import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/components/EmptyState';

export default function ExercisesScreen() {
  const { t } = useTranslation();
  return <EmptyState icon="list-outline" title={t('exercises.emptyTitle')} hint={t('exercises.emptyHint')} />;
}
