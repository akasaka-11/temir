export const SUPPORTED_LANGUAGES = ['kk', 'en', 'ru'] as const;
export type Language = (typeof SUPPORTED_LANGUAGES)[number];

export const FALLBACK_LANGUAGE: Language = 'en';

export function isSupportedLanguage(value: unknown): value is Language {
  return typeof value === 'string' && (SUPPORTED_LANGUAGES as readonly string[]).includes(value);
}

/**
 * Picks the app language: a saved user choice wins, otherwise the first
 * supported device language, otherwise English.
 */
export function resolveLanguage(
  saved: string | null,
  deviceLanguageCodes: readonly (string | null)[],
): Language {
  if (isSupportedLanguage(saved)) return saved;
  for (const code of deviceLanguageCodes) {
    const normalized = code?.toLowerCase().split(/[-_]/)[0];
    if (isSupportedLanguage(normalized)) return normalized;
  }
  return FALLBACK_LANGUAGE;
}
