import { computeOverallStats, startOfWeek, workoutsPerWeek } from '../stats';

describe('startOfWeek', () => {
  it('returns Monday 00:00 for any day of the week', () => {
    const monday = new Date(2026, 10, 2).getTime(); // Mon 2 Nov 2026
    expect(startOfWeek(new Date(2026, 10, 2, 15, 30).getTime())).toBe(monday);
    expect(startOfWeek(new Date(2026, 10, 4, 9).getTime())).toBe(monday); // Wed
    expect(startOfWeek(new Date(2026, 10, 8, 23, 59).getTime())).toBe(monday); // Sun
  });

  it('moves to the next week on Monday', () => {
    expect(startOfWeek(new Date(2026, 10, 9, 0, 1).getTime())).toBe(new Date(2026, 10, 9).getTime());
  });
});

describe('computeOverallStats', () => {
  it('sums workouts and sets and counts this week', () => {
    const now = new Date(2026, 10, 4, 12).getTime();
    const stats = computeOverallStats(
      [
        { startedAt: new Date(2026, 10, 3).getTime(), setCount: 10 },
        { startedAt: new Date(2026, 10, 1).getTime(), setCount: 8 }, // Sunday before
      ],
      now,
    );
    expect(stats).toEqual({ workouts: 2, workoutsThisWeek: 1, totalSets: 18 });
  });

  it('returns zeros without workouts', () => {
    expect(computeOverallStats([], Date.now())).toEqual({ workouts: 0, workoutsThisWeek: 0, totalSets: 0 });
  });
});

describe('workoutsPerWeek', () => {
  const now = new Date(2026, 10, 4, 12).getTime(); // Wed, week of Mon 2 Nov

  it('returns consecutive Monday buckets ending with the current week', () => {
    const buckets = workoutsPerWeek([], now, 3);
    expect(buckets.map((b) => new Date(b.weekStart).getDate())).toEqual([19, 26, 2]);
  });

  it('counts workouts per week and ignores older ones', () => {
    const buckets = workoutsPerWeek(
      [
        new Date(2026, 10, 3).getTime(),
        new Date(2026, 10, 4).getTime(),
        new Date(2026, 9, 27).getTime(),
        new Date(2026, 0, 1).getTime(), // too old
      ],
      now,
      3,
    );
    expect(buckets.map((b) => b.workouts)).toEqual([0, 1, 2]);
  });
});
