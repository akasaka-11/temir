import {
  formatWeight,
  fromKg,
  kgToLb,
  lbToKg,
  parseReps,
  parseWeight,
  roundWeight,
  toKg,
  weightToInput,
} from '../units';

describe('parseWeight', () => {
  it.each([
    ['62.5', 62.5],
    ['62,5', 62.5],
    [' 100 ', 100],
    ['0', 0],
    ['7.', 7],
    ['.5', 0.5],
    [',5', 0.5],
  ])('parses %p', (input, expected) => {
    expect(parseWeight(input)).toBe(expected);
  });

  it.each(['', '  ', 'abc', '-5', '1,2,3', '1.2.3', '1e3', '62 ,5'])('rejects %p', (input) => {
    expect(parseWeight(input)).toBeNull();
  });

  it('rejects unrealistic weights', () => {
    expect(parseWeight('1001')).toBeNull();
    expect(parseWeight('2300', 'lb')).toBeNull();
    expect(parseWeight('2200', 'lb')).toBe(2200);
  });
});

describe('parseReps', () => {
  it('accepts whole numbers', () => {
    expect(parseReps('8')).toBe(8);
    expect(parseReps(' 12 ')).toBe(12);
  });

  it.each(['', '8.5', '8,5', '-1', 'x', '1001'])('rejects %p', (input) => {
    expect(parseReps(input)).toBeNull();
  });
});

describe('kg/lb conversion', () => {
  it('converts both ways', () => {
    expect(kgToLb(100)).toBeCloseTo(220.462, 3);
    expect(lbToKg(225)).toBeCloseTo(102.058, 3);
  });

  it('round-trips without drift', () => {
    expect(roundWeight(fromKg(toKg(135, 'lb'), 'lb'))).toBe(135);
  });

  it('is a no-op for kg', () => {
    expect(toKg(62.5, 'kg')).toBe(62.5);
    expect(fromKg(62.5, 'kg')).toBe(62.5);
  });
});

describe('formatting', () => {
  it('uses the language decimal separator', () => {
    expect(formatWeight(62.5, 'kg', 'ru')).toBe('62,5');
    expect(formatWeight(62.5, 'kg', 'en')).toBe('62.5');
  });

  it('shows pounds rounded', () => {
    expect(formatWeight(lbToKg(135), 'lb', 'en')).toBe('135');
  });

  it('prepares input text with a dot', () => {
    expect(weightToInput(62.5, 'kg')).toBe('62.5');
    expect(weightToInput(lbToKg(45), 'lb')).toBe('45');
  });
});
