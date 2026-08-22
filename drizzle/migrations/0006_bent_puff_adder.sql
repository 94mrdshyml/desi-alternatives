CREATE TABLE `site_settings` (
	`id` text PRIMARY KEY NOT NULL,
	`from_name` text DEFAULT 'Desi Alternatives' NOT NULL,
	`from_email` text DEFAULT 'auth@desialternatives.in' NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
