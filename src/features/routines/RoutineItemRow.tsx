import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { MAX_TARGET_SETS, MIN_TARGET_SETS, type RoutineDraftItem } from '@/lib/routineDraft';
import { colors, radius, spacing, typography } from '@/theme';

type Props = {
  item: RoutineDraftItem;
  name: string;
  isFirst: boolean;
  isLast: boolean;
  onMove: (direction: -1 | 1) => void;
  onSetsChange: (targetSets: number) => void;
  onRemove: () => void;
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

export function RoutineItemRow({ item, name, isFirst, isLast, onMove, onSetsChange, onRemove }: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.row}>
      <View style={styles.order}>
        <IconButton icon="chevron-up" label={t('routines.moveUp')} onPress={() => onMove(-1)} disabled={isFirst} />
        <IconButton icon="chevron-down" label={t('routines.moveDown')} onPress={() => onMove(1)} disabled={isLast} />
      </View>
      <View style={styles.main}>
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>
        <View style={styles.stepper}>
          <IconButton
            icon="remove"
            label={t('routines.fewerSets')}
            onPress={() => onSetsChange(item.targetSets - 1)}
            disabled={item.targetSets <= MIN_TARGET_SETS}
          />
          <Text style={styles.sets}>{t('units.sets', { count: item.targetSets })}</Text>
          <IconButton
            icon="add"
            label={t('routines.moreSets')}
            onPress={() => onSetsChange(item.targetSets + 1)}
            disabled={item.targetSets >= MAX_TARGET_SETS}
          />
        </View>
      </View>
      <IconButton icon="trash-outline" label={t('common.remove')} onPress={onRemove} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  order: { gap: spacing.xs },
  main: { flex: 1, gap: spacing.sm },
  name: { ...typography.body, color: colors.text, fontWeight: '600' },
  stepper: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  sets: { ...typography.body, color: colors.textMuted, minWidth: 90, textAlign: 'center' },
  iconButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
  },
  disabled: { opacity: 0.3 },
});
