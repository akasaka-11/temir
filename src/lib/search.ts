const COMBINING_MARKS = /[̀-ͯ]/g;
// Explicit list instead of \p{...} escapes to stay safe on the Hermes engine.
const NON_WORD = /[\s\-‐–—_.,;:!?'"`’«»()[\]{}/\\+*&#]+/g;

/**
 * Lowercases and strips accents/punctuation so "Push-Up", "push up" and "PUSHUP"
 * compare equal, and "ё" matches "е". Kazakh letters (ә, қ, ұ, ...) are kept as is.
 */
export function normalizeForSearch(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(COMBINING_MARKS, '')
    .replace(NON_WORD, ' ')
    .trim();
}

/** True when every word of the query appears in the text, in any order. */
export function matchesQuery(text: string, query: string): boolean {
  const words = normalizeForSearch(query).split(' ').filter(Boolean);
  if (words.length === 0) return true;
  const haystack = normalizeForSearch(text);
  const compact = haystack.replace(/ /g, '');
  return words.every((word) => haystack.includes(word) || compact.includes(word));
}
