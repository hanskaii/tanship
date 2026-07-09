import type { ValidatedEnv } from "@/env";

export type ConsoleBindings = ValidatedEnv & {
	AI: Ai;
};

export interface HonoEnv {
	Bindings: ConsoleBindings;
}
