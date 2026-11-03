import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { Stack, useLocalSearchParams } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Chip } from '@/components/Chip';
import { EmptyState } from '@/components/EmptyState';
import { LineChart } from '@/components/LineChart';
import { db } from '@/db/client';
import { getExercise } from '@/db/repositories/exercises';
import { getExerciseHistory, selectFinishedWorkouts } from '@/db/repositories/workouts';
import { useExerciseNames } from '@/features/exercises/useExerciseNames';
import { formatWorkoutDate } from '@/lib/history';
import {
  buildProgressPoints,
  computeRecords,
  metricValue,
  type ProgressMetric,
  type RecordEntry,
} from '@/lib/progress';
import { formatWeight } from '@/lib/units';
import { useSettings } from '@/store/settings';
import { colors, radius, spacing, typography } from '@/theme';

const METRICS: ProgressMetric[] = ['oneRepMax', 'maxWeight', 'volume'];
const RECENT_SESSIONS = 10;

export default function ExerciseProgressScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const lang = i18n.language;
  const unit = useSettings((state) => state.unit);
  const names = useExerciseNames();
  const [metric, setMetric] = useState<ProgressMetric>('oneRepMax');

  // Re-read when workouts are saved or deleted.
  const { data: workouts } = useLiveQuery(selectFinishedWorkouts(db));
  const exercise = useMemo(() => getExercise(db, id), [id]);
  const rows = useMemo(() => getExerciseHistory(db, id), [id, workouts]);
  const points = useMemo(() => buildProgressPoints(rows), [rows]);
  const records = useMemo(() => computeRecords(rows), [rows]);

  const unitLabel = t(`units.${unit}`);
  const weight = (kg: number) => `${formatWeight(kg, unit, lang)} ${unitLabel}`;
  const title = names.get(id) ?? '';

  if (!exercise) {
    return <EmptyState icon="alert-circle-outline" title={t('progress.notFound')} hint="" />;
  }

  const recordRows: { label: string; entry: RecordEntry | null; showSet: boolean }[] = [
    { label: t('records.weight'), entry: records.maxWeight, showSet: true },
    { label: t('records.oneRepMax'), entry: records.bestOneRepMax, showSet: true },
    { label: t('records.volume'), entry: records.bestSetVolume, showSet: true },
    { label: t('progress.bestWorkoutVolume'), entry: records.bestWorkoutVolume, showSet: false },
  ];

  const first = points[0];
  const last = points[points.length - 1];

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title }} />
      <Text style={styles.meta}>
        {t(`muscleGroups.${exercise.muscleGroup}`)} · {t(`equipment.${exercise.equipment}`)}
      </Text>

      {points.length === 0 ? (
        <View style={styles.card}>
          <Text style={styles.muted}>{t('progress.noHistory')}</Text>
        </View>
      ) : (
        <>
          <Text style={styles.section}>{t('progress.records')}</Text>
          <View style={styles.card}>
            {recordRows.map(({ label, entry, showSet }) => (
              <View key={label} style={styles.recordRow}>
                <View style={styles.recordText}>
                  <Text style={styles.recordLabel}>{label}</Text>
                  {entry && (
                    <Text style={styles.muted}>
                      {formatWorkoutDate(entry.date, lang)}
                      {showSet && entry.set ? ` · ${weight(entry.set.weightKg)} × ${entry.set.reps}` : ''}
                    </Text>
                  )}
                </View>
                <Text style={styles.recordValue}>{entry ? weight(entry.valueKg) : '—'}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.section}>{t('progress.chart')}</Text>
          <View style={styles.chips}>
            {METRICS.map((m) => (
              <Chip key={m} label={t(`progress.metrics.${m}`)} selected={metric === m} onPress={() => setMetric(m)} />
            ))}
          </View>
          <View style={styles.card}>
            {points.length < 2 || !first || !last ? (
              <Text style={styles.muted}>{t('progress.needMoreData')}</Text>
            ) : (
              <LineChart
                values={points.map((p) => metricValue(p, metric))}
                formatValue={weight}
                startLabel={formatWorkoutDate(first.date, lang)}
                endLabel={formatWorkoutDate(last.date, lang)}
              />
            )}
          </View>

          <Text style={styles.section}>{t('progress.recent')}</Text>
          <View style={styles.card}>
            {[...points]
              .reverse()
              .slice(0, RECENT_SESSIONS)
              .map((p) => (
                <View key={p.workoutId} style={styles.recordRow}>
                  <View style={styles.recordText}>
                    <Text style={styles.recordLabel}>{formatWorkoutDate(p.date, lang)}</Text>
                    <Text style={styles.muted}>{t('units.sets', { count: p.setCount })}</Text>
                  </View>
                  <Text style={styles.sessionValue}>
                    {weight(p.bestSet.weightKg)} × {p.bestSet.reps}
                  </Text>
                </View>
              ))}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  meta: { ...typography.body, color: colors.textMuted },
  section: { ...typography.heading, color: colors.text, marginTop: spacing.md },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  recordRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  recordText: { flex: 1, gap: 2 },
  recordLabel: { ...typography.body, color: colors.text },
  recordValue: { ...typography.heading, color: colors.primary, fontVariant: ['tabular-nums'] },
  sessionValue: { ...typography.body, color: colors.text, fontVariant: ['tabular-nums'] },
  muted: { ...typography.caption, color: colors.textMuted },
});
