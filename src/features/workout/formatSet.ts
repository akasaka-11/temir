import type { TFunction } from 'i18next';

import type { ExerciseKind } from '@/db/schema';
import type { SetFallback } from '@/lib/activeWorkout';
import { distanceToInput, formatCardioDuration, formatDistanceKm } from '@/lib/cardio';
import { formatWeight, type WeightUnit, weightToInput } from '@/lib/units';
import type { RecordType, SetResult } from '@/lib/workoutMath';

/** "62,5 kg × 8" for strength, "25:30 · 5,2 km" for cardio. */
export function formatSetResult(
  set: SetResult,
  kind: ExerciseKind,
  unit: WeightUnit,
  language: string,
  t: TFunction,
): string {
  if (kind === 'cardio') {
    const parts = [formatCardioDuration(set.durationSeconds ?? 0)];
    if (set.distanceM) parts.push(`${formatDistanceKm(set.distanceM, language)} ${t('units.km')}`);
    return parts.join(' · ');
  }
  return `${formatWeight(set.weightKg, unit, language)} ${t(`units.${unit}`)} × ${set.reps}`;
}

/** Last time's values as input texts, used to fill empty fields. */
export function setToFallback(
  previous: SetResult | undefined,
  kind: ExerciseKind,
  unit: WeightUnit,
): SetFallback | undefined {
  if (!previous) return undefined;
  if (kind === 'cardio') {
    return {
      durationText: previous.durationSeconds ? formatCardioDuration(previous.durationSeconds) : '',
      distanceText: previous.distanceM ? distanceToInput(previous.distanceM) : '',
    };
  }
  return { weightText: weightToInput(previous.weightKg, unit), repsText: String(previous.reps) };
}

/** Formats a personal record value according to its type. */
export function formatRecordValue(
  type: RecordType,
  value: number,
  unit: WeightUnit,
  language: string,
  t: TFunction,
): string {
  if (type === 'duration') return formatCardioDuration(value);
  if (type === 'distance') return `${formatDistanceKm(value, language)} ${t('units.km')}`;
  return `${formatWeight(value, unit, language)} ${t(`units.${unit}`)}`;
}
