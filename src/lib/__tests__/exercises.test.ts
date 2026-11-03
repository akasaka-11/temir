import type { MuscleGroup } from '@/db/schema';

import { filterAndSortExercises, getExerciseName, validateExerciseName } from '../exercises';

const names = { bench_press: 'Жим штанги лёжа', squat: 'Приседания со штангой', ab_wheel: 'Ролик' };

type Row = {
  id: string;
  isCustom: boolean;
  customName: string | null;
  nameKey: string | null;
  muscleGroup: MuscleGroup;
};

const rows: Row[] = [
  { id: '1', isCustom: false, customName: null, nameKey: 'squat', muscleGroup: 'quads' },
  { id: '2', isCustom: false, customName: null, nameKey: 'bench_press', muscleGroup: 'chest' },
  { id: '3', isCustom: true, customName: 'Ёлочка', nameKey: null, muscleGroup: 'chest' },
];

describe('getExerciseName', () => {
  it('uses the translation for built-ins', () => {
    expect(getExerciseName(rows[1]!, names)).toBe('Жим штанги лёжа');
  });

  it('uses the custom name for custom exercises', () => {
    expect(getExerciseName(rows[2]!, names)).toBe('Ёлочка');
  });

  it('falls back to the key when a translation is missing', () => {
    expect(getExerciseName({ isCustom: false, customName: null, nameKey: 'unknown' }, names)).toBe('unknown');
  });
});

describe('filterAndSortExercises', () => {
  const all = { query: '', muscleGroup: null };

  it('sorts by localized name', () => {
    const result = filterAndSortExercises(rows, all, names, 'ru');
    expect(result.map((r) => r.displayName)).toEqual(['Ёлочка', 'Жим штанги лёжа', 'Приседания со штангой']);
  });

  it('filters by muscle group', () => {
    const result = filterAndSortExercises(rows, { query: '', muscleGroup: 'quads' }, names, 'ru');
    expect(result.map((r) => r.id)).toEqual(['1']);
  });

  it('searches in the translated name', () => {
    const result = filterAndSortExercises(rows, { query: 'жим', muscleGroup: null }, names, 'ru');
    expect(result.map((r) => r.id)).toEqual(['2']);
  });

  it('combines search and filter', () => {
    const result = filterAndSortExercises(rows, { query: 'елоч', muscleGroup: 'chest' }, names, 'ru');
    expect(result.map((r) => r.id)).toEqual(['3']);
  });
});

describe('validateExerciseName', () => {
  it('trims and collapses spaces', () => {
    expect(validateExerciseName('  Pull   over ')).toEqual({ ok: true, name: 'Pull over' });
  });

  it('rejects empty names', () => {
    expect(validateExerciseName('   ')).toEqual({ ok: false, error: 'required' });
  });

  it('rejects too long names', () => {
    expect(validateExerciseName('x'.repeat(61))).toEqual({ ok: false, error: 'tooLong' });
  });
});
