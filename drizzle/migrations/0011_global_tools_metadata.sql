ALTER TABLE `global_tools` ADD `description` text;
--> statement-breakpoint
ALTER TABLE `global_tools` ADD `pricing_plans` text;
--> statement-breakpoint
ALTER TABLE `global_tools` ADD `country` text;
--> statement-breakpoint
ALTER TABLE `global_tools` ADD `city` text;
--> statement-breakpoint
ALTER TABLE `global_tools` ADD `founded_year` integer;
--> statement-breakpoint
ALTER TABLE `global_tools` ADD `company_type` text;
--> statement-breakpoint
ALTER TABLE `global_tools` ADD `is_open_source` integer DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE `global_tools` ADD `github_url` text;
--> statement-breakpoint
ALTER TABLE `global_tools` ADD `discord_url` text;
--> statement-breakpoint
ALTER TABLE `global_tools` ADD `pros` text;
--> statement-breakpoint
ALTER TABLE `global_tools` ADD `cons` text;
--> statement-breakpoint
ALTER TABLE `global_tools` ADD `twitter_handle` text;
--> statement-breakpoint
ALTER TABLE `global_tools` ADD `instagram_handle` text;
--> statement-breakpoint
ALTER TABLE `global_tools` ADD `youtube_url` text;
--> statement-breakpoint
ALTER TABLE `global_tools` ADD `facebook_url` text;
--> statement-breakpoint
ALTER TABLE `global_tools` ADD `linkedin_url` text;
