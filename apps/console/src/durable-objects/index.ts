import { DurableObject } from "cloudflare:workers";

// Idle-expiry: an object with no writes for this long deletes its own storage,
// so abandoned counters/limiters never accrue storage cost forever.
const IDLE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface CounterEnv {
	COUNTER: DurableObjectNamespace<Counter>;
}

export interface LockEnv {
	LOCK: DurableObjectNamespace<Lock>;
}

interface LockState {
	locked: boolean;
	owner: string | null;
	lockedAt: number | null;
	/** Epoch ms when the lock auto-releases; refreshed by heartbeat. */
	expiresAt: number | null;
}

/**
 * Distributed mutex lock backed by a Durable Object.
 * Provides atomic lock/unlock with optional TTL for preventing deadlocks.
 */
export class Lock extends DurableObject {
	private async load(): Promise<LockState> {
		const state = (await this.ctx.storage.get<LockState>("state")) ?? {
			locked: false,
			owner: null,
			lockedAt: null,
			expiresAt: null
		};
		return state;
	}

	private async save(state: LockState): Promise<void> {
		await this.ctx.storage.put("state", state);
		// Extend idle-expiry on every write
		await this.ctx.storage.setAlarm(Date.now() + IDLE_TTL_MS);
	}

	/**
	 * Acquire the lock if it is free, or return false if already locked.
	 * Returns the lock token (owner id) on success.
	 */
	async acquire(
		owner: string,
		ttlMs?: number
	): Promise<{ success: boolean; token?: string; expiresAt?: number }> {
		const state = await this.load();
		// Auto-expire: if expired, treat as free.
		if (state.locked && state.expiresAt && state.expiresAt <= Date.now()) {
			state.locked = false;
			state.owner = null;
			state.lockedAt = null;
			state.expiresAt = null;
		}
		if (state.locked) {
			return { success: false };
		}
		const token = crypto.randomUUID();
		const expiresAt = ttlMs ? Date.now() + ttlMs : null;
		await this.save({
			locked: true,
			owner: owner,
			lockedAt: Date.now(),
			expiresAt
		});
		return { success: true, token, expiresAt: expiresAt ?? undefined };
	}

	/**
	 * Release the lock. Only the current owner can release.
	 * Returns true if released, false if not the owner or already unlocked.
	 */
	async release(owner: string): Promise<boolean> {
		const state = await this.load();
		if (!state.locked || state.owner !== owner) {
			return false;
		}
		await this.save({
			locked: false,
			owner: null,
			lockedAt: null,
			expiresAt: null
		});
		return true;
	}

	/**
	 * Refresh the TTL on a held lock. Only the current owner may heartbeat.
	 * Returns the new expiresAt on success, or { renewed: false } if the
	 * lock was free / held by another owner / already expired.
	 */
	async heartbeat(
		owner: string,
		ttlMs: number
	): Promise<
		| { renewed: true; expiresAt: number }
		| { renewed: false; reason: "not_owner" | "expired" | "free" }
	> {
		const state = await this.load();
		if (!state.locked) {
			return { renewed: false, reason: "free" };
		}
		if (state.expiresAt && state.expiresAt <= Date.now()) {
			return { renewed: false, reason: "expired" };
		}
		if (state.owner !== owner) {
			return { renewed: false, reason: "not_owner" };
		}
		const expiresAt = Date.now() + ttlMs;
		await this.save({ ...state, expiresAt });
		return { renewed: true, expiresAt };
	}

	/**
	 * Check current lock status.
	 */
	async status(): Promise<LockState> {
		return this.load();
	}

	/**
	 * Force-release the lock regardless of owner (admin use only).
	 */
	async forceRelease(): Promise<void> {
		await this.save({
			locked: false,
			owner: null,
			lockedAt: null,
			expiresAt: null
		});
	}

	/** Idle for IDLE_TTL_MS — wipe storage to stop accruing cost. */
	async alarm() {
		await this.ctx.storage.deleteAll();
	}
}

/**
 * Distributed atomic counter backed by a Durable Object.
 * Each named counter is its own isolate — no races, globally consistent.
 */
export class Counter extends DurableObject {
	private value = 0;
	private loaded = false;

	private async load() {
		if (this.loaded) return;
		this.value = (await this.ctx.storage.get<number>("value")) ?? 0;
		this.loaded = true;
	}

	/** Bump the idle-expiry alarm on every write. */
	private async touch() {
		await this.ctx.storage.setAlarm(Date.now() + IDLE_TTL_MS);
	}

	async increment(amount: number): Promise<number> {
		await this.load();
		this.value += amount;
		await this.ctx.storage.put("value", this.value);
		await this.touch();
		return this.value;
	}

	async decrement(amount: number): Promise<number> {
		await this.load();
		this.value -= amount;
		await this.ctx.storage.put("value", this.value);
		await this.touch();
		return this.value;
	}

