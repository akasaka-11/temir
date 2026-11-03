import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { LanguagePicker } from '@/components/LanguagePicker';
import { colors, spacing, typography } from '@/theme';

export default function ProfileScreen() {
  const { t } = useTranslation();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.sectionTitle}>{t('profile.settings')}</Text>
      <View style={styles.section}>
        <Text style={styles.label}>{t('profile.language')}</Text>
        <LanguagePicker />
        <Text style={styles.hint}>{t('profile.languageHint')}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: spacing.lg, gap: spacing.md },
  sectionTitle: { ...typography.title, color: colors.text },
  section: { gap: spacing.sm },
  label: { ...typography.caption, color: colors.textMuted, textTransform: 'uppercase' },
  hint: { ...typography.caption, color: colors.textMuted },
});
