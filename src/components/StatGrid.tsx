import { StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

export type Stat = { label: string; value: string };

/** Two-column grid of big numbers with captions (duration, volume, ...). */
export function StatGrid({ stats }: { stats: readonly Stat[] }) {
  return (
    <View style={styles.grid}>
      {stats.map((stat) => (
        <View key={stat.label} style={styles.tile}>
          <Text style={styles.value}>{stat.value}</Text>
          <Text style={styles.label}>{stat.label}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  tile: {
    flexGrow: 1,
    flexBasis: '45%',
    padding: spacing.lg,
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    gap: spacing.xs,
  },
  value: { ...typography.title, color: colors.text, fontVariant: ['tabular-nums'] },
  label: { ...typography.caption, color: colors.textMuted },
});
