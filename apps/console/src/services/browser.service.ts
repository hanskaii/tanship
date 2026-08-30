import { ApiError } from "@/helpers/errors.helper";

interface RenderingJsonResult<T> {
	success: boolean;
	result: T;
	errors?: Array<{ message: string }>;
}

/**
 * Thin client over the Cloudflare Browser Rendering REST API.
 * https://developers.cloudflare.com/browser-rendering/rest-api/
 */
export class BrowserRenderingService {
	constructor(
		private readonly accountId: string,
		private readonly apiToken: string
	) {}

	private async post(
		path: string,
		body: Record<string, unknown>
	): Promise<Response> {
		const res = await fetch(
			`https://api.cloudflare.com/client/v4/accounts/${this.accountId}/browser-rendering/${path}`,
			{
				method: "POST",
				headers: {
					Authorization: `Bearer ${this.apiToken}`,
					"Content-Type": "application/json"
				},
				body: JSON.stringify(body)
			}
		);

		if (!res.ok) {
			let message = `Browser Rendering ${path} failed (${res.status})`;
			try {
				const json = (await res.json()) as RenderingJsonResult<unknown>;
				message = json.errors?.[0]?.message ?? message;
			} catch {
				// non-JSON error body — keep the generic message
			}
			throw ApiError.badGateway(message);
		}

		return res;
	}

	async screenshot(options: {
		url: string;
		fullPage: boolean;
		width: number;
		height: number;
		selector?: string;
	}): Promise<ArrayBuffer> {
		const res = await this.post("screenshot", {
			url: options.url,
			screenshotOptions: {
				fullPage: options.fullPage,
				selector: options.selector
			},
			viewport: { width: options.width, height: options.height }
		});
		return res.arrayBuffer();
	}

	async pdf(options: {
		url: string;
		scale: number;
		printBackground: boolean;
		landscape: boolean;
		pageRanges?: string;
		format: string;
		margin?: {
			top: string;
			bottom: string;
			left: string;
			right: string;
		};
	}): Promise<ArrayBuffer> {
		const res = await this.post("pdf", {
			url: options.url,
			pdfOptions: {
				scale: options.scale,
				printBackground: options.printBackground,
				landscape: options.landscape,
				pageRanges: options.pageRanges,
				format: options.format,
				margin: options.margin
			}
		});
		return res.arrayBuffer();
	}

	async markdown(url: string): Promise<string> {
		const res = await this.post("markdown", { url });
		const json = (await res.json()) as RenderingJsonResult<string>;
		return json.result;
	}

	async links(url: string): Promise<string[]> {
		const res = await this.post("links", { url });
		const json = (await res.json()) as RenderingJsonResult<string[]>;
		return json.result;
	}

	async snapshot(
		url: string
	): Promise<{ screenshot: string; content: string }> {
		const res = await this.post("snapshot", { url });
		const json = (await res.json()) as RenderingJsonResult<{
			screenshot: string;
			content: string;
		}>;
		return json.result;
	}

	async scrape(url: string, selectors: string[]): Promise<unknown[]> {
		const res = await this.post("scrape", {
			url,
			elements: selectors.map((selector) => ({ selector }))
		});
		const json = (await res.json()) as RenderingJsonResult<unknown[]>;
		return json.result;
	}

	/**
	 * Featured screenshot with device presets, quality tuning, and retina support.
	 * ponytail: extends basic screenshot with device presets and quality tuning.
	 * Add PNG output format when CF Browser Rendering adds support.
	 */
	async screenshotFeatured(options: {
		url: string;
		device?: string;
		fullPage: boolean;
		quality?: number;
		format?: "jpeg" | "png";
	}): Promise<ArrayBuffer> {
		const devices: Record<string, { width: number; height: number }> = {
			desktop: { width: 1280, height: 800 },
			mobile: { width: 375, height: 812 },
			tablet: { width: 768, height: 1024 },
			"desktop-hd": { width: 1920, height: 1080 },
			"desktop-4k": { width: 3840, height: 2160 }
		};
		const preset = devices[options.device ?? "desktop"];
		const quality = options.quality ?? 85;
		const res = await this.post("screenshot", {
			url: options.url,
			screenshotOptions: {
				fullPage: options.fullPage,
				format: options.format ?? "jpeg",
				quality: Math.min(Math.max(quality, 10), 100),
				omitBackground: false
			},
			viewport: {
				width: preset.width,
				height: preset.height,
				deviceScaleFactor: 2 // retina by default
			}
		});
		return res.arrayBuffer();
	}

	async json(
		url: string,
		prompt: string,
		schema?: Record<string, unknown>
	): Promise<unknown> {
		const body: Record<string, unknown> = { url, prompt };
		if (schema) {
			body.response_format = { type: "json_schema", json_schema: schema };
		}
		const res = await this.post("json", body);
		const json = (await res.json()) as RenderingJsonResult<unknown>;
		return json.result;
	}

	/**
	 * Full-page screenshot — captures the entire scroll height of the page
	 * at high resolution (retina). Returns a single stitched image.
	 * ponytail: replace native fullPage with custom scroll-and-merge when
	 * pages exceed the browser-rendering viewport stitching limit.
	 */
	async screenshotFullPage(options: {
		url: string;
		width: number;
		height: number;
		quality: number;
		format: "jpeg" | "png";
	}): Promise<ArrayBuffer> {
		const res = await this.post("screenshot", {
			url: options.url,
			screenshotOptions: {
				fullPage: true,
				format: options.format,
				quality: Math.min(Math.max(options.quality, 10), 100),
				omitBackground: false
			},
			viewport: {
				width: options.width,
				height: options.height,
				deviceScaleFactor: 2
			}
		});
		return res.arrayBuffer();
	}
}
