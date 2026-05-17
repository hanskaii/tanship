CREATE TABLE `purchases` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`product_id` text NOT NULL,
	`plan_slug` text NOT NULL,
	`license_key` text NOT NULL,
	`payment_id` text,
	`github_username` text,
	`github_invited_at` integer,
	`email_sent_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `purchases_license_key_unique` ON `purchases` (`license_key`);--> statement-breakpoint
CREATE INDEX `idx_purchases_user_id` ON `purchases` (`user_id`);--> statement-breakpoint
CREATE INDEX `idx_purchases_license_key` ON `purchases` (`license_key`);--> statement-breakpoint
CREATE TABLE `showcases` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`submitter_name` text NOT NULL,
	`project_name` text NOT NULL,
	`project_url` text NOT NULL,
	`description` text NOT NULL,
	`image_key` text,
	`twitter_handle` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `idx_showcases_status` ON `showcases` (`status`);--> statement-breakpoint
CREATE INDEX `idx_showcases_user_id` ON `showcases` (`user_id`);