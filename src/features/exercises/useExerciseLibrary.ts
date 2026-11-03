import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { db } from '@/db/client';
import { selectExercises } from '@/db/repositories/exercises';
import { type ExerciseFilter, filterAndSortExercises } from '@/lib/exercises';

/** Live, translated, filtered and sorted list of exercises. */
export function useExerciseLibrary(filter: ExerciseFilter) {
  const { t, i18n } = useTranslation();
  const { data } = useLiveQuery(selectExercises(db));

  // Re-read translations when the language changes.
  const names = useMemo(
    () => t('exerciseNames', { returnObjects: true }) as Record<string, string>,
    [t, i18n.language],
  );

  return useMemo(
    () => filterAndSortExercises(data, filter, names, i18n.language),
    [data, filter, names, i18n.language],
  );
}
