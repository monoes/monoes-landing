CREATE TABLE `library_item` (
	`id` text PRIMARY KEY NOT NULL,
	`kind` text NOT NULL,
	`slug` text NOT NULL,
	`name` text NOT NULL,
	`description` text DEFAULT '' NOT NULL,
	`visibility` text DEFAULT 'private' NOT NULL,
	`tags_json` text DEFAULT '[]' NOT NULL,
	`owner_id` text NOT NULL,
	`current_version_id` text NOT NULL,
	`version` text NOT NULL,
	`sha256` text NOT NULL,
	`size` integer NOT NULL,
	`meta_json` text DEFAULT '{}' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`owner_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `library_item_kind_slug_unique` ON `library_item` (`kind`,`slug`);--> statement-breakpoint
CREATE INDEX `library_item_owner_idx` ON `library_item` (`owner_id`);--> statement-breakpoint
CREATE INDEX `library_item_visibility_idx` ON `library_item` (`visibility`);--> statement-breakpoint
CREATE TABLE `library_version` (
	`id` text PRIMARY KEY NOT NULL,
	`item_id` text NOT NULL,
	`version` text NOT NULL,
	`sha256` text NOT NULL,
	`size` integer NOT NULL,
	`content_type` text NOT NULL,
	`filename` text NOT NULL,
	`r2_key` text NOT NULL,
	`meta_json` text DEFAULT '{}' NOT NULL,
	`created_by` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`item_id`) REFERENCES `library_item`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `library_version_item_version_unique` ON `library_version` (`item_id`,`version`);--> statement-breakpoint
CREATE INDEX `library_version_created_by_idx` ON `library_version` (`created_by`,`created_at`);