import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useKeepAwake } from 'expo-keep-awake';
import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import { db } from '@/db/client';
import { getPreviousSets, selectFinishedWorkouts } from '@/db/repositories/workouts';
import { useExerciseNames } from '@/features/exercises/useExerciseNames';
import type { ActiveWorkout } from '@/lib/activeWorkout';
import { countCompletedSets } from '@/lib/activeWorkout';
import { useActiveWorkout } from '@/store/activeWorkout';
import { colors, radius, spacing, typography } from '@/theme';

import { ExerciseCard } from './ExerciseCard';
import { finishWorkout } from './finishWorkout';
import { RestTimerBar } from './RestTimerBar';
import { useRestTimer } from './useRestTimer';
import { WorkoutTimer } from './WorkoutTimer';
import { showAlert } from '@/components/alert';

export function ActiveWorkoutView({ workout }: { workout: ActiveWorkout }) {
  useKeepAwake(); // screen stays on during the workout
  const { t } = useTranslation();
  const names = useExerciseNames();
  const rest = useRestTimer();

  // Re-read "previous" when history changes too (e.g. a workout deleted mid-session).
  const { data: finishedWorkouts } = useLiveQuery(selectFinishedWorkouts(db));
  const exerciseIdsKey = workout.exercises.map((e) => e.exerciseId).join(',');
  const previousSets = useMemo(
    () => getPreviousSets(db, exerciseIdsKey ? exerciseIdsKey.split(',') : []),
    [exerciseIdsKey, finishedWorkouts],
  );

  const completed = countCompletedSets(workout);

  function discard() {
    rest.stop();
    useActiveWorkout.getState().clearWorkout();
  }

  function confirmDiscard() {
    showAlert(t('workout.discardTitle'), t('workout.discardBody'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('workout.discard'), style: 'destructive', onPress: discard },
    ]);
  }

  function finish() {
    let result: ReturnType<typeof finishWorkout>;
    try {
      result = finishWorkout(db, workout);
    } catch (error) {
      // The workout stays in the store, so nothing is lost and the user can retry.
      showAlert(t('workout.saveErrorTitle'), error instanceof Error ? error.message : String(error));
      return;
    }
    if (result.status === 'empty') {
      showAlert(t('workout.emptyFinishTitle'), t('workout.emptyFinishBody'), [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('workout.discard'), style: 'destructive', onPress: discard },
      ]);
      return;
    }
    rest.stop();
    const store = useActiveWorkout.getState();
    store.setSummary(result.summary);
    store.clearWorkout();
    router.push('/workout/summary');
  }

  function confirmFinish() {
    showAlert(t('workout.finishTitle'), t('workout.finishBody', { count: completed }), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('workout.finish'), onPress: finish },
    ]);
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <WorkoutTimer startedAt={workout.startedAt} />
          <Text style={styles.subtitle}>{t('workout.completedSets', { count: completed })}</Text>
        </View>
        <Button label={t('workout.finish')} compact onPress={confirmFinish} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        automaticallyAdjustKeyboardInsets
      >
        {workout.exercises.length === 0 && <Text style={styles.empty}>{t('workout.noExercises')}</Text>}
        {workout.exercises.map((row) => (
          <ExerciseCard
            key={row.id}
            row={row}
            name={names.get(row.exerciseId) ?? ''}
            previousSets={previousSets.get(row.exerciseId)}
            unit={workout.unit}
          />
        ))}
        <Button
          label={t('workout.addExercises')}
          icon="add"
          variant="secondary"
          onPress={() => router.push('/workout/add-exercises')}
        />
        <Button label={t('workout.discard')} variant="danger" onPress={confirmDiscard} />
      </ScrollView>

      <RestTimerBar />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  headerText: { flex: 1 },
  subtitle: { ...typography.caption, color: colors.textMuted },
  content: { padding: spacing.md, gap: spacing.md, paddingBottom: spacing.xxl },
  empty: {
    ...typography.body,
    color: colors.textMuted,
    textAlign: 'center',
    padding: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
  },
});
