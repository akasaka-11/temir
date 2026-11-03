// Monochrome (black & white) design tokens. Keep all colors/spacing here, never inline in components.
// Red is kept only for destructive actions and errors, so they stay recognizable.
export const colors = {
  background: '#000000',
  surface: '#121212',
  surfaceElevated: '#1E1E1E',
  border: '#2C2C2C',
  text: '#FFFFFF',
  textMuted: '#8E8E8E',
  primary: '#FFFFFF',
  primaryText: '#000000',
  success: '#FFFFFF',
  /** Background of a completed set row. */
  completedRow: 'rgba(255, 255, 255, 0.08)',
  danger: '#FF453A',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
} as const;

export const typography = {
  title: { fontSize: 28, fontWeight: '700' },
  heading: { fontSize: 18, fontWeight: '600' },
  body: { fontSize: 16, fontWeight: '400' },
  caption: { fontSize: 13, fontWeight: '400' },
} as const;
