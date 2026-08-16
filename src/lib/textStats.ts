// Lightweight text statistics for skill content.

/** Count whitespace-delimited words. */
export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

/**
 * Rough token estimate. There is no exact tokenizer client-side, so we use the
 * widely-cited ~4-characters-per-token heuristic for English prose. This is an
 * approximation for budgeting, not an exact count.
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/** Format a count compactly (e.g. 1234 -> "1.2k"). */
export function formatCount(n: number): string {
  if (n < 1000) return String(n);
  return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
}
