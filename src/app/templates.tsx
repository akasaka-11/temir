import { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { useExerciseNames } from '@/features/exercises/useExerciseNames';
import {
  BUILT_IN_TEMPLATES,
  PROGRAMS,
  SINGLE_WORKOUT_KEYS,
  templateToSpec,
} from '@/features/routines/builtInTemplates';
import { RoutineCard } from '@/features/routines/RoutineCard';
import { useStartRoutine } from '@/features/routines/useStartRoutine';
import { goBack } from '@/lib/navigation';
import type { RoutineSpecItem } from '@/lib/routineDraft';
import { colors, radius, spacing, typography } from '@/theme';

/** Short weekday names in the given language; 1 = Monday … 7 = Sunday. */
function weekdayFormatter(language: string) {
  const format = new Intl.DateTimeFormat(language, { weekday: 'short' });
  // 2 November 2026 is a Monday.
  return (weekday: number) => format.format(new Date(2026, 10, 1 + weekday));
}

export default function TemplatesScreen() {
  const { t, i18n } = useTranslation();
  const names = useExerciseNames();
  const { start, copy } = useStartRoutine();
  const weekday = weekdayFormatter(i18n.language);

  const workoutNames = t('templates.workouts', { returnObjects: true }) as Record<string, string>;
  const programTexts = t('templates.programs', { returnObjects: true }) as Record<
    string,
    { name: string; description: string }
  >;
  const guide = Object.values(t('templates.guide', { returnObjects: true }) as Record<string, string>);
  const tips = Object.values(t('templates.tips', { returnObjects: true }) as Record<string, string>);

  const specs = useMemo(
    () => new Map(BUILT_IN_TEMPLATES.map((template) => [template.key, templateToSpec(template)])),
    [],
  );

  function card(key: string, prefix?: string, optional?: boolean) {
    const items: RoutineSpecItem[] = specs.get(key) ?? [];
    const name = workoutNames[key] ?? key;
    const title = [prefix, name].filter(Boolean).join(' · ') + (optional ? ` (${t('templates.optional')})` : '');
    return (
      <View key={`${prefix ?? ''}${key}`} style={styles.day}>
        <RoutineCard
          name={title}
          exerciseNames={items.map((i) => names.get(i.exerciseId) ?? '').filter(Boolean)}
          onCopy={() => copy(name, items)}
          onStart={() => {
            start(name, items);
            goBack();
          }}
        />
        {key === 'cardio' && <Text style={styles.muted}>{t('templates.cardioHint')}</Text>}
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.guide}>
        <Text style={styles.guideTitle}>{t('templates.guideTitle')}</Text>
        {guide.map((line) => (
          <Text key={line} style={styles.bullet}>
            • {line}
          </Text>
        ))}
        <Text style={[styles.guideTitle, styles.tipsTitle]}>{t('templates.tipsTitle')}</Text>
        {tips.map((line) => (
          <Text key={line} style={styles.bullet}>
            • {line}
          </Text>
        ))}
      </View>

      <Text style={styles.section}>{t('templates.programsTitle')}</Text>
      {PROGRAMS.map((program) => (
        <View key={program.key} style={styles.program}>
          <Text style={styles.programName}>{programTexts[program.key]?.name}</Text>
          <Text style={styles.meta}>
            {t('templates.perWeek', { count: program.daysPerWeek })} ·{' '}
            {t('templates.perMuscle', { count: program.timesPerMuscle })}
          </Text>
          <Text style={styles.muted}>{programTexts[program.key]?.description}</Text>
          {program.days.map((day) => card(day.template, day.weekdays.map(weekday).join(', '), day.optional))}
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
  guide: { gap: spacing.xs, padding: spacing.lg, borderRadius: radius.lg, backgroundColor: colors.surface },
  guideTitle: { ...typography.heading, color: colors.text, marginBottom: spacing.xs },
  tipsTitle: { marginTop: spacing.md },
  bullet: { ...typography.body, color: colors.textMuted },
  section: { ...typography.heading, color: colors.text, marginTop: spacing.md },
  program: {
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
  },
  programName: { ...typography.heading, color: colors.text },
  meta: { ...typography.caption, color: colors.text, fontWeight: '600' },
  muted: { ...typography.caption, color: colors.textMuted, marginBottom: spacing.xs },
  day: { gap: spacing.xs },
});
