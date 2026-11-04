import Ionicons from '@expo/vector-icons/Ionicons';
import { memo } from 'react';
import { type KeyboardTypeOptions, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import type { ExerciseKind } from '@/db/schema';
import type { ActiveSet, SetFallback, SetTexts } from '@/lib/activeWorkout';
import { colors, radius, spacing, typography } from '@/theme';

type Field = {
  key: keyof SetTexts;
  keyboardType: KeyboardTypeOptions;
  placeholder: string;
  maxLength: number;
};

/** Strength: weight + reps. Cardio: duration (mm:ss) + distance (km). */
function fieldsFor(kind: ExerciseKind, fallback: SetFallback | undefined, repsHint?: string): [Field, Field] {
  if (kind === 'cardio') {
    return [
      { key: 'durationText', keyboardType: 'numbers-and-punctuation', placeholder: fallback?.durationText || '0:00', maxLength: 8 },
      { key: 'distanceText', keyboardType: 'decimal-pad', placeholder: fallback?.distanceText || '—', maxLength: 6 },
    ];
  }
  return [
    { key: 'weightText', keyboardType: 'decimal-pad', placeholder: fallback?.weightText || '0', maxLength: 7 },
    { key: 'repsText', keyboardType: 'number-pad', placeholder: fallback?.repsText || repsHint || '0', maxLength: 4 },
  ];
}

type Props = {
  index: number;
  set: ActiveSet;
  kind: ExerciseKind;
  /** Last time's result, already formatted ("60 kg × 8"), or undefined. */
  previousText: string | undefined;
  /** Last time's values as input texts (placeholders and auto-fill). */
  fallback: SetFallback | undefined;
  toggleLabel: string;
  // Handlers take ids so the parent can pass stable callbacks and memo works.
  onChange: (setId: string, patch: Partial<SetTexts>) => void;
  onToggle: (setId: string, index: number) => void;
  onLongPressIndex: (setId: string, index: number) => void;
  onUsePrevious: (setId: string, index: number) => void;
};

export const SetRow = memo(function SetRow({
  index,
  set,
  kind,
  previousText,
  fallback,
  toggleLabel,
  onChange,
  onToggle,
  onLongPressIndex,
  onUsePrevious,
}: Props) {
  const done = set.isCompleted;

  return (
    <View style={[styles.row, done && styles.rowDone]}>
      <Pressable onLongPress={() => onLongPressIndex(set.id, index)} style={styles.indexCell} hitSlop={4}>
        <Text style={styles.index}>{index + 1}</Text>
      </Pressable>
      <Pressable
        onPress={() => onUsePrevious(set.id, index)}
        disabled={!previousText || done}
        style={styles.previousCell}
      >
        <Text style={styles.previous} numberOfLines={1}>
          {previousText ?? '—'}
        </Text>
      </Pressable>
      {fieldsFor(kind, fallback, set.repsHint).map((field) => (
        <TextInput
          key={field.key}
          value={set[field.key] ?? ''}
          onChangeText={(text) => onChange(set.id, { [field.key]: text })}
          placeholder={field.placeholder}
          placeholderTextColor={colors.textMuted}
          keyboardType={field.keyboardType}
          style={[styles.input, done && styles.inputDone]}
          editable={!done}
          selectTextOnFocus
          maxLength={field.maxLength}
        />
      ))}
      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={toggleLabel}
        onPress={() => onToggle(set.id, index)}
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
  rowDone: { backgroundColor: colors.completedRow },
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
