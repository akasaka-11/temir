import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Chip } from '@/components/Chip';
import { db } from '@/db/client';
import { createCustomExercise } from '@/db/repositories/exercises';
import { EQUIPMENT, type Equipment, MUSCLE_GROUPS, type MuscleGroup } from '@/db/schema';
import { MAX_EXERCISE_NAME_LENGTH, validateExerciseName } from '@/lib/exercises';
import { goBack } from '@/lib/navigation';
import { colors, radius, spacing, typography } from '@/theme';

type FormErrors = { name?: string; muscleGroup?: string };

export default function NewExerciseScreen() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | null>(null);
  const [equipment, setEquipment] = useState<Equipment>('other');
  const [errors, setErrors] = useState<FormErrors>({});

  function save() {
    const result = validateExerciseName(name);
    const nextErrors: FormErrors = {};
    if (!result.ok) nextErrors.name = t(`exerciseForm.errors.${result.error}`, { max: MAX_EXERCISE_NAME_LENGTH });
    if (muscleGroup === null) nextErrors.muscleGroup = t('exerciseForm.errors.muscleGroupRequired');
    setErrors(nextErrors);
    if (!result.ok || muscleGroup === null) return;

    createCustomExercise(db, { name: result.name, muscleGroup, equipment });
    goBack();
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.field}>
        <Text style={styles.label}>{t('exerciseForm.name')}</Text>
        <TextInput
          value={name}
          onChangeText={setName}
          placeholder={t('exerciseForm.namePlaceholder')}
          placeholderTextColor={colors.textMuted}
          style={[styles.input, errors.name && styles.inputError]}
          maxLength={MAX_EXERCISE_NAME_LENGTH + 10}
          autoFocus
          returnKeyType="done"
        />
        {errors.name && <Text style={styles.error}>{errors.name}</Text>}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{t('exerciseForm.muscleGroup')}</Text>
        <View style={styles.chips}>
          {MUSCLE_GROUPS.map((group) => (
            <Chip
              key={group}
              label={t(`muscleGroups.${group}`)}
              selected={muscleGroup === group}
              onPress={() => setMuscleGroup(group)}
            />
          ))}
        </View>
        {errors.muscleGroup && <Text style={styles.error}>{errors.muscleGroup}</Text>}
      </View>

      <View style={styles.field}>
        <Text style={styles.label}>{t('exerciseForm.equipment')}</Text>
        <View style={styles.chips}>
          {EQUIPMENT.map((item) => (
            <Chip
              key={item}
              label={t(`equipment.${item}`)}
              selected={equipment === item}
              onPress={() => setEquipment(item)}
            />
          ))}
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={save}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Text style={styles.buttonText}>{t('common.save')}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.xl },
  field: { gap: spacing.sm },
  label: { ...typography.caption, color: colors.textMuted, textTransform: 'uppercase' },
  input: {
    ...typography.body,
    color: colors.text,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.surface,
  },
  inputError: { borderColor: colors.danger },
  error: { ...typography.caption, color: colors.danger },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  button: {
    backgroundColor: colors.primary,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
  buttonPressed: { opacity: 0.8 },
  buttonText: { ...typography.heading, color: colors.primaryText },
});
