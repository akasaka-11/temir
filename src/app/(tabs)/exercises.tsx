import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/components/EmptyState';
import { db } from '@/db/client';
import { countExercises } from '@/db/repositories/exercises';

export default function ExercisesScreen() {
  const { t } = useTranslation();
  const total = countExercises(db);
  return (
    <EmptyState
      icon="list-outline"
      title={t('exercises.count', { count: total })}
      hint={t('exercises.emptyHint')}
    />
  );
}
