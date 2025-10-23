'use client';
import { ThemeProvider } from '@publicplan/kern-react-kit';
import '@/styles/global.scss';

import { useKernTheme } from '@/styles/themes/kernTheme';

export function BodyProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider global={false} theme={useKernTheme()}>
      {children}
    </ThemeProvider>
  );
}

export function FooterProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      global={false}
      className="kern-footer-custom"
      data-kern-theme="dark"
    >
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
