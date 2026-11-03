import type { ExerciseKind } from '@/db/schema';

import { parseDistanceKm, parseDuration } from './cardio';
import { parseReps, parseWeight, toKg, type WeightUnit } from './units';

// Pure state transitions for the workout in progress. The Zustand store only wires them up,
// which keeps this logic easy to unit test.

/** Raw input texts of a set. Strength uses weight/reps, cardio uses duration/distance. */
export type SetTexts = {
  /** In the workout's unit ("62,5" is fine). */
  weightText: string;
  repsText: string;
  /** "25", "25:30" or "1:05:00". */
  durationText?: string;
  /** Kilometres. */
  distanceText?: string;
};

export type ActiveSet = SetTexts & {
  id: string;
  isCompleted: boolean;
};

export type ActiveExercise = {
  id: string;
  exerciseId: string;
  /** Missing in workouts saved by older versions: treated as strength. */
  kind?: ExerciseKind;
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

export type NewActiveExercise = {
  exerciseId: string;
  kind?: ExerciseKind;
  /** Prefilled sets (e.g. from a template). One empty set when omitted or empty. */
  sets?: readonly Partial<SetTexts>[];
};

const emptyTexts: SetTexts = { weightText: '', repsText: '', durationText: '', distanceText: '' };

function newSet(id: string, texts: Partial<SetTexts> = {}): ActiveSet {
  return { ...emptyTexts, ...texts, id, isCompleted: false };
}

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
  entries: readonly NewActiveExercise[],
  makeId: MakeId,
): ActiveWorkout {
  const added = entries.map(({ exerciseId, kind, sets }) => ({
    id: makeId(),
    exerciseId,
    kind: kind ?? 'strength',
    sets: sets && sets.length > 0 ? sets.map((texts) => newSet(makeId(), texts)) : [newSet(makeId())],
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
    const set = last
      ? newSet(makeId(), {
          weightText: last.weightText,
          repsText: last.repsText,
          durationText: last.durationText,
          distanceText: last.distanceText,
        })
      : newSet(makeId());
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
  patch: Partial<SetTexts>,
): ActiveWorkout {
  return mapSet(workout, rowId, setId, (set) => ({ ...set, ...patch }));
}

export type SetFallback = Partial<SetTexts>;

export type ParsedSet = {
  weightKg: number;
  reps: number;
  durationSeconds: number | null;
  distanceM: number | null;
};

/**
 * Validates set texts. Strength: reps > 0, empty weight = bodyweight (0).
 * Cardio: duration required, distance optional. Returns null when invalid.
 */
export function parseSetTexts(texts: Partial<SetTexts>, kind: ExerciseKind, unit: WeightUnit): ParsedSet | null {
  if (kind === 'cardio') {
    const durationSeconds = parseDuration(texts.durationText ?? '');
    const distanceKm = parseDistanceKm(texts.distanceText ?? '');
    if (durationSeconds === null || distanceKm === null) return null;
    return {
      weightKg: 0,
      reps: 0,
      durationSeconds,
      distanceM: distanceKm === undefined ? null : Math.round(distanceKm * 1000),
    };
  }
  const weightText = (texts.weightText ?? '').trim();
  const weight = weightText === '' ? 0 : parseWeight(weightText, unit);
  const reps = parseReps(texts.repsText ?? '');
  if (weight === null || reps === null || reps === 0) return null;
  return { weightKg: toKg(weight, unit), reps, durationSeconds: null, distanceM: null };
}

/** Each empty field takes the fallback (last time's value). */
function withFallback(set: SetTexts, fallback: SetFallback | undefined): SetTexts {
  const pick = (own: string | undefined, other: string | undefined) => (own ?? '').trim() || other || '';
  return {
    weightText: pick(set.weightText, fallback?.weightText),
    repsText: pick(set.repsText, fallback?.repsText),
    durationText: pick(set.durationText, fallback?.durationText),
    distanceText: pick(set.distanceText, fallback?.distanceText),
  };
}

/**
 * Toggles "done". Empty fields are filled from `fallback` (last time's values).
 * Returns null when the set cannot be completed (invalid values).
 */
export function toggleSet(
  workout: ActiveWorkout,
  rowId: string,
  setId: string,
  fallback?: SetFallback,
): { workout: ActiveWorkout; completed: boolean } | null {
  const exercise = workout.exercises.find((e) => e.id === rowId);
  const set = exercise?.sets.find((s) => s.id === setId);
  if (!exercise || !set) return null;

  if (set.isCompleted) {
    return { workout: mapSet(workout, rowId, setId, (s) => ({ ...s, isCompleted: false })), completed: false };
  }

  const texts = withFallback(set, fallback);
  if (!parseSetTexts(texts, exercise.kind ?? 'strength', workout.unit)) return null;

  return {
    workout: mapSet(workout, rowId, setId, (s) => ({ ...s, ...texts, isCompleted: true })),
    completed: true,
  };
}

export type CompletedSet = ParsedSet & {
  exerciseId: string;
  exercisePosition: number;
  setIndex: number;
};

/** Completed, valid sets (weights in kg), with compact positions (empty exercises are dropped). */
export function collectCompletedSets(workout: ActiveWorkout): CompletedSet[] {
  const result: CompletedSet[] = [];
  let position = 0;
  for (const exercise of workout.exercises) {
    let setIndex = 0;
    for (const set of exercise.sets) {
      if (!set.isCompleted) continue;
      const parsed = parseSetTexts(set, exercise.kind ?? 'strength', workout.unit);
      if (!parsed) continue;
      result.push({ ...parsed, exerciseId: exercise.exerciseId, exercisePosition: position, setIndex });
      setIndex += 1;
    }
    if (setIndex > 0) position += 1;
  }
  return result;
}

export function countCompletedSets(workout: ActiveWorkout): number {
  return workout.exercises.reduce((sum, e) => sum + e.sets.filter((s) => s.isCompleted).length, 0);
}
