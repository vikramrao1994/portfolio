import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { analyzeJobDescription } from "./tools/analyzeJobDescription";
import { generateCoverLetterPdf } from "./tools/generateCoverLetterPdf";
import { generateCoverLetterPrompt } from "./tools/generateCoverLetterPrompt";
import { matchCandidateEvidence } from "./tools/matchCandidateEvidence";
import { renderCoverLetterPdf } from "./tools/renderCoverLetterPdf";

const server = new Server(
  { name: "cover-letter", version: "1.0.0" },
  { capabilities: { tools: {} } },
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "analyze_job_description",
      description:
        "Extract and categorize hard skills, soft skills, domains, seniority, work mode, and language signals from a job description using deterministic keyword analysis.",
      inputSchema: {
        type: "object" as const,
        properties: {
          jobDescription: {
            type: "string",
            description: "The full job description text (50–20000 chars)",
          },
          language: {
            type: "string",
            enum: ["en", "de"],
            description: "Language of the job posting",
          },
        },
        required: ["jobDescription", "language"],
      },
    },
    {
      name: "match_candidate_evidence",
      description:
        "Score and rank candidate portfolio evidence (experience, skills, education, executive summary) against a job description using deterministic keyword matching.",
      inputSchema: {
        type: "object" as const,
        properties: {
          jobDescription: {
            type: "string",
            description: "The full job description text (50–20000 chars)",
          },
          language: {
            type: "string",
            enum: ["en", "de"],
            description: "Language for portfolio data retrieval",
          },
        },
        required: ["jobDescription", "language"],
      },
    },
    {
      name: "generate_cover_letter_prompt",
      description:
        "Generate a detailed Markdown prompt for LLM-based cover letter writing. Includes keyword analysis, ranked candidate evidence, and full candidate profile. Does NOT call Claude — returns the prompt only.",
      inputSchema: {
        type: "object" as const,
        properties: {
          jobDescription: {
            type: "string",
            description: "The full job description text (50–20000 chars)",
          },
          language: {
            type: "string",
            enum: ["en", "de"],
            description: "Target language of the cover letter",
          },
          companyName: {
            type: "string",
            description: "Optional company name to personalise the prompt",
          },
          jobTitle: {
            type: "string",
            description: "Optional job title to personalise the prompt",
          },
        },
        required: ["jobDescription", "language"],
      },
    },
    {
      name: "generate_cover_letter_pdf",
      description:
        "One-shot: generate a complete cover letter PDF from a job description. Runs the full pipeline — keyword extraction, candidate evidence scoring, Claude generation, and ReportLab PDF rendering — in a single call. Requires ANTHROPIC_API_KEY.",
      inputSchema: {
        type: "object" as const,
        properties: {
          jobDescription: {
            type: "string",
            description: "The full job description text (50–20000 chars)",
          },
          language: {
            type: "string",
            enum: ["en", "de"],
            description: "Target language for the cover letter",
          },
          companyName: {
            type: "string",
            description: "Optional company name",
          },
          jobTitle: {
            type: "string",
            description: "Optional job title",
          },
          recruiterName: {
            type: "string",
            description: "Optional recruiter or contact name",
          },
          tone: {
            type: "string",
            enum: ["professional", "warm", "direct", "modern"],
            description: "Writing tone — defaults to professional",
          },
        },
        required: ["jobDescription", "language"],
      },
    },
    {
      name: "render_cover_letter_pdf",
      description:
        "Render a validated cover letter JSON to a PDF using the ReportLab renderer. Returns the absolute path to the generated PDF file.",
      inputSchema: {
        type: "object" as const,
        properties: {
          coverLetter: {
            type: "object",
            description: "Validated cover letter content",
            properties: {
              language: { type: "string", enum: ["en", "de"] },
              recipient: {
                type: "object",
                properties: {
                  companyName: { type: "string" },
                  contactName: { type: "string" },
                  addressLines: { type: "array", items: { type: "string" }, maxItems: 5 },
                },
              },
              subject: { type: "string", minLength: 5, maxLength: 160 },
              salutation: { type: "string", minLength: 2, maxLength: 120 },
              paragraphs: {
                type: "array",
                items: { type: "string", minLength: 40, maxLength: 1500 },
                minItems: 3,
                maxItems: 5,
              },
              closing: { type: "string", minLength: 2, maxLength: 120 },
              signatureName: { type: "string", minLength: 2, maxLength: 120 },
            },
            required: ["language", "recipient", "subject", "salutation", "paragraphs", "closing", "signatureName"],
          },
        },
        required: ["coverLetter"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  console.error(`[cover-letter MCP] tool called: ${name}`);

  switch (name) {
    case "analyze_job_description":
      return analyzeJobDescription(args);
    case "match_candidate_evidence":
      return matchCandidateEvidence(args);
    case "generate_cover_letter_prompt":
      return generateCoverLetterPrompt(args);
    case "generate_cover_letter_pdf":
      return generateCoverLetterPdf(args);
    case "render_cover_letter_pdf":
      return renderCoverLetterPdf(args);
    default:
      return {
        content: [{ type: "text" as const, text: JSON.stringify({ error: `Unknown tool: ${name}` }) }],
        isError: true,
      };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[cover-letter MCP] Server running on stdio");
}

main().catch((err) => {
  console.error("[cover-letter MCP] Fatal error:", err);
  process.exit(1);
});
