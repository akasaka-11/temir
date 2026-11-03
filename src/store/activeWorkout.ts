import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import * as logic from '@/lib/activeWorkout';
import type { ActiveWorkout, NewActiveExercise, SetFallback, SetTexts } from '@/lib/activeWorkout';
import { newId } from '@/lib/id';
import type { WeightUnit } from '@/lib/units';
import type { WorkoutSummary } from '@/features/workout/finishWorkout';

import { persistStorage } from './storage';

export type RestTimer = {
  endsAt: number;
  durationSeconds: number;
  notificationId: string | null;
};

type ActiveWorkoutState = {
  workout: ActiveWorkout | null;
  rest: RestTimer | null;
  /** Result of the last finished workout, shown on the summary screen (not persisted). */
  summary: WorkoutSummary | null;

  /** Starts a workout, optionally prefilled (e.g. from a template). */
  start: (
    name: string,
    unit: WeightUnit,
    routineId?: string | null,
    exercises?: readonly NewActiveExercise[],
  ) => void;
  addExercises: (entries: readonly NewActiveExercise[]) => void;
  removeExercise: (rowId: string) => void;
  addSet: (rowId: string) => void;
  removeSet: (rowId: string, setId: string) => void;
  updateSet: (rowId: string, setId: string, patch: Partial<SetTexts>) => void;
  /** Returns true when the set became completed, false when un-completed, null when invalid. */
  toggleSet: (rowId: string, setId: string, fallback?: SetFallback) => boolean | null;
  setRest: (rest: RestTimer | null) => void;
  setSummary: (summary: WorkoutSummary | null) => void;
  clearWorkout: () => void;
};

export const useActiveWorkout = create<ActiveWorkoutState>()(
  persist(
    (set, get) => {
      const update = (fn: (workout: ActiveWorkout) => ActiveWorkout) => {
        const { workout } = get();
        if (workout) set({ workout: fn(workout) });
      };

      return {
        workout: null,
        rest: null,
        summary: null,

        start: (name, unit, routineId = null, exercises = []) => {
          const empty: ActiveWorkout = { id: newId(), name, startedAt: Date.now(), routineId, unit, exercises: [] };
          set({ workout: logic.addExercises(empty, exercises, newId), rest: null });
        },
        addExercises: (entries) => update((w) => logic.addExercises(w, entries, newId)),
        removeExercise: (rowId) => update((w) => logic.removeExercise(w, rowId)),
        addSet: (rowId) => update((w) => logic.addSet(w, rowId, newId)),
        removeSet: (rowId, setId) => update((w) => logic.removeSet(w, rowId, setId)),
        updateSet: (rowId, setId, patch) => update((w) => logic.updateSet(w, rowId, setId, patch)),
        toggleSet: (rowId, setId, fallback) => {
          const { workout } = get();
          if (!workout) return null;
          const result = logic.toggleSet(workout, rowId, setId, fallback);
          if (!result) return null;
          set({ workout: result.workout });
          return result.completed;
        },
        setRest: (rest) => set({ rest }),
        setSummary: (summary) => set({ summary }),
        clearWorkout: () => set({ workout: null, rest: null }),
      };
    },
    {
      name: 'activeWorkout',
      storage: persistStorage,
      partialize: (state) => ({ workout: state.workout, rest: state.rest }),
    },
  ),
);
