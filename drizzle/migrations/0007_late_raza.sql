PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_site_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`from_name` text DEFAULT 'Desi Alternatives' NOT NULL,
	`from_email` text DEFAULT 'team@letter.mrdshyml.xyz' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_site_settings`("id", "from_name", "from_email", "updated_at") SELECT "id", "from_name", "from_email", "updated_at" FROM `site_settings`;--> statement-breakpoint
DROP TABLE `site_settings`;--> statement-breakpoint
ALTER TABLE `__new_site_settings` RENAME TO `site_settings`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
ALTER TABLE `global_tools` ADD `tagline` text;--> statement-breakpoint
ALTER TABLE `global_tools` ADD `features` text;--> statement-breakpoint
ALTER TABLE `global_tools` ADD `starting_price_usd` integer;--> statement-breakpoint
ALTER TABLE `global_tools` ADD `foreign_pain_points` text;--> statement-breakpoint
ALTER TABLE `global_tools` ADD `category_id` text REFERENCES categories(id);--> statement-breakpoint
ALTER TABLE `global_tools` ADD `updated_at` text;