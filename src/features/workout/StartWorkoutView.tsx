import Ionicons from '@expo/vector-icons/Ionicons';
import { StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { Button } from '@/components/Button';
import { useActiveWorkout } from '@/store/activeWorkout';
import { useSettings } from '@/store/settings';
import { colors, spacing, typography } from '@/theme';

import { ensureNotificationPermission } from './restNotifications';

export function StartWorkoutView() {
  const { t } = useTranslation();
  const unit = useSettings((state) => state.unit);

  function startEmpty() {
    useActiveWorkout.getState().start(t('workout.defaultName'), unit);
    // Ask now, so the rest timer can notify when the app is in the background.
    void ensureNotificationPermission();
  }

  return (
    <View style={styles.container}>
      <Ionicons name="barbell-outline" size={56} color={colors.textMuted} />
      <Text style={styles.title}>{t('workout.startTitle')}</Text>
      <Text style={styles.hint}>{t('workout.startHint')}</Text>
      <View style={styles.button}>
        <Button label={t('workout.startEmpty')} icon="add" onPress={startEmpty} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  title: { ...typography.heading, color: colors.text, textAlign: 'center' },
  hint: { ...typography.body, color: colors.textMuted, textAlign: 'center' },
  button: { alignSelf: 'stretch', marginTop: spacing.md },
});
