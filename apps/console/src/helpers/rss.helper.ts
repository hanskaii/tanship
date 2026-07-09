export interface FeedItem {
	title: string;
	link: string;
	description?: string;
	date?: string;
}

function escapeXml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&apos;");
}

function toRfc822(date?: string): string | null {
	if (!date) return null;
	const parsed = new Date(date);
	return Number.isNaN(parsed.getTime()) ? null : parsed.toUTCString();
}

export function buildRssFeed(params: {
	title: string;
	sourceUrl: string;
	description?: string;
	items: FeedItem[];
}): string {
	const items = params.items
		.map((item) => {
			const pubDate = toRfc822(item.date);
			return [
				"    <item>",
				`      <title>${escapeXml(item.title)}</title>`,
				`      <link>${escapeXml(item.link)}</link>`,
				`      <guid>${escapeXml(item.link)}</guid>`,
				item.description
					? `      <description>${escapeXml(item.description)}</description>`
					: null,
				pubDate ? `      <pubDate>${pubDate}</pubDate>` : null,
				"    </item>"
			]
				.filter(Boolean)
				.join("\n");
		})
		.join("\n");

	return [
		`<?xml version="1.0" encoding="UTF-8"?>`,
		`<rss version="2.0">`,
		`  <channel>`,
		`    <title>${escapeXml(params.title)}</title>`,
		`    <link>${escapeXml(params.sourceUrl)}</link>`,
		`    <description>${escapeXml(
			params.description ?? `Feed generated from ${params.sourceUrl}`
		)}</description>`,
		`    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
		items,
		`  </channel>`,
		`</rss>`
	].join("\n");
}
