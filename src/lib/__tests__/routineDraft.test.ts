import {
  addDraftExercises,
  DEFAULT_TARGET_SETS,
  emptyDraft,
  moveDraftItem,
  removeDraftItem,
  type RoutineDraft,
  setDraftTargetSets,
  validateDraft,
} from '../routineDraft';

function idFactory() {
  let n = 0;
  return () => `k${++n}`;
}

function draftWith(...ids: string[]): RoutineDraft {
  return addDraftExercises({ ...emptyDraft(), name: 'Push' }, ids, idFactory());
}

describe('routine draft', () => {
  it('adds exercises with default target sets', () => {
    const draft = draftWith('bench', 'ohp');
    expect(draft.items).toEqual([
      { key: 'k1', exerciseId: 'bench', targetSets: DEFAULT_TARGET_SETS },
      { key: 'k2', exerciseId: 'ohp', targetSets: DEFAULT_TARGET_SETS },
    ]);
  });

  it('removes an item', () => {
    expect(removeDraftItem(draftWith('a', 'b'), 'k1').items.map((i) => i.exerciseId)).toEqual(['b']);
  });

  it('moves items up and down', () => {
    const draft = draftWith('a', 'b', 'c');
    expect(moveDraftItem(draft, 'k3', -1).items.map((i) => i.exerciseId)).toEqual(['a', 'c', 'b']);
    expect(moveDraftItem(draft, 'k1', 1).items.map((i) => i.exerciseId)).toEqual(['b', 'a', 'c']);
  });

  it('ignores moves past the ends', () => {
    const draft = draftWith('a', 'b');
    expect(moveDraftItem(draft, 'k1', -1)).toBe(draft);
    expect(moveDraftItem(draft, 'k2', 1)).toBe(draft);
    expect(moveDraftItem(draft, 'missing', 1)).toBe(draft);
  });

  it('clamps target sets to 1..20', () => {
    const draft = draftWith('a');
    expect(setDraftTargetSets(draft, 'k1', 0).items[0]!.targetSets).toBe(1);
    expect(setDraftTargetSets(draft, 'k1', 99).items[0]!.targetSets).toBe(20);
    expect(setDraftTargetSets(draft, 'k1', 5).items[0]!.targetSets).toBe(5);
  });
});

describe('validateDraft', () => {
  it('accepts a named routine with exercises', () => {
    expect(validateDraft(draftWith('a'))).toEqual([]);
  });

  it('requires a name and at least one exercise', () => {
    expect(validateDraft(emptyDraft())).toEqual(['nameRequired', 'noExercises']);
  });

  it('rejects too long names', () => {
    expect(validateDraft({ ...draftWith('a'), name: 'x'.repeat(61) })).toEqual(['nameTooLong']);
  });
});
