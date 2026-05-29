"use client";

import {
  Body,
  Button,
  CheckboxInput,
  Grid,
  Heading,
  SelectInput,
  TextareaInput,
  TextInput,
} from "@publicplan/kern-react-kit";
import { useState } from "react";
import AdminCard from "@/components/Admin/Card/AdminCard";
import type { CoverLetterContent } from "@/lib/cover-letter/coverLetterContentSchema";
import { spacing } from "@/utils/utils";

type Tone = "professional" | "warm" | "direct" | "modern";
type Language = "en" | "de";

interface FormState {
  jobDescription: string;
  language: Language;
  companyName: string;
  jobTitle: string;
  recruiterName: string;
  tone: Tone;
  includeFullCandidateData: boolean;
}

interface GenerateResult {
  coverLetter: CoverLetterContent;
  model: string;
  usage: {
    input_tokens: number | undefined;
    output_tokens: number | undefined;
  };
}

const DEFAULT: FormState = {
  jobDescription: "",
  language: "en",
  companyName: "",
  jobTitle: "",
  recruiterName: "",
  tone: "professional",
  includeFullCandidateData: true,
};

const TONE_OPTIONS = [
  { value: "professional", label: "Professional" },
  { value: "warm", label: "Warm" },
  { value: "direct", label: "Direct" },
  { value: "modern", label: "Modern" },
];

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "de", label: "German" },
];

