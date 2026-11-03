import { randomUUID } from 'expo-crypto';

/** New UUID v4 for any row created on the device. */
export function newId(): string {
  return randomUUID();
}
