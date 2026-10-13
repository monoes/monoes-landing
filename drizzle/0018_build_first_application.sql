CREATE TABLE `build_first_application` (
	`id` text PRIMARY KEY NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`audience` text NOT NULL,
	`line` text NOT NULL,
	`full_name` text NOT NULL,
	`email` text NOT NULL,
	`role` text NOT NULL,
	`organization` text NOT NULL,
	`website` text,
	`country` text NOT NULL,
	`can_sign` integer NOT NULL,
	`signer_contact` text,
	`profile` text NOT NULL,
	`deal_structure` text NOT NULL,
	`budget_range` text NOT NULL,
	`description` text NOT NULL,
	`regulated` integer NOT NULL,
	`regulated_detail` text,
	`systems` text,
	`consent_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `build_first_application_status_idx` ON `build_first_application` (`status`);