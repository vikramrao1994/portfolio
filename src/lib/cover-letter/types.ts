export interface ExtractedKeywords {
  hardSkills: string[];
  softSkills: string[];
  domains: string[];
  seniority: string[];
  workMode: string[];
  languages: string[];
}

export interface EvidenceItem {
  title: string;
  type: "experience" | "skill" | "education" | "executive_summary";
  score: number;
  matchedKeywords: string[];
  reason: string;
  content: string;
}

export interface CoverLetterPromptRequest {
  jobDescription: string;
  language: "en" | "de";
  companyName?: string;
  jobTitle?: string;
  recruiterName?: string;
  tone: "professional" | "warm" | "direct" | "modern";
  includeFullCandidateData: boolean;
}
