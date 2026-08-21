CREATE TABLE `org_run` (
	`id` text PRIMARY KEY NOT NULL,
	`org_upload_id` text NOT NULL,
	`uploader_id` text NOT NULL,
	`label` text,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`org_upload_id`) REFERENCES `org_upload`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`uploader_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `org_run_file` (
	`id` text PRIMARY KEY NOT NULL,
	`org_run_id` text NOT NULL,
	`filename` text NOT NULL,
	`file_type` text NOT NULL,
	`r2_key` text NOT NULL,
	`size_bytes` integer NOT NULL,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`org_run_id`) REFERENCES `org_run`(`id`) ON UPDATE no action ON DELETE cascade
);
