import { index, integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// Conventions (keep them, they make the future Supabase sync easy):
// - ids are UUID strings generated on the device
// - timestamps are epoch milliseconds
// - rows are soft-deleted via deleted_at so deletions can be synced
const timestamps = {
  createdAt: integer('created_at').notNull(),
  updatedAt: integer('updated_at').notNull(),
  deletedAt: integer('deleted_at'),
};

export const MUSCLE_GROUPS = [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'forearms',
  'quads',
  'hamstrings',
  'glutes',
  'calves',
  'abs',
  'full_body',
  'cardio',
] as const;
export type MuscleGroup = (typeof MUSCLE_GROUPS)[number];

export const EQUIPMENT = [
  'barbell',
  'dumbbell',
  'machine',
  'cable',
  'bodyweight',
  'kettlebell',
  'other',
] as const;
export type Equipment = (typeof EQUIPMENT)[number];

/** strength: weight × reps; cardio: duration (+ optional distance). */
export const EXERCISE_KINDS = ['strength', 'cardio'] as const;
export type ExerciseKind = (typeof EXERCISE_KINDS)[number];

export const exercises = sqliteTable(
  'exercises',
  {
    id: text('id').primaryKey(),
    // Built-in exercises store a translation key, custom ones store the user's text.
    nameKey: text('name_key'),
    customName: text('custom_name'),
    muscleGroup: text('muscle_group', { enum: MUSCLE_GROUPS }).notNull(),
    equipment: text('equipment', { enum: EQUIPMENT }).notNull(),
    isCustom: integer('is_custom', { mode: 'boolean' }).notNull().default(false),
    kind: text('kind', { enum: EXERCISE_KINDS }).notNull().default('strength'),
    ...timestamps,
  },
  (table) => [index('exercises_muscle_group_idx').on(table.muscleGroup)],
);

export const routines = sqliteTable('routines', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  notes: text('notes'),
  ...timestamps,
});

export const routineExercises = sqliteTable(
  'routine_exercises',
  {
    id: text('id').primaryKey(),
    routineId: text('routine_id')
      .notNull()
      .references(() => routines.id, { onDelete: 'cascade' }),
    exerciseId: text('exercise_id')
      .notNull()
      .references(() => exercises.id),
    position: integer('position').notNull(),
    targetSets: integer('target_sets').notNull().default(3),
    ...timestamps,
  },
  (table) => [index('routine_exercises_routine_idx').on(table.routineId)],
);

/** Planned sets of a routine exercise. Targets are optional; weight is always kg. */
export const routineSets = sqliteTable(
  'routine_sets',
  {
    id: text('id').primaryKey(),
    routineExerciseId: text('routine_exercise_id')
      .notNull()
      .references(() => routineExercises.id, { onDelete: 'cascade' }),
    setIndex: integer('set_index').notNull(),
    weightKg: real('weight_kg'),
    reps: integer('reps'),
    durationSeconds: integer('duration_seconds'),
    distanceM: real('distance_m'),
    ...timestamps,
  },
  (table) => [index('routine_sets_routine_exercise_idx').on(table.routineExerciseId)],
);

export const workouts = sqliteTable(
  'workouts',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    startedAt: integer('started_at').notNull(),
    finishedAt: integer('finished_at'),
    routineId: text('routine_id').references(() => routines.id, { onDelete: 'set null' }),
    notes: text('notes'),
    ...timestamps,
  },
  (table) => [index('workouts_started_at_idx').on(table.startedAt)],
);

export const workoutSets = sqliteTable(
  'workout_sets',
  {
    id: text('id').primaryKey(),
    workoutId: text('workout_id')
      .notNull()
      .references(() => workouts.id, { onDelete: 'cascade' }),
    exerciseId: text('exercise_id')
      .notNull()
      .references(() => exercises.id),
    // Order of the exercise inside the workout (sets of one exercise share it).
    exercisePosition: integer('exercise_position').notNull(),
    setIndex: integer('set_index').notNull(),
    weightKg: real('weight_kg').notNull().default(0),
    reps: integer('reps').notNull().default(0),
    rpe: real('rpe'),
    // Cardio only (null for strength sets).
    durationSeconds: integer('duration_seconds'),
    distanceM: real('distance_m'),
    isCompleted: integer('is_completed', { mode: 'boolean' }).notNull().default(false),
    ...timestamps,
  },
  (table) => [
    index('workout_sets_workout_idx').on(table.workoutId),
    index('workout_sets_exercise_idx').on(table.exerciseId),
  ],
);

export type Exercise = typeof exercises.$inferSelect;
export type NewExercise = typeof exercises.$inferInsert;
export type Routine = typeof routines.$inferSelect;
export type RoutineExercise = typeof routineExercises.$inferSelect;
export type Workout = typeof workouts.$inferSelect;
export type WorkoutSet = typeof workoutSets.$inferSelect;
