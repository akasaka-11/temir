import {
  bestsOf,
  estimateOneRepMax,
  findPersonalRecords,
  formatDuration,
  setVolume,
  totalVolume,
} from '../workoutMath';

describe('estimateOneRepMax (Epley)', () => {
  it('uses w * (1 + reps / 30)', () => {
    expect(estimateOneRepMax({ weightKg: 100, reps: 10 })).toBeCloseTo(133.333, 3);
  });

  it('returns the weight for a single rep', () => {
    expect(estimateOneRepMax({ weightKg: 140, reps: 1 })).toBe(140);
  });

  it('returns 0 for zero reps or weight', () => {
    expect(estimateOneRepMax({ weightKg: 100, reps: 0 })).toBe(0);
    expect(estimateOneRepMax({ weightKg: 0, reps: 10 })).toBe(0);
  });
});

describe('volume', () => {
  it('multiplies weight by reps', () => {
    expect(setVolume({ weightKg: 62.5, reps: 8 })).toBe(500);
  });

  it('sums sets', () => {
    expect(totalVolume([{ weightKg: 100, reps: 5 }, { weightKg: 80, reps: 10 }])).toBe(1300);
    expect(totalVolume([])).toBe(0);
  });
});

describe('bestsOf', () => {
  it('finds max weight, 1RM and set volume independently', () => {
    const bests = bestsOf([
      { weightKg: 100, reps: 3 },
      { weightKg: 80, reps: 12 },
    ]);
    expect(bests.maxWeightKg).toBe(100);
    expect(bests.maxOneRepMaxKg).toBeCloseTo(112, 3); // 80 * 1.4
    expect(bests.maxSetVolumeKg).toBe(960);
  });

  it('ignores weight of zero-rep sets', () => {
    expect(bestsOf([{ weightKg: 200, reps: 0 }]).maxWeightKg).toBe(0);
  });
});

describe('findPersonalRecords', () => {
  const previous = new Map([
    ['bench', { maxWeightKg: 100, maxOneRepMaxKg: 110, maxSetVolumeKg: 800, maxDurationSeconds: 0, maxDistanceM: 0 }],
  ]);

  it('reports each beaten record', () => {
    const current = new Map([['bench', [{ weightKg: 102.5, reps: 5 }]]]);
    const records = findPersonalRecords(current, previous);
    expect(records.map((r) => r.type)).toEqual(['weight', 'oneRepMax']);
    expect(records[0]!.value).toBe(102.5);
  });

  it('does not report ties', () => {
    const current = new Map([['bench', [{ weightKg: 100, reps: 8 }]]]);
    expect(findPersonalRecords(current, previous).map((r) => r.type)).toEqual(['oneRepMax']);
  });

  it('reports cardio records for longer duration or distance', () => {
    const run = new Map([
      ['run', { maxWeightKg: 0, maxOneRepMaxKg: 0, maxSetVolumeKg: 0, maxDurationSeconds: 1800, maxDistanceM: 5000 }],
    ]);
    const current = new Map([['run', [{ weightKg: 0, reps: 0, durationSeconds: 1700, distanceM: 5500 }]]]);
    expect(findPersonalRecords(current, run)).toEqual([{ exerciseId: 'run', type: 'distance', value: 5500 }]);
  });

  it('skips exercises without history', () => {
    const current = new Map([['squat', [{ weightKg: 150, reps: 5 }]]]);
    expect(findPersonalRecords(current, previous)).toEqual([]);
  });
});

describe('formatDuration', () => {
  it.each([
    [0, '0:00'],
    [5_000, '0:05'],
    [307_000, '5:07'],
    [3_723_000, '1:02:03'],
    [-5, '0:00'],
  ])('%p ms -> %p', (ms, text) => {
    expect(formatDuration(ms)).toBe(text);
  });
});
