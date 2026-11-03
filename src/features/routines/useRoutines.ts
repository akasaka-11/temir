import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useMemo } from 'react';

import { db } from '@/db/client';
import { getRoutineItems, type RoutineItemRow, selectRoutines } from '@/db/repositories/routines';
import type { Routine } from '@/db/schema';

export type RoutineWithItems = { routine: Routine; items: RoutineItemRow[] };

/** Live list of routines with their exercises (re-read when routines change). */
export function useRoutines(): RoutineWithItems[] {
  const { data } = useLiveQuery(selectRoutines(db));

  return useMemo(() => {
    const items = getRoutineItems(db, data.map((r) => r.id));
    return data.map((routine) => ({
      routine,
      items: items.filter((item) => item.routineId === routine.id),
    }));
  }, [data]);
}
