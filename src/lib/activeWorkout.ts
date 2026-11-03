import { parseReps, parseWeight, toKg, type WeightUnit } from './units';

// Pure state transitions for the workout in progress. The Zustand store only wires them up,
// which keeps this logic easy to unit test.

export type ActiveSet = {
  id: string;
  /** Raw text from the input, in the workout's unit ("62,5" is fine). */
  weightText: string;
  repsText: string;
  isCompleted: boolean;
};

export type ActiveExercise = {
  id: string;
  exerciseId: string;
  sets: ActiveSet[];
};

export type ActiveWorkout = {
  id: string;
  name: string;
  startedAt: number;
  routineId: string | null;
  /** Unit the weights were typed in; fixed for the whole workout. */
  unit: WeightUnit;
  exercises: ActiveExercise[];
};

export type MakeId = () => string;

const emptySet = (id: string): ActiveSet => ({ id, weightText: '', repsText: '', isCompleted: false });

function mapExercise(
  workout: ActiveWorkout,
  rowId: string,
  fn: (exercise: ActiveExercise) => ActiveExercise,
): ActiveWorkout {
  return {
    ...workout,
    exercises: workout.exercises.map((exercise) => (exercise.id === rowId ? fn(exercise) : exercise)),
  };
}

function mapSet(
  workout: ActiveWorkout,
  rowId: string,
  setId: string,
  fn: (set: ActiveSet) => ActiveSet,
): ActiveWorkout {
  return mapExercise(workout, rowId, (exercise) => ({
    ...exercise,
    sets: exercise.sets.map((set) => (set.id === setId ? fn(set) : set)),
  }));
}

export function addExercises(
  workout: ActiveWorkout,
  exerciseIds: readonly string[],
  makeId: MakeId,
  setsPerExercise = 1,
): ActiveWorkout {
  const added = exerciseIds.map((exerciseId) => ({
    id: makeId(),
    exerciseId,
    sets: Array.from({ length: Math.max(1, setsPerExercise) }, () => emptySet(makeId())),
  }));
  return { ...workout, exercises: [...workout.exercises, ...added] };
}

export function removeExercise(workout: ActiveWorkout, rowId: string): ActiveWorkout {
  return { ...workout, exercises: workout.exercises.filter((exercise) => exercise.id !== rowId) };
}

/** Adds a set, copying the values of the last set to save typing. */
export function addSet(workout: ActiveWorkout, rowId: string, makeId: MakeId): ActiveWorkout {
  return mapExercise(workout, rowId, (exercise) => {
    const last = exercise.sets[exercise.sets.length - 1];
    const set: ActiveSet = last
      ? { id: makeId(), weightText: last.weightText, repsText: last.repsText, isCompleted: false }
      : emptySet(makeId());
    return { ...exercise, sets: [...exercise.sets, set] };
  });
}

export function removeSet(workout: ActiveWorkout, rowId: string, setId: string): ActiveWorkout {
  return mapExercise(workout, rowId, (exercise) => ({
    ...exercise,
    sets: exercise.sets.filter((set) => set.id !== setId),
  }));
}

export function updateSet(
  workout: ActiveWorkout,
  rowId: string,
  setId: string,
  patch: Partial<Pick<ActiveSet, 'weightText' | 'repsText'>>,
): ActiveWorkout {
  return mapSet(workout, rowId, setId, (set) => ({ ...set, ...patch }));
}

export type SetFallback = { weightText: string; repsText: string };

/**
 * Toggles "done". Empty fields are filled from `fallback` (last time's values).
 * Returns null when the set cannot be completed (no valid reps or weight).
 */
export function toggleSet(
  workout: ActiveWorkout,
  rowId: string,
  setId: string,
  fallback?: SetFallback,
): { workout: ActiveWorkout; completed: boolean } | null {
  const set = workout.exercises.find((e) => e.id === rowId)?.sets.find((s) => s.id === setId);
  if (!set) return null;

  if (set.isCompleted) {
    return { workout: mapSet(workout, rowId, setId, (s) => ({ ...s, isCompleted: false })), completed: false };
  }

  const weightText = set.weightText.trim() || fallback?.weightText || '';
  const repsText = set.repsText.trim() || fallback?.repsText || '';
  // An empty weight means bodyweight (0).
  const weight = weightText === '' ? 0 : parseWeight(weightText, workout.unit);
  const reps = parseReps(repsText);
  if (weight === null || reps === null || reps === 0) return null;

  return {
    workout: mapSet(workout, rowId, setId, (s) => ({ ...s, weightText, repsText, isCompleted: true })),
    completed: true,
  };
}

export type CompletedSet = {
  exerciseId: string;
  exercisePosition: number;
  setIndex: number;
  weightKg: number;
  reps: number;
};

/** Completed, valid sets converted to kg, with compact positions (empty exercises are dropped). */
export function collectCompletedSets(workout: ActiveWorkout): CompletedSet[] {
  const result: CompletedSet[] = [];
  let position = 0;
  for (const exercise of workout.exercises) {
    let setIndex = 0;
    for (const set of exercise.sets) {
      if (!set.isCompleted) continue;
      const weight = set.weightText.trim() === '' ? 0 : parseWeight(set.weightText, workout.unit);
      const reps = parseReps(set.repsText);
      if (weight === null || reps === null || reps === 0) continue;
      result.push({
        exerciseId: exercise.exerciseId,
        exercisePosition: position,
        setIndex,
        weightKg: toKg(weight, workout.unit),
        reps,
      });
      setIndex += 1;
    }
    if (setIndex > 0) position += 1;
  }
  return result;
}

export function countCompletedSets(workout: ActiveWorkout): number {
  return workout.exercises.reduce((sum, e) => sum + e.sets.filter((s) => s.isCompleted).length, 0);
}
