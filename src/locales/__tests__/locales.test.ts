import en from '../en.json';
import kk from '../kk.json';
import ru from '../ru.json';

type Dict = { [key: string]: string | Dict };

const locales: Record<string, Dict> = { en, kk, ru };
const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/;

function flatten(dict: Dict, prefix = ''): Record<string, string> {
  return Object.entries(dict).reduce<Record<string, string>>((acc, [key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'string' ? { ...acc, [path]: value } : { ...acc, ...flatten(value, path) };
  }, {});
}

const flat = Object.fromEntries(
  Object.entries(locales).map(([lang, dict]) => [lang, flatten(dict)]),
) as Record<string, Record<string, string>>;

/** Keys without plural suffixes, e.g. "units.sets_one" -> "units.sets". */
function baseKeys(lang: string): Set<string> {
  return new Set(Object.keys(flat[lang]!).map((key) => key.replace(PLURAL_SUFFIX, '')));
}

describe('translation files', () => {
  const languages = Object.keys(locales);

  it.each(languages)('%s has the same keys as every other language', (lang) => {
    const own = baseKeys(lang);
    for (const other of languages) {
      const missing = [...baseKeys(other)].filter((key) => !own.has(key));
      expect({ lang, missingFrom: other, missing }).toEqual({ lang, missingFrom: other, missing: [] });
    }
  });

  it.each(languages)('%s has no empty strings', (lang) => {
    const empty = Object.entries(flat[lang]!).filter(([, value]) => value.trim() === '');
    expect(empty).toEqual([]);
  });

  it.each(languages)('%s defines every plural form its grammar needs', (lang) => {
    const categories = new Intl.PluralRules(lang).resolvedOptions().pluralCategories;
    const pluralBases = new Set(
      Object.keys(flat[lang]!)
        .filter((key) => PLURAL_SUFFIX.test(key))
        .map((key) => key.replace(PLURAL_SUFFIX, '')),
    );
    for (const base of pluralBases) {
      const missing = categories.filter((category) => !(`${base}_${category}` in flat[lang]!));
      expect({ key: base, missing }).toEqual({ key: base, missing: [] });
    }
  });
});
