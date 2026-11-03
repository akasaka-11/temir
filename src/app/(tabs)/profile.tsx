import Constants from 'expo-constants';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Chip } from '@/components/Chip';
import { LanguagePicker } from '@/components/LanguagePicker';
import { OptionList } from '@/components/OptionList';
import { StatGrid } from '@/components/StatGrid';
import { useWorkoutHistory } from '@/features/history/useWorkoutHistory';
import { computeOverallStats, REST_OPTIONS_SECONDS } from '@/lib/stats';
import { formatWeight, type WeightUnit } from '@/lib/units';
import { formatDuration } from '@/lib/workoutMath';
import { useSettings } from '@/store/settings';
import { colors, spacing, typography } from '@/theme';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const { unit, restSeconds, setUnit, setRestSeconds } = useSettings();
  const history = useWorkoutHistory();

  const stats = useMemo(
    () =>
      computeOverallStats(
        history.map((h) => ({
          startedAt: h.workout.startedAt,
          setCount: h.stats.setCount,
          volumeKg: h.stats.volumeKg,
        })),
        Date.now(),
      ),
    [history],
  );

  const tiles = [
    { label: t('profile.stats.workouts'), value: String(stats.workouts) },
    { label: t('profile.stats.thisWeek'), value: String(stats.workoutsThisWeek) },
    { label: t('profile.stats.sets'), value: String(stats.totalSets) },
    {
      label: t('profile.stats.volume'),
      value: `${formatWeight(stats.totalVolumeKg, unit, i18n.language)} ${t(`units.${unit}`)}`,
    },
  ];

  const unitOptions: { value: WeightUnit; label: string }[] = [
    { value: 'kg', label: t('profile.units.kg') },
    { value: 'lb', label: t('profile.units.lb') },
  ];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('profile.statsTitle')}</Text>
      <StatGrid stats={tiles} />

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
