import { sql } from 'drizzle-orm';
import Storage from 'expo-sqlite/kv-store';

import type { Database } from '../client';
import { exercises } from '../schema';
import { buildSeedRows } from './buildSeedRows';
import { BUILT_IN_EXERCISES, EXERCISE_SEED_VERSION } from './exercises';

const SEED_VERSION_KEY = 'db.exerciseSeedVersion';

/**
 * Inserts or refreshes built-in exercises when the seed list changed.
 * Safe to call on every app start: it does nothing if the data is up to date.
 */
export function seedDatabase(db: Database): void {
  const applied = Number(Storage.getItemSync(SEED_VERSION_KEY) ?? 0);
  if (applied >= EXERCISE_SEED_VERSION) return;

  const rows = buildSeedRows(BUILT_IN_EXERCISES, Date.now());
  db.transaction((tx) => {
    tx.insert(exercises)
      .values(rows)
      .onConflictDoUpdate({
        target: exercises.id,
        set: {
          nameKey: sql`excluded.name_key`,
          muscleGroup: sql`excluded.muscle_group`,
          equipment: sql`excluded.equipment`,
          updatedAt: sql`excluded.updated_at`,
        },
      })
      .run();
  });

  Storage.setItemSync(SEED_VERSION_KEY, String(EXERCISE_SEED_VERSION));
}
