import {
  buildChartGeometry,
  buildProgressPoints,
  computeRecords,
  type ExerciseHistoryRow,
  metricValue,
  topExerciseTrends,
} from '../progress';

function row(workoutId: string, startedAt: number, weightKg: number, reps: number): ExerciseHistoryRow {
  return { workoutId, startedAt, weightKg, reps };
}

const rows = [
  row('w2', 2000, 100, 5),
  row('w1', 1000, 80, 10),
  row('w1', 1000, 90, 5),
  row('w2', 2000, 110, 1),
];

describe('buildProgressPoints', () => {
  it('creates one point per workout, oldest first', () => {
    const points = buildProgressPoints(rows);
    expect(points.map((p) => p.workoutId)).toEqual(['w1', 'w2']);
  });

  it('aggregates max weight, best 1RM, volume and set count', () => {
    const [w1, w2] = buildProgressPoints(rows);
    expect(w1).toMatchObject({ maxWeightKg: 90, volumeKg: 1250, setCount: 2 });
    expect(w1!.bestOneRepMaxKg).toBeCloseTo(106.667, 3); // 80 × 10
    expect(w1!.bestSet).toEqual({ weightKg: 80, reps: 10 });
    expect(w2).toMatchObject({ maxWeightKg: 110, volumeKg: 610 });
    expect(w2!.bestOneRepMaxKg).toBeCloseTo(116.667, 3); // 100 × 5
  });

  it('exposes metrics by name', () => {
    const [w1] = buildProgressPoints(rows);
    expect(metricValue(w1!, 'maxWeight')).toBe(90);
    expect(metricValue(w1!, 'volume')).toBe(1250);
  });
});

describe('computeRecords', () => {
  it('returns each record with the date it was reached', () => {
    const records = computeRecords(rows);
    expect(records.maxWeight).toMatchObject({ value: 110, date: 2000 });
    expect(records.bestOneRepMax!.date).toBe(2000);
    expect(records.bestSetVolume).toMatchObject({ value: 800, date: 1000 });
    expect(records.bestWorkoutVolume).toMatchObject({ value: 1250, date: 1000 });
  });

  it('keeps the earliest date on ties', () => {
    const records = computeRecords([row('a', 1, 100, 5), row('b', 2, 100, 5)]);
    expect(records.maxWeight!.date).toBe(1);
  });

  it('returns nulls without history or with zero values', () => {
    expect(computeRecords([])).toEqual({
      maxWeight: null,
      bestOneRepMax: null,
      bestSetVolume: null,
      bestWorkoutVolume: null,
      longestDuration: null,
      longestDistance: null,
    });
    expect(computeRecords([row('a', 1, 0, 10)]).maxWeight).toBeNull();
  });
});

describe('cardio progress', () => {
  const cardio = [
    { workoutId: 'a', startedAt: 1, weightKg: 0, reps: 0, durationSeconds: 1200, distanceM: 3000 },
    { workoutId: 'a', startedAt: 1, weightKg: 0, reps: 0, durationSeconds: 600, distanceM: 1500 },
    { workoutId: 'b', startedAt: 2, weightKg: 0, reps: 0, durationSeconds: 1500, distanceM: null },
  ];

  it('sums duration and distance per workout', () => {
    const [a, b] = buildProgressPoints(cardio);
    expect(metricValue(a!, 'duration')).toBe(1800);
    expect(metricValue(a!, 'distance')).toBe(4500);
    expect(metricValue(b!, 'distance')).toBe(0);
  });

  it('finds the longest session and distance', () => {
    const records = computeRecords(cardio);
    expect(records.longestDuration).toMatchObject({ value: 1500, date: 2 });
    expect(records.longestDistance).toMatchObject({ value: 3000, date: 1 });
    expect(records.maxWeight).toBeNull();
  });
});

describe('topExerciseTrends', () => {
  const kinds = new Map<string, 'strength' | 'cardio'>([['run', 'cardio']]);
  // Newest first, like the history list.
  const workouts = [
    { exercises: [{ exerciseId: 'bench', sets: [{ weightKg: 110, reps: 1 }] }] },
    {
      exercises: [
        { exerciseId: 'bench', sets: [{ weightKg: 100, reps: 1 }, { weightKg: 90, reps: 1 }] },
        { exerciseId: 'run', sets: [{ weightKg: 0, reps: 0, durationSeconds: 1200 }] },
      ],
    },
    { exercises: [{ exerciseId: 'run', sets: [{ weightKg: 0, reps: 0, durationSeconds: 900 }] }] },
    { exercises: [{ exerciseId: 'bench', sets: [{ weightKg: 100, reps: 1 }] }] },
  ];

  it('ranks by sessions and compares first vs latest best', () => {
    const trends = topExerciseTrends(workouts, kinds, 5);
    expect(trends.map((t) => t.exerciseId)).toEqual(['bench', 'run']);
    expect(trends[0]).toMatchObject({ sessions: 3, first: 100, latest: 110 });
    expect(trends[0]!.change).toBeCloseTo(0.1, 5);
    expect(trends[1]).toMatchObject({ sessions: 2, first: 900, latest: 1200 });
  });

  it('respects the limit and handles zero starting values', () => {
    expect(topExerciseTrends(workouts, kinds, 1)).toHaveLength(1);
    const zero = topExerciseTrends([{ exercises: [{ exerciseId: 'x', sets: [{ weightKg: 0, reps: 10 }] }] }], kinds, 5);
    expect(zero[0]!.change).toBeNull();
  });
});

describe('buildChartGeometry', () => {
  it('spreads points across the width and inverts Y', () => {
    const g = buildChartGeometry([10, 20, 30], 220, 120, 10);
    expect(g.points.map((p) => p.x)).toEqual([10, 110, 210]);
    expect(g.points[0]!.y).toBeGreaterThan(g.points[2]!.y);
    expect(g.path.startsWith('M10.0,')).toBe(true);
    expect(g.minValue).toBe(10);
    expect(g.maxValue).toBe(30);
  });

  it('keeps all points inside the drawing area', () => {
    const g = buildChartGeometry([5, 100, 50], 300, 200, 16);
    for (const p of g.points) {
      expect(p.y).toBeGreaterThanOrEqual(16);
      expect(p.y).toBeLessThanOrEqual(184);
    }
  });

  it('centers a single point and handles flat lines', () => {
    const single = buildChartGeometry([50], 200, 100, 10);
    expect(single.points[0]!.x).toBe(100);
    const flat = buildChartGeometry([50, 50], 200, 100, 10);
    expect(flat.points[0]!.y).toBe(flat.points[1]!.y);
    expect(Number.isFinite(flat.points[0]!.y)).toBe(true);
  });

  it('returns an empty geometry for no data or zero size', () => {
    expect(buildChartGeometry([], 100, 100, 0).points).toEqual([]);
    expect(buildChartGeometry([1], 0, 100, 0).points).toEqual([]);
  });
});
