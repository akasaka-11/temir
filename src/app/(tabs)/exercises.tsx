import { router } from 'expo-router';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { EmptyState } from '@/components/EmptyState';
import { ExerciseFilterBar, useExerciseBrowser } from '@/features/exercises/ExerciseBrowser';
import { ExerciseListItem } from '@/features/exercises/ExerciseListItem';
import { colors, spacing } from '@/theme';

export default function ExercisesScreen() {
  const { t } = useTranslation();
  const browser = useExerciseBrowser();
  const { exercises } = browser;

  return (
    <View style={styles.screen}>
      <ExerciseFilterBar {...browser} />
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            onPress={() => router.push({ pathname: '/exercise/[id]', params: { id: item.id } })}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <ExerciseListItem
              name={item.displayName}
              muscleGroup={item.muscleGroup}
              equipment={item.equipment}
              isCustom={item.isCustom}
            />
          </Pressable>
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
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginLeft: spacing.lg,
  },
  emptyContainer: { flexGrow: 1 },
  pressed: { backgroundColor: colors.surface },
});
