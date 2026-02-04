import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { verifyJWT } from "@/lib/auth";

const intlMiddleware = createIntlMiddleware(routing);

/**
 * Checks if the pathname (without locale prefix) matches admin routes
 */
function isAdminPath(pathnameWithoutLocale: string): boolean {
  return pathnameWithoutLocale === "/admin" || pathnameWithoutLocale.startsWith("/admin/");
}

/**
 * Extracts pathname without locale prefix
 * Works with next-intl's localePrefix: "as-needed" pattern
 */
function getPathnameWithoutLocale(pathname: string): string {
  // For localePrefix: "as-needed", default locale (en) has no prefix
  // Non-default locales (de) have /{locale} prefix

  for (const locale of routing.locales) {
    if (locale === routing.defaultLocale) {
      // Default locale has no prefix
      continue;
    }

    // Check if pathname starts with /{locale}/
    if (pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`) {
      // Remove locale prefix
      return pathname.slice(`/${locale}`.length) || "/";
    }
  }

  // No locale prefix found, return as-is (default locale)
  return pathname;
}

export default async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  // Extract the pathname without locale prefix
  const pathnameWithoutLocale = getPathnameWithoutLocale(pathname);

  // Check if this is an admin route
  if (isAdminPath(pathnameWithoutLocale)) {
    const token = req.cookies.get("auth_token")?.value;

    if (!token) {
      // Build login URL in the same locale
      const loginPathname = pathname.replace(/\/admin.*/, "/login");
      return NextResponse.redirect(new URL(loginPathname, req.url));
    }

    const payload = await verifyJWT(token);
    if (!payload) {
      // Token is invalid or expired, redirect to login
      const loginPathname = pathname.replace(/\/admin.*/, "/login");
      const response = NextResponse.redirect(new URL(loginPathname, req.url));
      response.cookies.delete("auth_token"); // Clear invalid token
      return response;
    }

    // Auth successful, continue with intl middleware
    return intlMiddleware(req);
  }

  // For all other routes, use i18n middleware
  return intlMiddleware(req);
}

export const config = {
  matcher: "/((?!api|trpc|_next|_vercel|.*\\..*).*)",
};
