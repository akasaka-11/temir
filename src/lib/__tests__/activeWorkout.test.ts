import {
  type ActiveWorkout,
  addExercises,
  addSet,
  collectCompletedSets,
  countCompletedSets,
  parseSetTexts,
  removeExercise,
  removeSet,
  toggleSet,
  updateSet,
} from '../activeWorkout';

function idFactory() {
  let n = 0;
  return () => `id${++n}`;
}

function newWorkout(unit: 'kg' | 'lb' = 'kg'): ActiveWorkout {
  return { id: 'w', name: 'Workout', startedAt: 0, routineId: null, unit, exercises: [] };
}

const strength = (...ids: string[]) => ids.map((exerciseId) => ({ exerciseId }));

describe('active workout transitions', () => {
  it('adds exercises with one empty set each', () => {
    const w = addExercises(newWorkout(), strength('bench', 'squat'), idFactory());
    expect(w.exercises.map((e) => [e.exerciseId, e.kind])).toEqual([
      ['bench', 'strength'],
      ['squat', 'strength'],
    ]);
    expect(w.exercises[0]!.sets).toEqual([
      { id: 'id2', weightText: '', repsText: '', durationText: '', distanceText: '', isCompleted: false },
    ]);
  });

  it('adds prefilled sets (e.g. from a template)', () => {
    const w = addExercises(
      newWorkout(),
      [
        { exerciseId: 'bench', sets: [{ weightText: '60', repsText: '8' }, { repsText: '8' }, {}] },
        { exerciseId: 'run', kind: 'cardio', sets: [{ durationText: '20:00' }] },
      ],
      idFactory(),
    );
    expect(w.exercises[0]!.sets.map((s) => [s.weightText, s.repsText])).toEqual([
      ['60', '8'],
      ['', '8'],
      ['', ''],
    ]);
    expect(w.exercises[1]).toMatchObject({ kind: 'cardio', sets: [{ durationText: '20:00' }] });
  });

  it('copies the previous set values into a new set', () => {
    const makeId = idFactory();
    let w = addExercises(newWorkout(), strength('bench'), makeId);
    const row = w.exercises[0]!;
    w = updateSet(w, row.id, row.sets[0]!.id, { weightText: '60', repsText: '8' });
    w = addSet(w, row.id, makeId);
    expect(w.exercises[0]!.sets[1]).toMatchObject({ weightText: '60', repsText: '8', isCompleted: false });
  });

  it('removes sets and exercises', () => {
    const makeId = idFactory();
    let w = addExercises(newWorkout(), strength('bench', 'squat'), makeId);
    const row = w.exercises[0]!;
    w = removeSet(w, row.id, row.sets[0]!.id);
    expect(w.exercises[0]!.sets).toEqual([]);
    w = removeExercise(w, row.id);
    expect(w.exercises.map((e) => e.exerciseId)).toEqual(['squat']);
  });
});

