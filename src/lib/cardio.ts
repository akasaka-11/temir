// Parsing and formatting for cardio sets: duration (+ optional distance in km).

export const MAX_DURATION_SECONDS = 24 * 60 * 60;
export const MAX_DISTANCE_KM = 1000;

/**
 * Parses a duration typed by the user:
 * "25" -> 25 min, "25:30" -> 25 min 30 s, "1:05:00" -> 1 h 5 min.
 * Returns seconds, or null for empty/invalid/zero values.
 */
export function parseDuration(text: string): number | null {
  const normalized = text.trim().replace(/[.,]/g, ':');
  if (!/^\d+(:\d{1,2}){0,2}$/.test(normalized)) return null;
  const parts = normalized.split(':').map(Number);
  let seconds: number;
  if (parts.length === 1) {
    seconds = parts[0]! * 60;
  } else if (parts.length === 2) {
    if (parts[1]! >= 60) return null;
    seconds = parts[0]! * 60 + parts[1]!;
  } else {
    if (parts[1]! >= 60 || parts[2]! >= 60) return null;
    seconds = parts[0]! * 3600 + parts[1]! * 60 + parts[2]!;
  }
  return seconds > 0 && seconds <= MAX_DURATION_SECONDS ? seconds : null;
}

/** Seconds -> "25:30" or "1:05:00" (also used as input text, it parses back). */
export function formatCardioDuration(seconds: number): string {
  const total = Math.max(0, Math.round(seconds));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
}

/** Parses kilometres ("5", "5.2", "5,2"). Empty -> undefined (distance is optional). */
export function parseDistanceKm(text: string): number | null | undefined {
  const normalized = text.trim().replace(',', '.');
  if (normalized === '') return undefined;
  if (!/^\d+(\.\d*)?$|^\.\d+$/.test(normalized)) return null;
  const value = Number(normalized);
  return value > 0 && value <= MAX_DISTANCE_KM ? value : null;
}

export function formatDistanceKm(meters: number, language: string): string {
  return new Intl.NumberFormat(language, { maximumFractionDigits: 2 }).format(meters / 1000);
}

/** Distance as input text (always with a dot so it parses back). */
export function distanceToInput(meters: number): string {
  return String(Math.round(meters) / 1000);
}
