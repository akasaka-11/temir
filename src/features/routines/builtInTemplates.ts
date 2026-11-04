import { BUILT_IN_EXERCISES } from '@/db/seed/exercises';
import { EMPTY_TARGET, type RoutineSpecItem, type TargetSet } from '@/lib/routineDraft';

// Ready-made workouts and programs. Names and descriptions come from locales
// ("templates.workouts.<key>", "templates.programs.<key>.*"). They live in code, not in the DB:
// users start them directly or copy one to "My templates" to customize it.

type TemplateExercise = {
  /** nameKey of a built-in exercise. */
  exercise: string;
  sets: number;
  repsMin?: number;
  repsMax?: number;
  /** Cardio: planned minutes for the (single) set. */
  minutes?: number;
};

export type BuiltInTemplate = { key: string; exercises: readonly TemplateExercise[] };

const t = (key: string, exercises: TemplateExercise[]): BuiltInTemplate => ({ key, exercises });
/** sets × repsMin–repsMax */
const s = (exercise: string, sets: number, repsMin: number, repsMax: number): TemplateExercise => ({
  exercise,
  sets,
  repsMin,
  repsMax,
});
const cardio = (exercise: string, minutes: number): TemplateExercise => ({ exercise, sets: 1, minutes });

// Shared blocks (same exercise, sets and reps in several days).
const lateralRaise = (sets: number) => s('lateral_raise', sets, 12, 20);
const pushdown = (sets: number) => s('triceps_pushdown', sets, 10, 15);
const overheadExtension = (sets: number) => s('overhead_triceps_extension', sets, 10, 15);
const calves = s('standing_calf_raise', 3, 12, 20);
const rearDelts = (sets: number) => s('reverse_pec_deck', sets, 12, 20);

