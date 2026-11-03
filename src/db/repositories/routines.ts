import { and, asc, eq, inArray, isNull } from 'drizzle-orm';

import { newId } from '@/lib/id';
import type { RoutineDraft, RoutineDraftItem } from '@/lib/routineDraft';

import type { Database } from '../client';
import { type Routine, routineExercises, routines } from '../schema';

/** Routines sorted by name. Pass to useLiveQuery. */
export function selectRoutines(db: Database) {
  return db.select().from(routines).where(isNull(routines.deletedAt)).orderBy(asc(routines.name));
}

export type RoutineItemRow = { routineId: string; exerciseId: string; targetSets: number };

/** Exercises of the given routines in their saved order. */
export function getRoutineItems(db: Database, routineIds: readonly string[]): RoutineItemRow[] {
  if (routineIds.length === 0) return [];
  return db
    .select({
      routineId: routineExercises.routineId,
      exerciseId: routineExercises.exerciseId,
      targetSets: routineExercises.targetSets,
    })
    .from(routineExercises)
    .where(and(inArray(routineExercises.routineId, [...routineIds]), isNull(routineExercises.deletedAt)))
    .orderBy(asc(routineExercises.position))
    .all();
}

export function getRoutine(db: Database, id: string): Routine | undefined {
  return db
    .select()
    .from(routines)
    .where(and(eq(routines.id, id), isNull(routines.deletedAt)))
    .get();
}

/** Loads a routine into an editable draft (item keys are fresh ids). */
export function loadRoutineDraft(db: Database, id: string): RoutineDraft | null {
  const routine = getRoutine(db, id);
  if (!routine) return null;
  const items: RoutineDraftItem[] = getRoutineItems(db, [id]).map((item) => ({
    key: newId(),
    exerciseId: item.exerciseId,
    targetSets: item.targetSets,
  }));
  return { id, name: routine.name, notes: routine.notes ?? '', items };
}

/**
 * Inserts or updates a routine. Old exercise rows are soft-deleted and replaced,
 * which keeps the history of changes visible to a future sync.
 */
export function saveRoutine(db: Database, draft: RoutineDraft): string {
  const now = Date.now();
  const id = draft.id ?? newId();
  const name = draft.name.trim();
  const notes = draft.notes.trim() || null;

  db.transaction((tx) => {
    if (draft.id) {
      tx.update(routines).set({ name, notes, updatedAt: now }).where(eq(routines.id, id)).run();
      tx.update(routineExercises)
        .set({ deletedAt: now, updatedAt: now })
        .where(and(eq(routineExercises.routineId, id), isNull(routineExercises.deletedAt)))
        .run();
    } else {
      tx.insert(routines).values({ id, name, notes, createdAt: now, updatedAt: now }).run();
    }
    if (draft.items.length > 0) {
      tx.insert(routineExercises)
        .values(
          draft.items.map((item, position) => ({
            id: newId(),
            routineId: id,
            exerciseId: item.exerciseId,
            position,
            targetSets: item.targetSets,
            createdAt: now,
            updatedAt: now,
          })),
        )
        .run();
    }
  });
  return id;
}

export function deleteRoutine(db: Database, id: string): void {
  const now = Date.now();
  db.transaction((tx) => {
    tx.update(routines).set({ deletedAt: now, updatedAt: now }).where(eq(routines.id, id)).run();
    tx.update(routineExercises)
      .set({ deletedAt: now, updatedAt: now })
      .where(and(eq(routineExercises.routineId, id), isNull(routineExercises.deletedAt)))
      .run();
  });
}
