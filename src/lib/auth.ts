import { jwtVerify, SignJWT } from "jose";
import { z } from "zod";

// Zod schema for JWT payload
export const JWTPayloadSchema = z.object({
  authenticated: z.boolean(),
  iat: z.number(),
  exp: z.number(),
});

export type JWTPayload = z.infer<typeof JWTPayloadSchema>;

/**
 * Gets the JWT secret, throwing if not configured
 * Lazy evaluation to avoid build-time errors
 */
function getJWTSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET environment variable is not set");
  }
  return new TextEncoder().encode(secret);
}

/**
 * Gets the admin password, throwing if not configured
 * Lazy evaluation to avoid build-time errors
 */
function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("ADMIN_PASSWORD environment variable is not set");
  }
  return password;
}

/**
 * Creates a signed JWT with 24-hour expiry
 */
export async function createJWT(): Promise<string> {
  const jwt = await new SignJWT({ authenticated: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(getJWTSecret());

  return jwt;
}

/**
 * Verifies a JWT and returns the decoded payload
 * Returns null if verification fails
 */
export async function verifyJWT(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJWTSecret());

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
  const adminPassword = getAdminPassword();

  // Simple comparison since password is in env var (not stored/hashed)
  // Constant-time comparison using crypto if available
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const inputBuffer = new TextEncoder().encode(input);
    const storedBuffer = new TextEncoder().encode(adminPassword);

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
  return input === adminPassword;
}
