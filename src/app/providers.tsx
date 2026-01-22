"use client";
import { ThemeProvider } from "@publicplan/kern-react-kit";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { LanguageProvider } from "@/context/LanguageContext";

function BodyProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider global={false} className="kern-body-custom" data-kern-theme="light">
      {children}
    </ThemeProvider>
  );
}

function FooterProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider global={false} className="kern-footer-custom" data-kern-theme="light">
      {children}
    </ThemeProvider>
  );
}

function HeaderProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider global={false} className="kern-header-custom" data-kern-theme="light">
      {children}
    </ThemeProvider>
  );
}

export function PageProvider({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <header>
        <HeaderProvider>
          <Header />
        </HeaderProvider>
      </header>
      <main>
        <BodyProvider>{children}</BodyProvider>
      </main>
      <footer>
        <FooterProvider>
          <Footer />
        </FooterProvider>
      </footer>
    </LanguageProvider>
  );
}
