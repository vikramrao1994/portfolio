export function getLang<T extends { en?: string; de?: string }>(obj: T): string {
  return obj.en ?? obj.de ?? "";
}
