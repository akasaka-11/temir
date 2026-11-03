CREATE TABLE `routine_sets` (
	`id` text PRIMARY KEY NOT NULL,
	`routine_exercise_id` text NOT NULL,
	`set_index` integer NOT NULL,
	`weight_kg` real,
	`reps` integer,
	`duration_seconds` integer,
	`distance_m` real,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`deleted_at` integer,
	FOREIGN KEY (`routine_exercise_id`) REFERENCES `routine_exercises`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `routine_sets_routine_exercise_idx` ON `routine_sets` (`routine_exercise_id`);--> statement-breakpoint
ALTER TABLE `exercises` ADD `kind` text DEFAULT 'strength' NOT NULL;--> statement-breakpoint
ALTER TABLE `workout_sets` ADD `duration_seconds` integer;--> statement-breakpoint
ALTER TABLE `workout_sets` ADD `distance_m` real;