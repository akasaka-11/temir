// Small pure helpers for the profile screen and settings.

export const REST_OPTIONS_SECONDS = [0, 30, 60, 90, 120, 180, 300] as const;

/** Monday 00:00 (local time) of the week containing `now`. */
export function startOfWeek(now: number): number {
  const date = new Date(now);
  const daysSinceMonday = (date.getDay() + 6) % 7;
  date.setHours(0, 0, 0, 0);
  date.setDate(date.getDate() - daysSinceMonday);
  return date.getTime();
}

export type OverallStats = {
  workouts: number;
  workoutsThisWeek: number;
  totalSets: number;
};

export function computeOverallStats(
  items: readonly { startedAt: number; setCount: number }[],
  now: number,
): OverallStats {
  const weekStart = startOfWeek(now);
  return items.reduce<OverallStats>(
    (acc, item) => ({
      workouts: acc.workouts + 1,
      workoutsThisWeek: acc.workoutsThisWeek + (item.startedAt >= weekStart ? 1 : 0),
      totalSets: acc.totalSets + item.setCount,
    }),
    { workouts: 0, workoutsThisWeek: 0, totalSets: 0 },
  );
}

export type WeekBucket = { weekStart: number; workouts: number };

/** Workouts per week for the last `weeks` weeks (oldest first, current week last). */
export function workoutsPerWeek(startedAts: readonly number[], now: number, weeks: number): WeekBucket[] {
  const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
  const current = startOfWeek(now);
  const buckets: WeekBucket[] = Array.from({ length: weeks }, (_, i) => ({
    // startOfWeek again so DST shifts never move a bucket off Monday 00:00
    weekStart: startOfWeek(current - (weeks - 1 - i) * WEEK_MS + WEEK_MS / 2),
    workouts: 0,
  }));
  for (const startedAt of startedAts) {
    const weekStart = startOfWeek(startedAt);
    const bucket = buckets.find((b) => b.weekStart === weekStart);
    if (bucket) bucket.workouts += 1;
  }
  return buckets;
}
