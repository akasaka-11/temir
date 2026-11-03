import { router } from 'expo-router';
import { useMemo } from 'react';
import { SectionList, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/components/EmptyState';
import { useExerciseNames } from '@/features/exercises/useExerciseNames';
import { useWorkoutHistory } from '@/features/history/useWorkoutHistory';
import { WorkoutHistoryCard } from '@/features/history/WorkoutHistoryCard';
import { groupByMonth } from '@/lib/history';
import { colors, spacing, typography } from '@/theme';

export default function HistoryScreen() {
  const { t, i18n } = useTranslation();
  const history = useWorkoutHistory();
  const names = useExerciseNames();
  const sections = useMemo(
    () => groupByMonth(history, (item) => item.workout.startedAt, i18n.language),
    [history, i18n.language],
  );

  if (history.length === 0) {
    return <EmptyState icon="time-outline" title={t('history.emptyTitle')} hint={t('history.emptyHint')} />;
  }

  return (
    <SectionList
      style={styles.screen}
      contentContainerStyle={styles.content}
      sections={sections}
      keyExtractor={(item) => item.workout.id}
      stickySectionHeadersEnabled={false}
      renderSectionHeader={({ section }) => <Text style={styles.section}>{section.title}</Text>}
      renderItem={({ item }) => (
        <WorkoutHistoryCard
          item={item}
          names={names}
          onPress={() => router.push({ pathname: '/history/[id]', params: { id: item.workout.id } })}
        />
      )}
      ItemSeparatorComponent={Gap}
    />
  );
}

function Gap() {
  return <View style={styles.gap} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, paddingBottom: spacing.xxl },
  section: {
    ...typography.caption,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  gap: { height: spacing.md },
});
