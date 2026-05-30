import Anthropic from "@anthropic-ai/sdk";
import type { LinkedInRecommendationRecord } from "./loadDocumentsForExtraction";
import {
  ClaudeExtractionResponseSchema,
  ENGINEERING_BEHAVIOR_TRAITS,
  type EngineeringBehaviorProfile,
  SOURCE_TYPES,
  TRAIT_CATEGORIES,
} from "./schema";

export interface LoadedPdfDocument {
  label: string;
  base64: string;
}

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  if (trimmed.startsWith("```")) {
    return trimmed
      .replace(/^```(?:json)?\s*\n?/, "")
      .replace(/\n?```\s*$/, "")
      .trim();
  }
  return trimmed;
}

function buildLinkedInLabel(rec: LinkedInRecommendationRecord): string {
  if (!rec.authorName) return `LinkedIn Recommendation #${rec.id}`;
  const role = rec.authorRole
    ? ` (${rec.authorRole}${rec.company ? ` at ${rec.company}` : ""})`
    : "";
  return `LinkedIn – ${rec.authorName}${role}`;
}

function buildLinkedInSection(recs: LinkedInRecommendationRecord[]): string {
  if (recs.length === 0) return "";
  const lines: string[] = [`\nLINKEDIN RECOMMENDATIONS (${recs.length}):`];
  lines.push('→ Always use sourceType: "linkedin_recommendation" for traits from these sources.');
  lines.push(
    "→ Include authorName, authorRole, company, relationship in each trait exactly as listed.",
  );
  for (const rec of recs) {
    const label = buildLinkedInLabel(rec);
    lines.push("");
    lines.push(`[${label}]`);
    lines.push(`  sourceDocument: "${label}"`);
    if (rec.authorName) lines.push(`  authorName: "${rec.authorName}"`);
    if (rec.authorRole) lines.push(`  authorRole: "${rec.authorRole}"`);
    if (rec.company) lines.push(`  company: "${rec.company}"`);
    if (rec.relationship) lines.push(`  relationship: "${rec.relationship}"`);
    lines.push("  Text:");
    lines.push('  """');
    lines.push(`  ${rec.recommendationText}`);
    lines.push('  """');
  }
  return lines.join("\n");
}

const SYSTEM_PROMPT = `You are a behavioral analyst extracting engineering working-style observations from professional documents.

Sources include employment certificates, Arbeitszeugnisse, reference letters, recommendation letters, and LinkedIn recommendations.

STRICT RULES:
1. Only extract traits DIRECTLY supported by explicit text. No inference beyond what is stated.
2. Evidence MUST be the exact original wording — do NOT translate, paraphrase, or normalize.
3. German text stays in German. English text stays in English.
4. Do NOT extract technical skills (programming languages, frameworks, cloud tools, etc.).
5. Focus ONLY on behavior: how someone works, not what tools they used.
6. Summaries describe behavioral patterns only — no technologies, no specific tools or frameworks.
7. Return ONLY valid JSON. No markdown, no code fences, no commentary.`;

export async function generateBehaviorProfileWithClaude(
  pdfDocuments: LoadedPdfDocument[],
  linkedInRecommendations: LinkedInRecommendationRecord[],
): Promise<Omit<EngineeringBehaviorProfile, "extractedAt">> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Claude API key is not configured");

  const model = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";
  const client = new Anthropic({ apiKey });

  const traitList = ENGINEERING_BEHAVIOR_TRAITS.join(", ");
  const categoryList = TRAIT_CATEGORIES.join(", ");
  const sourceTypeList = SOURCE_TYPES.join(", ");

  const pdfSection =
    pdfDocuments.length > 0
      ? `\nPDF DOCUMENTS (${pdfDocuments.length}):\n${pdfDocuments.map((d) => `- ${d.label}`).join("\n")}\n→ Determine sourceType from content: "employment_certificate", "reference_letter", or "recommendation_letter"\n→ Use the company name as sourceDocument\n→ Omit authorName, authorRole, company, relationship for these traits`
      : "";

  const linkedInSection = buildLinkedInSection(linkedInRecommendations);

  const totalCount = pdfDocuments.length + linkedInRecommendations.length;

  const userPrompt = `Extract engineering behavioral traits from ${totalCount} source(s):
${pdfSection}${linkedInSection}

Return a JSON object with this exact structure:
{
  "traits": [
    {
      "trait": one of [${traitList}],
      "category": one of [${categoryList}],
      "confidence": number 0.0-1.0,
      "evidence": "verbatim quote in its original language",
      "evidenceLanguage": "de" or "en",
      "sourceDocument": "as specified per source above",
      "sourceType": one of [${sourceTypeList}],
      "authorName": "only for linkedin_recommendation — omit for PDF sources",
      "authorRole": "only for linkedin_recommendation — omit for PDF sources",
      "company": "only for linkedin_recommendation — omit for PDF sources",
      "relationship": "only for linkedin_recommendation — omit for PDF sources"
    }
  ],
  "summary_en": "Behavioral profile in English — working style, problem-solving approach, collaboration, quality orientation. No technologies.",
  "summary_de": "Behavioral profile in German — working style, problem-solving approach, collaboration, quality orientation. No technologies."
}

Confidence guide:
- 0.9-1.0: explicitly and clearly stated
- 0.7-0.89: strongly implied by context
- Below 0.7: do not include

Do not include the same trait more than once per source document.`;

  // biome-ignore lint/suspicious/noExplicitAny: SDK document block type requires runtime cast
  const contentBlocks: any[] = [
    { type: "text", text: userPrompt },
    ...pdfDocuments.map((doc) => ({
      type: "document",
      source: { type: "base64", media_type: "application/pdf", data: doc.base64 },
      title: doc.label,
    })),
  ];

  let message: Anthropic.Message;
  try {
    message = await client.messages.create({
      model,
      max_tokens: 4000,
      temperature: 0.1,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: contentBlocks }],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`Claude generation failed: ${msg.slice(0, 200)}`);
  }

  const textBlock = message.content.find((c) => c.type === "text");
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("Claude returned no text content");
  }

  const rawText = stripCodeFences(textBlock.text);

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
  } catch {
    throw new Error("Claude returned invalid JSON");
  }

  const result = ClaudeExtractionResponseSchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .slice(0, 3)
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`Claude response failed validation: ${issues}`);
  }

  return result.data;
}
