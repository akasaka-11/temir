import { create } from 'zustand';

import { newId } from '@/lib/id';
import * as logic from '@/lib/routineDraft';
import type { RoutineDraft } from '@/lib/routineDraft';

// The routine being edited. Shared between the editor and the exercise picker; not persisted.
type RoutineDraftState = {
  draft: RoutineDraft;
  load: (draft: RoutineDraft) => void;
  setName: (name: string) => void;
  setNotes: (notes: string) => void;
  addExercises: (exerciseIds: readonly string[]) => void;
  remove: (key: string) => void;
  move: (key: string, direction: -1 | 1) => void;
  setTargetSets: (key: string, targetSets: number) => void;
};

export const useRoutineDraft = create<RoutineDraftState>()((set) => ({
  draft: logic.emptyDraft(),
  load: (draft) => set({ draft }),
  setName: (name) => set((s) => ({ draft: { ...s.draft, name } })),
  setNotes: (notes) => set((s) => ({ draft: { ...s.draft, notes } })),
  addExercises: (ids) => set((s) => ({ draft: logic.addDraftExercises(s.draft, ids, newId) })),
  remove: (key) => set((s) => ({ draft: logic.removeDraftItem(s.draft, key) })),
  move: (key, direction) => set((s) => ({ draft: logic.moveDraftItem(s.draft, key, direction) })),
  setTargetSets: (key, targetSets) =>
    set((s) => ({ draft: logic.setDraftTargetSets(s.draft, key, targetSets) })),
}));
