"use client";
import { ThemeProvider } from "@publicplan/kern-react-kit";
import { useKernTheme } from "@/styles/themes/kernTheme";

export function BodyProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider global={false} theme={useKernTheme()} className="kern-body-custom">
      {children}
    </ThemeProvider>
  );
}

export function FooterProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider global={false} className="kern-footer-custom">
      {children}
    </ThemeProvider>
  );
}

export function HeaderProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider global={false} className="kern-header-custom">
      {children}
    </ThemeProvider>
  );
}