export const BUILT_IN_TEMPLATES: readonly BuiltInTemplate[] = [
  // Push / Pull / Legs
  t('push_a', [
    s('bench_press', 3, 6, 8),
    s('incline_dumbbell_press', 2, 8, 12),
    s('dumbbell_shoulder_press', 2, 8, 10),
    lateralRaise(3),
    pushdown(2),
    overheadExtension(2),
  ]),
  t('push_b', [
    s('chest_press_machine', 3, 6, 8),
    s('incline_machine_press', 2, 8, 12),
    s('dumbbell_shoulder_press', 2, 8, 10),
    lateralRaise(3),
    pushdown(2),
    overheadExtension(2),
  ]),
  t('pull_a', [
    s('lat_pulldown', 3, 8, 12),
    s('chest_supported_row', 3, 8, 12),
    s('seated_cable_row', 2, 10, 12),
    rearDelts(2),
    s('ez_bar_curl', 2, 8, 12),
    s('hammer_curl', 2, 10, 15),
  ]),
  t('pull_b', [
    s('pull_up', 3, 8, 12),
    s('chest_supported_row', 3, 8, 12),
    s('seated_cable_row', 2, 10, 12),
    rearDelts(2),
    s('preacher_curl', 2, 8, 12),
    s('hammer_curl', 2, 10, 15),
  ]),
  t('legs_a', [
    s('squat', 3, 6, 10),
    s('romanian_deadlift', 3, 8, 10),
    s('leg_extension', 2, 10, 15),
    s('leg_curl', 3, 10, 15),
    calves,
    s('cable_crunch', 2, 12, 20),
  ]),
  t('legs_b', [
    s('hack_squat', 3, 6, 10),
    s('hip_thrust', 3, 8, 10),
    s('leg_extension', 2, 10, 15),
    s('leg_curl', 3, 10, 15),
    calves,
    s('cable_crunch', 2, 12, 20),
  ]),

  // Upper / Lower
  t('upper_a', [
    s('bench_press', 3, 6, 8),
    s('chest_supported_row', 3, 8, 12),
    s('incline_dumbbell_press', 2, 8, 12),
    s('lat_pulldown', 2, 10, 12),
    lateralRaise(2),
    s('dumbbell_curl', 2, 10, 15),
    pushdown(2),
  ]),
  t('lower_a', [
    s('squat', 3, 6, 10),
    s('romanian_deadlift', 3, 8, 10),
    s('leg_extension', 2, 10, 15),
    s('leg_curl', 2, 10, 15),
    calves,
    s('hanging_leg_raise', 2, 12, 15),
  ]),
  t('upper_b', [
    s('dumbbell_shoulder_press', 3, 6, 10),
    s('lat_pulldown', 3, 8, 12),
    s('seated_cable_row', 3, 8, 12),
    s('chest_press_machine', 2, 10, 12),
    lateralRaise(2),
    rearDelts(2),
    s('dumbbell_curl', 2, 10, 15),
    overheadExtension(2),
  ]),
  t('lower_b', [
    s('hack_squat', 3, 8, 12),
    s('hip_thrust', 3, 8, 12),
    s('seated_leg_curl', 3, 10, 15),
    s('leg_extension', 2, 10, 15),
    calves,
    s('cable_crunch', 2, 12, 20),
  ]),

  // Classic body-part split
  t('chest_day', [
    s('bench_press', 3, 6, 8),
    s('incline_dumbbell_press', 3, 8, 12),
    s('chest_press_machine', 2, 10, 12),
    s('cable_crossover', 2, 12, 15),
    s('pec_deck', 2, 12, 15),
  ]),
  t('back_day', [
    s('lat_pulldown', 3, 8, 12),
    s('barbell_row', 3, 8, 10),
    s('seated_cable_row', 2, 10, 12),
    s('straight_arm_pulldown', 2, 12, 15),
    s('back_extension', 2, 12, 15),
  ]),
  t('leg_day', [
    s('squat', 3, 6, 10),
    s('romanian_deadlift', 3, 8, 10),
    s('leg_extension', 2, 10, 15),
    s('seated_leg_curl', 3, 10, 15),
    calves,
  ]),
  t('shoulder_day', [
    s('dumbbell_shoulder_press', 3, 6, 10),
    lateralRaise(3),
    s('cable_lateral_raise', 2, 12, 15),
    rearDelts(3),
    s('face_pull', 2, 12, 15),
  ]),
  t('arm_day', [
    s('ez_bar_curl', 3, 8, 12),
    s('incline_dumbbell_curl', 2, 10, 12),
    s('hammer_curl', 2, 10, 15),
    pushdown(3),
    overheadExtension(3),
    s('close_grip_bench_press', 2, 8, 10),
  ]),

  // Full body + cardio
  t('full_body', [
    s('leg_press', 2, 8, 12),
    s('bench_press', 2, 6, 10),
    s('lat_pulldown', 2, 8, 12),
    s('romanian_deadlift', 2, 8, 10),
    s('seated_cable_row', 2, 10, 12),
    lateralRaise(2),
    s('dumbbell_curl', 2, 10, 15),
    pushdown(2),
  ]),
  // Alternatives: pick one machine for 20–30 minutes at a moderate pace.
  t('cardio', [cardio('incline_walk', 15), cardio('stationary_bike', 10), cardio('elliptical', 10)]),
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

/** Weekdays: 1 = Monday … 7 = Sunday. */
export type ProgramDay = { template: string; weekdays: readonly number[]; optional?: boolean };

export type Program = {
  key: string;
  daysPerWeek: number;
  /** How many times a week each muscle is trained directly. */
  timesPerMuscle: number;
  days: readonly ProgramDay[];
};

export const PROGRAMS: readonly Program[] = [
  {
    key: 'ppl',
    daysPerWeek: 6,
    timesPerMuscle: 2,
    days: [
      { template: 'push_a', weekdays: [1] },
      { template: 'pull_a', weekdays: [2] },
      { template: 'legs_a', weekdays: [3] },
      { template: 'push_b', weekdays: [4] },
      { template: 'pull_b', weekdays: [5] },
      { template: 'legs_b', weekdays: [6] },
    ],
  },
  {
    key: 'upper_lower',
    daysPerWeek: 4,
    timesPerMuscle: 2,
    days: [
      { template: 'upper_a', weekdays: [1] },
      { template: 'lower_a', weekdays: [2] },
      { template: 'upper_b', weekdays: [4] },
      { template: 'lower_b', weekdays: [5] },
      { template: 'cardio', weekdays: [6], optional: true },
    ],
  },
  {
    key: 'bro_split',
    daysPerWeek: 5,
    timesPerMuscle: 1,
    days: [
      { template: 'chest_day', weekdays: [1] },
      { template: 'back_day', weekdays: [2] },
      { template: 'leg_day', weekdays: [3] },
      { template: 'shoulder_day', weekdays: [4] },
      { template: 'arm_day', weekdays: [5] },
      { template: 'cardio', weekdays: [6], optional: true },
    ],
  },
  {
    key: 'full_body_cardio',
    daysPerWeek: 3,
    timesPerMuscle: 3,
    days: [
      { template: 'full_body', weekdays: [1, 3, 5] },
      { template: 'cardio', weekdays: [1, 3, 5], optional: true },
    ],
  },
];

const exercisesByKey = new Map(BUILT_IN_EXERCISES.map((e) => [e.nameKey, e]));

export function findTemplate(key: string): BuiltInTemplate | undefined {
  return BUILT_IN_TEMPLATES.find((template) => template.key === key);
}

/** Template -> routine items with planned sets (reps ranges or minutes as targets, no weights). */
export function templateToSpec(template: BuiltInTemplate): RoutineSpecItem[] {
  return template.exercises.flatMap(({ exercise, sets, repsMin, repsMax, minutes }) => {
    const found = exercisesByKey.get(exercise);
    if (!found) return [];
    const target: TargetSet = {
      ...EMPTY_TARGET,
      reps: repsMin ?? null,
      repsMax: repsMax !== undefined && repsMax !== repsMin ? repsMax : null,
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
