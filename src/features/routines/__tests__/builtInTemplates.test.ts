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

  it('have unique keys, valid rep ranges and are all used', () => {
    const keys = BUILT_IN_TEMPLATES.map((t) => t.key);
    expect(new Set(keys).size).toBe(keys.length);
    const used = new Set<string>([...SINGLE_WORKOUT_KEYS, ...PROGRAMS.flatMap((p) => p.days.map((d) => d.template))]);
    expect([...used].filter((key) => !findTemplate(key))).toEqual([]);
    expect(keys.filter((key) => !used.has(key))).toEqual([]);
    for (const template of BUILT_IN_TEMPLATES) {
      for (const e of template.exercises) {
        expect(e.sets).toBeGreaterThan(0);
        if (e.repsMin !== undefined) expect(e.repsMax!).toBeGreaterThanOrEqual(e.repsMin);
      }
    }
  });

  it('match the planned programs', () => {
    const byKey = Object.fromEntries(PROGRAMS.map((p) => [p.key, p]));
    expect(byKey.ppl!.days.map((d) => d.template)).toEqual(['push_a', 'pull_a', 'legs_a', 'push_b', 'pull_b', 'legs_b']);
    expect(byKey.ppl!.days.map((d) => d.weekdays[0])).toEqual([1, 2, 3, 4, 5, 6]);
    expect(byKey.upper_lower!.days.filter((d) => !d.optional).map((d) => d.weekdays[0])).toEqual([1, 2, 4, 5]);
    expect(byKey.bro_split!.daysPerWeek).toBe(5);
    expect(byKey.full_body_cardio!.days[0]!.weekdays).toEqual([1, 3, 5]);
    // Day sizes from the plan: Push A has 6 exercises, Upper B 8, Full Body 8.
    expect(findTemplate('push_a')!.exercises).toHaveLength(6);
    expect(findTemplate('upper_b')!.exercises).toHaveLength(8);
    expect(findTemplate('full_body')!.exercises).toHaveLength(8);
  });

  it('weekdays are 1..7 and match daysPerWeek (without optional days)', () => {
    for (const program of PROGRAMS) {
      const trainingDays = new Set(program.days.filter((d) => !d.optional).flatMap((d) => d.weekdays));
      expect(trainingDays.size).toBe(program.daysPerWeek);
      for (const day of trainingDays) expect(day >= 1 && day <= 7).toBe(true);
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
    // No stale translations of removed templates.
    const keys = new Set(BUILT_IN_TEMPLATES.map((t) => t.key));
    expect(Object.keys(workouts).filter((k) => !keys.has(k))).toEqual([]);
  });
});

describe('templateToSpec', () => {
  it('creates planned sets with reps ranges', () => {
    const spec = templateToSpec(findTemplate('push_a')!);
    expect(spec[0]).toMatchObject({ kind: 'strength' });
    expect(spec[0]!.sets).toHaveLength(3);
    expect(spec[0]!.sets[0]).toEqual({ weightKg: null, reps: 6, repsMax: 8, durationSeconds: null, distanceM: null });
  });

  it('creates cardio sets with target minutes', () => {
    const spec = templateToSpec(findTemplate('cardio')!);
    expect(spec.every((item) => item.kind === 'cardio')).toBe(true);
    expect(spec[0]!.sets[0]!.durationSeconds).toBe(15 * 60);
  });

  it('does not share set objects between sets', () => {
    const spec = templateToSpec(findTemplate('legs_a')!);
    expect(spec[0]!.sets[0]).not.toBe(spec[0]!.sets[1]);
  });
});
