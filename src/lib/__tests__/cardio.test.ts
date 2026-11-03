import {
  distanceToInput,
  formatCardioDuration,
  formatDistanceKm,
  parseDistanceKm,
  parseDuration,
} from '../cardio';

describe('parseDuration', () => {
  it.each([
    ['25', 1500],
    ['25:30', 1530],
    ['0:45', 45],
    ['1:05:00', 3900],
    [' 30 ', 1800],
    ['25.30', 1530],
    ['25,30', 1530],
  ])('parses %p as %p seconds', (input, seconds) => {
    expect(parseDuration(input)).toBe(seconds);
  });

  it.each(['', 'abc', '0', '0:00', '25:60', '1:60:00', '1:2:3:4', '-5', '25:'])('rejects %p', (input) => {
    expect(parseDuration(input)).toBeNull();
  });

  it('rejects more than 24 hours', () => {
    expect(parseDuration('24:00:01')).toBeNull();
    expect(parseDuration('24:00:00')).toBe(86400);
  });
});

describe('formatCardioDuration', () => {
  it('formats minutes and hours and round-trips', () => {
    expect(formatCardioDuration(1530)).toBe('25:30');
    expect(formatCardioDuration(3900)).toBe('1:05:00');
    expect(parseDuration(formatCardioDuration(3900))).toBe(3900);
    expect(parseDuration(formatCardioDuration(45))).toBe(45);
  });
});

describe('distance', () => {
  it('parses km with dot or comma; empty means not set', () => {
    expect(parseDistanceKm('5,2')).toBe(5.2);
    expect(parseDistanceKm('10')).toBe(10);
    expect(parseDistanceKm('')).toBeUndefined();
  });

  it('rejects invalid, zero or huge distances', () => {
    expect(parseDistanceKm('abc')).toBeNull();
    expect(parseDistanceKm('0')).toBeNull();
    expect(parseDistanceKm('1001')).toBeNull();
  });

  it('formats and round-trips', () => {
    expect(formatDistanceKm(5200, 'ru')).toBe('5,2');
    expect(formatDistanceKm(5200, 'en')).toBe('5.2');
    expect(parseDistanceKm(distanceToInput(5200))).toBe(5.2);
  });
});
