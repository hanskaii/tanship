import { DurableObject } from "cloudflare:workers";

// Idle-expiry: an object with no writes for this long deletes its own storage,
// so abandoned counters/limiters never accrue storage cost forever.
const IDLE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface CounterEnv {
	COUNTER: DurableObjectNamespace<Counter>;
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
