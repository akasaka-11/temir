import en from '@/locales/en.json';
import kk from '@/locales/kk.json';
import ru from '@/locales/ru.json';

import { EQUIPMENT, MUSCLE_GROUPS } from '../../schema';
import { buildSeedRows } from '../buildSeedRows';
import { BUILT_IN_EXERCISES } from '../exercises';

const locales = { en, kk, ru } as const;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('built-in exercises', () => {
  it('has around 60 exercises', () => {
    expect(BUILT_IN_EXERCISES.length).toBeGreaterThanOrEqual(60);
  });

  it('uses unique, valid UUIDs and unique keys', () => {
    const ids = BUILT_IN_EXERCISES.map((e) => e.id);
    const keys = BUILT_IN_EXERCISES.map((e) => e.nameKey);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(keys).size).toBe(keys.length);
    ids.forEach((id) => expect(id).toMatch(UUID));
  });

  it('covers every muscle group', () => {
    const used = new Set(BUILT_IN_EXERCISES.map((e) => e.muscleGroup));
    expect([...MUSCLE_GROUPS].filter((group) => !used.has(group))).toEqual([]);
  });

  it.each(Object.keys(locales) as (keyof typeof locales)[])('is fully translated in %s', (lang) => {
    const dict = locales[lang];
    const names: Record<string, string> = dict.exerciseNames;
    const groups: Record<string, string> = dict.muscleGroups;
    const equipment: Record<string, string> = dict.equipment;

    expect(BUILT_IN_EXERCISES.filter((e) => !names[e.nameKey]).map((e) => e.nameKey)).toEqual([]);
    expect(MUSCLE_GROUPS.filter((g) => !groups[g])).toEqual([]);
    expect(EQUIPMENT.filter((q) => !equipment[q])).toEqual([]);
    // No stale translations for exercises that were removed from the seed.
    const seedKeys = new Set(BUILT_IN_EXERCISES.map((e) => e.nameKey));
    expect(Object.keys(names).filter((key) => !seedKeys.has(key))).toEqual([]);
  });
});

describe('buildSeedRows', () => {
  it('maps built-ins to non-custom rows with timestamps', () => {
    const [row] = buildSeedRows(BUILT_IN_EXERCISES.slice(0, 1), 1_700_000_000_000);
    expect(row).toEqual({
      id: BUILT_IN_EXERCISES[0]!.id,
      nameKey: BUILT_IN_EXERCISES[0]!.nameKey,
      customName: null,
      muscleGroup: BUILT_IN_EXERCISES[0]!.muscleGroup,
      equipment: BUILT_IN_EXERCISES[0]!.equipment,
      kind: 'strength',
      isCustom: false,
      createdAt: 1_700_000_000_000,
      updatedAt: 1_700_000_000_000,
      deletedAt: null,
    });
  });
});
