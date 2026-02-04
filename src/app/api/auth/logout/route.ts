import { NextResponse } from "next/server";

export async function POST() {
  try {
    // Create response
    const response = NextResponse.json({ success: true });

    // Clear auth cookie
    response.cookies.delete("auth_token");

    return response;
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error: "Logout failed",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
