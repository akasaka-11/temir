import Ionicons from '@expo/vector-icons/Ionicons';
import * as Haptics from 'expo-haptics';
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

export function ExerciseCard({ row, name, previousSets, unit }: Props) {
  const { t, i18n } = useTranslation();
  const { addSet, removeSet, removeExercise, updateSet, toggleSet } = useActiveWorkout.getState();
  const restSeconds = useSettings((state) => state.restSeconds);
  const rest = useRestTimer();

  function handleToggle(setId: string, previous: SetResult | undefined) {
    const result = toggleSet(row.id, setId, toFallback(previous, unit));
    if (result === null) {
      void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      return;
    }
    if (result) {
      void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (restSeconds > 0) rest.start(restSeconds);
    }
  }

  function confirmRemoveExercise() {
    Alert.alert(t('workout.removeExerciseTitle'), name, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.remove'), style: 'destructive', onPress: () => removeExercise(row.id) },
    ]);
  }

  function confirmRemoveSet(setId: string, index: number) {
    Alert.alert(t('workout.removeSetTitle', { number: index + 1 }), undefined, [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.remove'), style: 'destructive', onPress: () => removeSet(row.id, setId) },
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

      {row.sets.map((set, index) => {
        const previous = previousSets?.[index];
        return (
          <SetRow
            key={set.id}
            index={index}
            set={set}
            previous={previous}
            unit={unit}
            language={i18n.language}
            toggleLabel={t('workout.toggleSet', { number: index + 1 })}
            onChange={(patch) => updateSet(row.id, set.id, patch)}
            onToggle={() => handleToggle(set.id, previous)}
            onLongPressIndex={() => confirmRemoveSet(set.id, index)}
            onUsePrevious={() => {
              const fallback = toFallback(previous, unit);
              if (fallback) updateSet(row.id, set.id, fallback);
            }}
          />
        );
      })}

      <View style={styles.addSet}>
        <Button label={t('workout.addSet')} icon="add" variant="secondary" compact onPress={() => addSet(row.id)} />
      </View>
    </View>
  );
}

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
