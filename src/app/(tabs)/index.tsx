import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/components/EmptyState';

export default function WorkoutScreen() {
  const { t } = useTranslation();
  return <EmptyState icon="barbell-outline" title={t('workout.emptyTitle')} hint={t('workout.emptyHint')} />;
}
