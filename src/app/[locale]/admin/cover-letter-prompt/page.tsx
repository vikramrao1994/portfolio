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
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setError(null);
    setSuccess(false);
  }

  async function handleDownload() {
    if (form.jobDescription.trim().length < 100) {
      setError("Job description must be at least 100 characters.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/admin/cover-letter-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobDescription: form.jobDescription,
          language: form.language,
          companyName: form.companyName || undefined,
          jobTitle: form.jobTitle || undefined,
          recruiterName: form.recruiterName || undefined,
          tone: form.tone,
          includeFullCandidateData: form.includeFullCandidateData,
        }),
      });

      if (res.status === 401) {
        setError("Not authenticated. Please log in again.");
        return;
      }
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Generation failed. Please try again.");
        return;
      }

      const blob = await res.blob();
      const disposition = res.headers.get("Content-Disposition") ?? "";
      const filenameMatch = disposition.match(/filename="([^"]+)"/);
      const filename = filenameMatch?.[1] ?? "cover-letter-prompt.md";

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setSuccess(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Grid.Root>
      <Grid.Row>
        <Grid.Column>
          <AdminCard
            id="cover-letter-prompt"
            title="Cover Letter Prompt Generator"
            ariaLabel="Cover Letter Prompt Generator"
          >
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

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                marginBottom: spacing(2),
              }}
            >
              <Button
                type="button"
                variant="primary"
                text={isLoading ? "Generating..." : "Download Prompt (.md)"}
                disabled={isLoading || form.jobDescription.trim().length < 100}
                onClick={handleDownload}
              />
            </div>

            {success && (
              <Body style={{ color: "green", marginTop: spacing(2), marginBottom: spacing(2) }}>
                Prompt downloaded successfully.
              </Body>
            )}
            {error && (
              <Body style={{ color: "red", marginTop: spacing(2), marginBottom: spacing(2) }}>
                Error: {error}
              </Body>
            )}
          </AdminCard>
        </Grid.Column>
      </Grid.Row>
    </Grid.Root>
  );
}
