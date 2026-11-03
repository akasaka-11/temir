import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { WeightUnit } from '@/lib/units';

import { persistStorage } from './storage';

// The settings UI comes in stage 8; defaults are used until then.
type SettingsState = {
  unit: WeightUnit;
  restSeconds: number;
  setUnit: (unit: WeightUnit) => void;
  setRestSeconds: (seconds: number) => void;
};

export const useSettings = create<SettingsState>()(
  persist(
    (set) => ({
      unit: 'kg',
      restSeconds: 90,
      setUnit: (unit) => set({ unit }),
      setRestSeconds: (restSeconds) => set({ restSeconds }),
    }),
    { name: 'settings', storage: persistStorage },
  ),
);
