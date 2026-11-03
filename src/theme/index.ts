// Dark-first design tokens. Keep all colors/spacing here, never inline in components.
export const colors = {
  background: '#0B0B0F',
  surface: '#16161D',
  surfaceElevated: '#1F1F28',
  border: '#2A2A35',
  text: '#F5F5F7',
  textMuted: '#9A9AA8',
  primary: '#4F8CFF',
  primaryText: '#FFFFFF',
  success: '#34C759',
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
