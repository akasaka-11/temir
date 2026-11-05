import Ionicons from '@expo/vector-icons/Ionicons';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import { colors, radius, spacing, typography } from '@/theme';
import { showAlert } from '@/components/alert';

type Props = {
  name: string;
  exerciseNames: readonly string[];
  /** Ready-made templates cannot be edited or deleted, only copied. */
  onEdit?: () => void;
  onDelete?: () => void;
  onCopy?: () => void;
  onStart: () => void;
};

export const RoutineCard = memo(function RoutineCard({
  name,
  exerciseNames,
  onEdit,
  onDelete,
  onCopy,
  onStart,
}: Props) {
  const { t } = useTranslation();

  function openMenu() {
    showAlert(name, undefined, [
      ...(onEdit ? [{ text: t('routines.edit'), onPress: onEdit }] : []),
      ...(onCopy ? [{ text: t('routines.copy'), onPress: onCopy }] : []),
      ...(onDelete
        ? [
            {
              text: t('routines.delete'),
              style: 'destructive' as const,
              onPress: () =>
                showAlert(t('routines.deleteTitle'), name, [
                  { text: t('common.cancel'), style: 'cancel' },
                  { text: t('common.remove'), style: 'destructive', onPress: onDelete },
                ]),
            },
          ]
        : []),
      { text: t('common.cancel'), style: 'cancel' as const },
    ]);
  }

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onEdit ?? onStart}
      onLongPress={openMenu}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.text}>
        <Text style={styles.name} numberOfLines={1}>
          {name}
        </Text>
        <Text style={styles.exercises} numberOfLines={2}>
          {exerciseNames.length > 0 ? exerciseNames.join(', ') : t('routines.noExercises')}
        </Text>
      </View>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t('routines.more')}
        onPress={openMenu}
        hitSlop={10}
        style={styles.more}
      >
        <Ionicons name="ellipsis-horizontal" size={20} color={colors.textMuted} />
      </Pressable>
      <Button label={t('routines.start')} compact onPress={onStart} disabled={exerciseNames.length === 0} />
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
  more: { padding: spacing.xs },
});
