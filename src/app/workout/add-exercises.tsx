import { ExercisePicker } from '@/features/exercises/ExercisePicker';
import { goBack } from '@/lib/navigation';
import { useActiveWorkout } from '@/store/activeWorkout';

export default function AddExercisesScreen() {
  return (
    <ExercisePicker
      onConfirm={(picked) => {
        useActiveWorkout.getState().addExercises(picked);
        goBack();
      }}
    />
  );
}
