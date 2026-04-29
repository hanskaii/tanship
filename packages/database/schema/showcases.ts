import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { users } from "./auth";

export const showcases = sqliteTable(
	"showcases",
	{
		id: text("id").primaryKey(),
		userId: text("user_id").references(() => users.id, {
			onDelete: "set null"
		}),
		submitterName: text("submitter_name").notNull(),
		projectName: text("project_name").notNull(),
		projectUrl: text("project_url").notNull(),
		description: text("description").notNull(),
		imageKey: text("image_key"), // R2 key for screenshot
		twitterHandle: text("twitter_handle"),
		status: text("status", {
			enum: ["pending", "approved", "rejected"]
		})
			.notNull()
			.default("pending"),
		createdAt: integer("created_at", { mode: "timestamp" }).notNull()
	},
	(t) => [
		index("idx_showcases_status").on(t.status),
		index("idx_showcases_user_id").on(t.userId)
	]
);
