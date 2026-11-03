import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { db } from '@/db/client';
import { selectExercises } from '@/db/repositories/exercises';
import { getExerciseName } from '@/lib/exercises';

/** Map of exercise id -> name in the current language. */
export function useExerciseNames(): ReadonlyMap<string, string> {
  const { t, i18n } = useTranslation();
  const { data } = useLiveQuery(selectExercises(db));

  return useMemo(() => {
    const names = t('exerciseNames', { returnObjects: true }) as Record<string, string>;
    return new Map(data.map((exercise) => [exercise.id, getExerciseName(exercise, names)]));
  }, [data, t, i18n.language]); // i18n.language: rebuild names after a language switch
}
