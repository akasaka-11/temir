import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/components/EmptyState';

export default function HistoryScreen() {
  const { t } = useTranslation();
  return <EmptyState icon="time-outline" title={t('history.emptyTitle')} hint={t('history.emptyHint')} />;
}
