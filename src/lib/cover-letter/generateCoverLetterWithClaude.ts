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

const SYSTEM_PROMPT =
  "You are a professional cover letter writer. You output ONLY valid JSON. " +
  "Never include Markdown formatting, code fences, comments, or any text outside the JSON object. " +
  "Your entire response must be parseable by JSON.parse().";

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
      temperature: 0.2,
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
