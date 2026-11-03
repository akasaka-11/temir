import { router } from 'expo-router';

import { ExercisePicker } from '@/features/exercises/ExercisePicker';
import { useActiveWorkout } from '@/store/activeWorkout';

export default function AddExercisesScreen() {
  return (
    <ExercisePicker
      onConfirm={(ids) => {
        useActiveWorkout.getState().addExercises(ids);
        router.back();
      }}
    />
  );
}
