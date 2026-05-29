import Anthropic from "@anthropic-ai/sdk";
import { buildApplicationContext } from "@/lib/application-documents/context/buildApplicationContext";
import type { Language } from "@/lib/cover-letter/schemas";
import type { Site } from "@/lib/siteSchema";
import { buildCvSummaryPrompt } from "./buildCvSummaryPrompt";
import { type CvSummarySuggestion, CvSummarySuggestionSchema } from "./schema";

export interface GenerateCvSummaryInput {
  jobDescription: string;
  language: Language;
  companyName?: string;
  jobTitle?: string;
}

export interface GenerateCvSummaryResult {
  suggestion: CvSummarySuggestion;
  siteContent: Site;
  model: string;
  usage: {
    input_tokens: number | undefined;
    output_tokens: number | undefined;
  };
}

const SYSTEM_PROMPT = `You are a professional CV writer tailoring an existing CV top-section for a specific job application.

Your task is to write a targeted headline and executive summary that positions the candidate for the specific role.

Core rules:
- Use only facts from the provided evidence — do not invent experience, dates, employers, or achievements.
- Do not rewrite work experience bullets, education entries, or skills.
- Keep the tone professional and recruiter-facing.
- Write in the requested output language.
- Return only valid JSON. No Markdown, no code fences, no explanations.

Before returning JSON, silently verify:
- Headline is specific to this role, not a generic phrase
- Summary is grounded entirely in the provided evidence
- No invented facts were introduced
- Output language matches the requested language`;

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

export async function generateCvSummaryWithClaude(
  input: GenerateCvSummaryInput,
): Promise<GenerateCvSummaryResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new Error("Claude API key is not configured");

  const { jobDescription, language, companyName, jobTitle } = input;

  const context = await buildApplicationContext(jobDescription, language);
  const { siteContent, extractedKeywords, evidencePack, positioningPlan } = context;

  const prompt = buildCvSummaryPrompt({
    jobDescription,
    language,
    companyName,
    jobTitle,
    siteContent,
    extractedKeywords,
    evidencePack,
    positioningPlan,
  });

  const model = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";
  const client = new Anthropic({ apiKey });

  let message: Anthropic.Message;
  try {
    message = await client.messages.create({
      model,
      max_tokens: 1200,
      temperature: 0.3,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
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

  const result = CvSummarySuggestionSchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .slice(0, 3)
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`Claude response failed validation: ${issues}`);
  }

  return {
    suggestion: result.data,
    siteContent,
    model: message.model,
    usage: {
      input_tokens: message.usage?.input_tokens,
      output_tokens: message.usage?.output_tokens,
    },
  };
}
