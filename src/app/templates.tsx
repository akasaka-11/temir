import { router } from 'expo-router';
import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useExerciseNames } from '@/features/exercises/useExerciseNames';
import {
  findTemplate,
  PROGRAMS,
  SINGLE_WORKOUT_KEYS,
  templateToSpec,
} from '@/features/routines/builtInTemplates';
import { RoutineCard } from '@/features/routines/RoutineCard';
import { useStartRoutine } from '@/features/routines/useStartRoutine';
import type { RoutineSpecItem } from '@/lib/routineDraft';
import { colors, radius, spacing, typography } from '@/theme';

export default function TemplatesScreen() {
  const { t } = useTranslation();
  const names = useExerciseNames();
  const { start, copy } = useStartRoutine();

  const workoutNames = t('templates.workouts', { returnObjects: true }) as Record<string, string>;
  const programTexts = t('templates.programs', { returnObjects: true }) as Record<
    string,
    { name: string; description: string }
  >;

  const specs = useMemo(() => {
    const keys = new Set<string>([...SINGLE_WORKOUT_KEYS, ...PROGRAMS.flatMap((p) => p.days)]);
    return new Map([...keys].map((key) => [key, templateToSpec(findTemplate(key)!)]));
  }, []);

  function card(key: string, label?: string) {
    const items: RoutineSpecItem[] = specs.get(key) ?? [];
    const name = workoutNames[key] ?? key;
    return (
      <RoutineCard
        key={`${label ?? ''}${key}`}
        name={label ? `${label} · ${name}` : name}
        exerciseNames={items.map((i) => names.get(i.exerciseId) ?? '').filter(Boolean)}
        onCopy={() => copy(name, items)}
        onStart={() => {
          start(name, items);
          router.back();
        }}
      />
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.section}>{t('templates.programsTitle')}</Text>
      {PROGRAMS.map((program) => (
        <View key={program.key} style={styles.program}>
          <Text style={styles.programName}>{programTexts[program.key]?.name}</Text>
          <Text style={styles.muted}>{programTexts[program.key]?.description}</Text>
          {program.days.map((day, index) => card(day, t('templates.day', { number: index + 1 })))}
        </View>
      ))}

      <Text style={styles.section}>{t('templates.workoutsTitle')}</Text>
      {SINGLE_WORKOUT_KEYS.map((key) => card(key))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  section: { ...typography.heading, color: colors.text, marginTop: spacing.md },
  program: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  programName: { ...typography.heading, color: colors.text },
  muted: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.xs },
});
