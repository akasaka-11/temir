import { ActiveWorkoutView } from '@/features/workout/ActiveWorkoutView';
import { StartWorkoutView } from '@/features/workout/StartWorkoutView';
import { useActiveWorkout } from '@/store/activeWorkout';

export default function WorkoutScreen() {
  const workout = useActiveWorkout((state) => state.workout);
  return workout ? <ActiveWorkoutView workout={workout} /> : <StartWorkoutView />;
}
