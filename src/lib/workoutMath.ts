export type SetResult = {
  weightKg: number;
  reps: number;
  /** Cardio only. */
  durationSeconds?: number | null;
  distanceM?: number | null;
};

/** Estimated one-rep max (Epley): w * (1 + reps / 30); a single rep is the weight itself. */
export function estimateOneRepMax({ weightKg, reps }: SetResult): number {
  if (reps <= 0 || weightKg <= 0) return 0;
  if (reps === 1) return weightKg;
  return weightKg * (1 + reps / 30);
}

export function setVolume({ weightKg, reps }: SetResult): number {
  return weightKg * reps;
}

export function totalVolume(sets: readonly SetResult[]): number {
  return sets.reduce((sum, set) => sum + setVolume(set), 0);
}

export type ExerciseBests = {
  maxWeightKg: number;
  maxOneRepMaxKg: number;
  maxSetVolumeKg: number;
  maxDurationSeconds: number;
  maxDistanceM: number;
};

export function bestsOf(sets: readonly SetResult[]): ExerciseBests {
  return sets.reduce<ExerciseBests>(
    (best, set) => ({
      maxWeightKg: Math.max(best.maxWeightKg, set.reps > 0 ? set.weightKg : 0),
      maxOneRepMaxKg: Math.max(best.maxOneRepMaxKg, estimateOneRepMax(set)),
      maxSetVolumeKg: Math.max(best.maxSetVolumeKg, setVolume(set)),
      maxDurationSeconds: Math.max(best.maxDurationSeconds, set.durationSeconds ?? 0),
      maxDistanceM: Math.max(best.maxDistanceM, set.distanceM ?? 0),
    }),
    { maxWeightKg: 0, maxOneRepMaxKg: 0, maxSetVolumeKg: 0, maxDurationSeconds: 0, maxDistanceM: 0 },
  );
}

/** weight/oneRepMax/volume are in kg, duration in seconds, distance in meters. */
export type RecordType = 'weight' | 'oneRepMax' | 'volume' | 'duration' | 'distance';
export type PersonalRecord = { exerciseId: string; type: RecordType; value: number };

const EPSILON = 1e-6;

const RECORD_FIELDS: readonly [RecordType, keyof ExerciseBests][] = [
  ['weight', 'maxWeightKg'],
  ['oneRepMax', 'maxOneRepMaxKg'],
  ['volume', 'maxSetVolumeKg'],
  ['duration', 'maxDurationSeconds'],
  ['distance', 'maxDistanceM'],
];

/**
 * Compares this workout's sets with previous bests per exercise.
 * Exercises without history are skipped: a first attempt is not a "record".
 */
export function findPersonalRecords(
  current: ReadonlyMap<string, readonly SetResult[]>,
  previous: ReadonlyMap<string, ExerciseBests>,
): PersonalRecord[] {
  const records: PersonalRecord[] = [];
  for (const [exerciseId, sets] of current) {
    const before = previous.get(exerciseId);
    if (!before || sets.length === 0) continue;
    const now = bestsOf(sets);
    for (const [type, field] of RECORD_FIELDS) {
      if (now[field] > before[field] + EPSILON) records.push({ exerciseId, type, value: now[field] });
    }
  }
  return records;
}

/** "5:07", "12:34" or "1:02:03". */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return hours > 0 ? `${hours}:${pad(minutes)}:${pad(seconds)}` : `${minutes}:${pad(seconds)}`;
}
