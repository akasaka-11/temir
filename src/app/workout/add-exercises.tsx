import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { SearchBar } from '@/components/SearchBar';
import type { MuscleGroup } from '@/db/schema';
import { ExerciseListItem } from '@/features/exercises/ExerciseListItem';
import { MuscleGroupFilter } from '@/features/exercises/MuscleGroupFilter';
import { useExerciseLibrary } from '@/features/exercises/useExerciseLibrary';
import { useActiveWorkout } from '@/store/activeWorkout';
import { colors, spacing } from '@/theme';

export default function AddExercisesScreen() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | null>(null);
  // Keeps the tap order, so exercises are added in the order they were picked.
  const [selected, setSelected] = useState<string[]>([]);
  const filter = useMemo(() => ({ query, muscleGroup }), [query, muscleGroup]);
  const exercises = useExerciseLibrary(filter);

  function toggle(id: string) {
    setSelected((current) => (current.includes(id) ? current.filter((x) => x !== id) : [...current, id]));
  }

  function add() {
    useActiveWorkout.getState().addExercises(selected);
    router.back();
  }

  return (
    <View style={styles.screen}>
      <View style={styles.search}>
        <SearchBar
          value={query}
          onChangeText={setQuery}
          placeholder={t('exercises.searchPlaceholder')}
          clearLabel={t('common.clear')}
        />
      </View>
      <View style={styles.filter}>
        <MuscleGroupFilter value={muscleGroup} onChange={setMuscleGroup} />
      </View>
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
          onPress={add}
          disabled={selected.length === 0}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  search: { paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  filter: { paddingVertical: spacing.md },
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
