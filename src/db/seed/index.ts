import { sql } from 'drizzle-orm';

import type { Database } from '../client';
import { exercises } from '../schema';
import { buildSeedRows } from './buildSeedRows';
import { BUILT_IN_EXERCISES, EXERCISE_SEED_VERSION } from './exercises';

// The applied seed version is kept inside the main database (SQLite user_version,
// unused by Drizzle), so it can never disagree with the data it describes.
function getAppliedSeedVersion(db: Database): number {
  return db.$client.getFirstSync<{ user_version: number }>('PRAGMA user_version')?.user_version ?? 0;
}

/**
 * Inserts or refreshes built-in exercises when the seed list changed.
 * Safe to call on every app start: it does nothing if the data is up to date.
 */
export function seedDatabase(db: Database): void {
  if (getAppliedSeedVersion(db) >= EXERCISE_SEED_VERSION) return;

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

  db.$client.execSync(`PRAGMA user_version = ${EXERCISE_SEED_VERSION}`);
}