export default function CoverLetterPromptPage() {
  const [form, setForm] = useState<FormState>(DEFAULT);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState<string | null>(null);
  const [generatedData, setGeneratedData] = useState<GenerateResult | null>(null);
  const [copied, setCopied] = useState<"json" | "text" | null>(null);

  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);

  const [isTailoredCvGenerating, setIsTailoredCvGenerating] = useState(false);
  const [tailoredCvError, setTailoredCvError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setGenerateError(null);
  }

  function buildRequestBody() {
    return {
      jobDescription: form.jobDescription,
      language: form.language,
      companyName: form.companyName || undefined,
      jobTitle: form.jobTitle || undefined,
      recruiterName: form.recruiterName || undefined,
      tone: form.tone,
      includeFullCandidateData: form.includeFullCandidateData,
    };
  }

  async function handleGenerate() {
    if (form.jobDescription.trim().length < 100) {
      setGenerateError("Job description must be at least 100 characters.");
      return;
    }

    setIsGenerating(true);
    setGenerateError(null);
    setGeneratedData(null);

    try {
      const res = await fetch("/api/admin/cover-letter-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildRequestBody()),
      });

      if (res.status === 401) {
        setGenerateError("Not authenticated. Please log in again.");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setGenerateError(data.error ?? "Claude generation failed. Please try again.");
        return;
      }

      const data: GenerateResult = await res.json();
      setGeneratedData(data);
    } catch {
      setGenerateError("Network error. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleCopyJson() {
    if (!generatedData) return;
    await navigator.clipboard.writeText(JSON.stringify(generatedData.coverLetter, null, 2));
    setCopied("json");
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleDownloadPdf() {
    if (!generatedData) return;

    setIsDownloadingPdf(true);
    setPdfError(null);

    try {
      const res = await fetch("/api/admin/cover-letter-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(generatedData.coverLetter),
      });

      if (res.status === 401) {
        setPdfError("Not authenticated. Please log in again.");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const detail = data.detail ? ` — ${data.detail}` : "";
        setPdfError((data.error ?? "PDF generation failed") + detail);
        return;
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const filenameMatch = disposition.match(/filename="([^"]+)"/);
      const filename = filenameMatch?.[1] ?? "cover-letter.pdf";

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setPdfError("Network error. Please try again.");
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  async function handleCopyText() {
    if (!generatedData) return;
    const cl = generatedData.coverLetter;
    const text = [
      cl.subject,
      "",
      cl.salutation,
      "",
      ...cl.paragraphs,
      "",
      cl.closing,
      cl.signatureName,
    ].join("\n");
    await navigator.clipboard.writeText(text);
    setCopied("text");
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleGenerateTailoredCv() {
    if (form.jobDescription.trim().length < 100) {
      setTailoredCvError("Job description must be at least 100 characters.");
      return;
    }

    setIsTailoredCvGenerating(true);
    setTailoredCvError(null);

    try {
      const res = await fetch("/api/admin/application-documents/tailored-cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: form.jobDescription,
          language: form.language,
          companyName: form.companyName || undefined,
          jobTitle: form.jobTitle || undefined,
        }),
      });

      if (res.status === 401) {
        setTailoredCvError("Not authenticated. Please log in again.");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        const detail = data.detail ? ` — ${data.detail}` : "";
        setTailoredCvError((data.error ?? "Tailored CV generation failed") + detail);
        return;
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const filenameMatch = disposition.match(/filename="([^"]+)"/);
      const filename = filenameMatch?.[1] ?? "tailored-cv.pdf";

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setTailoredCvError("Network error. Please try again.");
    } finally {
      setIsTailoredCvGenerating(false);
    }
  }

  const jobDescriptionValid = form.jobDescription.trim().length >= 100;

  return (
    <Grid.Root>
      <Grid.Row>
        <Grid.Column>
          <AdminCard
            id="cover-letter-prompt"
            title="Cover Letter Prompt Generator"
            ariaLabel="Cover Letter Prompt Generator"
          >
            {/* ── Job Details ── */}
            <div style={{ marginBottom: spacing(3) }}>
              <Heading
                type="small"
                headerElement="h3"
                title="Job Details"
                style={{ marginBottom: spacing(2) }}
              />
              <TextInput
                id="companyName"
                label="Company Name (optional)"
                value={form.companyName}
                onChange={(e) => update("companyName", e.target.value)}
                style={{ marginBottom: spacing(2) }}
              />
              <TextInput
                id="jobTitle"
                label="Job Title (optional)"
                value={form.jobTitle}
                onChange={(e) => update("jobTitle", e.target.value)}
                style={{ marginBottom: spacing(2) }}
              />
              <TextInput
                id="recruiterName"
                label="Recruiter / Contact Name (optional)"
                value={form.recruiterName}
                onChange={(e) => update("recruiterName", e.target.value)}
                style={{ marginBottom: spacing(2) }}
              />
            </div>

            {/* ── Generation Options ── */}
            <div style={{ marginBottom: spacing(3) }}>
              <Heading
                type="small"
                headerElement="h3"
                title="Generation Options"
                style={{ marginBottom: spacing(2) }}
              />
              <SelectInput
                id="language"
                label="Output Language"
                value={form.language}
                options={LANGUAGE_OPTIONS}
                onChange={(e) => update("language", e.target.value as Language)}
              />
              <SelectInput
                id="tone"
                label="Tone"
                value={form.tone}
                options={TONE_OPTIONS}
                onChange={(e) => update("tone", e.target.value as Tone)}
              />
              <CheckboxInput
                id="includeFullCandidateData"
                label="Include full candidate profile in prompt"
                checked={form.includeFullCandidateData}
                onChange={(e) => update("includeFullCandidateData", e.target.checked)}
                style={{ marginTop: spacing(2) }}
              />
            </div>

            {/* ── Job Description ── */}
            <div style={{ marginBottom: spacing(3) }}>
              <Heading
                type="small"
                headerElement="h3"
                title="Job Description"
                style={{ marginBottom: spacing(2) }}
              />
              <TextareaInput
                id="jobDescription"
                label="Paste the full job description here (min. 100 characters)"
                value={form.jobDescription}
                onChange={(e) => update("jobDescription", e.target.value)}
                rows={30}
                style={{ marginBottom: spacing(1) }}
              />
              <Body style={{ color: "#666", fontSize: "0.85em" }}>
                {form.jobDescription.length} / 20,000 characters
              </Body>
            </div>

            {/* ── Actions ── */}
            <div
              style={{
                display: "flex",
                gap: spacing(2),
                justifyContent: "flex-end",
                marginBottom: spacing(2),
                flexWrap: "wrap",
              }}
            >
              <Button
                type="button"
                variant="primary"
                text={isGenerating ? "Generating..." : "Generate Letter JSON"}
                disabled={isGenerating || !jobDescriptionValid}
                onClick={handleGenerate}
              />
            </div>

            {generateError && (
              <Body style={{ color: "red", marginTop: spacing(2), marginBottom: spacing(2) }}>
                Claude generation failed: {generateError}
              </Body>
            )}
          </AdminCard>
        </Grid.Column>
      </Grid.Row>

      {/* ── Tailored CV ── */}
      <Grid.Row>
        <Grid.Column>
          <AdminCard id="tailored-cv" title="Tailored CV" ariaLabel="Tailored CV">
            <Body style={{ color: "#666", marginBottom: spacing(2) }}>
              Generates a CV PDF with a tailored headline and executive summary based on the job
              description above. Work experience, education, skills, and all other data remain
              unchanged. The canonical CV in the database is not modified.
            </Body>

            <div
              style={{
                display: "flex",
                gap: spacing(2),
                justifyContent: "flex-end",
                marginBottom: spacing(2),
                flexWrap: "wrap",
              }}
            >
              <Button
                type="button"
                variant="primary"
                text={isTailoredCvGenerating ? "Generating CV..." : "Generate Tailored CV"}
                disabled={isTailoredCvGenerating || !jobDescriptionValid}
                onClick={handleGenerateTailoredCv}
              />
            </div>

            {tailoredCvError && (
              <Body style={{ color: "red", marginTop: spacing(1) }}>
                Tailored CV error: {tailoredCvError}
              </Body>
            )}
          </AdminCard>
        </Grid.Column>
      </Grid.Row>

      {/* ── Generated Letter JSON Preview ── */}
      {generatedData && (
        <Grid.Row>
          <Grid.Column>
            <AdminCard
              id="cover-letter-result"
              title="Generated Letter JSON"
              ariaLabel="Generated Letter JSON"
            >
              <div style={{ marginBottom: spacing(2) }}>
                <Body style={{ color: "#666", fontSize: "0.85em" }}>
                  Model: {generatedData.model} · Input tokens:{" "}
                  {generatedData.usage.input_tokens ?? "—"} · Output tokens:{" "}
                  {generatedData.usage.output_tokens ?? "—"}
                </Body>
              </div>

              {/* Structured preview */}
              <div style={{ marginBottom: spacing(3) }}>
                <Heading
                  type="small"
                  headerElement="h3"
                  title="Subject"
                  style={{ marginBottom: spacing(1) }}
                />
                <Body>{generatedData.coverLetter.subject}</Body>
              </div>

              <div style={{ marginBottom: spacing(3) }}>
                <Heading
                  type="small"
                  headerElement="h3"
                  title="Salutation"
                  style={{ marginBottom: spacing(1) }}
                />
                <Body>{generatedData.coverLetter.salutation}</Body>
              </div>

              <div style={{ marginBottom: spacing(3) }}>
                <Heading
                  type="small"
                  headerElement="h3"
                  title="Paragraphs"
                  style={{ marginBottom: spacing(1) }}
                />
                {generatedData.coverLetter.paragraphs.map((p) => (
                  <Body
                    key={p.slice(0, 40)}
                    style={{ marginBottom: spacing(2), whiteSpace: "pre-wrap" }}
                  >
                    {p}
                  </Body>
                ))}
              </div>

              <div style={{ marginBottom: spacing(3) }}>
                <Heading
                  type="small"
                  headerElement="h3"
                  title="Closing"
                  style={{ marginBottom: spacing(1) }}
                />
                <Body>{generatedData.coverLetter.closing}</Body>
              </div>

              <div style={{ marginBottom: spacing(3) }}>
                <Heading
                  type="small"
                  headerElement="h3"
                  title="Signature"
                  style={{ marginBottom: spacing(1) }}
                />
                <Body>{generatedData.coverLetter.signatureName}</Body>
              </div>
              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  gap: spacing(2),
                  flexWrap: "wrap",
                  marginBottom: spacing(2),
                }}
              >
                <Button
                  type="button"
                  variant="primary"
                  text={isDownloadingPdf ? "Generating PDF..." : "Download PDF"}
                  disabled={isDownloadingPdf}
                  onClick={handleDownloadPdf}
                />
                <Button
                  type="button"
                  variant="secondary"
                  text={copied === "json" ? "Copied!" : "Copy JSON"}
                  onClick={handleCopyJson}
                />
                <Button
                  type="button"
                  variant="secondary"
                  text={copied === "text" ? "Copied!" : "Copy Letter Text"}
                  onClick={handleCopyText}
                />
              </div>
              {pdfError && (
                <Body style={{ color: "red", marginTop: spacing(1) }}>PDF error: {pdfError}</Body>
              )}
            </AdminCard>
          </Grid.Column>
        </Grid.Row>
      )}
    </Grid.Root>
  );
}
