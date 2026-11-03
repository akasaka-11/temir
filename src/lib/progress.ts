import { estimateOneRepMax, type SetResult, setVolume } from './workoutMath';

export type ExerciseHistoryRow = SetResult & { workoutId: string; startedAt: number };

/** One point per workout in which the exercise was done. */
export type ProgressPoint = {
  workoutId: string;
  date: number;
  maxWeightKg: number;
  bestOneRepMaxKg: number;
  /** Total volume of the exercise in that workout. */
  volumeKg: number;
  setCount: number;
  bestSet: SetResult;
};

export type ProgressMetric = 'oneRepMax' | 'maxWeight' | 'volume';

export function metricValue(point: ProgressPoint, metric: ProgressMetric): number {
  switch (metric) {
    case 'oneRepMax':
      return point.bestOneRepMaxKg;
    case 'maxWeight':
      return point.maxWeightKg;
    case 'volume':
      return point.volumeKg;
  }
}

/** Groups sets by workout and returns points sorted from oldest to newest. */
export function buildProgressPoints(rows: readonly ExerciseHistoryRow[]): ProgressPoint[] {
  const byWorkout = new Map<string, ProgressPoint>();
  for (const row of rows) {
    const oneRm = estimateOneRepMax(row);
    const point = byWorkout.get(row.workoutId);
    if (!point) {
      byWorkout.set(row.workoutId, {
        workoutId: row.workoutId,
        date: row.startedAt,
        maxWeightKg: row.reps > 0 ? row.weightKg : 0,
        bestOneRepMaxKg: oneRm,
        volumeKg: setVolume(row),
        setCount: 1,
        bestSet: { weightKg: row.weightKg, reps: row.reps },
      });
      continue;
    }
    point.maxWeightKg = Math.max(point.maxWeightKg, row.reps > 0 ? row.weightKg : 0);
    point.volumeKg += setVolume(row);
    point.setCount += 1;
    if (oneRm > point.bestOneRepMaxKg) {
      point.bestOneRepMaxKg = oneRm;
      point.bestSet = { weightKg: row.weightKg, reps: row.reps };
    }
  }
  return [...byWorkout.values()].sort((a, b) => a.date - b.date);
}

export type RecordEntry = { valueKg: number; date: number; set?: SetResult };

export type ExerciseRecords = {
  maxWeight: RecordEntry | null;
  bestOneRepMax: RecordEntry | null;
  /** Heaviest single set by weight × reps. */
  bestSetVolume: RecordEntry | null;
  /** Biggest total volume of the exercise in one workout. */
  bestWorkoutVolume: RecordEntry | null;
};

/** Personal records with the date they were first reached (earliest wins ties). */
export function computeRecords(rows: readonly ExerciseHistoryRow[]): ExerciseRecords {
  const sorted = [...rows].sort((a, b) => a.startedAt - b.startedAt);
  const best = (current: RecordEntry | null, valueKg: number, date: number, set?: SetResult) =>
    valueKg > 0 && (!current || valueKg > current.valueKg) ? { valueKg, date, set } : current;

  let maxWeight: RecordEntry | null = null;
  let bestOneRepMax: RecordEntry | null = null;
  let bestSetVolume: RecordEntry | null = null;
  for (const row of sorted) {
    const set = { weightKg: row.weightKg, reps: row.reps };
    if (row.reps > 0) maxWeight = best(maxWeight, row.weightKg, row.startedAt, set);
    bestOneRepMax = best(bestOneRepMax, estimateOneRepMax(row), row.startedAt, set);
    bestSetVolume = best(bestSetVolume, setVolume(row), row.startedAt, set);
  }

  let bestWorkoutVolume: RecordEntry | null = null;
  for (const point of buildProgressPoints(sorted)) {
    bestWorkoutVolume = best(bestWorkoutVolume, point.volumeKg, point.date);
  }

  return { maxWeight, bestOneRepMax, bestSetVolume, bestWorkoutVolume };
}

export type ChartPoint = { x: number; y: number };

export type ChartGeometry = {
  points: ChartPoint[];
  path: string;
  minValue: number;
  maxValue: number;
};

/**
 * Maps values to pixel coordinates. X is spread evenly by index (workouts are
 * the unit of progress, gaps between dates would only add empty space).
 * The Y range gets 10% headroom so the line never touches the edges.
 */
export function buildChartGeometry(
  values: readonly number[],
  width: number,
  height: number,
  padding: number,
): ChartGeometry {
  if (values.length === 0 || width <= 0 || height <= 0) {
    return { points: [], path: '', minValue: 0, maxValue: 0 };
  }
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const span = maxValue - minValue || Math.max(1, maxValue * 0.1);
  const low = minValue - span * 0.1;
  const high = maxValue + span * 0.1;
  const innerWidth = width - padding * 2;
  const innerHeight = height - padding * 2;

  const points = values.map((value, index) => ({
    x: padding + (values.length === 1 ? innerWidth / 2 : (index / (values.length - 1)) * innerWidth),
    y: padding + innerHeight - ((value - low) / (high - low)) * innerHeight,
  }));
  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  return { points, path, minValue, maxValue };
}
