import { ExercisePicker } from '@/features/exercises/ExercisePicker';
import { goBack } from '@/lib/navigation';
import { useRoutineDraft } from '@/store/routineDraft';

export default function RoutineAddExercisesScreen() {
  return (
    <ExercisePicker
      onConfirm={(picked) => {
        useRoutineDraft.getState().addExercises(picked);
        goBack();
      }}
    />
  );
}
