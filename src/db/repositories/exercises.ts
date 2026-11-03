import { count, isNull } from 'drizzle-orm';

import type { Database } from '../client';
import { exercises } from '../schema';

export function countExercises(db: Database): number {
  const [row] = db.select({ value: count() }).from(exercises).where(isNull(exercises.deletedAt)).all();
  return row?.value ?? 0;
}
