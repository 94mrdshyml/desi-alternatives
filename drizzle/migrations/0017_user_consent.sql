ALTER TABLE `users` ADD `consent_status` text;
--> statement-breakpoint
ALTER TABLE `users` ADD `consent_updated_at` integer;
--> statement-breakpoint
ALTER TABLE `site_settings` ADD `consent_banner_enabled` integer DEFAULT 1 NOT NULL;
