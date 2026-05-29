import { timingSafeEqual } from "node:crypto";
import { createMcpServer } from "@mcp/createServer";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyJWT } from "@/lib/auth";

export const dynamic = "force-dynamic";

// ---------------------------------------------------------------------------
// Feature flag
// ---------------------------------------------------------------------------

function isEnabled(): boolean {
  return process.env.ENABLE_REMOTE_MCP === "true";
}

// ---------------------------------------------------------------------------
// Authentication
// ---------------------------------------------------------------------------

/**
 * Timing-safe Bearer token comparison.
 * Prevents timing attacks that could reveal the expected token length.
 */
function compareTokens(provided: string, expected: string): boolean {
  try {
    const a = Buffer.from(provided, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Auth strategy (in order):
 * 1. Bearer token matching MCP_AUTH_TOKEN env var
 * 2. Existing admin JWT cookie (fallback for browser-originated requests)
 */
async function authenticate(req: Request): Promise<boolean> {
  const authHeader = req.headers.get("Authorization");

  if (authHeader?.startsWith("Bearer ")) {
    const provided = authHeader.slice(7).trim();
    const expected = process.env.MCP_AUTH_TOKEN;
    if (!expected) {
      // MCP_AUTH_TOKEN not configured → Bearer auth unavailable
      console.error("[mcp-http] MCP_AUTH_TOKEN is not set; Bearer auth rejected");
      return false;
    }
    return compareTokens(provided, expected);
  }

  // Fallback: validate existing JWT admin session cookie
  const cookieStore = await cookies();
  const token = cookieStore.get("auth_token")?.value;
  if (!token) return false;
  const payload = await verifyJWT(token);
  return payload?.authenticated === true;
}

// ---------------------------------------------------------------------------
// Per-request MCP handler
// ---------------------------------------------------------------------------

async function handleMcpRequest(req: Request): Promise<Response> {
  if (!isEnabled()) {
    return NextResponse.json({ error: "Not Found" }, { status: 404 });
  }

  const authed = await authenticate(req);
  if (!authed) {
    return NextResponse.json(
      { error: "Unauthorized" },
      {
        status: 401,
        headers: { "WWW-Authenticate": 'Bearer realm="cover-letter MCP"' },
      },
    );
  }

  // TODO: Add per-token rate limiting (e.g., in-memory sliding window or Redis).
  // Until then, the auth token acts as the primary access gate.
  // Suggested limit: 60 requests/minute per token.

  try {
    const appBaseUrl =
      process.env.PUBLIC_APP_URL ?? new URL(req.url).origin;
    const server = createMcpServer("remote-download", appBaseUrl);
    // Stateless mode: no sessionIdGenerator → no session tracking between requests.
    // enableJsonResponse: false → SSE stream (allows streaming tool results and
    // future notifications). Set to true for simpler JSON-only clients.
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });

    await server.connect(transport);
    return transport.handleRequest(req);
  } catch (err) {
    const msg = err instanceof Error ? err.message.slice(0, 200) : "Internal error";
    console.error("[mcp-http] Unhandled error:", msg);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// ---------------------------------------------------------------------------
// Route exports — Next.js App Router
// ---------------------------------------------------------------------------

export async function POST(req: Request): Promise<Response> {
  return handleMcpRequest(req);
}

// GET supports SSE streaming connections (MCP protocol spec).
// The transport handles session validation and SSE setup internally.
export async function GET(req: Request): Promise<Response> {
  return handleMcpRequest(req);
}

// DELETE allows clients to terminate sessions (no-op in stateless mode).
export async function DELETE(req: Request): Promise<Response> {
  return handleMcpRequest(req);
}
