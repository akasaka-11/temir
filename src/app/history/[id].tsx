import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useMemo } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { StatGrid } from '@/components/StatGrid';
import { db } from '@/db/client';
import { deleteWorkout, getSetsForWorkouts, getWorkout } from '@/db/repositories/workouts';
import { useExerciseCatalog } from '@/features/exercises/useExerciseNames';
import { formatSetResult } from '@/features/workout/formatSet';
import { buildWorkoutStatTiles } from '@/features/workout/statTiles';
import { buildWorkoutStats, formatTime, formatWorkoutDate } from '@/lib/history';
import { formatWeight } from '@/lib/units';
import { estimateOneRepMax } from '@/lib/workoutMath';
import { useSettings } from '@/store/settings';
import { colors, radius, spacing, typography } from '@/theme';

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const unit = useSettings((state) => state.unit);
  const { names, kinds } = useExerciseCatalog();
  const lang = i18n.language;

  const workout = useMemo(() => getWorkout(db, id), [id]);
  const stats = useMemo(() => buildWorkoutStats(getSetsForWorkouts(db, [id])).get(id), [id]);

  if (!workout) {
    return <EmptyState icon="alert-circle-outline" title={t('history.notFound')} hint="" />;
  }

  const finishedAt = workout.finishedAt ?? workout.startedAt;
  const tiles = buildWorkoutStatTiles(
    {
      durationMs: finishedAt - workout.startedAt,
      volumeKg: stats?.volumeKg ?? 0,
      setCount: stats?.setCount ?? 0,
      exerciseCount: stats?.exercises.length ?? 0,
    },
    t,
    unit,
    lang,
  );

  function confirmDelete() {
    Alert.alert(t('history.deleteTitle'), t('history.deleteBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.remove'),
        style: 'destructive',
        onPress: () => {
          deleteWorkout(db, id);
          router.back();
        },
      },
    ]);
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Stack.Screen options={{ title: workout.name }} />

      <Text style={styles.date}>
        {formatWorkoutDate(workout.startedAt, lang)} · {formatTime(workout.startedAt, lang)}–
        {formatTime(finishedAt, lang)}
      </Text>

      <StatGrid stats={tiles} />

      {stats?.exercises.map((exercise, exerciseIndex) => {
        const kind = kinds.get(exercise.exerciseId) ?? 'strength';
        return (
          <View key={`${exercise.exerciseId}-${exerciseIndex}`} style={styles.card}>
            <Pressable
              accessibilityRole="link"
              onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: exercise.exerciseId } })}
            >
              <Text style={styles.exerciseName}>{names.get(exercise.exerciseId) ?? ''}</Text>
            </Pressable>
            <View style={styles.row}>
              <Text style={[styles.headerCell, styles.indexCell]}>{t('workout.columns.set')}</Text>
              <Text style={[styles.headerCell, styles.resultCell]}>{t('history.columns.result')}</Text>
              {kind === 'strength' && (
                <Text style={[styles.headerCell, styles.oneRmCell]}>{t('history.columns.oneRepMax')}</Text>
              )}
            </View>
            {exercise.sets.map((set, index) => (
              <View key={index} style={styles.row}>
                <Text style={[styles.cell, styles.indexCell, styles.muted]}>{index + 1}</Text>
                <Text style={[styles.cell, styles.resultCell]}>{formatSetResult(set, kind, unit, lang, t)}</Text>
                {kind === 'strength' && (
                  <Text style={[styles.cell, styles.oneRmCell, styles.muted]}>
                    {formatWeight(estimateOneRepMax(set), unit, lang)}
                  </Text>
                )}
              </View>
            ))}
          </View>
        );
      })}

      <Button label={t('history.delete')} variant="danger" icon="trash-outline" onPress={confirmDelete} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  date: { ...typography.body, color: colors.textMuted, marginLeft: spacing.xs },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  exerciseName: { ...typography.heading, color: colors.primary, marginBottom: spacing.xs },
  row: { flexDirection: 'row', alignItems: 'center' },
  headerCell: { ...typography.caption, color: colors.textMuted },
  cell: { ...typography.body, color: colors.text, fontVariant: ['tabular-nums'] },
  muted: { color: colors.textMuted },
  indexCell: { width: 40 },
  resultCell: { flex: 1 },
  oneRmCell: { width: 72, textAlign: 'right' },
});
