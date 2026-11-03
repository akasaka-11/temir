import '@/i18n';

import { DarkTheme, Stack, ThemeProvider, type Theme } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useTranslation } from 'react-i18next';

import { DatabaseProvider } from '@/db/DatabaseProvider';
import { configureNotifications } from '@/features/workout/restNotifications';
import { colors } from '@/theme';

configureNotifications();

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
          <Stack.Screen
            name="workout/add-exercises"
            options={{ presentation: 'modal', title: t('workout.addExercises') }}
          />
          <Stack.Screen name="exercise/[id]" options={{ title: '', headerBackTitle: t('tabs.exercises') }} />
          <Stack.Screen name="routine/[id]" options={{ presentation: 'modal' }} />
          <Stack.Screen
            name="templates"
            options={{ title: t('templates.title'), headerBackTitle: t('tabs.workout') }}
          />
          <Stack.Screen
            name="routine/add-exercises"
            options={{ presentation: 'modal', title: t('workout.addExercises') }}
          />
          <Stack.Screen name="history/[id]" options={{ title: '', headerBackTitle: t('tabs.history') }} />
          <Stack.Screen
            name="workout/summary"
            options={{ presentation: 'modal', headerShown: false, gestureEnabled: false }}
          />
        </Stack>
      </DatabaseProvider>
    </ThemeProvider>
  );
}
