import { DurableObject } from "cloudflare:workers";

// ponytail: max items in queue = 10,000; add pagination for reads when needed
const MAX_QUEUE = 10_000;
const IDLE_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface DurableFifoQueueEnv {
	DURABLE_QUEUE: DurableObjectNamespace<DurableFIFOQueue>;
}

export interface QueueItem {
	id: string;
	payload: string; // JSON-serialized
	enqueuedAt: number;
	visibleAfter: number;
	deliveryAttempts: number;
}

interface QueueState {
	items: QueueItem[];
	stats: {
		pushed: number;
		popped: number;
		acked: number;
		dead_lettered: number;
	};
}

/**
 * DO-backed persistent FIFO queue — survives isolate restarts unlike KV.
 * Each named queue is its own DO isolate. Visibility timeout via
 * timestamped items means no separate lease table.
 */
export class DurableFIFOQueue extends DurableObject {
	private async load(): Promise<QueueState> {
		return (
			(await this.ctx.storage.get<QueueState>("state")) ?? {
				items: [],
				stats: { pushed: 0, popped: 0, acked: 0, dead_lettered: 0 }
			}
		);
	}

	private async save(state: QueueState): Promise<void> {
		await this.ctx.storage.put("state", state);
		await this.ctx.storage.setAlarm(Date.now() + IDLE_TTL_MS);
	}

	/** Push a JSON-serializable payload onto the queue. Returns the item id. */
	async push(
		payload: string,
		delaySeconds = 0
	): Promise<{ id: string; enqueuedAt: number }> {
		const state = await this.load();

		if (state.items.length >= MAX_QUEUE) {
			throw new Error(
				`Queue at capacity (${MAX_QUEUE} items max). Drain or ack messages.`
			);
		}

		const now = Date.now();
		const id = crypto.randomUUID();
		const item: QueueItem = {
			id,
			payload,
			enqueuedAt: now,
			visibleAfter: now + delaySeconds * 1000,
			deliveryAttempts: 0
		};

		state.items.push(item);
		state.stats.pushed += 1;

		await this.save(state);
		return { id, enqueuedAt: now };
	}

	/** Pop up to `max` visible items (oldest first). Marks them as in-flight. */
	async pop(max: number, visibilitySeconds = 30): Promise<QueueItem[]> {
		const state = await this.load();
		const now = Date.now();

		// Mark expired items as visible again (lease elapsed)
		const repaired = state.items.some((item) => {
			if (item.deliveryAttempts > 0 && item.visibleAfter <= now) {
				item.deliveryAttempts = 0;
				return true;
			}
			return false;
		});
		if (repaired) await this.save(state);

		// Filter visible, oldest-first (FIFO). Sort by enqueuedAt on first
		// pop call of this isolate lifecycle — items are appended FIFO so the
		// array naturally preserves order.
		const visible = state.items.filter(
			(item) => item.deliveryAttempts === 0 && item.visibleAfter <= now
		);

		const taken = visible.slice(0, max);
		const cutoff = now + visibilitySeconds * 1000;

		for (const item of taken) {
			item.deliveryAttempts = 1;
			item.visibleAfter = cutoff;
		}

		state.stats.popped += taken.length;
		await this.save(state);

		return taken;
	}

	/** Acknowledge (delete) a message by id. */
	async ack(id: string): Promise<boolean> {
		const state = await this.load();
		const idx = state.items.findIndex((item) => item.id === id);
		if (idx === -1) return false;

		state.items.splice(idx, 1);
		state.stats.acked += 1;
		await this.save(state);
		return true;
	}

	/** Move a failed message to dead-letter state (deliveryAttempts capped at 3). */
	async deadLetter(id: string): Promise<boolean> {
		const state = await this.load();
		const item = state.items.find((item) => item.id === id);
		if (!item) return false;

		item.deliveryAttempts += 1;
		if (item.deliveryAttempts >= 3) {
			// 3 failures → permanently dead-lettered (remove from queue)
			state.items = state.items.filter((i) => i.id !== id);
			state.stats.dead_lettered += 1;
		} else {
			// Re-queue with exponential-ish backoff: 10s, 30s, 90s
			item.visibleAfter =
				Date.now() +
				Math.min(90, 10 * 3 ** (item.deliveryAttempts - 1)) * 1000;
		}

		await this.save(state);
		return true;
	}

	/** Peek at up to `max` visible messages without affecting delivery state. */
	async peek(max: number): Promise<QueueItem[]> {
		const state = await this.load();
		const now = Date.now();

		return state.items
			.filter(
				(item) =>
					item.deliveryAttempts === 0 && item.visibleAfter <= now
			)
			.slice(0, max);
	}

	/** Return queue depth and stats. */
	async stats(): Promise<{
		size: number;
		dead_lettered: number;
		stats: QueueState["stats"];
	}> {
		const state = await this.load();
		return {
			size: state.items.length,
			dead_lettered: 0,
			stats: state.stats
		};
	}

	/** Wipe all items and reset stats (queue deletion). */
	async drain(): Promise<void> {
		await this.ctx.storage.put("state", {
			items: [],
			stats: { pushed: 0, popped: 0, acked: 0, dead_lettered: 0 }
		});
	}

	/** Idle for IDLE_TTL_MS — wipe storage so it stops costing anything. */
	async alarm() {
		await this.ctx.storage.deleteAll();
	}
}
