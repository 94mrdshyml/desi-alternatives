CREATE TABLE `review_helpful_votes` (
	`id` text PRIMARY KEY NOT NULL,
	`review_id` text NOT NULL,
	`voter_identifier` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`review_id`) REFERENCES `tool_reviews`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `search_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`query` text NOT NULL,
	`normalized_query` text NOT NULL,
	`results_count` integer DEFAULT 0 NOT NULL,
	`clicked_type` text DEFAULT 'none',
	`clicked_id` text,
	`clicked_slug` text,
	`user_session_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tool_reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`tool_id` text NOT NULL,
	`user_id` text,
	`author_name` text NOT NULL,
	`author_role` text,
	`author_company` text,
	`author_avatar_url` text,
	`rating` integer NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`ease_of_migration_rating` integer DEFAULT 5,
	`value_for_money_rating` integer DEFAULT 5,
	`support_rating` integer DEFAULT 5,
	`data_residency_rating` integer DEFAULT 5,
	`is_verified` integer DEFAULT false NOT NULL,
	`helpful_count` integer DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'published' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`tool_id`) REFERENCES `desi_tools`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE set null
);
