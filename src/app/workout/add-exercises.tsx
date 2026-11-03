import { router } from 'expo-router';

import { ExercisePicker } from '@/features/exercises/ExercisePicker';
import { useActiveWorkout } from '@/store/activeWorkout';

export default function AddExercisesScreen() {
  return (
    <ExercisePicker
      onConfirm={(picked) => {
        useActiveWorkout.getState().addExercises(picked);
        router.back();
      }}
    />
  );
}
