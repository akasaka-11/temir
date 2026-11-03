import { and, asc, desc, eq, inArray, isNotNull, isNull } from 'drizzle-orm';

import type { CompletedSet } from '@/lib/activeWorkout';
import { newId } from '@/lib/id';
import { bestsOf, type ExerciseBests, type SetResult } from '@/lib/workoutMath';

import type { Database } from '../client';
import { workouts, workoutSets } from '../schema';

const finishedAndAlive = and(isNotNull(workouts.finishedAt), isNull(workouts.deletedAt));

/** Completed sets of every finished workout for the given exercises, newest workout first. */
function selectHistory(db: Database, exerciseIds: readonly string[]) {
  return db
    .select({
      workoutId: workoutSets.workoutId,
      exerciseId: workoutSets.exerciseId,
      weightKg: workoutSets.weightKg,
      reps: workoutSets.reps,
    })
    .from(workoutSets)
    .innerJoin(workouts, eq(workouts.id, workoutSets.workoutId))
    .where(
      and(
        inArray(workoutSets.exerciseId, [...exerciseIds]),
        eq(workoutSets.isCompleted, true),
        isNull(workoutSets.deletedAt),
        finishedAndAlive,
      ),
    )
    .orderBy(desc(workouts.startedAt), asc(workoutSets.setIndex))
    .all();
}

/** Sets from the most recent finished workout that contains each exercise. */
export function getPreviousSets(
  db: Database,
  exerciseIds: readonly string[],
): Map<string, SetResult[]> {
  const result = new Map<string, SetResult[]>();
  if (exerciseIds.length === 0) return result;

  const latestWorkout = new Map<string, string>();
  for (const row of selectHistory(db, exerciseIds)) {
    const latest = latestWorkout.get(row.exerciseId) ?? row.workoutId;
    latestWorkout.set(row.exerciseId, latest);
    if (latest !== row.workoutId) continue;
    const sets = result.get(row.exerciseId) ?? [];
    sets.push({ weightKg: row.weightKg, reps: row.reps });
    result.set(row.exerciseId, sets);
  }
  return result;
}

/** All-time bests per exercise, used to detect new personal records. */
export function getExerciseBests(
  db: Database,
  exerciseIds: readonly string[],
): Map<string, ExerciseBests> {
  const grouped = new Map<string, SetResult[]>();
  if (exerciseIds.length === 0) return new Map();
  for (const row of selectHistory(db, exerciseIds)) {
    const sets = grouped.get(row.exerciseId) ?? [];
    sets.push({ weightKg: row.weightKg, reps: row.reps });
    grouped.set(row.exerciseId, sets);
  }
  return new Map([...grouped].map(([id, sets]) => [id, bestsOf(sets)]));
}

export type FinishedWorkoutInput = {
  id: string;
  name: string;
  startedAt: number;
  finishedAt: number;
  routineId: string | null;
  sets: readonly CompletedSet[];
};

export function saveFinishedWorkout(db: Database, input: FinishedWorkoutInput): void {
  const now = Date.now();
  db.transaction((tx) => {
    tx.insert(workouts)
      .values({
        id: input.id,
        name: input.name,
        startedAt: input.startedAt,
        finishedAt: input.finishedAt,
        routineId: input.routineId,
        notes: null,
        createdAt: now,
        updatedAt: now,
      })
      .run();
    if (input.sets.length > 0) {
      tx.insert(workoutSets)
        .values(
          input.sets.map((set) => ({
            id: newId(),
            workoutId: input.id,
            exerciseId: set.exerciseId,
            exercisePosition: set.exercisePosition,
            setIndex: set.setIndex,
            weightKg: set.weightKg,
            reps: set.reps,
            rpe: null,
            isCompleted: true,
            createdAt: now,
            updatedAt: now,
          })),
        )
        .run();
    }
  });
}
