import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { useActiveWorkout } from '@/store/activeWorkout';

import { cancelRestNotification, scheduleRestNotification } from './restNotifications';

const MIN_REST_SECONDS = 5;

/** Starts, adjusts and stops the rest timer, keeping the scheduled notification in sync. */
export function useRestTimer() {
  const { t } = useTranslation();

  const schedule = useCallback(
    async (durationSeconds: number, endsAt: number) => {
      const previous = useActiveWorkout.getState().rest;
      await cancelRestNotification(previous?.notificationId);
      // Show the timer immediately, attach the notification id once scheduled.
      useActiveWorkout.getState().setRest({ endsAt, durationSeconds, notificationId: null });
      const notificationId = await scheduleRestNotification((endsAt - Date.now()) / 1000, {
        title: t('rest.notificationTitle'),
        body: t('rest.notificationBody'),
      });
      const current = useActiveWorkout.getState().rest;
      if (current?.endsAt === endsAt) {
        useActiveWorkout.getState().setRest({ ...current, notificationId });
      } else {
        await cancelRestNotification(notificationId); // timer changed meanwhile
      }
    },
    [t],
  );

  const start = useCallback(
    (seconds: number) => void schedule(seconds, Date.now() + seconds * 1000),
    [schedule],
  );

  const adjust = useCallback(
    (deltaSeconds: number) => {
      const rest = useActiveWorkout.getState().rest;
      if (!rest) return;
      const endsAt = Math.max(Date.now() + MIN_REST_SECONDS * 1000, rest.endsAt + deltaSeconds * 1000);
      void schedule(Math.max(MIN_REST_SECONDS, rest.durationSeconds + deltaSeconds), endsAt);
    },
    [schedule],
  );

  const stop = useCallback(() => {
    const rest = useActiveWorkout.getState().rest;
    useActiveWorkout.getState().setRest(null);
    void cancelRestNotification(rest?.notificationId);
  }, []);

  return { start, adjust, stop };
}
