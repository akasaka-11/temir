import {
  addDraftExercises,
  addDraftSet,
  DEFAULT_STRENGTH_SETS,
  describeTargets,
  draftToSpec,
  EMPTY_TARGET,
  emptyDraft,
  MAX_TARGET_SETS,
  moveDraftItem,
  parseTargetSet,
  removeDraftItem,
  removeDraftSet,
  type RoutineDraft,
  specToDraftItems,
  specToWorkoutEntries,
  targetToTexts,
  updateDraftSet,
  validateDraft,
} from '../routineDraft';

function idFactory() {
  let n = 0;
  return () => `k${++n}`;
}

function draftWith(...ids: string[]): RoutineDraft {
  return addDraftExercises(
    { ...emptyDraft(), name: 'Push' },
    ids.map((exerciseId) => ({ exerciseId, kind: exerciseId === 'run' ? 'cardio' : 'strength' })),
    idFactory(),
  );
}

describe('routine draft editing', () => {
  it('adds 3 empty sets for strength and 1 for cardio', () => {
    const draft = draftWith('bench', 'run');
    expect(draft.items[0]!.sets).toHaveLength(DEFAULT_STRENGTH_SETS);
    expect(draft.items[1]!.sets).toHaveLength(1);
    expect(draft.items[1]!.kind).toBe('cardio');
  });

  it('adds a set copying the last targets and removes sets but keeps one', () => {
    const makeId = idFactory();
    let draft = addDraftExercises({ ...emptyDraft(), name: 'x' }, [{ exerciseId: 'bench', kind: 'strength' }], makeId);
    const item = draft.items[0]!;
    draft = updateDraftSet(draft, item.key, item.sets[2]!.key, { weightText: '80', repsText: '5' });
    draft = addDraftSet(draft, item.key, makeId);
    expect(draft.items[0]!.sets[3]).toMatchObject({ weightText: '80', repsText: '5' });
    for (const set of draft.items[0]!.sets) draft = removeDraftSet(draft, item.key, set.key);
    expect(draft.items[0]!.sets).toHaveLength(1);
  });

  it('never exceeds the max number of sets', () => {
    const makeId = idFactory();
    let draft = draftWith('bench');
    for (let i = 0; i < 30; i += 1) draft = addDraftSet(draft, draft.items[0]!.key, makeId);
    expect(draft.items[0]!.sets).toHaveLength(MAX_TARGET_SETS);
  });

  it('moves and removes items', () => {
    const draft = draftWith('a', 'b', 'c');
    const keys = draft.items.map((i) => i.key);
    expect(moveDraftItem(draft, keys[2]!, -1).items.map((i) => i.exerciseId)).toEqual(['a', 'c', 'b']);
    expect(moveDraftItem(draft, keys[0]!, -1)).toBe(draft);
    expect(removeDraftItem(draft, keys[0]!).items.map((i) => i.exerciseId)).toEqual(['b', 'c']);
  });
});

describe('parseTargetSet', () => {
  it('allows empty targets', () => {
    expect(parseTargetSet({}, 'strength', 'kg')).toEqual(EMPTY_TARGET);
    expect(parseTargetSet({ repsText: '8' }, 'strength', 'kg')).toEqual({ ...EMPTY_TARGET, reps: 8 });
  });

  it('stores weights in kg', () => {
    expect(parseTargetSet({ weightText: '135', repsText: '5' }, 'strength', 'lb')!.weightKg).toBeCloseTo(61.235, 3);
    expect(parseTargetSet({ weightText: '62,5' }, 'strength', 'kg')!.weightKg).toBe(62.5);
  });

  it('parses cardio targets', () => {
    expect(parseTargetSet({ durationText: '30', distanceText: '5' }, 'cardio', 'kg')).toEqual({
      ...EMPTY_TARGET,
      durationSeconds: 1800,
      distanceM: 5000,
    });
  });

  it('rejects invalid input', () => {
    expect(parseTargetSet({ weightText: 'abc' }, 'strength', 'kg')).toBeNull();
    expect(parseTargetSet({ repsText: '0' }, 'strength', 'kg')).toBeNull();
    expect(parseTargetSet({ durationText: '99:99' }, 'cardio', 'kg')).toBeNull();
  });
});

describe('conversions', () => {
  it('round-trips targets through texts', () => {
    const target = { weightKg: 62.5, reps: 8, durationSeconds: null, distanceM: null };
    expect(parseTargetSet(targetToTexts(target, 'kg'), 'strength', 'kg')).toEqual(target);
    const cardio = { ...EMPTY_TARGET, durationSeconds: 1530, distanceM: 5200 };
    expect(parseTargetSet(targetToTexts(cardio, 'kg'), 'cardio', 'kg')).toEqual(cardio);
  });

  it('turns a draft into a spec and back', () => {
    const makeId = idFactory();
    let draft = draftWith('bench');
    const item = draft.items[0]!;
    draft = updateDraftSet(draft, item.key, item.sets[0]!.key, { weightText: '100', repsText: '5' });
    const spec = draftToSpec(draft, 'kg');
    expect(spec[0]!.sets[0]).toEqual({ weightKg: 100, reps: 5, durationSeconds: null, distanceM: null });
    expect(spec[0]!.sets[1]).toEqual(EMPTY_TARGET);
    const items = specToDraftItems(spec, 'kg', makeId);
    expect(items[0]!.sets[0]).toMatchObject({ weightText: '100', repsText: '5' });
  });

  it('prefills workout sets in the workout unit', () => {
    const entries = specToWorkoutEntries(
      [{ exerciseId: 'bench', kind: 'strength', sets: [{ ...EMPTY_TARGET, weightKg: 100, reps: 5 }] }],
      'lb',
    );
    expect(entries[0]!.sets![0]).toMatchObject({ weightText: '220.46', repsText: '5' });
  });

  it('describes targets', () => {
    expect(describeTargets([{ ...EMPTY_TARGET, reps: 8 }, { ...EMPTY_TARGET, reps: 12 }, EMPTY_TARGET])).toEqual({
      count: 3,
      repsMin: 8,
      repsMax: 12,
    });
  });
});

describe('validateDraft', () => {
  it('accepts a named routine with exercises', () => {
    expect(validateDraft(draftWith('a'), 'kg')).toEqual([]);
  });

  it('requires a name and at least one exercise', () => {
    expect(validateDraft(emptyDraft(), 'kg')).toEqual(['nameRequired', 'noExercises']);
  });

  it('rejects too long names and invalid sets', () => {
    let draft = { ...draftWith('a'), name: 'x'.repeat(61) };
    draft = updateDraftSet(draft, draft.items[0]!.key, draft.items[0]!.sets[0]!.key, { repsText: 'abc' });
    expect(validateDraft(draft, 'kg')).toEqual(['nameTooLong', 'invalidSet']);
  });
});
