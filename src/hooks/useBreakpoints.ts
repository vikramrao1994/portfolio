import { useEffect, useState } from "react";

export type Breakpoint = "mobile" | "tablet" | "desktop";

const getDevice = (width: number): Breakpoint => {
  if (width <= 576) return "mobile";
  if (width <= 991) return "tablet";
  return "desktop";
};

/**
 * React hook that returns the current responsive breakpoint.
 *
 * Breakpoints:
 * - mobile: 0–576px
 * - tablet: 577–991px
 * - desktop: 992px+
 */
export const useBreakpoint = () => {
  // On the server is always 'desktop' to avoid hydration errors
  const [breakpoint, setBreakpoint] = useState<Breakpoint>("desktop");
  useEffect(() => {
    const updateBreakpoint = () => setBreakpoint(getDevice(window.innerWidth));
    updateBreakpoint(); // Set correct value on mount
    window.addEventListener("resize", updateBreakpoint);
    return () => window.removeEventListener("resize", updateBreakpoint);
  }, []);

  return breakpoint;
};

export const useBreakpointFlags = () => {
  const breakpoint = useBreakpoint();

  return {
    isMobile: breakpoint === "mobile",
    isTablet: breakpoint === "tablet",
    isDesktop: breakpoint === "desktop",
  };
};
