import {
  type ActiveWorkout,
  addExercises,
  addRoutineExercises,
  addSet,
  collectCompletedSets,
  countCompletedSets,
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

describe('active workout transitions', () => {
  it('adds exercises with one empty set each', () => {
    const w = addExercises(newWorkout(), ['bench', 'squat'], idFactory());
    expect(w.exercises.map((e) => e.exerciseId)).toEqual(['bench', 'squat']);
    expect(w.exercises[0]!.sets).toEqual([{ id: 'id2', weightText: '', repsText: '', isCompleted: false }]);
  });

  it('copies the previous set values into a new set', () => {
    const makeId = idFactory();
    let w = addExercises(newWorkout(), ['bench'], makeId);
    const row = w.exercises[0]!;
    w = updateSet(w, row.id, row.sets[0]!.id, { weightText: '60', repsText: '8' });
    w = addSet(w, row.id, makeId);
    expect(w.exercises[0]!.sets[1]).toMatchObject({ weightText: '60', repsText: '8', isCompleted: false });
  });

  it('adds routine exercises with their target number of sets', () => {
    const w = addRoutineExercises(
      newWorkout(),
      [
        { exerciseId: 'bench', targetSets: 4 },
        { exerciseId: 'row', targetSets: 2 },
      ],
      idFactory(),
    );
    expect(w.exercises.map((e) => [e.exerciseId, e.sets.length])).toEqual([
      ['bench', 4],
      ['row', 2],
    ]);
  });

  it('removes sets and exercises', () => {
    const makeId = idFactory();
    let w = addExercises(newWorkout(), ['bench', 'squat'], makeId);
    const row = w.exercises[0]!;
    w = removeSet(w, row.id, row.sets[0]!.id);
    expect(w.exercises[0]!.sets).toEqual([]);
    w = removeExercise(w, row.id);
    expect(w.exercises.map((e) => e.exerciseId)).toEqual(['squat']);
  });
});

describe('toggleSet', () => {
  function setup() {
    const w = addExercises(newWorkout(), ['bench'], idFactory());
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
});

describe('collectCompletedSets', () => {
  it('returns only completed sets in kg with compact positions', () => {
    const makeId = idFactory();
    let w = addExercises(newWorkout('lb'), ['skipped', 'bench'], makeId);
    const bench = w.exercises[1]!;
    w = updateSet(w, bench.id, bench.sets[0]!.id, { weightText: '135', repsText: '5' });
    w = addSet(w, bench.id, makeId); // copied but not completed
    w = toggleSet(w, bench.id, bench.sets[0]!.id)!.workout;

    const sets = collectCompletedSets(w);
    expect(sets).toHaveLength(1);
    expect(sets[0]).toMatchObject({ exerciseId: 'bench', exercisePosition: 0, setIndex: 0, reps: 5 });
    expect(sets[0]!.weightKg).toBeCloseTo(61.235, 3);
  });
});
