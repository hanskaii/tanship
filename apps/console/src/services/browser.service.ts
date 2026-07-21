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

	async pdf(url: string): Promise<ArrayBuffer> {
		const res = await this.post("pdf", { url });
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
}
