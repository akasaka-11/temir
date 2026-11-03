import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { SetTexts } from '@/lib/activeWorkout';
import { MAX_TARGET_SETS, parseTargetSet, type RoutineDraftItem } from '@/lib/routineDraft';
import type { WeightUnit } from '@/lib/units';
import { useRoutineDraft } from '@/store/routineDraft';
import { colors, radius, spacing, typography } from '@/theme';

type Props = {
  item: RoutineDraftItem;
  name: string;
  unit: WeightUnit;
  isFirst: boolean;
  isLast: boolean;
};

function IconButton({
  icon,
  label,
  onPress,
  disabled,
}: {
  icon: ComponentProps<typeof Ionicons>['name'];
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      disabled={disabled}
      hitSlop={6}
      style={[styles.iconButton, disabled && styles.disabled]}
    >
      <Ionicons name={icon} size={18} color={colors.text} />
    </Pressable>
  );
}

const actions = useRoutineDraft.getState();

/** One exercise of a template: order, planned sets with optional weight × reps (or time + km). */
export function RoutineExerciseEditor({ item, name, unit, isFirst, isLast }: Props) {
  const { t } = useTranslation();
  const cardio = item.kind === 'cardio';
  const fields: [keyof SetTexts, keyof SetTexts] = cardio
    ? ['durationText', 'distanceText']
    : ['weightText', 'repsText'];
  const placeholders = cardio ? ['0:00', '—'] : ['—', '—'];

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>
        <IconButton icon="chevron-up" label={t('routines.moveUp')} onPress={() => actions.move(item.key, -1)} disabled={isFirst} />
        <IconButton icon="chevron-down" label={t('routines.moveDown')} onPress={() => actions.move(item.key, 1)} disabled={isLast} />
        <IconButton icon="trash-outline" label={t('common.remove')} onPress={() => actions.remove(item.key)} />
      </View>

      <View style={styles.row}>
        <Text style={[styles.column, styles.index]}>{t('workout.columns.set')}</Text>
        <Text style={[styles.column, styles.input]}>{cardio ? t('workout.columns.time') : t(`units.${unit}`)}</Text>
        <Text style={[styles.column, styles.input]}>{cardio ? t('units.km') : t('workout.columns.reps')}</Text>
        <View style={styles.removeCell} />
      </View>

      {item.sets.map((set, index) => {
        const invalid = parseTargetSet(set, item.kind, unit) === null;
        return (
          <View key={set.key} style={styles.row}>
            <Text style={[styles.cell, styles.index]}>{index + 1}</Text>
            {fields.map((field, i) => (
              <TextInput
                key={field}
                value={set[field] ?? ''}
                onChangeText={(text) => actions.updateSet(item.key, set.key, { [field]: text })}
                placeholder={placeholders[i]}
                placeholderTextColor={colors.textMuted}
                keyboardType={
                  field === 'repsText' ? 'number-pad' : field === 'durationText' ? 'numbers-and-punctuation' : 'decimal-pad'
                }
                style={[styles.cell, styles.input, styles.field, invalid && styles.fieldError]}
                maxLength={8}
                selectTextOnFocus
              />
            ))}
            <View style={styles.removeCell}>
              {item.sets.length > 1 && (
                <IconButton icon="close" label={t('common.remove')} onPress={() => actions.removeSet(item.key, set.key)} />
              )}
            </View>
          </View>
        );
      })}

      <Pressable
        accessibilityRole="button"
        onPress={() => actions.addSet(item.key)}
        disabled={item.sets.length >= MAX_TARGET_SETS}
        style={styles.addSet}
        hitSlop={6}
      >
        <Ionicons name="add" size={18} color={colors.text} />
        <Text style={styles.addSetText}>{t('workout.addSet')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm, padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.surface },
  header: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  name: { ...typography.body, color: colors.text, fontWeight: '600', flex: 1 },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  column: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
  cell: { ...typography.body, color: colors.text, textAlign: 'center', fontVariant: ['tabular-nums'] },
  index: { width: 36 },
  input: { flex: 1 },
  field: { backgroundColor: colors.surfaceElevated, borderRadius: radius.sm, paddingVertical: spacing.sm },
  fieldError: { borderWidth: 1, borderColor: colors.danger },
  removeCell: { width: 32, alignItems: 'center' },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
  },
  disabled: { opacity: 0.3 },
  addSet: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    alignSelf: 'flex-start',
    paddingVertical: spacing.xs,
  },
  addSetText: { ...typography.body, color: colors.text, fontWeight: '500' },
});
