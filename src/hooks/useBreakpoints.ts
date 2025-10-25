import { useState, useEffect } from "react";

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
export const useBreakpoint = (): Breakpoint => {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => {
    if (typeof window !== "undefined") {
      return getDevice(window.innerWidth);
    }
    return "desktop";
  });

  useEffect(() => {
    const handleResize = () => {
      setBreakpoint(getDevice(window.innerWidth));
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
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
