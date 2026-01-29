"use client";
import { createContext, useContext } from "react";
import type { Site } from "@/lib/siteSchema";

const SiteContentContext = createContext<Site | null>(null);

export function SiteContentProvider({
  initialSite,
  children,
}: {
  initialSite: Site;
  children: React.ReactNode;
}) {
  return <SiteContentContext.Provider value={initialSite}>{children}</SiteContentContext.Provider>;
}

export function useSiteContent() {
  const ctx = useContext(SiteContentContext);
  if (!ctx) {
    throw new Error("useSiteContent must be used inside SiteContentProvider");
  }
  return ctx;
}
