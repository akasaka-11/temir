import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import { colors, radius, spacing, typography } from '@/theme';

import type { RoutineWithItems } from './useRoutines';

type Props = {
  item: RoutineWithItems;
  names: ReadonlyMap<string, string>;
  onEdit: () => void;
  onStart: () => void;
};

export const RoutineCard = memo(function RoutineCard({ item, names, onEdit, onStart }: Props) {
  const { t } = useTranslation();
  const exercises = item.items.map((i) => names.get(i.exerciseId) ?? '').filter(Boolean);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityHint={t('routines.editHint')}
      onPress={onEdit}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.text}>
        <Text style={styles.name} numberOfLines={1}>
          {item.routine.name}
        </Text>
        <Text style={styles.exercises} numberOfLines={2}>
          {exercises.length > 0 ? exercises.join(', ') : t('routines.noExercises')}
        </Text>
      </View>
      <Button label={t('routines.start')} compact onPress={onStart} disabled={item.items.length === 0} />
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  pressed: { opacity: 0.8 },
  text: { flex: 1, gap: spacing.xs },
  name: { ...typography.heading, color: colors.text },
  exercises: { ...typography.caption, color: colors.textMuted },
});
