"use client";
import { ThemeProvider } from "@publicplan/kern-react-kit";

export function BodyProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      global={false}
      className="kern-body-custom"
      data-kern-theme="light"
    >
      {children}
    </ThemeProvider>
  );
}

export function FooterProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      global={false}
      className="kern-footer-custom"
      data-kern-theme="light"
    >
      {children}
    </ThemeProvider>
  );
}

export function HeaderProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      global={false}
      className="kern-header-custom"
      data-kern-theme="light"
    >
      {children}
    </ThemeProvider>
  );
}
