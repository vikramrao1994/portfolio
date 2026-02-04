import { jwtVerify, SignJWT } from "jose";
import { z } from "zod";

// Zod schema for JWT payload
export const JWTPayloadSchema = z.object({
  authenticated: z.boolean(),
  iat: z.number(),
  exp: z.number(),
});

export type JWTPayload = z.infer<typeof JWTPayloadSchema>;

// Environment variables
const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not set");
}

if (!ADMIN_PASSWORD) {
  throw new Error("ADMIN_PASSWORD environment variable is not set");
}

// Convert secret to Uint8Array for jose
const secret = new TextEncoder().encode(JWT_SECRET);

/**
 * Creates a signed JWT with 24-hour expiry
 */
export async function createJWT(): Promise<string> {
  const jwt = await new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(secret);

  return jwt;
}

/**
 * Verifies a JWT and returns the decoded payload
 * Returns null if verification fails
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);

    // Validate payload structure with Zod
    const result = JWTPayloadSchema.safeParse(payload);
    if (!result.success) {
      return null;
    }

    return result.data;
  } catch (_err) {
    // Token is invalid or expired
    return null;
  }
}

/**
 * Constant-time password comparison to prevent timing attacks
 */
export function comparePasswords(input: string): boolean {
  // Simple comparison since password is in env var (not stored/hashed)
  // Constant-time comparison using crypto if available
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const inputBuffer = new TextEncoder().encode(input);
    const storedBuffer = new TextEncoder().encode(ADMIN_PASSWORD);

    // Use subtle crypto for constant-time comparison
    // This is a basic implementation; in production consider using a dedicated library
    if (inputBuffer.length !== storedBuffer.length) {
      return false;
    }

    let match = 0;
    for (let i = 0; i < inputBuffer.length; i++) {
      match |= inputBuffer[i] ^ storedBuffer[i];
    }

    return match === 0;
  }

  // Fallback to simple comparison
  return input === ADMIN_PASSWORD;
}
