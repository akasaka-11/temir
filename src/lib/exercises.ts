import type { Exercise, MuscleGroup } from '@/db/schema';

import { matchesQuery } from './search';

export type ExerciseNameSource = Pick<Exercise, 'isCustom' | 'customName' | 'nameKey'>;

/** Display name: the user's text for custom exercises, the translation for built-ins. */
export function getExerciseName(
  exercise: ExerciseNameSource,
  translatedNames: Readonly<Record<string, string>>,
): string {
  if (exercise.isCustom) return exercise.customName ?? '';
  const key = exercise.nameKey ?? '';
  return translatedNames[key] ?? key;
}

export type ExerciseFilter = {
  query: string;
  muscleGroup: MuscleGroup | null;
};

export type NamedExercise<T> = T & { displayName: string };

/** Adds display names, applies search + muscle group filter, sorts by name in the given language. */
export function filterAndSortExercises<T extends ExerciseNameSource & { muscleGroup: MuscleGroup }>(
  list: readonly T[],
  filter: ExerciseFilter,
  translatedNames: Readonly<Record<string, string>>,
  language: string,
): NamedExercise<T>[] {
  const collator = new Intl.Collator(language, { sensitivity: 'base' });
  return list
    .map((exercise) => ({ ...exercise, displayName: getExerciseName(exercise, translatedNames) }))
    .filter((exercise) => filter.muscleGroup === null || exercise.muscleGroup === filter.muscleGroup)
    .filter((exercise) => matchesQuery(exercise.displayName, filter.query))
    .sort((a, b) => collator.compare(a.displayName, b.displayName));
}

export const MAX_EXERCISE_NAME_LENGTH = 60;

export type ExerciseNameError = 'required' | 'tooLong';

/** Validates a custom exercise name; returns the trimmed name or an error code. */
export function validateExerciseName(
  raw: string,
): { ok: true; name: string } | { ok: false; error: ExerciseNameError } {
  const name = raw.trim().replace(/\s+/g, ' ');
  if (name.length === 0) return { ok: false, error: 'required' };
  if (name.length > MAX_EXERCISE_NAME_LENGTH) return { ok: false, error: 'tooLong' };
  return { ok: true, name };
}
