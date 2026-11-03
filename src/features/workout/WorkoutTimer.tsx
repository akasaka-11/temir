import { StyleSheet, Text } from 'react-native';

import { useNow } from '@/hooks/useNow';
import { formatDuration } from '@/lib/workoutMath';
import { colors, typography } from '@/theme';

/** Separate component so only this text re-renders every second. */
export function WorkoutTimer({ startedAt }: { startedAt: number }) {
  const now = useNow(1000);
  return <Text style={styles.time}>{formatDuration(now - startedAt)}</Text>;
}

const styles = StyleSheet.create({
  time: { ...typography.title, color: colors.text, fontVariant: ['tabular-nums'] },
});
