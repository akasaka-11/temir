export type WeightUnit = 'kg' | 'lb';

export const LB_PER_KG = 2.2046226218;
export const MAX_WEIGHT_KG = 1000;
export const MAX_REPS = 1000;

export function kgToLb(kg: number): number {
  return kg * LB_PER_KG;
}

export function lbToKg(lb: number): number {
  return lb / LB_PER_KG;
}

/** Converts a value entered in `unit` to kilograms (the only unit stored in the DB). */
export function toKg(value: number, unit: WeightUnit): number {
  return unit === 'kg' ? value : lbToKg(value);
}

/** Converts kilograms from the DB to the unit shown to the user. */
export function fromKg(kg: number, unit: WeightUnit): number {
  return unit === 'kg' ? kg : kgToLb(kg);
}

/** Rounds for display: at most 2 decimals, no float noise (62.4999999 -> 62.5). */
export function roundWeight(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * Parses a weight typed by the user. Accepts both "62.5" and "62,5".
 * Returns null for empty, invalid, negative or unrealistically large values.
 */
export function parseWeight(text: string, unit: WeightUnit = 'kg'): number | null {
  const normalized = text.trim().replace(',', '.');
  if (!/^\d+(\.\d*)?$|^\.\d+$/.test(normalized)) return null;
  const value = Number(normalized);
  if (!Number.isFinite(value) || toKg(value, unit) > MAX_WEIGHT_KG) return null;
  return value;
}

/** Parses repetitions: a whole, non-negative number. */
export function parseReps(text: string): number | null {
  const normalized = text.trim();
  if (!/^\d+$/.test(normalized)) return null;
  const value = Number(normalized);
  return value <= MAX_REPS ? value : null;
}

/** Formats a weight for display in the user's language, e.g. 62.5 -> "62,5" in ru. */
export function formatWeight(kg: number, unit: WeightUnit, language: string): string {
  return new Intl.NumberFormat(language, { maximumFractionDigits: 2 }).format(
    roundWeight(fromKg(kg, unit)),
  );
}

/** Weight as text for an input field (always uses "." so it parses back the same). */
export function weightToInput(kg: number, unit: WeightUnit): string {
  return String(roundWeight(fromKg(kg, unit)));
}
