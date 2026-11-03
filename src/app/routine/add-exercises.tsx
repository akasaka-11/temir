import { router } from 'expo-router';

import { ExercisePicker } from '@/features/exercises/ExercisePicker';
import { useRoutineDraft } from '@/store/routineDraft';

export default function RoutineAddExercisesScreen() {
  return (
    <ExercisePicker
      onConfirm={(ids) => {
        useRoutineDraft.getState().addExercises(ids);
        router.back();
      }}
    />
  );
}
