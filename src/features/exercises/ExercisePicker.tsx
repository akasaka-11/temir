import Ionicons from '@expo/vector-icons/Ionicons';
import { useRef, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import type { ExerciseKind } from '@/db/schema';
import { colors, spacing } from '@/theme';

import { ExerciseFilterBar, useExerciseBrowser } from './ExerciseBrowser';
import { ExerciseListItem } from './ExerciseListItem';

export type PickedExercise = { exerciseId: string; kind: ExerciseKind };

/** Multi-select list of exercises; returned in the order they were tapped. */
export function ExercisePicker({ onConfirm }: { onConfirm: (picked: PickedExercise[]) => void }) {
  const { t } = useTranslation();
  const browser = useExerciseBrowser();
  const { exercises } = browser;
  const [selected, setSelected] = useState<string[]>([]);

  // Remembers kinds of picked items even when a later search hides them from the list.
  const kindsById = useRef(new Map<string, ExerciseKind>());

  function toggle(id: string) {
    const kind = exercises.find((e) => e.id === id)?.kind;
    if (kind) kindsById.current.set(id, kind);
    setSelected((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));
  }

  return (
    <View style={styles.screen}>
      <ExerciseFilterBar {...browser} />
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        extraData={selected}
        renderItem={({ item }) => {
          const isSelected = selected.includes(item.id);
          return (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: isSelected }}
              onPress={() => toggle(item.id)}
              style={[styles.item, isSelected && styles.itemSelected]}
            >
              <View style={styles.itemContent}>
                <ExerciseListItem
                  name={item.displayName}
                  muscleGroup={item.muscleGroup}
                  equipment={item.equipment}
                  isCustom={item.isCustom}
                />
              </View>
              <Ionicons
                name={isSelected ? 'checkmark-circle' : 'ellipse-outline'}
                size={24}
                color={isSelected ? colors.primary : colors.border}
              />
            </Pressable>
          );
        }}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={exercises.length === 0 && styles.emptyContainer}
        ListEmptyComponent={
          <EmptyState icon="search" title={t('exercises.noResults')} hint={t('exercises.noResultsHint')} />
        }
      />
      <View style={styles.footer}>
        <Button
          label={t('workout.addSelected', { count: selected.length })}
          onPress={() =>
            onConfirm(
              selected.map((id) => ({
                exerciseId: id,
                kind: exercises.find((e) => e.id === id)?.kind ?? kindsById.current.get(id) ?? 'strength',
              })),
            )
          }
          disabled={selected.length === 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  item: { flexDirection: 'row', alignItems: 'center', paddingRight: spacing.lg },
  itemSelected: { backgroundColor: colors.surface },
  itemContent: { flex: 1 },
  emptyContainer: { flexGrow: 1 },
  footer: {
    padding: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.border,
  },
});
