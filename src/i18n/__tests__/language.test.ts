import { resolveLanguage } from '../language';

describe('resolveLanguage', () => {
  it('prefers the saved user choice', () => {
    expect(resolveLanguage('kk', ['ru', 'en'])).toBe('kk');
  });

  it('ignores an invalid saved value', () => {
    expect(resolveLanguage('de', ['ru'])).toBe('ru');
  });

  it('uses the first supported device language', () => {
    expect(resolveLanguage(null, ['de', 'kk', 'ru'])).toBe('kk');
  });

  it('normalizes region suffixes and case', () => {
    expect(resolveLanguage(null, ['RU-kz'])).toBe('ru');
    expect(resolveLanguage(null, ['kk_KZ'])).toBe('kk');
  });

  it('falls back to English', () => {
    expect(resolveLanguage(null, ['de', null])).toBe('en');
    expect(resolveLanguage(null, [])).toBe('en');
  });
});
