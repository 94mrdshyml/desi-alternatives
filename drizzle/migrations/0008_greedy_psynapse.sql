CREATE TABLE `tool_pricing_plans` (
	`id` text PRIMARY KEY NOT NULL,
	`tool_id` text NOT NULL,
	`name` text NOT NULL,
	`currency` text DEFAULT 'INR' NOT NULL,
	`amount` real,
	`billing_period` text DEFAULT 'monthly' NOT NULL,
	`is_free` integer DEFAULT false NOT NULL,
	`is_popular` integer DEFAULT false NOT NULL,
	`description` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`tool_id`) REFERENCES `desi_tools`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_global_tools` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`tagline` text,
	`website_url` text NOT NULL,
	`logo_url` text,
	`features` text,
	`starting_price_usd` integer,
	`foreign_pain_points` text,
	`category_id` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_global_tools`("id", "slug", "name", "tagline", "website_url", "logo_url", "features", "starting_price_usd", "foreign_pain_points", "category_id", "created_at", "updated_at") SELECT "id", "slug", "name", "tagline", "website_url", "logo_url", "features", "starting_price_usd", "foreign_pain_points", "category_id", "created_at", "updated_at" FROM `global_tools`;--> statement-breakpoint
DROP TABLE `global_tools`;--> statement-breakpoint
ALTER TABLE `__new_global_tools` RENAME TO `global_tools`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE UNIQUE INDEX `global_tools_slug_unique` ON `global_tools` (`slug`);--> statement-breakpoint
ALTER TABLE `desi_tools` ADD `city` text;--> statement-breakpoint
ALTER TABLE `desi_tools` ADD `state` text;--> statement-breakpoint
ALTER TABLE `desi_tools` ADD `founded_year` integer;--> statement-breakpoint
ALTER TABLE `desi_tools` ADD `company_type` text;--> statement-breakpoint
ALTER TABLE `desi_tools` ADD `github_url` text;--> statement-breakpoint
ALTER TABLE `desi_tools` ADD `discord_url` text;--> statement-breakpoint
ALTER TABLE `desi_tools` ADD `pros` text;--> statement-breakpoint
ALTER TABLE `desi_tools` ADD `cons` text;