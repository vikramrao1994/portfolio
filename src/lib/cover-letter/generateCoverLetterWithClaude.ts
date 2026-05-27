import Anthropic from "@anthropic-ai/sdk";
import { type CoverLetterContent, CoverLetterContentSchema } from "./coverLetterContentSchema";

export interface GenerateCoverLetterResult {
  coverLetter: CoverLetterContent;
  model: string;
  usage: {
    input_tokens: number | undefined;
    output_tokens: number | undefined;
  };
}

const SYSTEM_PROMPT = [
  "You are a senior software engineer writing your own cover letter.",
  "You write the way engineers actually communicate: direct, concrete, outcome-focused.",
  "You do not sound like a recruiter, a consultant, or a LinkedIn post.",
  "",
  "Writing rules:",
  "- Short to medium sentences. Vary length and rhythm deliberately — no monotonous structure.",
  "- Every claim must be grounded in a specific outcome, system, or decision you owned.",
  "- Mention technologies only when they explain HOW something was built — never list them for their own sake.",
  "- Confident without overselling. Restrained, not weak.",
  "",
  "Banned phrases and patterns (never write these):",
  "- Enthusiasm openers: excited, passionate, thrilled, honored to apply",
  "- Buzzwords: AI-first, engineering velocity, growth mindset, culture-driving, impactful journey",
  "- Consultant-speak: leverage, synergize, unlock, empower, accelerate, drive impact",
  "- Filler transitions: Furthermore, Additionally, In summary, It goes without saying",
  "- Generic closers: I look forward to discussing how I can contribute to your team",
  "- Tech stacking: listing 3+ technologies in a single sentence without context",
  "- Anything that reads like a LinkedIn headline or job posting description",
  "",
  "Structure rules:",
  "- One major point per paragraph. Not one point padded with a list of supporting technologies.",
  "- 3 paragraphs preferred. Use a 4th only if a genuine additional point adds real value.",
  "- Opening must NOT start with 'I am applying', 'My name is', or any enthusiasm phrase.",
  "- Closing must be specific to this role — not a generic placeholder sentence.",
  "",
  "You output ONLY valid JSON.",
  "Never include Markdown formatting, code fences, comments, or any text outside the JSON object.",
  "Your entire response must be parseable by JSON.parse().",
].join("\n");

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

export async function generateCoverLetterWithClaude(
  prompt: string,
): Promise<GenerateCoverLetterResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error("Claude API key is not configured");
  }

  const model = process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5-20251001";

  const client = new Anthropic({ apiKey });

  let message: Anthropic.Message;
  try {
    message = await client.messages.create({
      model,
      max_tokens: 2000,
      temperature: 0.35,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content: prompt }],
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    // Do not leak full error which may contain model names or API details
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

  const result = CoverLetterContentSchema.safeParse(parsed);
  if (!result.success) {
    const issues = result.error.issues
      .slice(0, 3)
      .map((i) => `${i.path.join(".")}: ${i.message}`)
      .join("; ");
    throw new Error(`Claude response failed validation: ${issues}`);
  }

  return {
    coverLetter: result.data,
    model: message.model,
    usage: {
      input_tokens: message.usage?.input_tokens,
      output_tokens: message.usage?.output_tokens,
    },
  };
}
