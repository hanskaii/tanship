import type { ValidatedEnv } from "@/env";

export type ConsoleBindings = ValidatedEnv & {
	AI: Ai;
	VECTORIZE: VectorizeIndex;
};

export interface HonoEnv {
	Bindings: ConsoleBindings;
}
