ALTER TABLE `site_settings` ADD `gtm_enabled` integer DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE `site_settings` ADD `gtm_id` text;
--> statement-breakpoint
ALTER TABLE `site_settings` ADD `umami_enabled` integer DEFAULT false NOT NULL;
--> statement-breakpoint
ALTER TABLE `site_settings` ADD `umami_website_id` text;
--> statement-breakpoint
ALTER TABLE `site_settings` ADD `umami_script_url` text DEFAULT 'https://cloud.umami.is/script.js' NOT NULL;
