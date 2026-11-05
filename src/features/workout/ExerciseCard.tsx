import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { memo, useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import type { ActiveExercise, SetTexts } from '@/lib/activeWorkout';
import type { WeightUnit } from '@/lib/units';
import type { SetResult } from '@/lib/workoutMath';
import { useActiveWorkout } from '@/store/activeWorkout';
import { useSettings } from '@/store/settings';
import { colors, radius, spacing, typography } from '@/theme';

import { formatSetResult, setToFallback } from './formatSet';
import { SET_COLUMNS, SetRow } from './SetRow';
import { useRestTimer } from './useRestTimer';
import { showAlert } from '@/components/alert';

type Props = {
  row: ActiveExercise;
  name: string;
  previousSets: readonly SetResult[] | undefined;
  unit: WeightUnit;
};

// Store actions never change, so reading them once keeps callbacks stable.
const actions = useActiveWorkout.getState();

/** Memoized: typing in one exercise does not re-render the others (rows are immutable). */
export const ExerciseCard = memo(function ExerciseCard({ row, name, previousSets, unit }: Props) {
  const { t, i18n } = useTranslation();
  const restSeconds = useSettings((state) => state.restSeconds);
  const { start: startRest } = useRestTimer();
  const rowId = row.id;
  const kind = row.kind ?? 'strength';

  // Per-set "last time" values, memoized so SetRow props stay referentially stable.
  const fallbacks = useMemo(
    () => (previousSets ?? []).map((p) => setToFallback(p, kind, unit)),
    [previousSets, kind, unit],
  );
  const previousTexts = useMemo(
    () => (previousSets ?? []).map((p) => formatSetResult(p, kind, unit, i18n.language, t)),
    [previousSets, kind, unit, i18n.language, t],
  );

  const handleChange = useCallback(
    (setId: string, patch: Partial<SetTexts>) => actions.updateSet(rowId, setId, patch),
    [rowId],
  );

  const handleToggle = useCallback(
    (setId: string, index: number) => {
      const result = actions.toggleSet(rowId, setId, fallbacks[index]);
      if (result === null) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return;
      }
      if (result) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (restSeconds > 0) startRest(restSeconds);
      }
    },
    [rowId, fallbacks, restSeconds, startRest],
  );

  const handleRemoveSet = useCallback(
    (setId: string, index: number) => {
      showAlert(t('workout.removeSetTitle', { number: index + 1 }), undefined, [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.remove'), style: 'destructive', onPress: () => actions.removeSet(rowId, setId) },
      ]);
    },
    [rowId, t],
  );

  const handleUsePrevious = useCallback(
    (setId: string, index: number) => {
      const fallback = fallbacks[index];
      if (fallback) actions.updateSet(rowId, setId, fallback);
    },
    [rowId, fallbacks],
  );

  function confirmRemoveExercise() {
    showAlert(t('workout.removeExerciseTitle'), name, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.remove'), style: 'destructive', onPress: () => actions.removeExercise(rowId) },
    ]);
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t('workout.removeExerciseTitle')}
          onPress={confirmRemoveExercise}
          hitSlop={10}
        >
          <Ionicons name="trash-outline" size={20} color={colors.textMuted} />
        </Pressable>
      </View>

      <View style={styles.columns}>
        <Text style={[styles.column, { width: SET_COLUMNS.index }]} numberOfLines={1}>
          {t('workout.columns.set')}
        </Text>
        <Text style={[styles.column, styles.previousColumn]}>{t('workout.columns.previous')}</Text>
        <Text style={[styles.column, { width: SET_COLUMNS.input }]}>
          {kind === 'cardio' ? t('workout.columns.time') : t(`units.${unit}`)}
        </Text>
        <Text style={[styles.column, { width: SET_COLUMNS.input }]}>
          {kind === 'cardio' ? t('units.km') : t('workout.columns.reps')}
        </Text>
        <View style={{ width: SET_COLUMNS.check }} />
      </View>

      {row.sets.map((set, index) => (
        <SetRow
          key={set.id}
          index={index}
          set={set}
          kind={kind}
          previousText={previousTexts[index]}
          fallback={fallbacks[index]}
          toggleLabel={t('workout.toggleSet', { number: index + 1 })}
          onChange={handleChange}
          onToggle={handleToggle}
          onLongPressIndex={handleRemoveSet}
          onUsePrevious={handleUsePrevious}
        />
      ))}

      <View style={styles.addSet}>
        <Button
          label={t('workout.addSet')}
          icon="add"
          variant="secondary"
          compact
          onPress={() => actions.addSet(rowId)}
        />
      </View>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    paddingVertical: spacing.md,
    gap: spacing.xs,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  name: { ...typography.heading, color: colors.primary, flex: 1 },
  columns: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md },
  column: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
  previousColumn: { flex: 1, textAlign: 'left' },
  addSet: { paddingHorizontal: spacing.md, paddingTop: spacing.sm },
});
