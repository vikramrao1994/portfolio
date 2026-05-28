import type { Site } from "@/lib/siteSchema";
import type { CoverLetterContent } from "./coverLetterContentSchema";
import { getLang } from "./utils";

export type CoverLetterPdfPayload = {
  language: "en" | "de";
  sender: {
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
  };
  recipient: {
    companyName?: string;
    contactName?: string;
    addressLines?: string[];
  };
  date: string;
  subject: string;
  salutation: string;
  paragraphs: string[];
  closing: string;
  signatureName: string;
};

function formatDate(lang: "en" | "de"): string {
  const now = new Date();
  if (lang === "de") {
    const day = String(now.getDate()).padStart(2, "0");
    const month = String(now.getMonth() + 1).padStart(2, "0");
    return `${day}.${month}.${now.getFullYear()}`;
  }
  return now.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export function buildPdfPayload({
  coverLetter,
  siteContent,
}: {
  coverLetter: CoverLetterContent;
  siteContent: Site;
}): CoverLetterPdfPayload {
  const { heading } = siteContent;
  const lang = coverLetter.language;

  return {
    language: lang,
    sender: {
      name: heading.name,
      email: heading.email || undefined,
      phone: heading.phone || undefined,
      address: getLang(heading.address) || undefined,
      website: heading.website || undefined,
    },
    recipient: {
      companyName: coverLetter.recipient.companyName,
      contactName: coverLetter.recipient.contactName,
      addressLines: coverLetter.recipient.addressLines,
    },
    date: formatDate(lang),
    subject: coverLetter.subject,
    salutation: coverLetter.salutation,
    paragraphs: coverLetter.paragraphs,
    closing: coverLetter.closing,
    signatureName: coverLetter.signatureName,
  };
}
