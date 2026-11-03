import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useMemo } from 'react';

import { db } from '@/db/client';
import { getRoutineSpecs, selectRoutines } from '@/db/repositories/routines';
import type { Routine } from '@/db/schema';
import type { RoutineSpecItem } from '@/lib/routineDraft';

export type RoutineWithItems = { routine: Routine; items: RoutineSpecItem[] };

/** Live list of the user's routines with their planned exercises. */
export function useRoutines(): RoutineWithItems[] {
  const { data } = useLiveQuery(selectRoutines(db));

  return useMemo(() => {
    const specs = getRoutineSpecs(db, data.map((r) => r.id));
    return data.map((routine) => ({ routine, items: specs.get(routine.id) ?? [] }));
  }, [data]);
}
