import Ionicons from '@expo/vector-icons/Ionicons';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { ActiveSet } from '@/lib/activeWorkout';
import { formatWeight, type WeightUnit, weightToInput } from '@/lib/units';
import type { SetResult } from '@/lib/workoutMath';
import { colors, radius, spacing, typography } from '@/theme';

type Props = {
  index: number;
  set: ActiveSet;
  previous: SetResult | undefined;
  unit: WeightUnit;
  language: string;
  toggleLabel: string;
  onChange: (patch: { weightText?: string; repsText?: string }) => void;
  onToggle: () => void;
  onLongPressIndex: () => void;
  onUsePrevious: () => void;
};

export const SetRow = memo(function SetRow({
  index,
  set,
  previous,
  unit,
  language,
  toggleLabel,
  onChange,
  onToggle,
  onLongPressIndex,
  onUsePrevious,
}: Props) {
  const done = set.isCompleted;
  const previousText = previous ? `${formatWeight(previous.weightKg, unit, language)} × ${previous.reps}` : '—';

  return (
    <View style={[styles.row, done && styles.rowDone]}>
      <Pressable onLongPress={onLongPressIndex} style={styles.indexCell} hitSlop={4}>
        <Text style={styles.index}>{index + 1}</Text>
      </Pressable>
      <Pressable onPress={onUsePrevious} disabled={!previous || done} style={styles.previousCell}>
        <Text style={styles.previous} numberOfLines={1}>
          {previousText}
        </Text>
      </Pressable>
      <TextInput
        value={set.weightText}
        onChangeText={(weightText) => onChange({ weightText })}
        placeholder={previous ? weightToInput(previous.weightKg, unit) : '0'}
        placeholderTextColor={colors.textMuted}
        keyboardType="decimal-pad"
        style={[styles.input, done && styles.inputDone]}
        editable={!done}
        selectTextOnFocus
        maxLength={7}
      />
      <TextInput
        value={set.repsText}
        onChangeText={(repsText) => onChange({ repsText })}
        placeholder={previous ? String(previous.reps) : '0'}
        placeholderTextColor={colors.textMuted}
        keyboardType="number-pad"
        style={[styles.input, done && styles.inputDone]}
        editable={!done}
        selectTextOnFocus
        maxLength={4}
      />
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={toggleLabel}
        onPress={onToggle}
        hitSlop={6}
        style={[styles.check, done && styles.checkDone]}
      >
        <Ionicons name="checkmark" size={20} color={done ? colors.primaryText : colors.textMuted} />
      </Pressable>
    </View>
  );
});

export const SET_COLUMNS = {
  index: 28,
  input: 64,
  check: 40,
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.sm,
  },
  rowDone: { backgroundColor: 'rgba(52, 199, 89, 0.12)' },
  indexCell: { width: SET_COLUMNS.index, alignItems: 'center' },
  index: { ...typography.body, color: colors.textMuted, fontWeight: '600' },
  previousCell: { flex: 1 },
  previous: { ...typography.caption, color: colors.textMuted },
  input: {
    ...typography.body,
    width: SET_COLUMNS.input,
    textAlign: 'center',
    color: colors.text,
    backgroundColor: colors.surfaceElevated,
    borderRadius: radius.sm,
    paddingVertical: spacing.sm,
    fontVariant: ['tabular-nums'],
  },
  inputDone: { backgroundColor: 'transparent' },
  check: {
    width: SET_COLUMNS.check,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
  },
  checkDone: { backgroundColor: colors.success },
});
