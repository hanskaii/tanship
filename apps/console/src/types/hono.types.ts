import type { ValidatedEnv } from "@/env";
import type { Sandbox } from "@cloudflare/sandbox";
import type {
	Counter,
	RateLimiter,
	Lock,
	Leader,
	Barrier
} from "@/durable-objects";
import type { Scheduler } from "@/durable-objects/scheduler";
import type { DurableFIFOQueue } from "@/durable-objects/fifo";
import type { DurableBloomFilter } from "@/durable-objects/bloom";
import type { PayerIdentity } from "@/helpers/payer.helper";

export type ConsoleBindings = ValidatedEnv & {
	AI: Ai;
	VECTORIZE: VectorizeIndex;
	Sandbox: DurableObjectNamespace<Sandbox>;
	KV: KVNamespace;
	R2: R2Bucket;
	DB: D1Database;
	QUEUE: Queue;
	COUNTER: DurableObjectNamespace<Counter>;
	RATE_LIMITER: DurableObjectNamespace<RateLimiter>;
	LOCK: DurableObjectNamespace<Lock>;
	SCHEDULER: DurableObjectNamespace<Scheduler>;
	LEADER: DurableObjectNamespace<Leader>;
	BARRIER: DurableObjectNamespace<Barrier>;
	DURABLE_QUEUE: DurableObjectNamespace<DurableFIFOQueue>;
	DURABLE_BLOOM: DurableObjectNamespace<DurableBloomFilter>;
};

export interface HonoEnv {
	Bindings: ConsoleBindings;
	Variables: {
		/** Set by the payer middleware on wallet-scoped routes. */
		payer: PayerIdentity;
		/** Convenience aliases for Cloudflare bindings (legacy handlers). */
		kv: KVNamespace;
		worker: Ai;
		vectorize: VectorizeIndex;
	};
}
