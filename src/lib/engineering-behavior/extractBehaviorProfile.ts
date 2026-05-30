import { getWriteDb } from "@/server/db";
import type { LoadedPdfDocument } from "./generateBehaviorProfileWithClaude";
import { generateBehaviorProfileWithClaude } from "./generateBehaviorProfileWithClaude";
import { loadDocumentsForExtraction } from "./loadDocumentsForExtraction";
import { buildEngineeringProfile } from "./profile/buildEngineeringProfile";
import type { EngineeringProfile } from "./profile/schema";
import type { EngineeringBehaviorProfile } from "./schema";

async function fetchPdfAsBase64(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buffer = await res.arrayBuffer();
  return Buffer.from(buffer).toString("base64");
}

export interface ExtractionResult {
  profile: EngineeringBehaviorProfile;
  engineeringProfile: EngineeringProfile;
  documentsProcessed: number;
  documentsSkipped: number;
}

export async function extractBehaviorProfile(): Promise<ExtractionResult> {
  const { pdfDocuments, linkedInRecommendations } = loadDocumentsForExtraction();

  if (pdfDocuments.length === 0 && linkedInRecommendations.length === 0) {
    throw new Error("No documents found in the database for extraction");
  }

  const loadedPdfs: LoadedPdfDocument[] = [];
  let skipped = 0;

  for (const doc of pdfDocuments) {
    try {
      const base64 = await fetchPdfAsBase64(doc.certificateUrl);
      loadedPdfs.push({ label: doc.company, base64 });
    } catch {
      skipped++;
    }
  }

  if (loadedPdfs.length === 0 && linkedInRecommendations.length === 0) {
    throw new Error("All document fetches failed — no content to extract from");
  }

  const partialProfile = await generateBehaviorProfileWithClaude(
    loadedPdfs,
    linkedInRecommendations,
  );

  const profile: EngineeringBehaviorProfile = {
    ...partialProfile,
    extractedAt: new Date().toISOString(),
  };

  const engineeringProfile = buildEngineeringProfile(profile);

  const db = getWriteDb();
  const stmt = db.prepare(
    "INSERT OR REPLACE INTO engineering_behavior_profile (id, profile_json, engineering_profile_json, created_at) VALUES (1, ?, ?, ?)",
  );
  stmt.run(JSON.stringify(profile), JSON.stringify(engineeringProfile), profile.extractedAt);

  return {
    profile,
    engineeringProfile,
    documentsProcessed: loadedPdfs.length + linkedInRecommendations.length,
    documentsSkipped: skipped,
  };
}
