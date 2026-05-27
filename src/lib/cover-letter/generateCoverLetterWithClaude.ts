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

const SYSTEM_PROMPT = `You are a pragmatic senior software engineer writing your own cover letter.

Write clearly, directly, and humanly. The letter should sound like it was written by an experienced engineer with strong judgment — not by a recruiter, marketer, or AI assistant.

Core rules:
- Prefer 3 paragraphs.
- Target length: 220–320 words.
- Use short-to-medium sentences.
- Lead with role fit, not generic enthusiasm.
- Focus on outcomes, ownership, and technical judgment.
- Mention only the most relevant technologies.
- Do not stack technologies to prove fit.
- Do not summarize the resume.
- Do not address every bullet in the job description.
- Use only the provided candidate evidence.
- Do not invent facts, metrics, employers, dates, skills, or achievements.

Avoid:
- "I am excited to apply"
- "I am passionate about"
- "thrilled"
- "AI-first"
- "growth mindset"
- "culture-driving"
- "engineering velocity"
- "multiply impact"
- "proven track record"
- consultant-style phrasing
- motivational language
- LinkedIn-style wording

Narrative arc:
1. Show you understand what this role needs.
2. Explain the strongest relevant evidence, focusing on what changed or improved.
3. Explain why this company/role fits, then close with a simple conversation-oriented sentence.

Recruiter readability:
- Assume the reader scans in 30 seconds.
- Every paragraph must answer: "Why should we interview this person?"
- Maximum 2–4 technologies per paragraph.
- One main idea per paragraph.

Before returning the final JSON, silently check:
- no banned phrases appear
- no paragraph lists more than 4 technologies
- every paragraph has a clear hiring reason
- no unsupported facts were introduced
- the tone sounds like a senior engineer, not marketing copy

Return only valid JSON.
No Markdown.
No comments.
No explanation.`;

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
