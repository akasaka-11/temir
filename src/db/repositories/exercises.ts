import { eq, isNull } from 'drizzle-orm';

import { newId } from '@/lib/id';

import type { Database } from '../client';
import { type Equipment, exercises, type MuscleGroup } from '../schema';

/** Query for all non-deleted exercises; pass to useLiveQuery for live updates. */
export function selectExercises(db: Database) {
  return db.select().from(exercises).where(isNull(exercises.deletedAt));
}

export function getExercise(db: Database, id: string) {
  return db.select().from(exercises).where(eq(exercises.id, id)).get();
}

export type NewCustomExercise = {
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
};

export function createCustomExercise(db: Database, input: NewCustomExercise): string {
  const id = newId();
  const now = Date.now();
  db.insert(exercises)
    .values({
      id,
      nameKey: null,
      customName: input.name,
      muscleGroup: input.muscleGroup,
      equipment: input.equipment,
      isCustom: true,
      createdAt: now,
      updatedAt: now,
    })
    .run();
  return id;
}
