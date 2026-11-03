import { create } from 'zustand';

import type { SetTexts } from '@/lib/activeWorkout';
import { newId } from '@/lib/id';
import * as logic from '@/lib/routineDraft';
import type { RoutineDraft } from '@/lib/routineDraft';
import type { ExerciseKind } from '@/db/schema';

// The routine being edited. Shared between the editor and the exercise picker; not persisted.
type RoutineDraftState = {
  draft: RoutineDraft;
  load: (draft: RoutineDraft) => void;
  setName: (name: string) => void;
  setNotes: (notes: string) => void;
  addExercises: (entries: readonly { exerciseId: string; kind: ExerciseKind }[]) => void;
  remove: (key: string) => void;
  move: (key: string, direction: -1 | 1) => void;
  addSet: (itemKey: string) => void;
  removeSet: (itemKey: string, setKey: string) => void;
  updateSet: (itemKey: string, setKey: string, patch: Partial<SetTexts>) => void;
};

export const useRoutineDraft = create<RoutineDraftState>()((set) => ({
  draft: logic.emptyDraft(),
  load: (draft) => set({ draft }),
  setName: (name) => set((s) => ({ draft: { ...s.draft, name } })),
  setNotes: (notes) => set((s) => ({ draft: { ...s.draft, notes } })),
  addExercises: (entries) => set((s) => ({ draft: logic.addDraftExercises(s.draft, entries, newId) })),
  remove: (key) => set((s) => ({ draft: logic.removeDraftItem(s.draft, key) })),
  move: (key, direction) => set((s) => ({ draft: logic.moveDraftItem(s.draft, key, direction) })),
  addSet: (itemKey) => set((s) => ({ draft: logic.addDraftSet(s.draft, itemKey, newId) })),
  removeSet: (itemKey, setKey) => set((s) => ({ draft: logic.removeDraftSet(s.draft, itemKey, setKey) })),
  updateSet: (itemKey, setKey, patch) =>
    set((s) => ({ draft: logic.updateDraftSet(s.draft, itemKey, setKey, patch) })),
}));
