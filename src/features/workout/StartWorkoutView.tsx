import Ionicons from '@expo/vector-icons/Ionicons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import { db } from '@/db/client';
import { deleteRoutine } from '@/db/repositories/routines';
import { useExerciseNames } from '@/features/exercises/useExerciseNames';
import { RoutineCard } from '@/features/routines/RoutineCard';
import { useRoutines } from '@/features/routines/useRoutines';
import { useStartRoutine } from '@/features/routines/useStartRoutine';
import { colors, radius, spacing, typography } from '@/theme';

export function StartWorkoutView() {
  const { t } = useTranslation();
  const routines = useRoutines();
  const names = useExerciseNames();
  const { start } = useStartRoutine();

  const openEditor = (id: string) => router.push({ pathname: '/routine/[id]', params: { id } });

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('workout.startTitle')}</Text>
      <Button label={t('workout.startEmpty')} icon="add" onPress={() => start(t('workout.defaultName'), [])} />

      <Pressable
        accessibilityRole="button"
        onPress={() => router.push('/templates')}
        style={({ pressed }) => [styles.browse, pressed && styles.pressed]}
      >
        <Ionicons name="albums-outline" size={24} color={colors.text} />
        <View style={styles.browseText}>
          <Text style={styles.browseTitle}>{t('templates.browse')}</Text>
          <Text style={styles.muted}>{t('templates.browseHint')}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
      </Pressable>

      <View style={styles.sectionHeader}>
        <Text style={styles.section}>{t('routines.myTitle')}</Text>
        <Pressable accessibilityRole="button" onPress={() => openEditor('new')} hitSlop={8}>
          <Text style={styles.link}>{t('routines.new')}</Text>
        </Pressable>
      </View>

      {routines.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{t('routines.emptyHint')}</Text>
        </View>
      ) : (
        routines.map(({ routine, items }) => (
          <RoutineCard
            key={routine.id}
            name={routine.name}
            exerciseNames={items.map((i) => names.get(i.exerciseId) ?? '').filter(Boolean)}
            onEdit={() => openEditor(routine.id)}
            onDelete={() => deleteRoutine(db, routine.id)}
            onStart={() => start(routine.name, items, routine.id)}
          />
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  title: { ...typography.title, color: colors.text, marginBottom: spacing.sm },
  browse: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
  },
  pressed: { opacity: 0.8 },
  browseText: { flex: 1, gap: 2 },
  browseTitle: { ...typography.body, color: colors.text, fontWeight: '600' },
  muted: { ...typography.caption, color: colors.textMuted },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
  },
  section: { ...typography.heading, color: colors.text },
  link: { ...typography.body, color: colors.primary, fontWeight: '600' },
  empty: { padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.surface },
  emptyText: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
});
