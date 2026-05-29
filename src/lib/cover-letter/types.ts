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
  type: "experience" | "skill" | "education" | "executive_summary" | "project";
  score: number;
  matchedKeywords: string[];
  reason: string;
  content: string;
}
