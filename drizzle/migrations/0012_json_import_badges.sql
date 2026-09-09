-- Step 1: Add is_json_imported column to desi_tools and global_tools
ALTER TABLE `desi_tools` ADD `is_json_imported` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint
ALTER TABLE `global_tools` ADD `is_json_imported` integer DEFAULT 0 NOT NULL;
--> statement-breakpoint

-- Step 2: Retroactive Backfill for existing D1 database records
-- Mark global tools that have rich JSON metadata as is_json_imported = 1
UPDATE `global_tools`
SET `is_json_imported` = 1
WHERE `pros` IS NOT NULL
   OR `cons` IS NOT NULL
   OR `pricing_plans` IS NOT NULL
   OR `country` IS NOT NULL
   OR `description` IS NOT NULL;
--> statement-breakpoint

-- Mark desi tools that have rich metadata as is_json_imported = 1
UPDATE `desi_tools`
SET `is_json_imported` = 1
WHERE `pros` IS NOT NULL
   OR `cons` IS NOT NULL
   OR `city` IS NOT NULL
   OR `state` IS NOT NULL
   OR `company_type` IS NOT NULL;
