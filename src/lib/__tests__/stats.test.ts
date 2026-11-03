import { computeOverallStats, startOfWeek } from '../stats';

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
  it('sums workouts, sets and volume and counts this week', () => {
    const now = new Date(2026, 10, 4, 12).getTime();
    const stats = computeOverallStats(
      [
        { startedAt: new Date(2026, 10, 3).getTime(), setCount: 10, volumeKg: 5000 },
        { startedAt: new Date(2026, 10, 1).getTime(), setCount: 8, volumeKg: 3000 }, // Sunday before
      ],
      now,
    );
    expect(stats).toEqual({ workouts: 2, workoutsThisWeek: 1, totalSets: 18, totalVolumeKg: 8000 });
  });

  it('returns zeros without workouts', () => {
    expect(computeOverallStats([], Date.now())).toEqual({
      workouts: 0,
      workoutsThisWeek: 0,
      totalSets: 0,
      totalVolumeKg: 0,
    });
  });
});
