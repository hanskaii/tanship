import type { ValidatedEnv } from "@/env";
import type { Sandbox } from "@cloudflare/sandbox";

export type ConsoleBindings = ValidatedEnv & {
	AI: Ai;
	VECTORIZE: VectorizeIndex;
	Sandbox: DurableObjectNamespace<Sandbox>;
};

export interface HonoEnv {
	Bindings: ConsoleBindings;
}
