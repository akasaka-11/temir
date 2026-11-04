import type { ExerciseKind } from '@/db/schema';

import type { MakeId, NewActiveExercise, SetTexts } from './activeWorkout';
import { distanceToInput, formatCardioDuration, parseDistanceKm, parseDuration } from './cardio';
import { formatRepsRange, parseRepsRange, parseWeight, toKg, type WeightUnit, weightToInput } from './units';

// Routines (workout templates): pure editing logic and conversions.

export const MAX_TARGET_SETS = 20;
export const MAX_ROUTINE_NAME_LENGTH = 60;
export const DEFAULT_STRENGTH_SETS = 3;

/** A planned set as stored: every target is optional. Weight in kg. */
export type TargetSet = {
  weightKg: number | null;
  /** Target reps, or the lower bound of a range. */
  reps: number | null;
  /** Upper bound of a range like 6–8 (null for a single target). */
  repsMax: number | null;
  durationSeconds: number | null;
  distanceM: number | null;
};

export const EMPTY_TARGET: TargetSet = {
  weightKg: null,
  reps: null,
  repsMax: null,
  durationSeconds: null,
  distanceM: null,
};

/** A routine exercise with its planned sets, independent of the UI. */
export type RoutineSpecItem = { exerciseId: string; kind: ExerciseKind; sets: TargetSet[] };

export type DraftSet = SetTexts & { key: string };

export type RoutineDraftItem = {
  key: string;
  exerciseId: string;
  kind: ExerciseKind;
  sets: DraftSet[];
};

export type RoutineDraft = {
  /** null for a routine that has not been saved yet. */
  id: string | null;
  name: string;
  notes: string;
  items: RoutineDraftItem[];
};

export function emptyDraft(): RoutineDraft {
  return { id: null, name: '', notes: '', items: [] };
}

const emptyTexts = (key: string): DraftSet => ({
  key,
  weightText: '',
  repsText: '',
  durationText: '',
  distanceText: '',
});

function mapItem(draft: RoutineDraft, itemKey: string, fn: (item: RoutineDraftItem) => RoutineDraftItem) {
  return { ...draft, items: draft.items.map((item) => (item.key === itemKey ? fn(item) : item)) };
}

export function addDraftExercises(
  draft: RoutineDraft,
  entries: readonly { exerciseId: string; kind: ExerciseKind }[],
  makeId: MakeId,
): RoutineDraft {
  const added = entries.map(({ exerciseId, kind }) => ({
    key: makeId(),
    exerciseId,
    kind,
    sets: Array.from({ length: kind === 'cardio' ? 1 : DEFAULT_STRENGTH_SETS }, () => emptyTexts(makeId())),
  }));
  return { ...draft, items: [...draft.items, ...added] };
}

export function removeDraftItem(draft: RoutineDraft, key: string): RoutineDraft {
  return { ...draft, items: draft.items.filter((item) => item.key !== key) };
}

/** Moves an item up (-1) or down (+1); out-of-range moves are ignored. */
export function moveDraftItem(draft: RoutineDraft, key: string, direction: -1 | 1): RoutineDraft {
  const from = draft.items.findIndex((item) => item.key === key);
  const to = from + direction;
  if (from < 0 || to < 0 || to >= draft.items.length) return draft;
  const items = [...draft.items];
  const [moved] = items.splice(from, 1);
  items.splice(to, 0, moved!);
  return { ...draft, items };
}

/** Adds a set copying the last one's targets (max 20 sets). */
export function addDraftSet(draft: RoutineDraft, itemKey: string, makeId: MakeId): RoutineDraft {
  return mapItem(draft, itemKey, (item) => {
    if (item.sets.length >= MAX_TARGET_SETS) return item;
    const last = item.sets[item.sets.length - 1];
    return { ...item, sets: [...item.sets, last ? { ...last, key: makeId() } : emptyTexts(makeId())] };
  });
}

/** Removes a set; an exercise always keeps at least one. */
export function removeDraftSet(draft: RoutineDraft, itemKey: string, setKey: string): RoutineDraft {
  return mapItem(draft, itemKey, (item) =>
    item.sets.length <= 1 ? item : { ...item, sets: item.sets.filter((s) => s.key !== setKey) },
  );
}

export function updateDraftSet(
  draft: RoutineDraft,
  itemKey: string,
  setKey: string,
  patch: Partial<SetTexts>,
): RoutineDraft {
  return mapItem(draft, itemKey, (item) => ({
    ...item,
    sets: item.sets.map((s) => (s.key === setKey ? { ...s, ...patch } : s)),
  }));
}

