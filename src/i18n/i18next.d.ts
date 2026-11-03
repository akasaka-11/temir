import 'i18next';

import type en from '@/locales/en.json';

// Makes t('...') type-checked: a typo in a key becomes a TypeScript error.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'translation';
    resources: { translation: typeof en };
  }
}
