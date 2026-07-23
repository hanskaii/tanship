import type { ValidatedEnv } from "@/env";
import type { Sandbox } from "@cloudflare/sandbox";
import type { Counter, RateLimiter } from "@/durable-objects";
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
};

export interface HonoEnv {
	Bindings: ConsoleBindings;
	Variables: {
		/** Set by the payer middleware on wallet-scoped routes. */
		payer: PayerIdentity;
	};
}
