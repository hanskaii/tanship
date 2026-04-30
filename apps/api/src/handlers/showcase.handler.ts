import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { ApiError } from "../helpers/errors.helper";
import { ApiResponse } from "../helpers/response.helper";
import { authMiddleware } from "../middleware/auth.middleware";
import { protect } from "../middleware/protect.middleware";
import { createMailer } from "@workspace/auth/emails/mailer";
import { showcases, eq, and } from "@workspace/database";
import type { HonoEnv } from "../types/hono.types";

const ALLOWED_IMAGE_TYPES: Record<string, string> = {
	"image/jpeg": "jpg",
	"image/png": "png",
	"image/webp": "webp"
};
const MAX_IMAGE_SIZE = 3 * 1024 * 1024; // 3 MB

const SubmitSchema = z.object({
	submitterName: z.string().min(1).max(80),
	projectName: z.string().min(1).max(120),
	projectUrl: z.string().url("Must be a valid URL"),
	description: z.string().min(10).max(500),
	twitterHandle: z.string().max(50).optional()
});

const showcaseHandler = new Hono<HonoEnv>()
	// ─── Public: list approved ────────────────────────────────────────────────
	.get("/", async (c) => {
		const db = c.get("db");

		const rows = await db.query.showcases.findMany({
			where: eq(showcases.status, "approved"),
			orderBy: (t, { desc }) => [desc(t.createdAt)]
		});

		return ApiResponse.ok(
			c,
			"Showcases",
			rows.map((r) => ({
				id: r.id,
				submitterName: r.submitterName,
				projectName: r.projectName,
				projectUrl: r.projectUrl,
				description: r.description,
				imageKey: r.imageKey,
				twitterHandle: r.twitterHandle,
				createdAt: r.createdAt
			}))
		);
	})

	// ─── Authenticated: submit ────────────────────────────────────────────────
	.post("/", authMiddleware, async (c) => {
		const user = c.get("user");
		const db = c.get("db");
		const env = c.env as any;

		const formData = await c.req.formData();

		// Validate text fields
		const parsed = SubmitSchema.safeParse({
			submitterName: formData.get("submitterName"),
			projectName: formData.get("projectName"),
			projectUrl: formData.get("projectUrl"),
			description: formData.get("description"),
			twitterHandle: formData.get("twitterHandle") || undefined
		});

		if (!parsed.success) {
			throw ApiError.validation(
				"Invalid submission",
				parsed.error.flatten().fieldErrors as any
			);
		}

		const {
			submitterName,
			projectName,
			projectUrl,
			description,
			twitterHandle
		} = parsed.data;

		// Optional screenshot upload
		let imageKey: string | null = null;
		const screenshot = formData.get("screenshot") as File | null;

		if (screenshot && screenshot.size > 0) {
			if (screenshot.size > MAX_IMAGE_SIZE) {
				throw ApiError.badRequest("Screenshot must be under 3 MB");
			}
			const ext = ALLOWED_IMAGE_TYPES[screenshot.type];
			if (!ext) {
				throw ApiError.badRequest(
					"Screenshot must be a JPEG, PNG, or WebP image"
				);
			}
			imageKey = `showcases/${crypto.randomUUID()}.${ext}`;
			const buffer = await screenshot.arrayBuffer();
			await env.STORAGE.put(imageKey, buffer, {
				httpMetadata: { contentType: screenshot.type }
			});
		}

		const id = crypto.randomUUID();
		await db.insert(showcases).values({
			id,
			userId: user.id,
			submitterName,
			projectName,
			projectUrl,
			description,
			imageKey,
			twitterHandle: twitterHandle ?? null,
			status: "pending",
			createdAt: new Date()
		});

		// Notify admin
		const adminEmail: string | undefined = env.ADMIN_EMAIL;
		if (adminEmail && env.SEND_EMAIL) {
			try {
				const mailer = createMailer({
					SEND_EMAIL: env.SEND_EMAIL,
					RESEND_FROM_EMAIL: env.RESEND_FROM_EMAIL,
					APP_NAME: env.APP_NAME
				});
				const origin = new URL(c.req.url).origin;
				await mailer.sendShowcaseNotification(adminEmail, {
					submitterName,
					projectName,
					projectUrl,
					description,
					twitterHandle,
					adminReviewUrl: `${origin}/s/showcase`
				});
			} catch (err) {
				console.error(
					"[Showcase] Failed to send admin notification:",
					err
				);
			}
		}

		return ApiResponse.created(c, "Showcase submitted for review", { id });
	})

	// ─── Admin: list pending ──────────────────────────────────────────────────
	.get("/pending", authMiddleware, protect("admin.access"), async (c) => {
		const db = c.get("db");

		const rows = await db.query.showcases.findMany({
			where: eq(showcases.status, "pending"),
			orderBy: (t, { asc }) => [asc(t.createdAt)]
		});

		return ApiResponse.ok(c, "Pending showcases", rows);
	})

	// ─── Admin: approve ───────────────────────────────────────────────────────
	.patch(
		"/:id/approve",
		authMiddleware,
		protect("admin.access"),
		async (c) => {
			const db = c.get("db");
			const { id } = c.req.param();

			const showcase = await db.query.showcases.findFirst({
				where: and(
					eq(showcases.id, id),
					eq(showcases.status, "pending")
				)
			});

			if (!showcase) {
				throw ApiError.notFound(
					"Showcase not found or already reviewed"
				);
			}

			await db
				.update(showcases)
				.set({ status: "approved" })
				.where(eq(showcases.id, id));

			return ApiResponse.ok(c, "Showcase approved");
		}
	)

	// ─── Admin: reject ────────────────────────────────────────────────────────
	.patch(
		"/:id/reject",
		authMiddleware,
		protect("admin.access"),
		async (c) => {
			const db = c.get("db");
			const { id } = c.req.param();

			const showcase = await db.query.showcases.findFirst({
				where: and(
					eq(showcases.id, id),
					eq(showcases.status, "pending")
				)
			});

			if (!showcase) {
				throw ApiError.notFound(
					"Showcase not found or already reviewed"
				);
			}

			await db
				.update(showcases)
				.set({ status: "rejected" })
				.where(eq(showcases.id, id));

			return ApiResponse.ok(c, "Showcase rejected");
		}
	);

export default showcaseHandler;
