import { matchesQuery, normalizeForSearch } from '../search';

describe('normalizeForSearch', () => {
  it('lowercases and drops punctuation', () => {
    expect(normalizeForSearch('Push-Up (Barbell)')).toBe('push up barbell');
  });

  it('treats ё as е', () => {
    expect(normalizeForSearch('Подъём')).toBe('подъем');
  });

  it('keeps Kazakh letters', () => {
    expect(normalizeForSearch('Көлбеу Қол')).toBe('көлбеу қол');
  });
});

describe('matchesQuery', () => {
  it('matches everything for an empty query', () => {
    expect(matchesQuery('Squat', '   ')).toBe(true);
  });

  it('matches words in any order', () => {
    expect(matchesQuery('Bench Press (Dumbbell)', 'dumbbell bench')).toBe(true);
  });

  it('matches partial words', () => {
    expect(matchesQuery('Жим штанги лёжа', 'жим леж')).toBe(true);
  });

  it('ignores spaces and hyphens inside words', () => {
    expect(matchesQuery('Push-Up', 'pushup')).toBe(true);
  });

  it('requires all words', () => {
    expect(matchesQuery('Bench Press', 'bench squat')).toBe(false);
  });
});
