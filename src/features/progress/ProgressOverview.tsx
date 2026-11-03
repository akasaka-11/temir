import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { BarChart } from '@/components/BarChart';
import { useExerciseCatalog } from '@/features/exercises/useExerciseNames';
import type { HistoryItem } from '@/features/history/useWorkoutHistory';
import { formatRecordValue } from '@/features/workout/formatSet';
import { topExerciseTrends } from '@/lib/progress';
import { workoutsPerWeek } from '@/lib/stats';
import { useSettings } from '@/store/settings';
import { colors, radius, spacing, typography } from '@/theme';

const WEEKS = 8;
const TOP_EXERCISES = 5;

/** Workouts per week and the most trained exercises with their progress. */
export function ProgressOverview({ history }: { history: readonly HistoryItem[] }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const unit = useSettings((state) => state.unit);
  const { names, kinds } = useExerciseCatalog();

  const weeks = useMemo(
    () => workoutsPerWeek(history.map((h) => h.workout.startedAt), Date.now(), WEEKS),
    [history],
  );
  const trends = useMemo(
    () => topExerciseTrends(history.map((h) => h.stats), kinds, TOP_EXERCISES),
    [history, kinds],
  );

  const dateFormat = new Intl.DateTimeFormat(lang, { day: 'numeric', month: 'short' });
  // The arrow shows the direction, so the number is shown without a sign.
  const percent = new Intl.NumberFormat(lang, { style: 'percent', maximumFractionDigits: 0 });

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.label}>{t('profile.progress.perWeek', { count: WEEKS })}</Text>
        <BarChart
          values={weeks.map((w) => w.workouts)}
          startLabel={dateFormat.format(new Date(weeks[0]!.weekStart))}
          endLabel={t('profile.progress.thisWeek')}
        />
      </View>

      {trends.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.label}>{t('profile.progress.topExercises')}</Text>
          {trends.map((trend) => {
            const cardio = kinds.get(trend.exerciseId) === 'cardio';
            const up = trend.change !== null && trend.change > 0.0005;
            const down = trend.change !== null && trend.change < -0.0005;
            return (
              <Pressable
                key={trend.exerciseId}
                accessibilityRole="button"
                onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: trend.exerciseId } })}
                style={({ pressed }) => [styles.row, pressed && styles.pressed]}
              >
                <View style={styles.rowText}>
                  <Text style={styles.name} numberOfLines={1}>
                    {names.get(trend.exerciseId) ?? ''}
                  </Text>
                  <Text style={styles.muted}>
                    {t('profile.progress.sessions', { count: trend.sessions })} ·{' '}
                    {cardio ? t('records.duration') : t('records.oneRepMax')}
                  </Text>
                </View>
                <View style={styles.values}>
                  <Text style={styles.value}>
                    {formatRecordValue(cardio ? 'duration' : 'oneRepMax', trend.latest, unit, lang, t)}
                  </Text>
                  {trend.change !== null && trend.sessions > 1 && (
                    <View style={styles.change}>
                      <Ionicons
                        name={up ? 'arrow-up' : down ? 'arrow-down' : 'remove'}
                        size={12}
                        color={colors.textMuted}
                      />
                      <Text style={styles.muted}>{percent.format(Math.abs(trend.change))}</Text>
                    </View>
                  )}
                </View>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
  label: { ...typography.caption, color: colors.textMuted, textTransform: 'uppercase' },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  pressed: { opacity: 0.7 },
  rowText: { flex: 1, gap: 2 },
  name: { ...typography.body, color: colors.text, fontWeight: '500' },
  muted: { ...typography.caption, color: colors.textMuted },
  values: { alignItems: 'flex-end', gap: 2 },
  value: { ...typography.body, color: colors.text, fontWeight: '600', fontVariant: ['tabular-nums'] },
  change: { flexDirection: 'row', alignItems: 'center', gap: 2 },
});
