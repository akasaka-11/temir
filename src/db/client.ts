import { drizzle } from 'drizzle-orm/expo-sqlite';
import { openDatabaseSync } from 'expo-sqlite';
import { Platform } from 'react-native';

import * as schema from './schema';

const DATABASE_NAME = 'strength-tracker.db';

// enableChangeListener lets useLiveQuery re-render screens when data changes.
const sqlite = openDatabaseSync(DATABASE_NAME, { enableChangeListener: true });
sqlite.execSync('PRAGMA foreign_keys = ON;');
// The web build stores SQLite in the browser's file system (OPFS), which can't create WAL files.
if (Platform.OS !== 'web') sqlite.execSync('PRAGMA journal_mode = WAL;');

export const db = drizzle(sqlite, { schema });
export type Database = typeof db;
