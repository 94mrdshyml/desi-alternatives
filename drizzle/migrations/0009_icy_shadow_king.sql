CREATE TABLE `blog_authors` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`role` text NOT NULL,
	`avatar_url` text,
	`bio` text,
	`twitter_handle` text,
	`linkedin_url` text,
	`website_url` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `blog_authors_slug_unique` ON `blog_authors` (`slug`);--> statement-breakpoint
CREATE TABLE `blog_post_tools` (
	`id` text PRIMARY KEY NOT NULL,
	`post_id` text NOT NULL,
	`desi_tool_id` text NOT NULL,
	FOREIGN KEY (`post_id`) REFERENCES `blog_posts`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`desi_tool_id`) REFERENCES `desi_tools`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `blog_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`subtitle` text,
	`content` text NOT NULL,
	`cover_image_url` text,
	`author_id` text,
	`category_id` text,
	`status` text DEFAULT 'draft' NOT NULL,
	`reading_time_minutes` integer DEFAULT 5 NOT NULL,
	`meta_title` text,
	`meta_description` text,
	`canonical_url` text,
	`published_at` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	FOREIGN KEY (`author_id`) REFERENCES `blog_authors`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `blog_posts_slug_unique` ON `blog_posts` (`slug`);