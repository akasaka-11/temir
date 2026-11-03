import { type SetResult, totalVolume } from './workoutMath';

export type HistorySetRow = SetResult & {
  workoutId: string;
  exerciseId: string;
  exercisePosition: number;
  setIndex: number;
};

export type ExerciseInWorkout = {
  exerciseId: string;
  sets: SetResult[];
};

export type WorkoutStats = {
  setCount: number;
  volumeKg: number;
  /** Exercises in the order they were done, each with its sets in order. */
  exercises: ExerciseInWorkout[];
};

/** Groups flat set rows by workout, then by exercise (keeping workout order). */
export function buildWorkoutStats(rows: readonly HistorySetRow[]): Map<string, WorkoutStats> {
  const sorted = [...rows].sort(
    (a, b) => a.exercisePosition - b.exercisePosition || a.setIndex - b.setIndex,
  );
  const result = new Map<string, WorkoutStats>();
  const lastPosition = new Map<string, number>();
  for (const row of sorted) {
    const stats = result.get(row.workoutId) ?? { setCount: 0, volumeKg: 0, exercises: [] };
    let exercise = stats.exercises[stats.exercises.length - 1];
    if (!exercise || lastPosition.get(row.workoutId) !== row.exercisePosition) {
      exercise = { exerciseId: row.exerciseId, sets: [] };
      stats.exercises.push(exercise);
      lastPosition.set(row.workoutId, row.exercisePosition);
    }
    exercise.sets.push({ weightKg: row.weightKg, reps: row.reps });
    stats.setCount += 1;
    stats.volumeKg += totalVolume([row]);
    result.set(row.workoutId, stats);
  }
  return result;
}

export type Section<T> = { key: string; title: string; data: T[] };

function capitalize(text: string, language: string): string {
  return text.charAt(0).toLocaleUpperCase(language) + text.slice(1);
}

/** Groups items (already sorted newest first) into month sections, e.g. "November 2026". */
export function groupByMonth<T>(
  items: readonly T[],
  getTime: (item: T) => number,
  language: string,
): Section<T>[] {
  const format = new Intl.DateTimeFormat(language, { month: 'long', year: 'numeric' });
  const sections: Section<T>[] = [];
  for (const item of items) {
    const date = new Date(getTime(item));
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    let section = sections[sections.length - 1];
    if (!section || section.key !== key) {
      section = { key, title: capitalize(format.format(date), language), data: [] };
      sections.push(section);
    }
    section.data.push(item);
  }
  return sections;
}

/** "Tue, 4 November" style date in the user's language. */
export function formatWorkoutDate(timestamp: number, language: string): string {
  const text = new Intl.DateTimeFormat(language, {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
  }).format(new Date(timestamp));
  return capitalize(text, language);
}

export function formatTime(timestamp: number, language: string): string {
  return new Intl.DateTimeFormat(language, { hour: '2-digit', minute: '2-digit' }).format(
    new Date(timestamp),
  );
}
