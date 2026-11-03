import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

import { colors, radius, spacing, typography } from '@/theme';

type Variant = 'primary' | 'secondary' | 'danger';

type Props = {
  label: string;
  onPress: () => void;
  variant?: Variant;
  icon?: ComponentProps<typeof Ionicons>['name'];
  compact?: boolean;
  disabled?: boolean;
};

const variantColors: Record<Variant, { background: string; text: string }> = {
  primary: { background: colors.primary, text: colors.primaryText },
  secondary: { background: colors.surfaceElevated, text: colors.text },
  danger: { background: 'transparent', text: colors.danger },
};

export function Button({ label, onPress, variant = 'primary', icon, compact, disabled }: Props) {
  const palette = variantColors[variant];
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        compact && styles.compact,
        { backgroundColor: palette.background },
        (pressed || disabled) && styles.dimmed,
      ]}
    >
      {icon && <Ionicons name={icon} size={compact ? 16 : 20} color={palette.text} />}
      <Text style={[compact ? styles.compactLabel : styles.label, { color: palette.text }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  compact: { paddingVertical: spacing.sm, paddingHorizontal: spacing.md, borderRadius: radius.sm },
  dimmed: { opacity: 0.6 },
  label: { ...typography.heading },
  compactLabel: { ...typography.body, fontWeight: '600' },
});
