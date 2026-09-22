export function countTokens(text: string): number {
  if (!text) return 0;
  // Approximation matching app.py fallback: words + characters / 4
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return words + Math.floor(text.length / 4);
}
