CREATE TABLE `email_claim_request` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`code_hash` text NOT NULL,
	`client_id` text NOT NULL,
	`scope` text NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL,
	`expires_at` integer NOT NULL,
	`consumed_at` integer,
	`created_at` integer NOT NULL,
	FOREIGN KEY (`client_id`) REFERENCES `oauth_client`(`client_id`) ON UPDATE no action ON DELETE cascade
);
