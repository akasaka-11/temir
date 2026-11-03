import { BUILT_IN_EXERCISES } from '@/db/seed/exercises';
import en from '@/locales/en.json';
import kk from '@/locales/kk.json';
import ru from '@/locales/ru.json';

import { BUILT_IN_TEMPLATES, findTemplate, PROGRAMS, SINGLE_WORKOUT_KEYS, templateToSpec } from '../builtInTemplates';

const exerciseKeys = new Set(BUILT_IN_EXERCISES.map((e) => e.nameKey));

describe('built-in templates', () => {
  it('only use existing built-in exercises', () => {
    const missing = BUILT_IN_TEMPLATES.flatMap((t) => t.exercises.map((e) => e.exercise)).filter(
      (key) => !exerciseKeys.has(key),
    );
    expect(missing).toEqual([]);
  });

  it('have unique keys and are referenced by lists and programs', () => {
    const keys = BUILT_IN_TEMPLATES.map((t) => t.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const key of [...SINGLE_WORKOUT_KEYS, ...PROGRAMS.flatMap((p) => p.days)]) {
      expect(findTemplate(key)).toBeDefined();
    }
  });

  it('include push/pull/legs, full body, cardio and day splits', () => {
    expect(PROGRAMS.find((p) => p.key === 'ppl')?.days).toEqual(['push', 'pull', 'legs']);
    for (const key of ['chest_day', 'back_day', 'leg_day', 'arm_day', 'full_body', 'cardio']) {
      expect(SINGLE_WORKOUT_KEYS).toContain(key);
    }
  });

  it.each([
    ['en', en],
    ['kk', kk],
    ['ru', ru],
  ])('are translated in %s', (_, dict) => {
    const workouts: Record<string, string> = dict.templates.workouts;
    const programs: Record<string, { name: string; description: string }> = dict.templates.programs;
    expect(BUILT_IN_TEMPLATES.filter((t) => !workouts[t.key]).map((t) => t.key)).toEqual([]);
    expect(PROGRAMS.filter((p) => !programs[p.key]?.name || !programs[p.key]?.description).map((p) => p.key)).toEqual(
      [],
    );
  });
});

describe('templateToSpec', () => {
  it('creates planned sets with target reps', () => {
    const spec = templateToSpec(findTemplate('chest_day')!);
    expect(spec[0]).toMatchObject({ kind: 'strength' });
    expect(spec[0]!.sets).toHaveLength(4);
    expect(spec[0]!.sets[0]).toEqual({ weightKg: null, reps: 8, durationSeconds: null, distanceM: null });
  });

  it('creates cardio sets with target minutes', () => {
    const spec = templateToSpec(findTemplate('cardio')!);
    expect(spec.every((item) => item.kind === 'cardio')).toBe(true);
    expect(spec[0]!.sets[0]!.durationSeconds).toBe(20 * 60);
  });

  it('does not share set objects between sets', () => {
    const spec = templateToSpec(findTemplate('push')!);
    expect(spec[0]!.sets[0]).not.toBe(spec[0]!.sets[1]);
  });
});
