import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import { useExerciseNames } from '@/features/exercises/useExerciseNames';
import { RoutineCard } from '@/features/routines/RoutineCard';
import { type RoutineWithItems, useRoutines } from '@/features/routines/useRoutines';
import { useActiveWorkout } from '@/store/activeWorkout';
import { useSettings } from '@/store/settings';
import { colors, radius, spacing, typography } from '@/theme';

import { ensureNotificationPermission } from './restNotifications';

export function StartWorkoutView() {
  const { t } = useTranslation();
  const unit = useSettings((state) => state.unit);
  const routines = useRoutines();
  const names = useExerciseNames();

  function startEmpty() {
    useActiveWorkout.getState().start(t('workout.defaultName'), unit);
    // Ask now, so the rest timer can notify when the app is in the background.
    void ensureNotificationPermission();
  }

  function startRoutine({ routine, items }: RoutineWithItems) {
    useActiveWorkout.getState().startFromRoutine(routine.name, unit, routine.id, items);
    void ensureNotificationPermission();
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('workout.startTitle')}</Text>
      <Button label={t('workout.startEmpty')} icon="add" onPress={startEmpty} />

      <View style={styles.sectionHeader}>
        <Text style={styles.section}>{t('routines.title')}</Text>
        <Pressable
          accessibilityRole="button"
          onPress={() => router.push({ pathname: '/routine/[id]', params: { id: 'new' } })}
          hitSlop={8}
        >
          <Text style={styles.link}>{t('routines.new')}</Text>
        </Pressable>
      </View>

      {routines.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{t('routines.emptyHint')}</Text>
        </View>
      ) : (
        routines.map((item) => (
          <RoutineCard
            key={item.routine.id}
            item={item}
            names={names}
            onEdit={() => router.push({ pathname: '/routine/[id]', params: { id: item.routine.id } })}
            onStart={() => startRoutine(item)}
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
