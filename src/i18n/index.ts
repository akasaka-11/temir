import { getLocales } from 'expo-localization';
import Storage from 'expo-sqlite/kv-store';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '@/locales/en.json';
import kk from '@/locales/kk.json';
import ru from '@/locales/ru.json';

import { FALLBACK_LANGUAGE, type Language, resolveLanguage } from './language';

// TODO(stage 2+): move user settings into the settings table if we need them in SQL queries.
const LANGUAGE_STORAGE_KEY = 'settings.language';

export const resources = {
  en: { translation: en },
  kk: { translation: kk },
  ru: { translation: ru },
} as const;

const initialLanguage = resolveLanguage(
  Storage.getItemSync(LANGUAGE_STORAGE_KEY),
  getLocales().map((locale) => locale.languageCode),
);

void i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: FALLBACK_LANGUAGE,
  interpolation: { escapeValue: false }, // React already escapes output
  returnNull: false,
});

/** Switches the UI language immediately and remembers the choice. */
export async function changeLanguage(language: Language): Promise<void> {
  Storage.setItemSync(LANGUAGE_STORAGE_KEY, language);
  await i18n.changeLanguage(language);
}

export default i18n;
