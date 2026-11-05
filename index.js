// App entry. On native it is just expo-router's entry.
// On web, expo-sqlite runs SQLite (WebAssembly) in a worker, and synchronous calls give up if the
// worker is still loading. The app opens its databases synchronously at startup (DB client,
// kv-store for settings), so on web we first load the worker by opening and closing an in-memory
// database asynchronously, then start the app. (Not a file: the web file system holds only 6
// SQLite files, and each database file allows only one open connection.)
import { Platform } from 'react-native';

if (Platform.OS === 'web') {
  const { openDatabaseAsync } = require('expo-sqlite');
  openDatabaseAsync(':memory:')
    .then((db) => db.closeAsync())
    .catch((error) => console.error('Failed to load SQLite', error))
    .finally(() => require('expo-router/entry'));
} else {
  require('expo-router/entry');
}
