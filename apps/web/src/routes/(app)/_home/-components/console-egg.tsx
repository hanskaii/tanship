import { useEffect } from "react";

/** Developer-facing console message. Fires once on mount. */
export function ConsoleEgg() {
	useEffect(() => {
		const lime = "color: color(display-p3 0.789306 1 0)";
		const dim = "color: #555; font-size: 11px; font-family: monospace";
		const mono = "color: #aaa; font-size: 12px; font-family: monospace";

		console.log(
			`%c◆ Tanship%c\n\nTanStack Start boilerplate for Cloudflare Workers.\nAuth, payments, database, email, blog — wired on day one.\n\n%c→ Invite-only access at tanship.dev`,
			`${lime}; font-weight: 700; font-size: 14px; font-family: monospace`,
			dim,
			`${lime}; font-size: 12px; font-family: monospace`
		);

		// Separate hint for devs inspecting the source
		console.log(
			`%cLooking at the code? It's TanStack Start + Hono + Drizzle, all the way down.`,
			mono
		);
	}, []);

	return null;
}
