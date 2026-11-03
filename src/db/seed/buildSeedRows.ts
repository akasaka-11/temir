import type { NewExercise } from '../schema';
import type { BuiltInExercise } from './exercises';

/** Maps the built-in list to rows for the exercises table (pure, easy to test). */
export function buildSeedRows(list: readonly BuiltInExercise[], now: number): NewExercise[] {
  return list.map((exercise) => ({
    id: exercise.id,
    nameKey: exercise.nameKey,
    customName: null,
    muscleGroup: exercise.muscleGroup,
    equipment: exercise.equipment,
    isCustom: false,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
  }));
}
