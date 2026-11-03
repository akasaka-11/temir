import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import type { Equipment, MuscleGroup } from '@/db/schema';
import { colors, radius, spacing, typography } from '@/theme';

type Props = {
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  isCustom: boolean;
};

export const ExerciseListItem = memo(function ExerciseListItem({
  name,
  muscleGroup,
  equipment,
  isCustom,
}: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <Text style={styles.name} numberOfLines={2}>
          {name}
        </Text>
        <Text style={styles.meta}>
          {t(`muscleGroups.${muscleGroup}`)} · {t(`equipment.${equipment}`)}
        </Text>
      </View>
      {isCustom && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{t('exercises.custom')}</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  text: { flex: 1, gap: 2 },
  name: { ...typography.body, color: colors.text, fontWeight: '500' },
  meta: { ...typography.caption, color: colors.textMuted },
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceElevated,
  },
  badgeText: { ...typography.caption, color: colors.primary },
});
