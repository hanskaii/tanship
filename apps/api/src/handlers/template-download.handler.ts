import { Hono } from "hono";
import { Gate } from "@workspace/core";
import { ApiError } from "../helpers/errors.helper";
import type { HonoEnv } from "../types/hono.types";
import { purchases, eq, and, or } from "@workspace/database";

const TEMPLATE_IDS = [
	"saas-dashboard",
	"marketing-site",
	"docs-site",
	"api-starter",
	"waitlist",
	"changelog"
] as const;

type TemplateId = (typeof TEMPLATE_IDS)[number];

const templateDownloadHandler = new Hono<HonoEnv>().get(
	"/:templateId/download",
	async (c) => {
		const user = c.get("user");
		const db = c.get("db");
		const { templateId } = c.req.param();

		if (!TEMPLATE_IDS.includes(templateId as TemplateId)) {
			throw ApiError.notFound("Template not found");
		}

		// Find any purchase that grants access: Pro plan or individual template purchase
		const purchase = await db.query.purchases.findFirst({
			where: and(
				eq(purchases.userId, user.id),
				or(
					eq(purchases.planSlug, "tanship-pro"),
					eq(purchases.planSlug, `template-${templateId}`)
				)
			)
		});

		// Gate policy check — passes planSlug so policy can decide allow/deny
		await Gate.assert("templates.access", {
			actor: user,
			resource: { planSlug: purchase?.planSlug ?? null }
		});

		// Fetch from R2 storage
		const key = `templates/${templateId}.zip`;
		const object = await (c.env as any).STORAGE?.get(key);

		if (!object) {
			throw ApiError.notFound(
				"Template file not available yet. Please contact support."
			);
		}

		const headers = new Headers();
		object.writeHttpMetadata(headers);
		headers.set(
			"content-disposition",
			`attachment; filename="tanship-${templateId}.zip"`
		);
		headers.set("cache-control", "private, no-cache");

		return new Response(object.body, { headers });
	}
);

export default templateDownloadHandler;
