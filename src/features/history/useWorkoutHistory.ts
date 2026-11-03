import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useMemo } from 'react';

import { db } from '@/db/client';
import { getSetsForWorkouts, selectFinishedWorkouts } from '@/db/repositories/workouts';
import type { Workout } from '@/db/schema';
import { buildWorkoutStats, type WorkoutStats } from '@/lib/history';

export type HistoryItem = { workout: Workout; stats: WorkoutStats };

const EMPTY_STATS: WorkoutStats = { setCount: 0, volumeKg: 0, exercises: [] };

/** Finished workouts with their stats; updates live when a workout is saved or deleted. */
export function useWorkoutHistory(): HistoryItem[] {
  const { data } = useLiveQuery(selectFinishedWorkouts(db));

  return useMemo(() => {
    const stats = buildWorkoutStats(getSetsForWorkouts(db, data.map((w) => w.id)));
    return data.map((workout) => ({ workout, stats: stats.get(workout.id) ?? EMPTY_STATS }));
  }, [data]);
}
