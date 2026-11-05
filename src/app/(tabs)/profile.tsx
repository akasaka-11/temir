import Constants from 'expo-constants';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import { Chip } from '@/components/Chip';
import { LanguagePicker } from '@/components/LanguagePicker';
import { OptionList } from '@/components/OptionList';
import { StatGrid } from '@/components/StatGrid';
import { db } from '@/db/client';
import { deleteAllWorkouts } from '@/db/repositories/workouts';
import { useWorkoutHistory } from '@/features/history/useWorkoutHistory';
import { ProgressOverview } from '@/features/progress/ProgressOverview';
import { computeOverallStats, REST_OPTIONS_SECONDS } from '@/lib/stats';
import type { WeightUnit } from '@/lib/units';
import { formatDuration } from '@/lib/workoutMath';
import { useSettings } from '@/store/settings';
import { colors, spacing, typography } from '@/theme';
import { showAlert } from '@/components/alert';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { unit, restSeconds, setUnit, setRestSeconds } = useSettings();
  const history = useWorkoutHistory();

  const stats = useMemo(
    () =>
      computeOverallStats(
        history.map((h) => ({ startedAt: h.workout.startedAt, setCount: h.stats.setCount })),
        Date.now(),
      ),
    [history],
  );

  const tiles = [
    { label: t('profile.stats.workouts'), value: String(stats.workouts) },
    { label: t('profile.stats.thisWeek'), value: String(stats.workoutsThisWeek) },
    { label: t('profile.stats.sets'), value: String(stats.totalSets) },
  ];

  const unitOptions: { value: WeightUnit; label: string }[] = [
    { value: 'kg', label: t('profile.units.kg') },
    { value: 'lb', label: t('profile.units.lb') },
  ];

  function confirmClearHistory() {
    showAlert(t('profile.clearHistoryTitle'), t('profile.clearHistoryBody', { count: stats.workouts }), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('profile.clearHistoryConfirm'), style: 'destructive', onPress: () => deleteAllWorkouts(db) },
    ]);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('profile.statsTitle')}</Text>
      <StatGrid stats={tiles} />
      {stats.workouts > 0 && <ProgressOverview history={history} />}

      <Text style={styles.title}>{t('profile.settings')}</Text>

      <View style={styles.section}>
        <Text style={styles.label}>{t('profile.language')}</Text>
        <LanguagePicker />
        <Text style={styles.hint}>{t('profile.languageHint')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>{t('profile.unit')}</Text>
        <OptionList options={unitOptions} value={unit} onChange={setUnit} />
        <Text style={styles.hint}>{t('profile.unitHint')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>{t('profile.rest')}</Text>
        <View style={styles.chips}>
          {REST_OPTIONS_SECONDS.map((seconds) => (
            <Chip
              key={seconds}
              label={seconds === 0 ? t('profile.restOff') : formatDuration(seconds * 1000)}
              selected={restSeconds === seconds}
              onPress={() => setRestSeconds(seconds)}
            />
          ))}
        </View>
        <Text style={styles.hint}>{t('profile.restHint')}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.label}>{t('profile.data')}</Text>
        <Button
          label={t('profile.clearHistory')}
          variant="danger"
          icon="trash-outline"
          onPress={confirmClearHistory}
          disabled={stats.workouts === 0}
        />
      </View>

      <Text style={styles.version}>
        {t('profile.version', { version: Constants.expoConfig?.version ?? '—' })}
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  title: { ...typography.title, color: colors.text, marginTop: spacing.sm },
  section: { gap: spacing.sm },
  label: { ...typography.caption, color: colors.textMuted, textTransform: 'uppercase' },
  hint: { ...typography.caption, color: colors.textMuted },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  version: { ...typography.caption, color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg },
});
