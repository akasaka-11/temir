import type { MakeId } from './activeWorkout';

// Pure editing logic for a routine (workout template) before it is saved.

export const MIN_TARGET_SETS = 1;
export const MAX_TARGET_SETS = 20;
export const MAX_ROUTINE_NAME_LENGTH = 60;

export type RoutineDraftItem = {
  key: string;
  exerciseId: string;
  targetSets: number;
};

export type RoutineDraft = {
  /** null for a routine that has not been saved yet. */
  id: string | null;
  name: string;
  notes: string;
  items: RoutineDraftItem[];
};

export const DEFAULT_TARGET_SETS = 3;

export function emptyDraft(): RoutineDraft {
  return { id: null, name: '', notes: '', items: [] };
}

export function addDraftExercises(
  draft: RoutineDraft,
  exerciseIds: readonly string[],
  makeId: MakeId,
): RoutineDraft {
  const added = exerciseIds.map((exerciseId) => ({
    key: makeId(),
    exerciseId,
    targetSets: DEFAULT_TARGET_SETS,
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

export function setDraftTargetSets(draft: RoutineDraft, key: string, targetSets: number): RoutineDraft {
  const clamped = Math.min(MAX_TARGET_SETS, Math.max(MIN_TARGET_SETS, Math.round(targetSets)));
  return {
    ...draft,
    items: draft.items.map((item) => (item.key === key ? { ...item, targetSets: clamped } : item)),
  };
}

export type RoutineDraftError = 'nameRequired' | 'nameTooLong' | 'noExercises';

export function validateDraft(draft: RoutineDraft): RoutineDraftError[] {
  const errors: RoutineDraftError[] = [];
  const name = draft.name.trim();
  if (name.length === 0) errors.push('nameRequired');
  if (name.length > MAX_ROUTINE_NAME_LENGTH) errors.push('nameTooLong');
  if (draft.items.length === 0) errors.push('noExercises');
  return errors;
}
