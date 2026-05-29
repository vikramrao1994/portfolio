import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const TMP_DIR = "/tmp/application-documents-downloads";
const TTL_DEFAULT_SECONDS = 600; // 10 minutes
const TOKEN_REGEX = /^[0-9a-f]{64}$/;

interface DownloadMeta {
  token: string;
  filename: string;
  mimeType: "application/pdf";
  createdAt: string;
  expiresAt: string;
}

function metaPath(token: string): string {
  return path.join(TMP_DIR, `${token}.json`);
}

function pdfPath(token: string): string {
  return path.join(TMP_DIR, `${token}.pdf`);
}

export async function createTemporaryMcpDownload({
  filename,
  mimeType,
  buffer,
  ttlSeconds = TTL_DEFAULT_SECONDS,
}: {
  filename: string;
  mimeType: "application/pdf";
  buffer: Buffer;
  ttlSeconds?: number;
}): Promise<{ token: string; downloadPath: string; expiresAt: string }> {
  await cleanupExpiredMcpDownloads();

  const token = crypto.randomBytes(32).toString("hex");
  await fs.mkdir(TMP_DIR, { recursive: true });

  const now = new Date();
  const expiresAt = new Date(now.getTime() + ttlSeconds * 1000).toISOString();

  const meta: DownloadMeta = {
    token,
    filename,
    mimeType,
    createdAt: now.toISOString(),
    expiresAt,
  };

  await fs.writeFile(pdfPath(token), buffer);
  await fs.writeFile(metaPath(token), JSON.stringify(meta), "utf8");

  return { token, downloadPath: pdfPath(token), expiresAt };
}

export async function consumeTemporaryMcpDownload(token: string): Promise<{
  filename: string;
  mimeType: string;
  buffer: Buffer;
} | null> {
  if (!TOKEN_REGEX.test(token)) return null;

  await cleanupExpiredMcpDownloads();

  let meta: DownloadMeta;
  try {
    const raw = await fs.readFile(metaPath(token), "utf8");
    meta = JSON.parse(raw) as DownloadMeta;
  } catch {
    return null;
  }

  if (new Date() > new Date(meta.expiresAt)) {
    await Promise.all([
      fs.unlink(metaPath(token)).catch(() => {}),
      fs.unlink(pdfPath(token)).catch(() => {}),
    ]);
    return null;
  }

  let buffer: Buffer;
  try {
    buffer = await fs.readFile(pdfPath(token));
  } catch {
    return null;
  }

  await Promise.all([
    fs.unlink(metaPath(token)).catch(() => {}),
    fs.unlink(pdfPath(token)).catch(() => {}),
  ]);

  return { filename: meta.filename, mimeType: meta.mimeType, buffer };
}

export async function cleanupExpiredMcpDownloads(): Promise<void> {
  let entries: string[];
  try {
    entries = await fs.readdir(TMP_DIR);
  } catch {
    return;
  }

  const now = new Date();
  await Promise.all(
    entries
      .filter((e) => e.endsWith(".json"))
      .map(async (entry) => {
        const token = entry.slice(0, -5);
        if (!TOKEN_REGEX.test(token)) return;
        try {
          const raw = await fs.readFile(path.join(TMP_DIR, entry), "utf8");
          const meta = JSON.parse(raw) as DownloadMeta;
          if (new Date(meta.expiresAt) < now) {
            await Promise.all([
              fs.unlink(path.join(TMP_DIR, entry)).catch(() => {}),
              fs.unlink(pdfPath(token)).catch(() => {}),
            ]);
          }
        } catch {
          // ignore individual file errors
        }
      }),
  );
}
