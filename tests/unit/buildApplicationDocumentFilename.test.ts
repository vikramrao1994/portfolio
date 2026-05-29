import { describe, expect, test } from "bun:test";
import { buildApplicationDocumentFilename } from "@/lib/application-documents/shared/buildApplicationDocumentFilename";

describe("buildApplicationDocumentFilename — basic output", () => {
  test("CV EN: Vikram_Rao_Eterno_EN_CV.pdf", () => {
    expect(
      buildApplicationDocumentFilename({
        candidateName: "Vikram Rao",
        companyName: "Eterno",
        language: "en",
        documentType: "cv",
      }),
    ).toBe("Vikram_Rao_Eterno_EN_CV.pdf");
  });

  test("Cover letter EN: Vikram_Rao_Eterno_EN_COVER_LETTER.pdf", () => {
    expect(
      buildApplicationDocumentFilename({
        candidateName: "Vikram Rao",
        companyName: "Eterno",
        language: "en",
        documentType: "cover-letter",
      }),
    ).toBe("Vikram_Rao_Eterno_EN_COVER_LETTER.pdf");
  });

  test("CV DE without company: Vikram_Rao_Application_DE_CV.pdf", () => {
    expect(
      buildApplicationDocumentFilename({
        candidateName: "Vikram Rao",
        language: "de",
        documentType: "cv",
      }),
    ).toBe("Vikram_Rao_Application_DE_CV.pdf");
  });

  test("language is uppercased in filename", () => {
    const filename = buildApplicationDocumentFilename({
      candidateName: "Vikram Rao",
      companyName: "Acme",
      language: "de",
      documentType: "cv",
    });
    expect(filename).toContain("_DE_");
  });
});

describe("buildApplicationDocumentFilename — company fallback", () => {
  test("missing company falls back to Application", () => {
    const filename = buildApplicationDocumentFilename({
      candidateName: "Test User",
      language: "en",
      documentType: "cv",
    });
    expect(filename).toContain("Application");
  });

  test("empty string company falls back to Application", () => {
    const filename = buildApplicationDocumentFilename({
      candidateName: "Test User",
      companyName: "",
      language: "en",
      documentType: "cv",
    });
    expect(filename).toContain("Application");
  });
});

describe("buildApplicationDocumentFilename — sanitization", () => {
  test("slashes in company name are removed", () => {
    const filename = buildApplicationDocumentFilename({
      candidateName: "Vikram Rao",
      companyName: "Acme/Corp",
      language: "en",
      documentType: "cv",
    });
    expect(filename).not.toContain("/");
  });

  test("double dots in company name are removed", () => {
    const filename = buildApplicationDocumentFilename({
      candidateName: "Vikram Rao",
      companyName: "Acme..Corp",
      language: "en",
      documentType: "cv",
    });
    expect(filename).not.toContain("..");
  });

  test("repeated underscores are collapsed to single underscore", () => {
    const filename = buildApplicationDocumentFilename({
      candidateName: "Vikram  Rao",
      companyName: "Some  Company",
      language: "en",
      documentType: "cv",
    });
    expect(filename).not.toMatch(/__/);
  });

  test("always ends with .pdf", () => {
    const filename = buildApplicationDocumentFilename({
      candidateName: "Vikram Rao",
      companyName: "Eterno",
      language: "en",
      documentType: "cv",
    });
    expect(filename).toMatch(/\.pdf$/);
  });

  test("spaces in name are replaced by underscores", () => {
    const filename = buildApplicationDocumentFilename({
      candidateName: "Vikram Rao",
      companyName: "Eterno",
      language: "en",
      documentType: "cv",
    });
    expect(filename).not.toContain(" ");
  });

  test("special chars in company name are stripped", () => {
    const filename = buildApplicationDocumentFilename({
      candidateName: "Vikram Rao",
      companyName: "Acme & Co. (GmbH)",
      language: "en",
      documentType: "cover-letter",
    });
    expect(filename).not.toContain("&");
    expect(filename).not.toContain("(");
    expect(filename).not.toContain(")");
    expect(filename).toMatch(/\.pdf$/);
  });

  test("very long company name is truncated, still a valid filename", () => {
    const filename = buildApplicationDocumentFilename({
      candidateName: "Vikram Rao",
      companyName: "A".repeat(200),
      language: "en",
      documentType: "cv",
    });
    expect(filename.length).toBeLessThan(300);
    expect(filename).toMatch(/\.pdf$/);
  });
});
