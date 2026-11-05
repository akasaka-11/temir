import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import { db } from '@/db/client';
import { deleteRoutine, getRoutine, getRoutineSpecs, saveRoutine } from '@/db/repositories/routines';
import { useExerciseNames } from '@/features/exercises/useExerciseNames';
import { RoutineExerciseEditor } from '@/features/routines/RoutineExerciseEditor';
import { newId } from '@/lib/id';
import {
  draftToSpec,
  emptyDraft,
  MAX_ROUTINE_NAME_LENGTH,
  type RoutineDraft,
  type RoutineDraftError,
  specToDraftItems,
  validateDraft,
} from '@/lib/routineDraft';
import { goBack } from '@/lib/navigation';
import type { WeightUnit } from '@/lib/units';
import { useRoutineDraft } from '@/store/routineDraft';
import { useSettings } from '@/store/settings';
import { colors, radius, spacing, typography } from '@/theme';
import { showAlert } from '@/components/alert';

function loadDraft(id: string, unit: WeightUnit): RoutineDraft {
  const routine = getRoutine(db, id);
  if (!routine) return emptyDraft();
  const items = getRoutineSpecs(db, [id]).get(id) ?? [];
  return { id, name: routine.name, notes: routine.notes ?? '', items: specToDraftItems(items, unit, newId) };
}

export default function RoutineEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const { t } = useTranslation();
  const names = useExerciseNames();
  const unit = useSettings((state) => state.unit);
  const draft = useRoutineDraft((state) => state.draft);
  const actions = useRoutineDraft.getState();
  const [errors, setErrors] = useState<RoutineDraftError[]>([]);

  // Load once per opened routine; the exercise picker edits the same draft afterwards.
  useEffect(() => {
    useRoutineDraft.getState().load(isNew ? emptyDraft() : loadDraft(id, unit));
    setErrors([]);
    // unit is read once on open (it cannot change while the editor is open).
  }, [id, isNew]);

  function save() {
    const found = validateDraft(draft, unit);
    setErrors(found);
    if (found.length > 0) return;
    saveRoutine(db, { id: draft.id, name: draft.name, notes: draft.notes, items: draftToSpec(draft, unit) });
    goBack();
  }

  function confirmDelete() {
    showAlert(t('routines.deleteTitle'), draft.name, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.remove'),
        style: 'destructive',
        onPress: () => {
          deleteRoutine(db, id);
          goBack();
        },
      },
    ]);
  }

  const nameError = errors.find((e) => e === 'nameRequired' || e === 'nameTooLong');

  return (
    <>
      <Stack.Screen
        options={{
          title: isNew ? t('routines.newTitle') : t('routines.editTitle'),
          headerRight: () => (
            <Pressable accessibilityRole="button" onPress={save} hitSlop={10}>
              <Text style={styles.headerAction}>{t('common.save')}</Text>
            </Pressable>
          ),
        }}
      />
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <View style={styles.field}>
          <Text style={styles.label}>{t('routines.name')}</Text>
          <TextInput
            value={draft.name}
            onChangeText={actions.setName}
            placeholder={t('routines.namePlaceholder')}
            placeholderTextColor={colors.textMuted}
            style={[styles.input, nameError && styles.inputError]}
            maxLength={MAX_ROUTINE_NAME_LENGTH + 10}
          />
          {nameError && (
            <Text style={styles.error}>{t(`routines.errors.${nameError}`, { max: MAX_ROUTINE_NAME_LENGTH })}</Text>
          )}
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{t('routines.notes')}</Text>
          <TextInput
            value={draft.notes}
            onChangeText={actions.setNotes}
            placeholder={t('routines.notesPlaceholder')}
            placeholderTextColor={colors.textMuted}
            style={[styles.input, styles.notes]}
            multiline
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>{t('routines.exercises')}</Text>
          {draft.items.map((item, index) => (
            <RoutineExerciseEditor
              key={item.key}
              item={item}
              name={names.get(item.exerciseId) ?? ''}
              unit={unit}
              isFirst={index === 0}
              isLast={index === draft.items.length - 1}
            />
          ))}
          {draft.items.length > 0 && <Text style={styles.hint}>{t('routines.setsHint')}</Text>}
          {errors.includes('noExercises') && <Text style={styles.error}>{t('routines.errors.noExercises')}</Text>}
          {errors.includes('invalidSet') && <Text style={styles.error}>{t('routines.errors.invalidSet')}</Text>}
          <Button
            label={t('workout.addExercises')}
            icon="add"
            variant="secondary"
            onPress={() => router.push('/routine/add-exercises')}
          />
        </View>

        <Button label={t('common.save')} onPress={save} />
        {!isNew && <Button label={t('routines.delete')} variant="danger" icon="trash-outline" onPress={confirmDelete} />}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.xl, paddingBottom: spacing.xxl },
  headerAction: { ...typography.body, color: colors.primary, fontWeight: '600' },
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
  notes: { minHeight: 80, textAlignVertical: 'top' },
  inputError: { borderColor: colors.danger },
  error: { ...typography.caption, color: colors.danger },
  hint: { ...typography.caption, color: colors.textMuted },
});