/** Parses typed targets. Empty fields are allowed (no target); invalid text returns null. */
export function parseTargetSet(texts: Partial<SetTexts>, kind: ExerciseKind, unit: WeightUnit): TargetSet | null {
  const filled = (t: string | undefined) => (t ?? '').trim() !== '';
  if (kind === 'cardio') {
    const duration = filled(texts.durationText) ? parseDuration(texts.durationText!) : undefined;
    const distanceKm = parseDistanceKm(texts.distanceText ?? '');
    if (duration === null || distanceKm === null) return null;
    return {
      ...EMPTY_TARGET,
      durationSeconds: duration ?? null,
      distanceM: distanceKm === undefined ? null : Math.round(distanceKm * 1000),
    };
  }
  const weight = filled(texts.weightText) ? parseWeight(texts.weightText!, unit) : undefined;
  const reps = filled(texts.repsText) ? parseRepsRange(texts.repsText!) : undefined;
  if (weight === null || reps === null) return null;
  return {
    ...EMPTY_TARGET,
    weightKg: weight === undefined ? null : toKg(weight, unit),
    reps: reps?.min ?? null,
    repsMax: reps && reps.max !== reps.min ? reps.max : null,
  };
}

/** Stored targets -> input texts in the given unit (empty where there is no target). */
export function targetToTexts(target: TargetSet, unit: WeightUnit): SetTexts {
  return {
    weightText: target.weightKg === null ? '' : weightToInput(target.weightKg, unit),
    repsText: target.reps === null ? '' : formatRepsRange(target.reps, target.repsMax),
    durationText: target.durationSeconds === null ? '' : formatCardioDuration(target.durationSeconds),
    distanceText: target.distanceM === null ? '' : distanceToInput(target.distanceM),
  };
}

export type RoutineDraftError = 'nameRequired' | 'nameTooLong' | 'noExercises' | 'invalidSet';

export function validateDraft(draft: RoutineDraft, unit: WeightUnit): RoutineDraftError[] {
  const errors: RoutineDraftError[] = [];
  const name = draft.name.trim();
  if (name.length === 0) errors.push('nameRequired');
  if (name.length > MAX_ROUTINE_NAME_LENGTH) errors.push('nameTooLong');
  if (draft.items.length === 0) errors.push('noExercises');
  const invalid = draft.items.some((item) => item.sets.some((s) => !parseTargetSet(s, item.kind, unit)));
  if (invalid) errors.push('invalidSet');
  return errors;
}

/** Draft -> storable items (call after validateDraft passed). */
export function draftToSpec(draft: RoutineDraft, unit: WeightUnit): RoutineSpecItem[] {
  return draft.items.map((item) => ({
    exerciseId: item.exerciseId,
    kind: item.kind,
    sets: item.sets.map((s) => parseTargetSet(s, item.kind, unit) ?? EMPTY_TARGET),
  }));
}

export function specToDraftItems(items: readonly RoutineSpecItem[], unit: WeightUnit, makeId: MakeId) {
  return items.map((item) => ({
    key: makeId(),
    exerciseId: item.exerciseId,
    kind: item.kind,
    sets: item.sets.map((target) => ({ key: makeId(), ...targetToTexts(target, unit) })),
  }));
}

/**
 * Routine -> exercises for a new workout, with targets prefilled in the workout's unit.
 * A single reps target is prefilled; a range ("6–8") becomes a hint, the user enters what they did.
 */
export function specToWorkoutEntries(items: readonly RoutineSpecItem[], unit: WeightUnit): NewActiveExercise[] {
  return items.map((item) => ({
    exerciseId: item.exerciseId,
    kind: item.kind,
    sets: item.sets.map((target) => {
      const texts = targetToTexts(target, unit);
      const isRange = target.repsMax !== null && target.repsMax !== target.reps;
      return isRange ? { ...texts, repsText: '', repsHint: texts.repsText } : texts;
    }),
  }));
}

/** Short summary for cards, e.g. "3 × 8–10" (reps range of the planned sets). */
export function describeTargets(sets: readonly TargetSet[]): { count: number; repsMin: number | null; repsMax: number | null } {
  const reps = sets.map((s) => s.reps).filter((r): r is number => r !== null);
  return {
    count: sets.length,
    repsMin: reps.length ? Math.min(...reps) : null,
    repsMax: reps.length ? Math.max(...reps) : null,
  };
}

