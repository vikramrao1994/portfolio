export function normalizeText(value: string): string {
  return value.replace(/[ \t]+/g, " ").trim();
}

export function tokenizeText(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[\s,;.\-/()[\]{}|&+]+/)
    .map((t) => t.trim())
    .filter((t) => t.length > 1);
}

export function slugifyChunkId(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 64);
}

export function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values));
}
