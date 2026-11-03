import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { formatWorkoutDate } from '@/lib/history';
import { formatWeight } from '@/lib/units';
import { formatDuration } from '@/lib/workoutMath';
import { useSettings } from '@/store/settings';
import { colors, radius, spacing, typography } from '@/theme';

import type { HistoryItem } from './useWorkoutHistory';

const MAX_EXERCISE_LINES = 4;

type Props = {
  item: HistoryItem;
  names: ReadonlyMap<string, string>;
  onPress: () => void;
};

function Metric({ icon, text }: { icon: ComponentProps<typeof Ionicons>['name']; text: string }) {
  return (
    <View style={styles.metric}>
      <Ionicons name={icon} size={14} color={colors.textMuted} />
      <Text style={styles.metricText}>{text}</Text>
    </View>
  );
}

export const WorkoutHistoryCard = memo(function WorkoutHistoryCard({ item, names, onPress }: Props) {
  const { t, i18n } = useTranslation();
  const unit = useSettings((state) => state.unit);
  const { workout, stats } = item;
  const duration = (workout.finishedAt ?? workout.startedAt) - workout.startedAt;
  const hidden = stats.exercises.length - MAX_EXERCISE_LINES;

  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.header}>
        <Text style={styles.name} numberOfLines={1}>
          {workout.name}
        </Text>
        <Text style={styles.date}>{formatWorkoutDate(workout.startedAt, i18n.language)}</Text>
      </View>

      <View style={styles.metrics}>
        <Metric icon="time-outline" text={formatDuration(duration)} />
        <Metric
          icon="barbell-outline"
          text={`${formatWeight(stats.volumeKg, unit, i18n.language)} ${t(`units.${unit}`)}`}
        />
        <Metric icon="checkmark-done-outline" text={t('units.sets', { count: stats.setCount })} />
      </View>

      <View style={styles.exercises}>
        {stats.exercises.slice(0, MAX_EXERCISE_LINES).map((exercise, index) => (
          <Text key={`${exercise.exerciseId}-${index}`} style={styles.exercise} numberOfLines={1}>
            {exercise.sets.length} × {names.get(exercise.exerciseId) ?? ''}
          </Text>
        ))}
        {hidden > 0 && <Text style={styles.more}>{t('history.moreExercises', { count: hidden })}</Text>}
      </View>
    </Pressable>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
  },
  pressed: { opacity: 0.8 },
  header: { gap: 2 },
  name: { ...typography.heading, color: colors.text },
  date: { ...typography.caption, color: colors.textMuted },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.lg },
  metric: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  metricText: { ...typography.caption, color: colors.text },
  exercises: { gap: 2 },
  exercise: { ...typography.body, color: colors.textMuted },
  more: { ...typography.caption, color: colors.primary },
});
