import { DurableObject } from "cloudflare:workers";

// ponytail: 1M item default capacity, ~125 KB per filter; tune capacity/m hash on first add
const IDLE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const DEFAULT_CAPACITY = 1_000_000;
const DEFAULT_ERROR_RATE = 0.01; // 1% false positive

interface BloomState {
	bits: Uint8Array;
	added: number;
	capacity: number;
	errorRate: number;
	bitSize: number;
	hashCount: number;
}

function chooseParams(
	capacity: number,
	errorRate: number
): {
	bitSize: number;
	hashCount: number;
} {
	// m = -n * ln(p) / (ln(2)^2)
	const bitSize = Math.max(
		64,
		Math.ceil(-(capacity * Math.log(errorRate)) / Math.LN2 ** 2)
	);
	// k = (m / n) * ln(2)
	const hashCount = Math.max(1, Math.ceil((bitSize / capacity) * Math.LN2));
	return { bitSize, hashCount };
}

// 64-bit FNV-1a + splitmix64 for k independent hashes (no extra deps).
function fnv1a64(s: string): bigint {
	let h = 0xcbf29ce484222325n;
	for (let i = 0; i < s.length; i++) {
		h ^= BigInt(s.charCodeAt(i));
		h = (h * 0x100000001b3n) & 0xffffffffffffffffn;
	}
	return h;
}

function splitmix64(seed: bigint): bigint {
	let z = seed & 0xffffffffffffffffn;
	z = (z + 0x9e3779b97f4a7c15n) & 0xffffffffffffffffn;
	z = ((z ^ (z >> 30n)) * 0xbf58476d1ce4e5b9n) & 0xffffffffffffffffn;
	z = ((z ^ (z >> 27n)) * 0x94d049bb133111ebn) & 0xffffffffffffffffn;
	return z ^ (z >> 31n);
}

export interface DurableBloomFilterEnv {
	DURABLE_BLOOM: DurableObjectNamespace<DurableBloomFilter>;
}

/**
 * Space-efficient probabilistic set backed by a Durable Object. Each named
 * filter is its own DO isolate. False positives possible (rate configurable),
 * false negatives impossible. Survives isolate restarts.
 */
export class DurableBloomFilter extends DurableObject {
	private cached: BloomState | null = null;

	private async load(): Promise<BloomState> {
		if (this.cached) return this.cached;
		const stored = await this.ctx.storage.get<BloomState>("state");
		if (stored) {
			// Rehydrate Uint8Array (DO storage round-trips as plain object)
			stored.bits = new Uint8Array(
				stored.bits as unknown as ArrayLike<number>
			);
			this.cached = stored;
			return stored;
		}
		const { bitSize, hashCount } = chooseParams(
			DEFAULT_CAPACITY,
			DEFAULT_ERROR_RATE
		);
		const fresh: BloomState = {
			bits: new Uint8Array(bitSize),
			added: 0,
			capacity: DEFAULT_CAPACITY,
			errorRate: DEFAULT_ERROR_RATE,
			bitSize,
			hashCount
		};
		await this.ctx.storage.put("state", fresh);
		this.cached = fresh;
		return fresh;
	}

	private async save(): Promise<void> {
		if (!this.cached) return;
		await this.ctx.storage.put("state", this.cached);
		await this.ctx.storage.setAlarm(Date.now() + IDLE_TTL_MS);
	}

	private positions(item: string): number[] {
		const state = this.cached!;
		const seed = fnv1a64(item);
		const positions: number[] = [];
		for (let i = 0; i < state.hashCount; i++) {
			const h = splitmix64(seed ^ BigInt(i));
			positions.push(Number(h % BigInt(state.bitSize)));
		}
		return positions;
	}

	/**
	 * Add an item. Returns the new bit positions and the post-add fill ratio.
	 */
	async add(
		item: string,
		capacity?: number,
		errorRate?: number
	): Promise<
		| {
				added: number;
				capacity: number;
				fillRatio: number;
		  }
		| { recreated: true; capacity: number; errorRate: number }
	> {
		const state = await this.load();
		if (capacity && errorRate && state.added === 0) {
			// First-call sizing: re-initialise with requested dimensions.
			const { bitSize, hashCount } = chooseParams(capacity, errorRate);
			const fresh: BloomState = {
				bits: new Uint8Array(bitSize),
				added: 0,
				capacity,
				errorRate,
				bitSize,
				hashCount
			};
			await this.ctx.storage.put("state", fresh);
			this.cached = fresh;
			return { recreated: true, capacity, errorRate };
		}
		if (item.length > 1024) {
			throw new Error("item exceeds 1024 chars");
		}
		for (const pos of this.positions(item)) {
			state.bits[pos] = 1;
		}
		state.added += 1;
		await this.save();
		const set = state.bits.reduce((acc, b) => acc + b, 0);
		return {
			added: state.added,
			capacity: state.capacity,
			fillRatio: +(set / state.bitSize).toFixed(6)
		};
	}

	/**
	 * Test membership. False positives possible at the configured rate.
	 */
	async has(item: string): Promise<{ present: boolean }> {
		const state = await this.load();
		if (item.length > 1024) throw new Error("item exceeds 1024 chars");
		for (const pos of this.positions(item)) {
			if (state.bits[pos] === 0) return { present: false };
		}
		return { present: true };
	}

	/**
	 * Batch-test up to 1000 items. Returns each membership result.
	 */
	async hasMany(
		items: string[]
	): Promise<{ results: { present: boolean }[] }> {
		const state = await this.load();
		const results = items.map((item) => {
			if (item.length > 1024) throw new Error("item exceeds 1024 chars");
			for (const pos of this.positions(item)) {
				if (state.bits[pos] === 0) return { present: false };
			}
			return { present: true };
		});
		return { results };
	}

	/** Snapshot stats for monitoring. */
	async stats(): Promise<{
		added: number;
		capacity: number;
		errorRate: number;
		bitSize: number;
		hashCount: number;
		fillRatio: number;
		bytes: number;
	}> {
		const state = await this.load();
		const set = state.bits.reduce((acc, b) => acc + b, 0);
		return {
			added: state.added,
			capacity: state.capacity,
			errorRate: state.errorRate,
			bitSize: state.bitSize,
			hashCount: state.hashCount,
			fillRatio: +(set / state.bitSize).toFixed(6),
			bytes: state.bits.byteLength
		};
	}

	/** Wipe filter. */
	async clear(): Promise<void> {
		const state = await this.load();
		state.bits = new Uint8Array(state.bitSize);
		state.added = 0;
		await this.save();
	}

	/** Idle for IDLE_TTL_MS — wipe storage so it stops costing anything. */
	async alarm() {
		await this.ctx.storage.deleteAll();
	}
}
