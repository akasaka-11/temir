import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { db } from '@/db/client';
import { selectExercises } from '@/db/repositories/exercises';
import type { ExerciseKind } from '@/db/schema';
import { getExerciseName } from '@/lib/exercises';

export type ExerciseCatalog = {
  /** id -> name in the current language. */
  names: ReadonlyMap<string, string>;
  kinds: ReadonlyMap<string, ExerciseKind>;
};

/** Names and kinds of all exercises, updated live and on language change. */
export function useExerciseCatalog(): ExerciseCatalog {
  const { t, i18n } = useTranslation();
  const { data } = useLiveQuery(selectExercises(db));

  return useMemo(() => {
    const translated = t('exerciseNames', { returnObjects: true }) as Record<string, string>;
    return {
      names: new Map(data.map((exercise) => [exercise.id, getExerciseName(exercise, translated)])),
      kinds: new Map(data.map((exercise) => [exercise.id, exercise.kind])),
    };
  }, [data, t, i18n.language]); // i18n.language: rebuild names after a language switch
}

/** Map of exercise id -> name in the current language. */
export function useExerciseNames(): ReadonlyMap<string, string> {
  return useExerciseCatalog().names;
}
