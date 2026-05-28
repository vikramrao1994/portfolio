import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";
import { CoverLetterContentSchema } from "@/lib/cover-letter/coverLetterContentSchema";
import { renderCoverLetterPdfToBuffer } from "@/lib/cover-letter/pdf/runCoverLetterPdfRenderer";
import { getSiteContent } from "@/server/siteContent";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const jwtPayload = await verifyJWT(token);
  if (!jwtPayload?.authenticated)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const parsed = CoverLetterContentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid cover letter JSON", detail: parsed.error.issues },
      { status: 400 },
    );
  }

  const coverLetter = parsed.data;

  try {
    const siteContent = await getSiteContent(coverLetter.language);
    const { bytes, filename } = await renderCoverLetterPdfToBuffer(coverLetter, siteContent);

    return new NextResponse(bytes, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("Python exited") || msg.includes("ENOENT")) {
      return NextResponse.json(
        { error: "PDF generation failed", detail: msg.slice(0, 500) },
        { status: 502 },
      );
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
