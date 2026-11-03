import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import { StatGrid } from '@/components/StatGrid';
import { useExerciseNames } from '@/features/exercises/useExerciseNames';
import { buildWorkoutStatTiles } from '@/features/workout/statTiles';
import { formatRecordValue } from '@/features/workout/formatSet';
import { useActiveWorkout } from '@/store/activeWorkout';
import { useSettings } from '@/store/settings';
import { colors, radius, spacing, typography } from '@/theme';

export default function WorkoutSummaryScreen() {
  const { t, i18n } = useTranslation();
  const summary = useActiveWorkout((state) => state.summary);
  const unit = useSettings((state) => state.unit);
  const names = useExerciseNames();

  function close() {
    useActiveWorkout.getState().setSummary(null);
    router.back();
  }

  if (!summary) return null;

  const stats = buildWorkoutStatTiles(summary, t, unit, i18n.language);

  return (
    <View style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content}>
        <Ionicons name="trophy-outline" size={56} color={colors.primary} style={styles.icon} />
        <Text style={styles.title}>{t('summary.title')}</Text>

        <View style={styles.stats}>
          <StatGrid stats={stats} />
        </View>

        <Text style={styles.section}>{t('summary.records', { count: summary.records.length })}</Text>
        {summary.records.length === 0 ? (
          <Text style={styles.muted}>{t('summary.noRecords')}</Text>
        ) : (
          summary.records.map((record) => (
            <View key={`${record.exerciseId}-${record.type}`} style={styles.record}>
              <Ionicons name="medal-outline" size={20} color={colors.primary} />
              <View style={styles.recordText}>
                <Text style={styles.recordName}>{names.get(record.exerciseId) ?? ''}</Text>
                <Text style={styles.muted}>{t(`records.${record.type}`)}</Text>
              </View>
              <Text style={styles.recordValue}>
                {formatRecordValue(record.type, record.value, unit, i18n.language, t)}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
      <View style={styles.footer}>
        <Button label={t('common.done')} onPress={close} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  icon: { alignSelf: 'center', marginTop: spacing.lg },
  title: { ...typography.title, color: colors.text, textAlign: 'center' },
  stats: { marginTop: spacing.md },
  section: { ...typography.heading, color: colors.text, marginTop: spacing.lg },
  muted: { ...typography.caption, color: colors.textMuted },
  record: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  recordText: { flex: 1, gap: 2 },
  recordName: { ...typography.body, color: colors.text, fontWeight: '500' },
  recordValue: { ...typography.body, color: colors.primary, fontWeight: '600' },
  footer: { padding: spacing.lg },
});
