function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s-]+/g, "-");
}

export function createPromptFilename(
  companyName: string | undefined,
  jobTitle: string | undefined,
  language: string,
): string {
  const parts = [
    "cover-letter-prompt",
    companyName ? slugify(companyName) : null,
    jobTitle ? slugify(jobTitle) : null,
    language,
  ].filter(Boolean);

  return `${parts.join("-")}.md`;
}
