import type { Equipment, MuscleGroup } from '../schema';

export type BuiltInExercise = {
  id: string;
  nameKey: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
};

// Bump when this list changes so existing installs pick up the new rows.
export const EXERCISE_SEED_VERSION = 1;

// Built-in exercises. Names live in locales under "exerciseNames.<nameKey>".
// Ids are fixed (never change them): the same exercise must have the same id on every device.
export const BUILT_IN_EXERCISES: readonly BuiltInExercise[] = [
  { id: 'c3b61de3-3b71-5bc4-b6a7-c711da93c64e', nameKey: 'bench_press', muscleGroup: 'chest', equipment: 'barbell' },
  { id: '8cc68f22-56e9-52bc-9e03-b332bb3a6ee8', nameKey: 'incline_bench_press', muscleGroup: 'chest', equipment: 'barbell' },
  { id: '3bbe8799-013c-5058-919b-0d2a03e37197', nameKey: 'decline_bench_press', muscleGroup: 'chest', equipment: 'barbell' },
  { id: '78623343-1acf-5b9e-bef4-4df94655ed27', nameKey: 'dumbbell_bench_press', muscleGroup: 'chest', equipment: 'dumbbell' },
  { id: '32de9bd3-c2fb-5268-801f-b97b23525dea', nameKey: 'incline_dumbbell_press', muscleGroup: 'chest', equipment: 'dumbbell' },
  { id: '8f1dfb60-8cbe-5c26-b618-e1004c9ce14f', nameKey: 'dumbbell_fly', muscleGroup: 'chest', equipment: 'dumbbell' },
  { id: '539462a8-fcb2-52e7-a75b-bfb69704b65c', nameKey: 'cable_crossover', muscleGroup: 'chest', equipment: 'cable' },
  { id: '94fb7ab7-82ac-5ebb-aa00-fd7745898a40', nameKey: 'chest_press_machine', muscleGroup: 'chest', equipment: 'machine' },
  { id: '136a1f04-40a9-5ae8-aea1-6de4f70d2f64', nameKey: 'push_up', muscleGroup: 'chest', equipment: 'bodyweight' },
  { id: 'eb7848a3-130e-5ba8-ac66-536b0fa9904e', nameKey: 'chest_dip', muscleGroup: 'chest', equipment: 'bodyweight' },
  { id: '4b2e81a2-e0dd-5515-92ed-8036dfa15785', nameKey: 'deadlift', muscleGroup: 'back', equipment: 'barbell' },
  { id: 'd23a591a-3fbd-55ce-85ab-93033dbbf33b', nameKey: 'pull_up', muscleGroup: 'back', equipment: 'bodyweight' },
  { id: '225eff72-585c-5f55-8058-effe27a5184f', nameKey: 'chin_up', muscleGroup: 'back', equipment: 'bodyweight' },
  { id: '3f3ce3de-ae64-59df-8075-0f94790313ff', nameKey: 'lat_pulldown', muscleGroup: 'back', equipment: 'cable' },
  { id: '65f0255a-0ec1-5785-baa5-c7fcd4085bbf', nameKey: 'barbell_row', muscleGroup: 'back', equipment: 'barbell' },
  { id: '20f30ee6-afd2-5449-b813-159e1b6d441a', nameKey: 'dumbbell_row', muscleGroup: 'back', equipment: 'dumbbell' },
  { id: '523d4dc7-40c5-5fb4-8710-6fd53431b3cc', nameKey: 'seated_cable_row', muscleGroup: 'back', equipment: 'cable' },
  { id: '1336bcc3-4bab-516d-ad46-c77d2b465b04', nameKey: 't_bar_row', muscleGroup: 'back', equipment: 'barbell' },
  { id: '32e36087-1b53-53ec-8102-15807eca3bdb', nameKey: 'back_extension', muscleGroup: 'back', equipment: 'bodyweight' },
  { id: 'f3962c9d-dc23-5ee5-afec-04b116c4a1f5', nameKey: 'shrug', muscleGroup: 'back', equipment: 'barbell' },
  { id: '8ecb51e5-3371-51ae-8992-d7d396d88643', nameKey: 'overhead_press', muscleGroup: 'shoulders', equipment: 'barbell' },
  { id: '420063f6-4cdf-5994-8c6b-dfec010b824d', nameKey: 'dumbbell_shoulder_press', muscleGroup: 'shoulders', equipment: 'dumbbell' },
  { id: 'c2120c8c-93d2-55b2-9ad9-764dba13b99b', nameKey: 'arnold_press', muscleGroup: 'shoulders', equipment: 'dumbbell' },
  { id: '1ea0a435-b3cf-5051-bb2a-ce851e1039dc', nameKey: 'lateral_raise', muscleGroup: 'shoulders', equipment: 'dumbbell' },
  { id: '04c3e4c0-63d9-52fe-9ba0-ccfa1ccf92f0', nameKey: 'front_raise', muscleGroup: 'shoulders', equipment: 'dumbbell' },
  { id: 'b03bdd23-7653-5896-b153-b7db9ecf5f2e', nameKey: 'rear_delt_fly', muscleGroup: 'shoulders', equipment: 'dumbbell' },
  { id: 'bdbec610-3800-5175-b344-7f2c2463c398', nameKey: 'face_pull', muscleGroup: 'shoulders', equipment: 'cable' },
  { id: 'd54e8d0b-c20f-5db0-911f-038494b59015', nameKey: 'upright_row', muscleGroup: 'shoulders', equipment: 'barbell' },
  { id: 'b4a0ad0d-11bc-5658-aed2-01b3db31129b', nameKey: 'barbell_curl', muscleGroup: 'biceps', equipment: 'barbell' },
  { id: 'fa9a7307-697f-57d4-b2a4-1e235d338c50', nameKey: 'dumbbell_curl', muscleGroup: 'biceps', equipment: 'dumbbell' },
  { id: '4e644aba-e799-5764-9c1e-c6899fd9efe6', nameKey: 'hammer_curl', muscleGroup: 'biceps', equipment: 'dumbbell' },
  { id: '0b33d670-231b-5f78-b380-823a9016db83', nameKey: 'preacher_curl', muscleGroup: 'biceps', equipment: 'barbell' },
  { id: 'e90f657e-4c12-5bf2-9f08-be4831d30753', nameKey: 'cable_curl', muscleGroup: 'biceps', equipment: 'cable' },
  { id: 'b79e51cc-068b-5140-b9d1-c548c315c0af', nameKey: 'concentration_curl', muscleGroup: 'biceps', equipment: 'dumbbell' },
  { id: 'defb85eb-129b-5df4-a5b2-766efda86e79', nameKey: 'triceps_pushdown', muscleGroup: 'triceps', equipment: 'cable' },
  { id: '2f84eda1-a578-509e-8046-f904bf22e2c7', nameKey: 'skull_crusher', muscleGroup: 'triceps', equipment: 'barbell' },
  { id: 'e45726b5-c14e-5230-9072-3ad1cb5231bb', nameKey: 'overhead_triceps_extension', muscleGroup: 'triceps', equipment: 'dumbbell' },
  { id: '4f430859-0c96-55c1-92a5-15f758789b8b', nameKey: 'close_grip_bench_press', muscleGroup: 'triceps', equipment: 'barbell' },
  { id: '8bbb6876-05e2-5e96-b3d4-31601267165d', nameKey: 'bench_dip', muscleGroup: 'triceps', equipment: 'bodyweight' },
  { id: '8fcc4183-b10d-5a6c-a9b0-3482515fb809', nameKey: 'squat', muscleGroup: 'quads', equipment: 'barbell' },
  { id: '636acddd-9cd4-51f6-8f5a-3e1c685b20a4', nameKey: 'front_squat', muscleGroup: 'quads', equipment: 'barbell' },
  { id: '8af7eab2-ac33-549b-86f0-7c61d2775397', nameKey: 'goblet_squat', muscleGroup: 'quads', equipment: 'dumbbell' },
  { id: '6e39fcf8-1f30-5a25-b20f-6ac0ffde3c7d', nameKey: 'leg_press', muscleGroup: 'quads', equipment: 'machine' },
  { id: 'ce59acd2-e635-5846-8a82-6231679058b1', nameKey: 'hack_squat', muscleGroup: 'quads', equipment: 'machine' },
  { id: 'fd7d07ea-0845-5ab5-b01e-4aad96e7db06', nameKey: 'leg_extension', muscleGroup: 'quads', equipment: 'machine' },
  { id: '863b7249-96fc-56d5-a426-28185c23de46', nameKey: 'lunge', muscleGroup: 'quads', equipment: 'dumbbell' },
  { id: 'd47ebc2d-1168-5e6e-bb34-2e9f2b750884', nameKey: 'bulgarian_split_squat', muscleGroup: 'quads', equipment: 'dumbbell' },
  { id: '100746ca-897b-528a-bc7c-fae361445f2a', nameKey: 'romanian_deadlift', muscleGroup: 'hamstrings', equipment: 'barbell' },
  { id: '2be3077b-5f01-5242-9da5-5ed6396091cd', nameKey: 'leg_curl', muscleGroup: 'hamstrings', equipment: 'machine' },
  { id: '89eb6629-5175-5e10-b879-d190465ce7a7', nameKey: 'good_morning', muscleGroup: 'hamstrings', equipment: 'barbell' },
  { id: 'a51ea478-6ee8-56f0-90e3-ebc6c1228560', nameKey: 'hip_thrust', muscleGroup: 'glutes', equipment: 'barbell' },
  { id: 'a5f036fc-61bf-5013-8ab5-778dd3239958', nameKey: 'glute_bridge', muscleGroup: 'glutes', equipment: 'bodyweight' },
  { id: '40715362-3bd8-5d3c-9965-83c1ff22f735', nameKey: 'hip_abduction', muscleGroup: 'glutes', equipment: 'machine' },
  { id: 'f056c67b-f333-5d00-b71a-637090999e0e', nameKey: 'standing_calf_raise', muscleGroup: 'calves', equipment: 'machine' },
  { id: 'fc7fbdd4-304b-561b-82d9-7609e5d321c4', nameKey: 'seated_calf_raise', muscleGroup: 'calves', equipment: 'machine' },
  { id: '7ace8f08-576e-518a-a6d6-f0f1bd5ac84a', nameKey: 'plank', muscleGroup: 'abs', equipment: 'bodyweight' },
  { id: 'b20502d3-3d3f-51fa-9c9f-8774af1da549', nameKey: 'crunch', muscleGroup: 'abs', equipment: 'bodyweight' },
  { id: 'a765bb44-a0c5-5b2b-aa87-13dbbbec611a', nameKey: 'hanging_leg_raise', muscleGroup: 'abs', equipment: 'bodyweight' },
  { id: 'ccffe8d4-d91f-54e7-b5c3-4c423f24e5de', nameKey: 'cable_crunch', muscleGroup: 'abs', equipment: 'cable' },
  { id: '7c7592bf-91f9-523e-a3b1-2f6bf5f9fba9', nameKey: 'russian_twist', muscleGroup: 'abs', equipment: 'bodyweight' },
  { id: '6bf8b4ca-281e-59db-8ecd-02b0790561a4', nameKey: 'ab_wheel_rollout', muscleGroup: 'abs', equipment: 'other' },
  { id: '9e1273a4-65fb-5bae-a7cd-9c7e93bef8dd', nameKey: 'wrist_curl', muscleGroup: 'forearms', equipment: 'dumbbell' },
  { id: '72906c91-2d96-5ad6-805b-4f4f660f19bd', nameKey: 'farmers_walk', muscleGroup: 'forearms', equipment: 'dumbbell' },
  { id: 'f0246420-603a-5076-b027-fb7317dedc90', nameKey: 'kettlebell_swing', muscleGroup: 'full_body', equipment: 'kettlebell' },
  { id: '933d8284-d1ed-5f5a-af4f-0eeab988bd65', nameKey: 'clean_and_press', muscleGroup: 'full_body', equipment: 'barbell' },
];
