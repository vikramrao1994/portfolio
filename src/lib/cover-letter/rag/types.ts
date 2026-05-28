export type CandidateChunk = {
  id: string;
  type: "experience" | "skill" | "education" | "summary" | "project";
  language: "en" | "de";
  title: string;
  text: string;
  metadata?: {
    sourceId?: string;
    company?: string;
    skills?: string[];
    tags?: string[];
    dateRange?: string;
  };
};

export type RetrievedCandidateChunk = {
  chunk: CandidateChunk;
  score: number;
  matchedKeywords: string[];
  matchedTerms: string[];
  reason: string;
};

export type EvidencePackItem = {
  title: string;
  type: CandidateChunk["type"];
  score: number;
  matchedKeywords: string[];
  matchedTerms: string[];
  reason: string;
  content: string;
  metadata?: CandidateChunk["metadata"];
};
