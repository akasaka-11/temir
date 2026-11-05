import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Web: scheduled local notifications aren't supported without a push server, so they are skipped
// (no permission prompt); the in-app rest timer still works.
const supported = Platform.OS !== 'web';

// While the app is open the rest timer UI (plus a haptic) is enough, so foreground
// notifications are silent. The notification matters when the app is in the background.
export function configureNotifications(): void {
  if (!supported) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: false,
      shouldShowList: false,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
}

export async function ensureNotificationPermission(): Promise<boolean> {
  if (!supported) return false;
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function scheduleRestNotification(
  seconds: number,
  content: { title: string; body: string },
): Promise<string | null> {
  try {
    if (!(await ensureNotificationPermission())) return null;
    return await Notifications.scheduleNotificationAsync({
      content: { ...content, sound: true },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: Math.max(1, Math.round(seconds)),
      },
    });
  } catch {
    // Notifications are a nice-to-have; the in-app timer still works.
    return null;
  }
}

export async function cancelRestNotification(id: string | null | undefined): Promise<void> {
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // Already delivered or never scheduled.
  }
}
