import { buildWorkoutStats, formatWorkoutDate, groupByMonth, type HistorySetRow } from '../history';

function row(partial: Partial<HistorySetRow>): HistorySetRow {
  return {
    workoutId: 'w1',
    exerciseId: 'bench',
    exercisePosition: 0,
    setIndex: 0,
    weightKg: 100,
    reps: 5,
    ...partial,
  };
}

describe('buildWorkoutStats', () => {
  it('counts sets and volume per workout', () => {
    const stats = buildWorkoutStats([
      row({ setIndex: 0 }),
      row({ setIndex: 1, weightKg: 80, reps: 10 }),
      row({ workoutId: 'w2', reps: 1 }),
    ]);
    expect(stats.get('w1')).toMatchObject({ setCount: 2, volumeKg: 1300 });
    expect(stats.get('w2')).toMatchObject({ setCount: 1, volumeKg: 100 });
  });

  it('keeps exercise and set order regardless of input order', () => {
    const stats = buildWorkoutStats([
      row({ exerciseId: 'squat', exercisePosition: 1, setIndex: 1, reps: 3 }),
      row({ exerciseId: 'bench', exercisePosition: 0, setIndex: 0 }),
      row({ exerciseId: 'squat', exercisePosition: 1, setIndex: 0, reps: 8 }),
    ]);
    const exercises = stats.get('w1')!.exercises;
    expect(exercises.map((e) => e.exerciseId)).toEqual(['bench', 'squat']);
    expect(exercises[1]!.sets.map((s) => s.reps)).toEqual([8, 3]);
  });

  it('keeps the same exercise twice when it was done in two separate blocks', () => {
    const stats = buildWorkoutStats([
      row({ exerciseId: 'bench', exercisePosition: 0 }),
      row({ exerciseId: 'squat', exercisePosition: 1 }),
      row({ exerciseId: 'bench', exercisePosition: 2 }),
    ]);
    expect(stats.get('w1')!.exercises.map((e) => e.exerciseId)).toEqual(['bench', 'squat', 'bench']);
  });

  it('keeps two consecutive blocks of the same exercise apart', () => {
    const stats = buildWorkoutStats([
      row({ exercisePosition: 0 }),
      row({ exercisePosition: 1 }),
    ]);
    expect(stats.get('w1')!.exercises).toHaveLength(2);
  });
});

describe('groupByMonth', () => {
  const items = [
    { id: 'a', at: new Date(2026, 10, 20).getTime() },
    { id: 'b', at: new Date(2026, 10, 3).getTime() },
    { id: 'c', at: new Date(2026, 9, 30).getTime() },
  ];

  it('creates one section per month in order', () => {
    const sections = groupByMonth(items, (i) => i.at, 'en');
    expect(sections.map((s) => s.title)).toEqual(['November 2026', 'October 2026']);
    expect(sections[0]!.data.map((i) => i.id)).toEqual(['a', 'b']);
  });

  it('localizes and capitalizes month names', () => {
    expect(groupByMonth(items, (i) => i.at, 'ru')[0]!.title).toMatch(/^Ноябрь 2026/);
    expect(groupByMonth(items, (i) => i.at, 'kk')[0]!.title).toMatch(/^Қараша|2026/);
  });
});

describe('formatWorkoutDate', () => {
  it('formats in the given language', () => {
    const date = new Date(2026, 10, 4).getTime();
    expect(formatWorkoutDate(date, 'en')).toBe('Wed, November 4');
    expect(formatWorkoutDate(date, 'ru')).toMatch(/^Ср, 4 ноября/);
  });
});
