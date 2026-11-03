import { ScrollView, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Chip } from '@/components/Chip';
import { MUSCLE_GROUPS, type MuscleGroup } from '@/db/schema';
import { spacing } from '@/theme';

type Props = {
  value: MuscleGroup | null;
  onChange: (group: MuscleGroup | null) => void;
};

export function MuscleGroupFilter({ value, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
      keyboardShouldPersistTaps="handled"
    >
      <Chip label={t('exercises.allMuscles')} selected={value === null} onPress={() => onChange(null)} />
      {MUSCLE_GROUPS.map((group) => (
        <Chip
          key={group}
          label={t(`muscleGroups.${group}`)}
          selected={value === group}
          onPress={() => onChange(value === group ? null : group)}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: { gap: spacing.sm, paddingHorizontal: spacing.lg },
});
