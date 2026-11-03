import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';

import { changeLanguage } from '@/i18n';
import { SUPPORTED_LANGUAGES } from '@/i18n/language';
import { colors, radius, spacing, typography } from '@/theme';

export function LanguagePicker() {
  const { t, i18n } = useTranslation();

  return (
    <View style={styles.list}>
      {SUPPORTED_LANGUAGES.map((language, index) => {
        const selected = i18n.language === language;
        return (
          <Pressable
            key={language}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => void changeLanguage(language)}
            style={({ pressed }) => [
              styles.row,
              index > 0 && styles.rowDivider,
              pressed && styles.rowPressed,
            ]}
          >
            <Text style={styles.label}>{t(`languages.${language}`)}</Text>
            {selected && <Ionicons name="checkmark" size={20} color={colors.primary} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
  },
  rowDivider: { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.border },
  rowPressed: { backgroundColor: colors.surfaceElevated },
  label: { ...typography.body, color: colors.text },
});
