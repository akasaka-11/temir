import { useTranslation } from 'react-i18next';

import { changeLanguage } from '@/i18n';
import { isSupportedLanguage, type Language, SUPPORTED_LANGUAGES } from '@/i18n/language';

import { OptionList } from './OptionList';

export function LanguagePicker() {
  const { t, i18n } = useTranslation();
  const current: Language = isSupportedLanguage(i18n.language) ? i18n.language : 'en';

  return (
    <OptionList
      options={SUPPORTED_LANGUAGES.map((language) => ({ value: language, label: t(`languages.${language}`) }))}
      value={current}
      onChange={(language) => void changeLanguage(language)}
    />
  );
}
