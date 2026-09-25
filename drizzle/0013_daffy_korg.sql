ALTER TABLE `org_upload` ADD `slug` text;--> statement-breakpoint
CREATE UNIQUE INDEX `org_upload_slug_unique` ON `org_upload` (`slug`);