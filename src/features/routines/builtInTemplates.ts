import { BUILT_IN_EXERCISES } from '@/db/seed/exercises';
import { EMPTY_TARGET, type RoutineSpecItem, type TargetSet } from '@/lib/routineDraft';

// Ready-made workouts and programs (written for this app, names come from locales:
// "templates.workouts.<key>" and "templates.programs.<key>.*"). They live in code, not in the DB:
// users start them directly or copy one to "My templates" to customize it.

type TemplateExercise = {
  /** nameKey of a built-in exercise. */
  exercise: string;
  sets: number;
  reps?: number;
  /** Cardio: planned minutes for the (single) set. */
  minutes?: number;
};

export type BuiltInTemplate = { key: string; exercises: readonly TemplateExercise[] };

const t = (key: string, exercises: TemplateExercise[]): BuiltInTemplate => ({ key, exercises });
const s = (exercise: string, sets: number, reps: number): TemplateExercise => ({ exercise, sets, reps });
const cardio = (exercise: string, minutes: number): TemplateExercise => ({ exercise, sets: 1, minutes });

export const BUILT_IN_TEMPLATES: readonly BuiltInTemplate[] = [
  t('chest_day', [
    s('bench_press', 4, 8),
    s('incline_dumbbell_press', 3, 10),
    s('chest_press_machine', 3, 10),
    s('cable_crossover', 3, 12),
    s('chest_dip', 3, 10),
  ]),
  t('back_day', [
    s('deadlift', 3, 5),
    s('pull_up', 3, 8),
    s('barbell_row', 4, 8),
    s('lat_pulldown', 3, 10),
    s('seated_cable_row', 3, 10),
    s('face_pull', 3, 15),
  ]),
  t('leg_day', [
    s('squat', 4, 6),
    s('romanian_deadlift', 3, 8),
    s('leg_press', 3, 10),
    s('leg_curl', 3, 12),
    s('leg_extension', 3, 12),
    s('standing_calf_raise', 4, 12),
  ]),
  t('shoulder_day', [
    s('overhead_press', 4, 6),
    s('arnold_press', 3, 10),
    s('lateral_raise', 4, 12),
    s('rear_delt_fly', 3, 15),
    s('shrug', 3, 12),
  ]),
  t('arm_day', [
    s('barbell_curl', 3, 10),
    s('close_grip_bench_press', 3, 8),
    s('hammer_curl', 3, 12),
    s('triceps_pushdown', 3, 12),
    s('preacher_curl', 3, 10),
    s('overhead_triceps_extension', 3, 12),
  ]),
  t('full_body', [
    s('squat', 3, 8),
    s('bench_press', 3, 8),
    s('barbell_row', 3, 8),
    s('overhead_press', 3, 10),
    s('romanian_deadlift', 3, 10),
    s('hanging_leg_raise', 3, 12),
  ]),
  t('cardio', [cardio('treadmill_run', 20), cardio('stationary_bike', 15), cardio('rowing_machine', 10)]),
  t('push', [
    s('bench_press', 4, 8),
    s('overhead_press', 3, 8),
    s('incline_dumbbell_press', 3, 10),
    s('lateral_raise', 3, 15),
    s('triceps_pushdown', 3, 12),
    s('overhead_triceps_extension', 3, 12),
  ]),
  t('pull', [
    s('deadlift', 3, 5),
    s('pull_up', 3, 8),
    s('barbell_row', 3, 8),
    s('face_pull', 3, 15),
    s('barbell_curl', 3, 10),
    s('hammer_curl', 3, 12),
  ]),
  t('legs', [
    s('squat', 4, 6),
    s('romanian_deadlift', 3, 8),
    s('leg_press', 3, 10),
    s('leg_curl', 3, 12),
    s('standing_calf_raise', 4, 12),
    s('hanging_leg_raise', 3, 12),
  ]),
  t('upper', [
    s('bench_press', 4, 6),
    s('barbell_row', 4, 8),
    s('overhead_press', 3, 8),
    s('lat_pulldown', 3, 10),
    s('dumbbell_curl', 3, 12),
    s('triceps_pushdown', 3, 12),
  ]),
  t('lower', [
    s('squat', 4, 6),
    s('romanian_deadlift', 3, 8),
    s('bulgarian_split_squat', 3, 10),
    s('leg_curl', 3, 12),
    s('seated_calf_raise', 4, 15),
    s('cable_crunch', 3, 15),
  ]),
];

/** One-day workouts shown in "Ready-made workouts". */
export const SINGLE_WORKOUT_KEYS = [
  'chest_day',
  'back_day',
  'leg_day',
  'shoulder_day',
  'arm_day',
  'full_body',
  'cardio',
] as const;

/** Multi-day programs: each day is a template above. */
export const PROGRAMS: readonly { key: string; days: readonly string[] }[] = [
  { key: 'ppl', days: ['push', 'pull', 'legs'] },
  { key: 'upper_lower', days: ['upper', 'lower'] },
  { key: 'bro_split', days: ['chest_day', 'back_day', 'shoulder_day', 'leg_day', 'arm_day'] },
];

const exercisesByKey = new Map(BUILT_IN_EXERCISES.map((e) => [e.nameKey, e]));

export function findTemplate(key: string): BuiltInTemplate | undefined {
  return BUILT_IN_TEMPLATES.find((template) => template.key === key);
}

/** Template -> routine items with planned sets (reps or minutes as targets, no weights). */
export function templateToSpec(template: BuiltInTemplate): RoutineSpecItem[] {
  return template.exercises.flatMap(({ exercise, sets, reps, minutes }) => {
    const found = exercisesByKey.get(exercise);
    if (!found) return [];
    const target: TargetSet = {
      ...EMPTY_TARGET,
      reps: reps ?? null,
      durationSeconds: minutes ? minutes * 60 : null,
    };
    return [
      {
        exerciseId: found.id,
        kind: found.kind ?? 'strength',
        sets: Array.from({ length: sets }, () => ({ ...target })),
      },
    ];
  });
}
