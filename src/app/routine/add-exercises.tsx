import { router } from 'expo-router';

import { ExercisePicker } from '@/features/exercises/ExercisePicker';
import { useRoutineDraft } from '@/store/routineDraft';

export default function RoutineAddExercisesScreen() {
  return (
    <ExercisePicker
      onConfirm={(picked) => {
        useRoutineDraft.getState().addExercises(picked);
        router.back();
      }}
    />
  );
}