	async get(): Promise<number> {
		await this.load();
		return this.value;
	}

	async set(val: number): Promise<number> {
		this.value = val;
		this.loaded = true;
		await this.ctx.storage.put("value", this.value);
		await this.touch();
		return this.value;
	}

	async reset(): Promise<number> {
		return this.set(0);
	}

	/** Idle for IDLE_TTL_MS — wipe storage so it stops costing anything. */
	async alarm() {
		await this.ctx.storage.deleteAll();
	}
}

export interface RateLimiterEnv {
	RATE_LIMITER: DurableObjectNamespace<RateLimiter>;
}

export interface LeaderEnv {
	LEADER: DurableObjectNamespace<Leader>;
}

export interface BarrierEnv {
	BARRIER: DurableObjectNamespace<Barrier>;
}

interface RateLimiterWindow {
	timestamps: number[];
}

/**
 * Sliding-window rate limiter backed by a Durable Object.
 * Each named limiter (e.g. per-IP, per-user) is its own isolate.
 */
export class RateLimiter extends DurableObject {
	async check(
		limit: number,
		windowMs: number
	): Promise<{
		allowed: boolean;
		remaining: number;
		resetMs: number;
	}> {
		const now = Date.now();
		const cutoff = now - windowMs;

		const data = (await this.ctx.storage.get<RateLimiterWindow>(
			"window"
		)) ?? {
			timestamps: []
		};

		// Prune expired
		data.timestamps = data.timestamps.filter((t) => t > cutoff);

		const remaining = Math.max(0, limit - data.timestamps.length);
		const allowed = data.timestamps.length < limit;

		if (allowed) {
			data.timestamps.push(now);
			await this.ctx.storage.put("window", data);
		}

		// Idle-expiry: abandoned limiters wipe themselves after IDLE_TTL_MS.
		await this.ctx.storage.setAlarm(now + IDLE_TTL_MS);

		const oldestInWindow = data.timestamps[0] ?? now;
		const resetMs = oldestInWindow + windowMs - now;

		return { allowed, remaining: allowed ? remaining - 1 : 0, resetMs };
	}

	async reset(): Promise<void> {
		await this.ctx.storage.delete("window");
	}

	/** Idle for IDLE_TTL_MS — wipe storage so it stops costing anything. */
	async alarm() {
		await this.ctx.storage.deleteAll();
	}
}

interface LeaderState {
	leaderId: string | null;
	leaderToken: string | null;
	acquiredAt: number | null;
	/** Epoch ms when the current leader's lease expires; refreshed by heartbeat. */
	expiresAt: number | null;
	/** Generation counter — bumps on every leader change for fencing tokens. */
	generation: number;
}

/**
 * Distributed leader election backed by a Durable Object.
 * Each named leader group is its own isolate — atomic election, no split-brain.
 * Uses TTL-based leases with heartbeat refresh, similar to Lock.
 */
export class Leader extends DurableObject {
	private async load(): Promise<LeaderState> {
		return (
			(await this.ctx.storage.get<LeaderState>("state")) ?? {
				leaderId: null,
				leaderToken: null,
				acquiredAt: null,
				expiresAt: null,
				generation: 0
			}
		);
	}

	private async save(state: LeaderState): Promise<void> {
		await this.ctx.storage.put("state", state);
		await this.ctx.storage.setAlarm(Date.now() + IDLE_TTL_MS);
	}

	/**
	 * Try to become the leader. Returns a fenced token on success, or the
	 * current leader's identity + remaining lease on failure.
	 */
	async tryAcquire(
		candidateId: string,
		ttlMs: number
	): Promise<
		| {
				elected: true;
				token: string;
				generation: number;
				expiresAt: number;
		  }
		| {
				elected: false;
				currentLeader: string;
				expiresAt: number | null;
		  }
	> {
		const state = await this.load();
		const now = Date.now();

		// Auto-expire stale lease
		if (state.expiresAt && state.expiresAt <= now) {
			state.leaderId = null;
			state.leaderToken = null;
			state.acquiredAt = null;
			state.expiresAt = null;
		}

		// Already this candidate — re-elect refreshes the lease without bumping generation
		if (state.leaderId === candidateId && state.leaderToken) {
			state.expiresAt = now + ttlMs;
			await this.save(state);
			return {
				elected: true,
				token: state.leaderToken,
				generation: state.generation,
				expiresAt: state.expiresAt
			};
		}

		// Free seat — claim it
		if (state.leaderId === null) {
			const generation = state.generation + 1;
			const token = crypto.randomUUID();
			const next: LeaderState = {
				leaderId: candidateId,
				leaderToken: token,
				acquiredAt: now,
				expiresAt: now + ttlMs,
				generation
			};
			await this.save(next);
			return {
				elected: true,
				token,
				generation,
				expiresAt: next.expiresAt!
			};
		}

		// Held by someone else
		return {
			elected: false,
			currentLeader: state.leaderId,
			expiresAt: state.expiresAt
		};
	}

