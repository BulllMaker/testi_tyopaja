CREATE TABLE `approval_packages` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`month` text NOT NULL,
	`client_email` text NOT NULL,
	`video_count` integer NOT NULL,
	`file_name` text NOT NULL,
	`file_key` text NOT NULL,
	`file_type` text NOT NULL,
	`status` text NOT NULL,
	`created_at` text NOT NULL,
	`approved_at` text,
	`approved_by` text
);

