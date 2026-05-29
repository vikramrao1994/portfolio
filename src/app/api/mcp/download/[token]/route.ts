import { NextResponse } from "next/server";
import { consumeTemporaryMcpDownload } from "@/lib/application-documents/shared/temporaryMcpDownloadStore";

export const dynamic = "force-dynamic";

const TOKEN_REGEX = /^[0-9a-f]{64}$/;

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> },
): Promise<Response> {
  const { token } = await params;

  if (!TOKEN_REGEX.test(token)) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  const result = await consumeTemporaryMcpDownload(token);

  if (!result) {
    return NextResponse.json({ error: "Gone" }, { status: 410 });
  }

  const sanitizedFilename = result.filename.replace(/[^a-zA-Z0-9._-]/g, "_");

  return new Response(new Uint8Array(result.buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${sanitizedFilename}"`,
      "Cache-Control": "no-store",
    },
  });
}