	/** Renew an existing leader's lease. Only the current leader may heartbeat. */
	async heartbeat(
		candidateId: string,
		token: string,
		ttlMs: number
	): Promise<
		| { renewed: true; generation: number; expiresAt: number }
		| { renewed: false; reason: "not_leader" | "expired" | "stale_token" }
	> {
		const state = await this.load();
		if (state.leaderId !== candidateId) {
			return { renewed: false, reason: "not_leader" };
		}
		if (state.leaderToken !== token) {
			return { renewed: false, reason: "stale_token" };
		}
		if (state.expiresAt && state.expiresAt <= Date.now()) {
			return { renewed: false, reason: "expired" };
		}
		const expiresAt = Date.now() + ttlMs;
		await this.save({ ...state, expiresAt });
		return { renewed: true, generation: state.generation, expiresAt };
	}

	/** Voluntarily step down. Only the current leader may resign. */
	async resign(
		candidateId: string,
		token: string
	): Promise<{ resigned: boolean; reason?: string }> {
		const state = await this.load();
		if (state.leaderId !== candidateId) {
			return { resigned: false, reason: "not_leader" };
		}
		if (state.leaderToken !== token) {
			return { resigned: false, reason: "stale_token" };
		}
		const next: LeaderState = {
			leaderId: null,
			leaderToken: null,
			acquiredAt: null,
			expiresAt: null,
			generation: state.generation
		};
		await this.save(next);
		return { resigned: true };
	}

	/** Snapshot the current leadership state. */
	async status(): Promise<LeaderState> {
		return this.load();
	}

	/** Idle for IDLE_TTL_MS — wipe storage so it stops costing anything. */
	async alarm() {
		await this.ctx.storage.deleteAll();
	}
}

interface BarrierState {
	required: number;
	arrived: string[];
	completed: boolean;
	createdAt: number;
}

/**
 * Distributed barrier sync backed by a Durable Object.
 * N agents must call `join` before the barrier trips; once tripped,
 * every subsequent `join` reports the barrier as completed.
 */
export class Barrier extends DurableObject {
	private async load(): Promise<BarrierState> {
		return (
			(await this.ctx.storage.get<BarrierState>("state")) ?? {
				required: 0,
				arrived: [],
				completed: false,
				createdAt: Date.now()
			}
		);
	}

	private async save(state: BarrierState): Promise<void> {
		await this.ctx.storage.put("state", state);
		await this.ctx.storage.setAlarm(Date.now() + IDLE_TTL_MS);
	}

	/**
	 * Create or reset a barrier. The first call with a `required` count
	 * sets the target; subsequent calls without `required` are no-ops.
	 * Pass `required` to re-initialise an existing barrier.
	 */
	async create(
		required: number
	): Promise<{ required: number; arrived: number; completed: boolean }> {
		const state = await this.load();
		const next: BarrierState = {
			required,
			arrived: [],
			completed: false,
			createdAt:
				state.required === required ? state.createdAt : Date.now()
		};
		await this.save(next);
		return { required, arrived: 0, completed: false };
	}

	/**
	 * Record an agent's arrival. Returns the barrier status and, if this
	 * call was the one that tripped the barrier, the `tripped: true` flag.
	 */
	async join(participantId: string): Promise<{
		required: number;
		arrived: number;
		completed: boolean;
		tripped: boolean;
		participants: string[];
	}> {
		const state = await this.load();
		if (state.required <= 0) {
			throw new Error(
				"Barrier not initialised — call create(required) first"
			);
		}
		if (!state.arrived.includes(participantId)) {
			state.arrived.push(participantId);
		}
		const tripped =
			!state.completed && state.arrived.length >= state.required;
		if (tripped) {
			state.completed = true;
		}
		await this.save(state);
		return {
			required: state.required,
			arrived: state.arrived.length,
			completed: state.completed,
			tripped,
			participants: [...state.arrived]
		};
	}

	/** Snapshot the current barrier state. */
	async status(): Promise<{
		required: number;
		arrived: number;
		completed: boolean;
		createdAt: number;
		participants: string[];
	}> {
		const state = await this.load();
		return {
			required: state.required,
			arrived: state.arrived.length,
			completed: state.completed,
			createdAt: state.createdAt,
			participants: [...state.arrived]
		};
	}

	/** Idle for IDLE_TTL_MS — wipe storage so it stops costing anything. */
	async alarm() {
		await this.ctx.storage.deleteAll();
	}
}

export { DurableFIFOQueue } from "./fifo";
export type { DurableFifoQueueEnv } from "./fifo";
export { DurableBloomFilter } from "./bloom";
export type { DurableBloomFilterEnv } from "./bloom";
export { PubSub } from "./pubsub";
export type { PubSubEnv } from "./pubsub";
