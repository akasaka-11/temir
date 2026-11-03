import { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { SearchBar } from '@/components/SearchBar';
import type { MuscleGroup } from '@/db/schema';
import { spacing } from '@/theme';

import { MuscleGroupFilter } from './MuscleGroupFilter';
import { useExerciseLibrary } from './useExerciseLibrary';

/** Search + muscle filter state and the matching exercises (shared by library and pickers). */
export function useExerciseBrowser() {
  const [query, setQuery] = useState('');
  const [muscleGroup, setMuscleGroup] = useState<MuscleGroup | null>(null);
  const filter = useMemo(() => ({ query, muscleGroup }), [query, muscleGroup]);
  const exercises = useExerciseLibrary(filter);
  return { query, setQuery, muscleGroup, setMuscleGroup, exercises };
}

type Props = Pick<ReturnType<typeof useExerciseBrowser>, 'query' | 'setQuery' | 'muscleGroup' | 'setMuscleGroup'>;

export function ExerciseFilterBar({ query, setQuery, muscleGroup, setMuscleGroup }: Props) {
  const { t } = useTranslation();
  return (
    <View>
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
    </View>
  );
}

const styles = StyleSheet.create({
  search: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  filter: { paddingVertical: spacing.md },
});
