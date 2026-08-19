CREATE TABLE `org_upload` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`goal` text DEFAULT '' NOT NULL,
	`topology` text,
	`role_count` integer NOT NULL,
	`org_json` text NOT NULL,
	`uploader_id` text NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`uploader_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
