import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./auth";

export const purchases = sqliteTable(
	"purchases",
	{
		id: text("id").primaryKey(),
		userId: text("user_id")
			.notNull()
			.references(() => users.id, { onDelete: "cascade" }),
		productId: text("product_id").notNull(),
		planSlug: text("plan_slug").notNull(), // "tanship" | "tanship-pro"
		licenseKey: text("license_key").notNull().unique(),
		paymentId: text("payment_id"),
		githubUsername: text("github_username"), // null until user claims
		githubInvitedAt: integer("github_invited_at", { mode: "timestamp" }),
		emailSentAt: integer("email_sent_at", { mode: "timestamp" }),
		createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
		updatedAt: integer("updated_at", { mode: "timestamp" })
			.$onUpdate(() => new Date())
			.notNull()
	},
	(t) => [
		index("idx_purchases_user_id").on(t.userId),
		index("idx_purchases_license_key").on(t.licenseKey)
	]
);
