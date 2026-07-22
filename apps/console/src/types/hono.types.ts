import type { ValidatedEnv } from "@/env";

export type ConsoleBindings = ValidatedEnv & {
	AI: Ai;
	VECTORIZE: VectorizeIndex;
	Sandbox: DurableObjectNamespace;
};

export interface HonoEnv {
	Bindings: ConsoleBindings;
}
