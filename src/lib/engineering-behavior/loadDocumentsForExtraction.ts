import { getDb } from "@/server/db";

export interface PdfDocumentRecord {
  company: string;
  certificateUrl: string;
}

export interface LinkedInRecommendationRecord {
  id: number;
  authorName: string | null;
  authorRole: string | null;
  company: string | null;
  relationship: string | null;
  recommendationText: string;
}

export interface DocumentSources {
  pdfDocuments: PdfDocumentRecord[];
  linkedInRecommendations: LinkedInRecommendationRecord[];
}

export function loadDocumentsForExtraction(): DocumentSources {
  const db = getDb();

  const pdfRows = db
    .query(
      `SELECT company, certificate
       FROM experience
       WHERE certificate IS NOT NULL AND certificate != ''
       ORDER BY sort_order ASC`,
    )
    .all() as { company: string; certificate: string }[];

  const recRows = db
    .query(
      `SELECT id, author_name, author_role, company, relationship, recommendation_text
       FROM linkedin_recommendation
       ORDER BY created_at ASC`,
    )
    .all() as {
    id: number;
    author_name: string | null;
    author_role: string | null;
    company: string | null;
    relationship: string | null;
    recommendation_text: string;
  }[];

  return {
    pdfDocuments: pdfRows.map((r) => ({
      company: r.company,
      certificateUrl: r.certificate,
    })),
    linkedInRecommendations: recRows.map((r) => ({
      id: r.id,
      authorName: r.author_name,
      authorRole: r.author_role,
      company: r.company,
      relationship: r.relationship,
      recommendationText: r.recommendation_text,
    })),
  };
}
