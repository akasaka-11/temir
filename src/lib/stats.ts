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
  totalVolumeKg: number;
};

export function computeOverallStats(
  items: readonly { startedAt: number; setCount: number; volumeKg: number }[],
  now: number,
): OverallStats {
  const weekStart = startOfWeek(now);
  return items.reduce<OverallStats>(
    (acc, item) => ({
      workouts: acc.workouts + 1,
      workoutsThisWeek: acc.workoutsThisWeek + (item.startedAt >= weekStart ? 1 : 0),
      totalSets: acc.totalSets + item.setCount,
      totalVolumeKg: acc.totalVolumeKg + item.volumeKg,
    }),
    { workouts: 0, workoutsThisWeek: 0, totalSets: 0, totalVolumeKg: 0 },
  );
}
