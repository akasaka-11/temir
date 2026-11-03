import * as Haptics from 'expo-haptics';
import { useEffect } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useNow } from '@/hooks/useNow';
import { formatDuration } from '@/lib/workoutMath';
import { useActiveWorkout } from '@/store/activeWorkout';
import { colors, radius, spacing, typography } from '@/theme';

import { useRestTimer } from './useRestTimer';

const STEP_SECONDS = 15;

export function RestTimerBar() {
  const { t } = useTranslation();
  const rest = useActiveWorkout((state) => state.rest);
  const now = useNow(250, rest !== null);
  const { adjust, stop } = useRestTimer();

  const remainingMs = rest ? rest.endsAt - now : 0;
  const finished = rest !== null && remainingMs <= 0;

  useEffect(() => {
    if (!finished) return;
    void Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    stop();
  }, [finished, stop]);

  if (!rest || finished) return null;

  const progress = Math.min(1, Math.max(0, remainingMs / (rest.durationSeconds * 1000)));

  return (
    <View style={styles.bar}>
      <View style={[styles.progress, { width: `${progress * 100}%` }]} />
      <Pressable accessibilityRole="button" onPress={() => adjust(-STEP_SECONDS)} style={styles.step}>
        <Text style={styles.stepText}>−{STEP_SECONDS}</Text>
      </Pressable>
      <View style={styles.center}>
        <Text style={styles.label}>{t('rest.title')}</Text>
        <Text style={styles.time}>{formatDuration(remainingMs + 999)}</Text>
      </View>
      <Pressable accessibilityRole="button" onPress={() => adjust(STEP_SECONDS)} style={styles.step}>
        <Text style={styles.stepText}>+{STEP_SECONDS}</Text>
      </Pressable>
      <Pressable accessibilityRole="button" onPress={stop} style={styles.skip}>
        <Text style={styles.skipText}>{t('rest.skip')}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceElevated,
    overflow: 'hidden',
  },
  progress: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: colors.primary,
    opacity: 0.18,
  },
  center: { flex: 1, alignItems: 'center' },
  label: { ...typography.caption, color: colors.textMuted },
  time: { ...typography.title, color: colors.text, fontVariant: ['tabular-nums'] },
  step: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surface,
  },
  stepText: { ...typography.body, color: colors.text, fontWeight: '600' },
  skip: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  skipText: { ...typography.body, color: colors.primary, fontWeight: '600' },
});
