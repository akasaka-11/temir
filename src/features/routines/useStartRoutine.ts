import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import { db } from '@/db/client';
import { saveRoutine } from '@/db/repositories/routines';
import { ensureNotificationPermission } from '@/features/workout/restNotifications';
import { type RoutineSpecItem, specToWorkoutEntries } from '@/lib/routineDraft';
import { useActiveWorkout } from '@/store/activeWorkout';
import { useSettings } from '@/store/settings';
import { showAlert } from '@/components/alert';

/** Starting a workout from any template, and copying ready-made ones to "My templates". */
export function useStartRoutine() {
  const { t } = useTranslation();
  const unit = useSettings((state) => state.unit);

  const start = useCallback(
    (name: string, items: readonly RoutineSpecItem[], routineId: string | null = null) => {
      useActiveWorkout.getState().start(name, unit, routineId, specToWorkoutEntries(items, unit));
      // Ask now, so the rest timer can notify when the app is in the background.
      void ensureNotificationPermission();
    },
    [unit],
  );

  const copy = useCallback(
    (name: string, items: readonly RoutineSpecItem[]) => {
      saveRoutine(db, { id: null, name, notes: '', items });
      showAlert(t('templates.copied'), name);
    },
    [t],
  );

  return { start, copy };
}
