import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import { db } from '@/db/client';
import { deleteRoutine, loadRoutineDraft, saveRoutine } from '@/db/repositories/routines';
import { useExerciseNames } from '@/features/exercises/useExerciseNames';
import { RoutineItemRow } from '@/features/routines/RoutineItemRow';
import { emptyDraft, MAX_ROUTINE_NAME_LENGTH, type RoutineDraftError, validateDraft } from '@/lib/routineDraft';
import { useRoutineDraft } from '@/store/routineDraft';
import { colors, radius, spacing, typography } from '@/theme';

export default function RoutineEditorScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const isNew = id === 'new';
  const { t } = useTranslation();
  const names = useExerciseNames();
  const draft = useRoutineDraft((state) => state.draft);
  const actions = useRoutineDraft.getState();
  const [errors, setErrors] = useState<RoutineDraftError[]>([]);

  // Load once per opened routine; the exercise picker edits the same draft afterwards.
  useEffect(() => {
    useRoutineDraft.getState().load(isNew ? emptyDraft() : (loadRoutineDraft(db, id) ?? emptyDraft()));
    setErrors([]);
  }, [id, isNew]);

  function save() {
    const found = validateDraft(draft);
    setErrors(found);
    if (found.length > 0) return;
    saveRoutine(db, draft);
    router.back();
  }

  function confirmDelete() {
    Alert.alert(t('routines.deleteTitle'), draft.name, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.remove'),
        style: 'destructive',
        onPress: () => {
          deleteRoutine(db, id);
          router.back();
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
            <RoutineItemRow
              key={item.key}
              item={item}
              name={names.get(item.exerciseId) ?? ''}
              isFirst={index === 0}
              isLast={index === draft.items.length - 1}
              onMove={(direction) => actions.move(item.key, direction)}
              onSetsChange={(sets) => actions.setTargetSets(item.key, sets)}
              onRemove={() => actions.remove(item.key)}
            />
          ))}
          {errors.includes('noExercises') && <Text style={styles.error}>{t('routines.errors.noExercises')}</Text>}
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
});
