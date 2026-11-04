import { and, asc, eq, inArray, isNull } from 'drizzle-orm';

import { newId } from '@/lib/id';
import { EMPTY_TARGET, type RoutineSpecItem, type TargetSet } from '@/lib/routineDraft';

import type { Database } from '../client';
import { exercises, type Routine, routineExercises, routines, routineSets } from '../schema';

/** Routines sorted by name. Pass to useLiveQuery. */
export function selectRoutines(db: Database) {
  return db.select().from(routines).where(isNull(routines.deletedAt)).orderBy(asc(routines.name));
}

/** Exercises with planned sets for each routine, in their saved order. */
export function getRoutineSpecs(db: Database, routineIds: readonly string[]): Map<string, RoutineSpecItem[]> {
  const result = new Map<string, RoutineSpecItem[]>();
  if (routineIds.length === 0) return result;

  const items = db
    .select({
      id: routineExercises.id,
      routineId: routineExercises.routineId,
      exerciseId: routineExercises.exerciseId,
      targetSets: routineExercises.targetSets,
      kind: exercises.kind,
    })
    .from(routineExercises)
    .innerJoin(exercises, eq(exercises.id, routineExercises.exerciseId))
    .where(and(inArray(routineExercises.routineId, [...routineIds]), isNull(routineExercises.deletedAt)))
    .orderBy(asc(routineExercises.position))
    .all();

  const sets = items.length
    ? db
        .select()
        .from(routineSets)
        .where(
          and(
            inArray(
              routineSets.routineExerciseId,
              items.map((i) => i.id),
            ),
            isNull(routineSets.deletedAt),
          ),
        )
        .orderBy(asc(routineSets.setIndex))
        .all()
    : [];

  for (const item of items) {
    const planned: TargetSet[] = sets
      .filter((s) => s.routineExerciseId === item.id)
      .map((s) => ({
        weightKg: s.weightKg,
        reps: s.reps,
        repsMax: s.repsMax,
        durationSeconds: s.durationSeconds,
        distanceM: s.distanceM,
      }));
    // Routines saved before per-set targets existed only have a set count.
    const filled = planned.length > 0 ? planned : Array.from({ length: item.targetSets }, () => EMPTY_TARGET);
    const list = result.get(item.routineId) ?? [];
    list.push({ exerciseId: item.exerciseId, kind: item.kind, sets: filled });
    result.set(item.routineId, list);
  }
  return result;
}

export function getRoutine(db: Database, id: string): Routine | undefined {
  return db
    .select()
    .from(routines)
    .where(and(eq(routines.id, id), isNull(routines.deletedAt)))
    .get();
}

export type RoutineInput = {
  /** null creates a new routine. */
  id: string | null;
  name: string;
  notes: string;
  items: readonly RoutineSpecItem[];
};

/**
 * Inserts or updates a routine. Old exercise/set rows are soft-deleted and replaced,
 * which keeps the history of changes visible to a future sync.
 */
export function saveRoutine(db: Database, input: RoutineInput): string {
  const now = Date.now();
  const id = input.id ?? newId();
  const name = input.name.trim();
  const notes = input.notes.trim() || null;

  db.transaction((tx) => {
    if (input.id) {
      tx.update(routines).set({ name, notes, updatedAt: now }).where(eq(routines.id, id)).run();
      softDeleteItems(tx, id, now);
    } else {
      tx.insert(routines).values({ id, name, notes, createdAt: now, updatedAt: now }).run();
    }
    input.items.forEach((item, position) => {
      const itemId = newId();
      tx.insert(routineExercises)
        .values({
          id: itemId,
          routineId: id,
          exerciseId: item.exerciseId,
          position,
          targetSets: item.sets.length,
          createdAt: now,
          updatedAt: now,
        })
        .run();
      if (item.sets.length > 0) {
        tx.insert(routineSets)
          .values(
            item.sets.map((set, setIndex) => ({
              id: newId(),
              routineExerciseId: itemId,
              setIndex,
              ...set,
              createdAt: now,
              updatedAt: now,
            })),
          )
          .run();
      }
    });
  });
  return id;
}

type Tx = Parameters<Parameters<Database['transaction']>[0]>[0];

function softDeleteItems(tx: Tx, routineId: string, now: number) {
  const old = tx
    .select({ id: routineExercises.id })
    .from(routineExercises)
    .where(and(eq(routineExercises.routineId, routineId), isNull(routineExercises.deletedAt)))
    .all()
    .map((r) => r.id);
  if (old.length === 0) return;
  tx.update(routineSets)
    .set({ deletedAt: now, updatedAt: now })
    .where(and(inArray(routineSets.routineExerciseId, old), isNull(routineSets.deletedAt)))
    .run();
  tx.update(routineExercises)
    .set({ deletedAt: now, updatedAt: now })
    .where(inArray(routineExercises.id, old))
    .run();
}

export function deleteRoutine(db: Database, id: string): void {
  const now = Date.now();
  db.transaction((tx) => {
    tx.update(routines).set({ deletedAt: now, updatedAt: now }).where(eq(routines.id, id)).run();
    softDeleteItems(tx, id, now);
  });
}
