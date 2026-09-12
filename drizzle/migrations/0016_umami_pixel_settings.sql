ALTER TABLE `system_settings` ADD `umami_pixel_enabled` integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `system_settings` ADD `umami_pixel_url` text;--> statement-breakpoint
ALTER TABLE `system_settings` ADD `email_pixel_tracking_enabled` integer DEFAULT 0 NOT NULL;
