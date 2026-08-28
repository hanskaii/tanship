import { createFileRoute } from "@tanstack/react-router";
import { ImageResponse } from "takumi-js/response";

/**
 * Dynamic Open Graph image route — rendered with Takumi v2.
 *
 * On Cloudflare Workers, `takumi-js` automatically uses its WebAssembly
 * renderer (no headless browser). The built-in Manrope font covers the Latin
 * text we draw, so no font fetch is needed on the request path.
 *
 * Usage: `/og?title=...&description=...&eyebrow=...`
 */
export const Route = createFileRoute("/og")({
	server: {
		handlers: {
			GET({ request }) {
				const url = new URL(request.url);
				const title =
					url.searchParams.get("title") ??
					"Edge-native SaaS boilerplate";
				const description =
					url.searchParams.get("description") ??
					"TanStack Start · Cloudflare Workers · Hono · Drizzle · Better Auth";
				const eyebrow = url.searchParams.get("eyebrow") ?? "Tanship";

				// Brand mark, fetched from the same origin and decoded by Takumi.
				// PNG (not the source logo.avif) — Takumi's WASM renderer on the
				// edge cannot decode AVIF. `logo-mark.png` is generated from
				// logo.avif; regenerate it if the brand mark changes.
				const logoUrl = new URL("/logo-mark.png", request.url).href;

				return new ImageResponse(
					<div
						style={{
							width: "100%",
							height: "100%",
							display: "flex",
							flexDirection: "column",
							justifyContent: "space-between",
							padding: "80px",
							backgroundColor: "#09090b",
							backgroundImage:
								"radial-gradient(circle at 0% 0%, rgba(120,119,198,0.25), transparent 45%), radial-gradient(circle at 100% 100%, rgba(56,189,248,0.18), transparent 45%)",
							color: "#fafafa",
							fontFamily: "Manrope"
						}}
					>
						{/* Eyebrow / brand row */}
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: "18px"
							}}
						>
							<img
								src="logo"
								width={52}
								height={52}
								style={{ objectFit: "contain" }}
								alt="Logo"
							/>
							<span
								style={{
									fontSize: 28,
									fontWeight: 600,
									letterSpacing: "0.18em",
									textTransform: "uppercase",
									color: "#a1a1aa"
								}}
							>
								{eyebrow}
							</span>
						</div>

						{/* Title + description */}
						<div
							style={{
								display: "flex",
								flexDirection: "column",
								gap: "28px"
							}}
						>
							<p
								style={{
									fontSize: 76,
									fontWeight: 800,
									lineHeight: 1.05,
									letterSpacing: "-0.03em",
									margin: 0,
									color: "#ffffff"
								}}
							>
								{title}
							</p>
							<p
								style={{
									fontSize: 34,
									fontWeight: 500,
									lineHeight: 1.35,
									margin: 0,
									color: "#a1a1aa"
								}}
							>
								{description}
							</p>
						</div>

						{/* Footer */}
						<div
							style={{
								display: "flex",
								alignItems: "center",
								justifyContent: "space-between",
								fontSize: 26,
								fontWeight: 600,
								color: "#71717a"
							}}
						>
							<span style={{ color: "#e4e4e7" }}>
								tanship.dev
							</span>
							<span>Ship in days, not months</span>
						</div>
					</div>,
					{
						width: 1200,
						height: 630,
						format: "webp",
						images: [
							{
								src: "logo",
								data: () =>
									fetch(logoUrl).then((res) =>
										res.arrayBuffer()
									)
							}
						],
						headers: {
							"Cache-Control":
								"public, immutable, no-transform, max-age=31536000"
						}
					}
				);
			}
		}
	}
});