describe('toggleSet', () => {
  function setup(kind: 'strength' | 'cardio' = 'strength') {
    const w = addExercises(newWorkout(), [{ exerciseId: 'x', kind }], idFactory());
    const row = w.exercises[0]!;
    return { w, rowId: row.id, setId: row.sets[0]!.id };
  }

  it('completes a filled set', () => {
    const { w, rowId, setId } = setup();
    const filled = updateSet(w, rowId, setId, { weightText: '62,5', repsText: '8' });
    const result = toggleSet(filled, rowId, setId);
    expect(result?.completed).toBe(true);
    expect(countCompletedSets(result!.workout)).toBe(1);
  });

  it('fills empty fields from the previous workout', () => {
    const { w, rowId, setId } = setup();
    const result = toggleSet(w, rowId, setId, { weightText: '60', repsText: '10' });
    expect(result!.workout.exercises[0]!.sets[0]).toMatchObject({ weightText: '60', repsText: '10' });
  });

  it('treats an empty weight as bodyweight', () => {
    const { w, rowId, setId } = setup();
    const result = toggleSet(updateSet(w, rowId, setId, { repsText: '12' }), rowId, setId);
    expect(result?.completed).toBe(true);
  });

  it('refuses sets without valid reps', () => {
    const { w, rowId, setId } = setup();
    expect(toggleSet(w, rowId, setId)).toBeNull();
    expect(toggleSet(updateSet(w, rowId, setId, { weightText: '60', repsText: '0' }), rowId, setId)).toBeNull();
    expect(toggleSet(updateSet(w, rowId, setId, { weightText: 'abc', repsText: '5' }), rowId, setId)).toBeNull();
  });

  it('un-completes a completed set', () => {
    const { w, rowId, setId } = setup();
    const done = toggleSet(updateSet(w, rowId, setId, { repsText: '5' }), rowId, setId)!.workout;
    const result = toggleSet(done, rowId, setId);
    expect(result?.completed).toBe(false);
    expect(countCompletedSets(result!.workout)).toBe(0);
  });

  it('uses the lower bound of the planned range when nothing else is known', () => {
    const w = addExercises(newWorkout(), [{ exerciseId: 'x', sets: [{ repsHint: '6–8' }] }], idFactory());
    const row = w.exercises[0]!;
    const result = toggleSet(w, row.id, row.sets[0]!.id);
    expect(result!.workout.exercises[0]!.sets[0]).toMatchObject({ repsText: '6', isCompleted: true });
    // last time's reps win over the plan
    const withPrevious = toggleSet(w, row.id, row.sets[0]!.id, { repsText: '9' });
    expect(withPrevious!.workout.exercises[0]!.sets[0]!.repsText).toBe('9');
  });

  it('completes cardio with a duration, distance optional', () => {
    const { w, rowId, setId } = setup('cardio');
    expect(toggleSet(w, rowId, setId)).toBeNull();
    expect(toggleSet(updateSet(w, rowId, setId, { durationText: '25:00' }), rowId, setId)?.completed).toBe(true);
    expect(
      toggleSet(updateSet(w, rowId, setId, { durationText: '25', distanceText: 'abc' }), rowId, setId),
    ).toBeNull();
  });

  it('fills cardio fields from the previous workout', () => {
    const { w, rowId, setId } = setup('cardio');
    const result = toggleSet(w, rowId, setId, { durationText: '30:00', distanceText: '5' });
    expect(result!.workout.exercises[0]!.sets[0]).toMatchObject({ durationText: '30:00', distanceText: '5' });
  });
});

describe('parseSetTexts', () => {
  it('parses strength sets in kg', () => {
    expect(parseSetTexts({ weightText: '135', repsText: '5' }, 'strength', 'lb')!.weightKg).toBeCloseTo(61.235, 3);
  });

  it('parses cardio sets', () => {
    expect(parseSetTexts({ durationText: '25:30', distanceText: '5,2' }, 'cardio', 'kg')).toEqual({
      weightKg: 0,
      reps: 0,
      durationSeconds: 1530,
      distanceM: 5200,
    });
    expect(parseSetTexts({ durationText: '20' }, 'cardio', 'kg')!.distanceM).toBeNull();
  });
});

describe('collectCompletedSets', () => {
  it('returns only completed sets in kg with compact positions', () => {
    const makeId = idFactory();
    let w = addExercises(newWorkout('lb'), strength('skipped', 'bench'), makeId);
    const bench = w.exercises[1]!;
    w = updateSet(w, bench.id, bench.sets[0]!.id, { weightText: '135', repsText: '5' });
    w = addSet(w, bench.id, makeId); // copied but not completed
    w = toggleSet(w, bench.id, bench.sets[0]!.id)!.workout;

    const sets = collectCompletedSets(w);
    expect(sets).toHaveLength(1);
    expect(sets[0]).toMatchObject({ exerciseId: 'bench', exercisePosition: 0, setIndex: 0, reps: 5 });
    expect(sets[0]!.weightKg).toBeCloseTo(61.235, 3);
  });

  it('collects cardio sets with duration and distance', () => {
    let w = addExercises(newWorkout(), [{ exerciseId: 'run', kind: 'cardio' }], idFactory());
    const row = w.exercises[0]!;
    w = updateSet(w, row.id, row.sets[0]!.id, { durationText: '30', distanceText: '6' });
    w = toggleSet(w, row.id, row.sets[0]!.id)!.workout;
    expect(collectCompletedSets(w)[0]).toMatchObject({ durationSeconds: 1800, distanceM: 6000, weightKg: 0 });
  });

  it('treats exercises from older saved workouts (no kind) as strength', () => {
    const w: ActiveWorkout = {
      ...newWorkout(),
      exercises: [
        {
          id: 'r',
          exerciseId: 'bench',
          sets: [{ id: 's', weightText: '50', repsText: '5', isCompleted: true }],
        },
      ],
    };
    expect(collectCompletedSets(w)).toHaveLength(1);
  });
});
