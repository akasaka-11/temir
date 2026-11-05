import Ionicons from '@expo/vector-icons/Ionicons';
import { Link } from 'expo-router';
import { Tabs } from 'expo-router/js-tabs';
import type { ComponentProps } from 'react';
import { useTranslation } from 'react-i18next';
import { Platform, Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { colors, spacing } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

// Web: the default tab bar is too short for icon + label with browser fonts (labels get clipped).
// The home indicator inset comes from CSS env(), which react-native-web passes through as is.
const webTabBar = (
  Platform.OS === 'web'
    ? {
        height: 'calc(58px + env(safe-area-inset-bottom))',
        paddingTop: 4,
        paddingBottom: 'calc(4px + env(safe-area-inset-bottom))',
      }
    : {}
) as ViewStyle;

function tabIcon(name: IconName) {
  return ({ focused, size }: { focused: boolean; size: number }) => (
    <Ionicons name={name} color={focused ? colors.primary : colors.textMuted} size={size} />
  );
}

export default function TabsLayout() {
  const { t } = useTranslation();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: [{ backgroundColor: colors.surface, borderTopColor: colors.border }, webTabBar],
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: t('tabs.workout'), tabBarIcon: tabIcon('barbell-outline') }}
      />
      <Tabs.Screen
        name="history"
        options={{ title: t('tabs.history'), tabBarIcon: tabIcon('time-outline') }}
      />
      <Tabs.Screen
        name="exercises"
        options={{
          title: t('tabs.exercises'),
          tabBarIcon: tabIcon('list-outline'),
          headerRight: () => (
            <Link href="/exercise/new" asChild>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={t('exercises.add')}
                hitSlop={12}
                style={styles.headerButton}
              >
                <Ionicons name="add" size={28} color={colors.primary} />
              </Pressable>
            </Link>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: t('tabs.profile'), tabBarIcon: tabIcon('person-outline') }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerButton: { marginRight: spacing.lg },
});
