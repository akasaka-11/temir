import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
import { memo, useCallback } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import type { ActiveExercise, SetFallback } from '@/lib/activeWorkout';
import { type WeightUnit, weightToInput } from '@/lib/units';
import type { SetResult } from '@/lib/workoutMath';
import { useActiveWorkout } from '@/store/activeWorkout';
import { useSettings } from '@/store/settings';
import { colors, radius, spacing, typography } from '@/theme';

import { SET_COLUMNS, SetRow } from './SetRow';
import { useRestTimer } from './useRestTimer';

type Props = {
  row: ActiveExercise;
  name: string;
  previousSets: readonly SetResult[] | undefined;
  unit: WeightUnit;
};

function toFallback(previous: SetResult | undefined, unit: WeightUnit): SetFallback | undefined {
  return previous ? { weightText: weightToInput(previous.weightKg, unit), repsText: String(previous.reps) } : undefined;
}

// Store actions never change, so reading them once keeps callbacks stable.
const actions = useActiveWorkout.getState();

/** Memoized: typing in one exercise does not re-render the others (rows are immutable). */
export const ExerciseCard = memo(function ExerciseCard({ row, name, previousSets, unit }: Props) {
  const { t, i18n } = useTranslation();
  const restSeconds = useSettings((state) => state.restSeconds);
  const { start: startRest } = useRestTimer();
  const rowId = row.id;

  const handleChange = useCallback(
    (setId: string, patch: { weightText?: string; repsText?: string }) => actions.updateSet(rowId, setId, patch),
    [rowId],
  );

  const handleToggle = useCallback(
    (setId: string, index: number) => {
      const result = actions.toggleSet(rowId, setId, toFallback(previousSets?.[index], unit));
      if (result === null) {
        void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        return;
      }
      if (result) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        if (restSeconds > 0) startRest(restSeconds);
      }
    },
    [rowId, previousSets, unit, restSeconds, startRest],
  );

  const handleRemoveSet = useCallback(
    (setId: string, index: number) => {
      Alert.alert(t('workout.removeSetTitle', { number: index + 1 }), undefined, [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.remove'), style: 'destructive', onPress: () => actions.removeSet(rowId, setId) },
      ]);
    },
    [rowId, t],
  );

  const handleUsePrevious = useCallback(
    (setId: string, index: number) => {
      const fallback = toFallback(previousSets?.[index], unit);
      if (fallback) actions.updateSet(rowId, setId, fallback);
    },
    [rowId, previousSets, unit],
  );

  function confirmRemoveExercise() {
    Alert.alert(t('workout.removeExerciseTitle'), name, [
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
        <Text style={[styles.column, { width: SET_COLUMNS.index }]}>{t('workout.columns.set')}</Text>
        <Text style={[styles.column, styles.previousColumn]}>{t('workout.columns.previous')}</Text>
        <Text style={[styles.column, { width: SET_COLUMNS.input }]}>{t(`units.${unit}`)}</Text>
        <Text style={[styles.column, { width: SET_COLUMNS.input }]}>{t('workout.columns.reps')}</Text>
        <View style={{ width: SET_COLUMNS.check }} />
      </View>

      {row.sets.map((set, index) => (
        <SetRow
          key={set.id}
          index={index}
          set={set}
          previous={previousSets?.[index]}
          unit={unit}
          language={i18n.language}
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
