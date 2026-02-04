import { NextResponse } from "next/server";
import { z } from "zod";
import { comparePasswords, createJWT } from "@/lib/auth";

// Zod schema for login request
const LoginRequestSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validate request body
    const result = LoginRequestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid request", detail: result.error.issues },
        { status: 400 },
      );
    }

    const { password } = result.data;

    // Verify password
    if (!comparePasswords(password)) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

    // Create JWT
    const token = await createJWT();

    // Create response with cookie
    const response = NextResponse.json({ success: true });

    // Set httpOnly cookie
    response.cookies.set("auth_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return response;
  } catch (err: unknown) {
    return NextResponse.json(
      {
        error: "Login failed",
        detail: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
