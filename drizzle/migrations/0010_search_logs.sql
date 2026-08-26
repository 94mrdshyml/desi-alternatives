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
CREATE INDEX `search_logs_normalized_query_idx` ON `search_logs` (`normalized_query`);
--> statement-breakpoint
CREATE INDEX `search_logs_created_at_idx` ON `search_logs` (`created_at`);
