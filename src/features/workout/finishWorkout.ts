import type { Database } from '@/db/client';
import { getExerciseBests, saveFinishedWorkout } from '@/db/repositories/workouts';
import { type ActiveWorkout, collectCompletedSets } from '@/lib/activeWorkout';
import { findPersonalRecords, type PersonalRecord, type SetResult, totalVolume } from '@/lib/workoutMath';

export type WorkoutSummary = {
  workoutId: string;
  name: string;
  durationMs: number;
  volumeKg: number;
  setCount: number;
  exerciseCount: number;
  records: PersonalRecord[];
};

export type FinishResult = { status: 'empty' } | { status: 'saved'; summary: WorkoutSummary };

/** Saves the workout (completed sets only) and returns the summary with new records. */
export function finishWorkout(db: Database, workout: ActiveWorkout, now = Date.now()): FinishResult {
  const sets = collectCompletedSets(workout);
  if (sets.length === 0) return { status: 'empty' };

  const byExercise = new Map<string, SetResult[]>();
  for (const set of sets) {
    byExercise.set(set.exerciseId, [...(byExercise.get(set.exerciseId) ?? []), set]);
  }

  // Bests must be read before saving, otherwise this workout would compete with itself.
  const previousBests = getExerciseBests(db, [...byExercise.keys()]);
  const records = findPersonalRecords(byExercise, previousBests);

  saveFinishedWorkout(db, {
    id: workout.id,
    name: workout.name,
    startedAt: workout.startedAt,
    finishedAt: now,
    routineId: workout.routineId,
    sets,
  });

  return {
    status: 'saved',
    summary: {
      workoutId: workout.id,
      name: workout.name,
      durationMs: now - workout.startedAt,
      volumeKg: totalVolume(sets),
      setCount: sets.length,
      exerciseCount: byExercise.size,
      records,
    },
  };
}
