// App entry. On native it is just expo-router's entry.
//
// On web, expo-sqlite runs SQLite (WebAssembly) in a worker that keeps its database files in the
// browser's file system (OPFS, folder "expo-sqlite"). Two things must happen before the app starts:
// 1. After a page reload the previous page's worker may still hold the files for a moment. If the new
//    worker tries to open them then, it fails for good (black screen). So we first wait until the
//    files can be opened.
// 2. The app opens its databases synchronously at startup (DB client, kv-store for settings), and
//    synchronous calls give up if the worker is still loading. So we load the worker by opening and
//    closing an in-memory database asynchronously. (Not a file: the web file system holds only 6
//    SQLite files, and each database file allows only one open connection.)
import { Platform } from 'react-native';

// Runs in a throwaway worker: tries to open (and close) every database file.
const PROBE_WORKER = `
onmessage = async () => {
  try {
    const root = await navigator.storage.getDirectory();
    let dir;
    try {
      dir = await root.getDirectoryHandle('expo-sqlite');
    } catch {
      postMessage(true); // first launch: no files yet
      return;
    }
    for await (const [, handle] of dir.entries()) {
      if (handle.kind !== 'file') continue;
      const access = await handle.createSyncAccessHandle();
      access.close();
    }
    postMessage(true);
  } catch {
    postMessage(false);
  }
};
`;

async function waitForDatabaseFiles() {
  if (typeof navigator === 'undefined' || !navigator.storage?.getDirectory) return;
  const url = URL.createObjectURL(new Blob([PROBE_WORKER], { type: 'text/javascript' }));
  try {
    for (let attempt = 0; attempt < 50; attempt++) {
      const worker = new Worker(url);
      const free = await new Promise((resolve) => {
        worker.onmessage = (event) => resolve(event.data === true);
        worker.onerror = () => resolve(true); // can't check: don't block the app
        worker.postMessage(null);
      });
      worker.terminate();
      if (free) return;
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  } finally {
    URL.revokeObjectURL(url);
  }
}

if (Platform.OS === 'web') {
  waitForDatabaseFiles()
    .then(() => require('expo-sqlite').openDatabaseAsync(':memory:'))
    .then((db) => db.closeAsync())
    .catch((error) => console.error('Failed to load SQLite', error))
    .finally(() => require('expo-router/entry'));
} else {
  require('expo-router/entry');
}
