export function sortByFrequency<T extends string>(
  counts: Partial<Record<T, number>>,
  order: readonly T[],
): T[] {
  return order
    .filter((k) => (counts[k] ?? 0) > 0)
    .sort((a, b) => (counts[b] ?? 0) - (counts[a] ?? 0));
}
