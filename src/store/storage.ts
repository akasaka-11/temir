import Storage from 'expo-sqlite/kv-store';
import { createJSONStorage } from 'zustand/middleware';

// Synchronous storage: stores are restored before the first render (no flash of empty state).
export const persistStorage = createJSONStorage(() => ({
  getItem: (name: string) => Storage.getItemSync(name),
  setItem: (name: string, value: string) => Storage.setItemSync(name, value),
  removeItem: (name: string) => {
    Storage.removeItemSync(name);
  },
}));
