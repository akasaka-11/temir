import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { type ReactNode, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { colors, spacing, typography } from '@/theme';

import { db } from './client';
import migrations from './migrations/migrations';
import { seedDatabase } from './seed';

/** Runs migrations and seeding before rendering the app. */
export function DatabaseProvider({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { success, error: migrationError } = useMigrations(db, migrations);
  const [seedError, setSeedError] = useState<Error | null>(null);
  const [seeded, setSeeded] = useState(false);

  useEffect(() => {
    if (!success) return;
    try {
      seedDatabase(db);
      setSeeded(true);
    } catch (e) {
      setSeedError(e instanceof Error ? e : new Error(String(e)));
    }
  }, [success]);

  const error = migrationError ?? seedError;
  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>{t('database.errorTitle')}</Text>
        <Text style={styles.details}>{error.message}</Text>
      </View>
    );
  }

  if (!seeded) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return children;
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  title: { ...typography.heading, color: colors.text, textAlign: 'center' },
  details: { ...typography.caption, color: colors.textMuted, textAlign: 'center' },
});
