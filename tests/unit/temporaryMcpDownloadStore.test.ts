import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, test } from "bun:test";
import {
  cleanupExpiredMcpDownloads,
  consumeTemporaryMcpDownload,
  createTemporaryMcpDownload,
} from "@/lib/application-documents/shared/temporaryMcpDownloadStore";

const TOKEN_REGEX = /^[0-9a-f]{64}$/;

let testDir: string;

beforeEach(async () => {
  testDir = await fs.mkdtemp(path.join(os.tmpdir(), "mcp-dl-test-"));
});

afterEach(async () => {
  await fs.rm(testDir, { recursive: true, force: true });
});

describe("createTemporaryMcpDownload", () => {
  test("returns a 64-char hex token", async () => {
    const buffer = Buffer.from("pdf-content");
    const { token } = await createTemporaryMcpDownload({
      filename: "test.pdf",
      mimeType: "application/pdf",
      buffer,
      _baseDir: testDir,
    });
    expect(TOKEN_REGEX.test(token)).toBe(true);
  });

  test("creates a metadata JSON file", async () => {
    const buffer = Buffer.from("pdf-content");
    const { token } = await createTemporaryMcpDownload({
      filename: "test.pdf",
      mimeType: "application/pdf",
      buffer,
      _baseDir: testDir,
    });
    const metaFile = path.join(testDir, `${token}.json`);
    const stat = await fs.stat(metaFile);
    expect(stat.isFile()).toBe(true);
  });

  test("creates a PDF file", async () => {
    const buffer = Buffer.from("pdf-bytes");
    const { token } = await createTemporaryMcpDownload({
      filename: "test.pdf",
      mimeType: "application/pdf",
      buffer,
      _baseDir: testDir,
    });
    const pdfFile = path.join(testDir, `${token}.pdf`);
    const stat = await fs.stat(pdfFile);
    expect(stat.isFile()).toBe(true);
  });

  test("downloadPath points to the PDF file", async () => {
    const buffer = Buffer.from("pdf-bytes");
    const { token, downloadPath } = await createTemporaryMcpDownload({
      filename: "test.pdf",
      mimeType: "application/pdf",
      buffer,
      _baseDir: testDir,
    });
    expect(downloadPath).toBe(path.join(testDir, `${token}.pdf`));
  });

  test("expiresAt is an ISO string in the future", async () => {
    const buffer = Buffer.from("pdf-bytes");
    const before = new Date();
    const { expiresAt } = await createTemporaryMcpDownload({
      filename: "test.pdf",
      mimeType: "application/pdf",
      buffer,
      _baseDir: testDir,
    });
    expect(new Date(expiresAt) > before).toBe(true);
  });
});

describe("consumeTemporaryMcpDownload", () => {
  test("returns filename, mimeType, and buffer matching original", async () => {
    const original = Buffer.from("hello pdf");
    const { token } = await createTemporaryMcpDownload({
      filename: "result.pdf",
      mimeType: "application/pdf",
      buffer: original,
      _baseDir: testDir,
    });

    const result = await consumeTemporaryMcpDownload(token, { _baseDir: testDir });
    expect(result).not.toBeNull();
    expect(result!.filename).toBe("result.pdf");
    expect(result!.mimeType).toBe("application/pdf");
    expect(result!.buffer.toString()).toBe("hello pdf");
  });

  test("deletes both files after successful consume", async () => {
    const { token } = await createTemporaryMcpDownload({
      filename: "once.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("data"),
      _baseDir: testDir,
    });

    await consumeTemporaryMcpDownload(token, { _baseDir: testDir });

    const metaExists = await fs
      .stat(path.join(testDir, `${token}.json`))
      .then(() => true)
      .catch(() => false);
    const pdfExists = await fs
      .stat(path.join(testDir, `${token}.pdf`))
      .then(() => true)
      .catch(() => false);

    expect(metaExists).toBe(false);
    expect(pdfExists).toBe(false);
  });

  test("second consume of same token returns null", async () => {
    const { token } = await createTemporaryMcpDownload({
      filename: "once.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("data"),
      _baseDir: testDir,
    });

    await consumeTemporaryMcpDownload(token, { _baseDir: testDir });
    const second = await consumeTemporaryMcpDownload(token, { _baseDir: testDir });
    expect(second).toBeNull();
  });

  test("malformed token returns null immediately", async () => {
    const result = await consumeTemporaryMcpDownload("not-a-valid-token", { _baseDir: testDir });
    expect(result).toBeNull();
  });

  test("non-existent valid-format token returns null", async () => {
    const fakeToken = "a".repeat(64);
    const result = await consumeTemporaryMcpDownload(fakeToken, { _baseDir: testDir });
    expect(result).toBeNull();
  });

  test("expired token returns null and removes files", async () => {
    const { token } = await createTemporaryMcpDownload({
      filename: "expired.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("data"),
      ttlSeconds: -1,
      _baseDir: testDir,
    });

    const result = await consumeTemporaryMcpDownload(token, { _baseDir: testDir });
    expect(result).toBeNull();

    const metaExists = await fs
      .stat(path.join(testDir, `${token}.json`))
      .then(() => true)
      .catch(() => false);
    expect(metaExists).toBe(false);
  });
});

describe("cleanupExpiredMcpDownloads", () => {
  test("removes expired meta and PDF files", async () => {
    const { token } = await createTemporaryMcpDownload({
      filename: "cleanup.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("data"),
      ttlSeconds: -1,
      _baseDir: testDir,
    });

    await cleanupExpiredMcpDownloads({ _baseDir: testDir });

    const metaExists = await fs
      .stat(path.join(testDir, `${token}.json`))
      .then(() => true)
      .catch(() => false);
    const pdfExists = await fs
      .stat(path.join(testDir, `${token}.pdf`))
      .then(() => true)
      .catch(() => false);

    expect(metaExists).toBe(false);
    expect(pdfExists).toBe(false);
  });

  test("does not remove non-expired files", async () => {
    const { token } = await createTemporaryMcpDownload({
      filename: "keep.pdf",
      mimeType: "application/pdf",
      buffer: Buffer.from("data"),
      ttlSeconds: 3600,
      _baseDir: testDir,
    });

    await cleanupExpiredMcpDownloads({ _baseDir: testDir });

    const metaExists = await fs
      .stat(path.join(testDir, `${token}.json`))
      .then(() => true)
      .catch(() => false);
    expect(metaExists).toBe(true);
  });

  test("is safe on empty/nonexistent directory", async () => {
    const emptyDir = path.join(os.tmpdir(), "mcp-dl-nonexistent-" + Date.now());
    await expect(cleanupExpiredMcpDownloads({ _baseDir: emptyDir })).resolves.toBeUndefined();
  });
});
