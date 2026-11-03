import type { TFunction } from 'i18next';

import type { Stat } from '@/components/StatGrid';
import { formatWeight, type WeightUnit } from '@/lib/units';
import { formatDuration } from '@/lib/workoutMath';

export type WorkoutTotals = {
  durationMs: number;
  volumeKg: number;
  setCount: number;
  exerciseCount: number;
};

/** The four standard tiles shown after a workout and in history details. */
export function buildWorkoutStatTiles(
  totals: WorkoutTotals,
  t: TFunction,
  unit: WeightUnit,
  language: string,
): Stat[] {
  return [
    { label: t('summary.duration'), value: formatDuration(totals.durationMs) },
    {
      label: t('summary.volume'),
      value: `${formatWeight(totals.volumeKg, unit, language)} ${t(`units.${unit}`)}`,
    },
    { label: t('summary.sets'), value: String(totals.setCount) },
    { label: t('summary.exercises'), value: String(totals.exerciseCount) },
  ];
}
