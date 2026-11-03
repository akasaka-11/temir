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
  /** Cardio: totals of the exercise in that workout. */
  durationSeconds: number;
  distanceM: number;
};

export type ProgressMetric = 'oneRepMax' | 'maxWeight' | 'volume' | 'duration' | 'distance';
export const STRENGTH_METRICS: readonly ProgressMetric[] = ['oneRepMax', 'maxWeight', 'volume'];
export const CARDIO_METRICS: readonly ProgressMetric[] = ['duration', 'distance'];

export function metricValue(point: ProgressPoint, metric: ProgressMetric): number {
  switch (metric) {
    case 'oneRepMax':
      return point.bestOneRepMaxKg;
    case 'maxWeight':
      return point.maxWeightKg;
    case 'volume':
      return point.volumeKg;
    case 'duration':
      return point.durationSeconds;
    case 'distance':
      return point.distanceM;
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
        durationSeconds: row.durationSeconds ?? 0,
        distanceM: row.distanceM ?? 0,
      });
      continue;
    }
    point.maxWeightKg = Math.max(point.maxWeightKg, row.reps > 0 ? row.weightKg : 0);
    point.volumeKg += setVolume(row);
    point.setCount += 1;
    point.durationSeconds += row.durationSeconds ?? 0;
    point.distanceM += row.distanceM ?? 0;
    if (oneRm > point.bestOneRepMaxKg) {
      point.bestOneRepMaxKg = oneRm;
      point.bestSet = { weightKg: row.weightKg, reps: row.reps };
    }
  }
  return [...byWorkout.values()].sort((a, b) => a.date - b.date);
}

/** value is kg for weight records, seconds for duration, meters for distance. */
export type RecordEntry = { value: number; date: number; set?: SetResult };

export type ExerciseRecords = {
  maxWeight: RecordEntry | null;
  bestOneRepMax: RecordEntry | null;
  /** Heaviest single set by weight × reps. */
  bestSetVolume: RecordEntry | null;
  /** Biggest total volume of the exercise in one workout. */
  bestWorkoutVolume: RecordEntry | null;
  /** Cardio: longest single session and longest distance. */
  longestDuration: RecordEntry | null;
  longestDistance: RecordEntry | null;
};

/** Personal records with the date they were first reached (earliest wins ties). */
export function computeRecords(rows: readonly ExerciseHistoryRow[]): ExerciseRecords {
  const sorted = [...rows].sort((a, b) => a.startedAt - b.startedAt);
  const best = (current: RecordEntry | null, value: number, date: number, set?: SetResult) =>
    value > 0 && (!current || value > current.value) ? { value, date, set } : current;

  let maxWeight: RecordEntry | null = null;
  let bestOneRepMax: RecordEntry | null = null;
  let bestSetVolume: RecordEntry | null = null;
  let longestDuration: RecordEntry | null = null;
  let longestDistance: RecordEntry | null = null;
  for (const row of sorted) {
    const set = { weightKg: row.weightKg, reps: row.reps };
    if (row.reps > 0) maxWeight = best(maxWeight, row.weightKg, row.startedAt, set);
    bestOneRepMax = best(bestOneRepMax, estimateOneRepMax(row), row.startedAt, set);
    bestSetVolume = best(bestSetVolume, setVolume(row), row.startedAt, set);
    longestDuration = best(longestDuration, row.durationSeconds ?? 0, row.startedAt);
    longestDistance = best(longestDistance, row.distanceM ?? 0, row.startedAt);
  }

  let bestWorkoutVolume: RecordEntry | null = null;
  for (const point of buildProgressPoints(sorted)) {
    bestWorkoutVolume = best(bestWorkoutVolume, point.volumeKg, point.date);
  }

  return { maxWeight, bestOneRepMax, bestSetVolume, bestWorkoutVolume, longestDuration, longestDistance };
}

export type ExerciseTrend = {
  exerciseId: string;
  sessions: number;
  /** Best estimated 1RM (strength, kg) or longest set (cardio, seconds) in the first and latest session. */
  first: number;
  latest: number;
  /** Relative change from first to latest, e.g. 0.12 = +12%. null if first is 0. */
  change: number | null;
};

/**
 * Most trained exercises with their progress, from workouts given newest first.
 * Cardio is measured by the longest set duration, strength by the best estimated 1RM.
 */
export function topExerciseTrends(
  workouts: readonly { exercises: readonly { exerciseId: string; sets: readonly SetResult[] }[] }[],
  kinds: ReadonlyMap<string, 'strength' | 'cardio'>,
  limit: number,
): ExerciseTrend[] {
  // Oldest first, so "first" and "latest" are easy to track.
  const values = new Map<string, number[]>();
  for (const workout of [...workouts].reverse()) {
    const bestInWorkout = new Map<string, number>();
    for (const exercise of workout.exercises) {
      const cardio = kinds.get(exercise.exerciseId) === 'cardio';
      for (const set of exercise.sets) {
        const value = cardio ? (set.durationSeconds ?? 0) : estimateOneRepMax(set);
        bestInWorkout.set(exercise.exerciseId, Math.max(bestInWorkout.get(exercise.exerciseId) ?? 0, value));
      }
    }
    for (const [id, value] of bestInWorkout) values.set(id, [...(values.get(id) ?? []), value]);
  }

  return [...values]
    .map(([exerciseId, list]) => {
      const first = list[0] ?? 0;
      const latest = list[list.length - 1] ?? 0;
      return { exerciseId, sessions: list.length, first, latest, change: first > 0 ? latest / first - 1 : null };
    })
    .sort((a, b) => b.sessions - a.sessions || b.latest - a.latest)
    .slice(0, limit);
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
