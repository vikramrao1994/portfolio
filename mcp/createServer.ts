import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import type { OutputMode } from "@/lib/application-documents/shared/applicationDocumentMcpOutput";
import { analyzeJobDescription } from "@mcp/tools/analyzeJobDescription";
import { generateCoverLetterPdf } from "@mcp/tools/generateCoverLetterPdf";
import { generateCoverLetterPrompt } from "@mcp/tools/generateCoverLetterPrompt";
import { generateTailoredCvPdf } from "@mcp/tools/generateTailoredCvPdf";
import { matchCandidateEvidence } from "@mcp/tools/matchCandidateEvidence";
import { renderCoverLetterPdf } from "@mcp/tools/renderCoverLetterPdf";

const TOOL_DEFINITIONS = [
  {
    name: "analyze_job_description",
    description:
      "Extract and categorize hard skills, soft skills, domains, seniority, work mode, and language signals from a job description using deterministic keyword analysis.",
    inputSchema: {
      type: "object" as const,
      properties: {
        jobDescription: { type: "string", description: "The full job description text (50–20000 chars)" },
        language: { type: "string", enum: ["en", "de"], description: "Language of the job posting" },
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
        jobDescription: { type: "string", description: "The full job description text (50–20000 chars)" },
        language: { type: "string", enum: ["en", "de"], description: "Language for portfolio data retrieval" },
      },
      required: ["jobDescription", "language"],
    },
  },
  {
    name: "generate_cover_letter_prompt",
    description:
      "Generate a human-readable Markdown context document for reviewing cover letter generation inputs. Includes keyword analysis, ranked candidate evidence, and full candidate profile. Useful for inspecting what data would be sent before committing to a full generation. Does NOT call Claude. Note: this is NOT the internal prompt Claude receives during generation — that is a structured =SECTION= format built separately inside generate_cover_letter_pdf.",
    inputSchema: {
      type: "object" as const,
      properties: {
        jobDescription: { type: "string", description: "The full job description text (50–20000 chars)" },
        language: { type: "string", enum: ["en", "de"], description: "Target language of the cover letter" },
        companyName: { type: "string", description: "Optional company name to personalise the prompt" },
        jobTitle: { type: "string", description: "Optional job title to personalise the prompt" },
      },
      required: ["jobDescription", "language"],
    },
  },
  {
    name: "generate_cover_letter_pdf",
    description:
      "One-shot: generate a complete cover letter PDF from a job description. Runs the full pipeline — keyword extraction, candidate evidence scoring, Claude generation, and ReportLab PDF rendering — in a single call. Requires ANTHROPIC_API_KEY. Local stdio: returns pdfPath (file saved to ~/Downloads). Remote HTTP: returns base64-encoded PDF content (no file written to disk).",
    inputSchema: {
      type: "object" as const,
      properties: {
        jobDescription: { type: "string", description: "The full job description text (50–20000 chars)" },
        language: { type: "string", enum: ["en", "de"], description: "Target language for the cover letter" },
        companyName: { type: "string", description: "Optional company name" },
        jobTitle: { type: "string", description: "Optional job title" },
        recruiterName: { type: "string", description: "Optional recruiter or contact name" },
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
    name: "generate_tailored_cv_pdf",
    description:
      "Generate a tailored CV PDF from a job description by customizing only the CV headline and executive summary, using existing validated CV-tailor services and the ReportLab CV renderer. Work experience, education, skills, dates, job titles, and employer names are not modified. Canonical CV data in the database is not overwritten. Requires ANTHROPIC_API_KEY. Local stdio: returns pdfPath (file saved to ~/Downloads). Remote HTTP: returns base64-encoded PDF content (no file written to disk).",
    inputSchema: {
      type: "object" as const,
      properties: {
        jobDescription: { type: "string", description: "The full job description text (100–20000 chars)" },
        language: { type: "string", enum: ["en", "de"], description: "Language for the tailored CV" },
        companyName: { type: "string", description: "Optional company name for the role" },
        jobTitle: { type: "string", description: "Optional job title for the role" },
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
      "Render a validated cover letter JSON to a PDF using the ReportLab renderer. Local stdio: returns pdfPath (file saved to ~/Downloads). Remote HTTP: returns base64-encoded PDF content (no file written to disk).",
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
];

/**
 * Creates a fully-configured MCP Server with all tools registered.
 * Does not connect to any transport — the caller is responsible for that.
 * Used by both the local stdio server (mcp/server.ts) and the remote HTTP endpoint
 * (src/app/api/mcp/route.ts).
 *
 * outputMode controls PDF delivery:
 *   "local-file"    → PDFs saved to ~/Downloads; response includes pdfPath
 *   "remote-base64" → PDFs returned as base64 content; no file written to disk
 */
export function createMcpServer(outputMode: OutputMode): Server {
  const server = new Server(
    { name: "cover-letter", version: "1.0.0" },
    { capabilities: { tools: {} } },
  );

  server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools: TOOL_DEFINITIONS }));

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
        return generateCoverLetterPdf(args, outputMode);
      case "generate_tailored_cv_pdf":
        return generateTailoredCvPdf(args, outputMode);
      case "render_cover_letter_pdf":
        return renderCoverLetterPdf(args, outputMode);
      default:
        return {
          content: [{ type: "text" as const, text: JSON.stringify({ error: `Unknown tool: ${name}` }) }],
          isError: true,
        };
    }
  });

  return server;
}
