import { useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/components/EmptyState';
import { SearchBar } from '@/components/SearchBar';
import type { MuscleGroup } from '@/db/schema';
import { ExerciseListItem } from '@/features/exercises/ExerciseListItem';
import { MuscleGroupFilter } from '@/features/exercises/MuscleGroupFilter';
import { useExerciseLibrary } from '@/features/exercises/useExerciseLibrary';
import { colors, spacing } from '@/theme';

export default function ExercisesScreen() {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | null>(null);
  const filter = useMemo(() => ({ query, muscleGroup }), [query, muscleGroup]);
  const exercises = useExerciseLibrary(filter);

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
        renderItem={({ item }) => (
          <ExerciseListItem
            name={item.displayName}
            muscleGroup={item.muscleGroup}
            equipment={item.equipment}
            isCustom={item.isCustom}
          />
        )}
        ItemSeparatorComponent={Separator}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        contentContainerStyle={exercises.length === 0 && styles.emptyContainer}
        ListEmptyComponent={
          <EmptyState icon="search" title={t('exercises.noResults')} hint={t('exercises.noResultsHint')} />
        }
      />
    </View>
  );
}

function Separator() {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  search: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  filter: { paddingVertical: spacing.md },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: spacing.lg,
  },
  emptyContainer: { flexGrow: 1 },
});
