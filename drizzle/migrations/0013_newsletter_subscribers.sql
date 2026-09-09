CREATE TABLE IF NOT EXISTS `newsletter_subscribers` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`name` text,
	`user_id` text,
	`source` text DEFAULT 'newsletter_page' NOT NULL,
	`status` text DEFAULT 'subscribed' NOT NULL,
	`token` text NOT NULL,
	`subscribed_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`unsubscribed_at` text,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `newsletter_subscribers_email_unique` ON `newsletter_subscribers` (`email`);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS `newsletter_subscribers_token_unique` ON `newsletter_subscribers` (`token`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `newsletter_subscribers_user_id_idx` ON `newsletter_subscribers` (`user_id`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `newsletter_subscribers_status_idx` ON `newsletter_subscribers` (`status`);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `newsletter_subscribers_source_idx` ON `newsletter_subscribers` (`source`);
