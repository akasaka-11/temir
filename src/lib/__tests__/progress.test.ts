import {
  buildChartGeometry,
  buildProgressPoints,
  computeRecords,
  type ExerciseHistoryRow,
  metricValue,
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
    expect(records.maxWeight).toMatchObject({ valueKg: 110, date: 2000 });
    expect(records.bestOneRepMax!.date).toBe(2000);
    expect(records.bestSetVolume).toMatchObject({ valueKg: 800, date: 1000 });
    expect(records.bestWorkoutVolume).toMatchObject({ valueKg: 1250, date: 1000 });
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
    });
    expect(computeRecords([row('a', 1, 0, 10)]).maxWeight).toBeNull();
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
