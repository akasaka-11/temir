import '@/i18n';

import { DarkTheme, Stack, ThemeProvider, type Theme } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';

import { DatabaseProvider } from '@/db/DatabaseProvider';
import { colors } from '@/theme';

const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
  },
};

export default function RootLayout() {
  const { t } = useTranslation();

  return (
    <ThemeProvider value={navigationTheme}>
      <StatusBar style="light" />
      <DatabaseProvider>
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colors.background },
            headerTintColor: colors.text,
            headerShadowVisible: false,
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="exercise/new"
            options={{ presentation: 'modal', title: t('exerciseForm.title') }}
          />
        </Stack>
      </DatabaseProvider>
    </ThemeProvider>
  );
}
