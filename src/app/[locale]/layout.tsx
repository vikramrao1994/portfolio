import type { Metadata } from "next";
import "@/styles/global.scss";
import { notFound } from "next/navigation";
import Script from "next/script";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { routing } from "@/i18n/routing";
import { getSiteContent } from "@/server/siteContent";
import { PageProvider } from "../providers";

export const metadata: Metadata = {
  title: "Vikram Rao",
  description:
    "Senior Frontend Software Developer | React.js, Next.js, TypeScript, JavaScript | English (C2), German (A1)",
  metadataBase: new URL("https://www.vikramrao.me"),
  openGraph: {
    title: "CV | Vikram Rao",
    description:
      "Senior Frontend Software Developer | React.js, Next.js, TypeScript, JavaScript | English (C2), German (A1)",
    url: "https://www.vikramrao.me",
    type: "website",
    images: ["/portrait.webp"],
  },
  twitter: {
    card: "summary_large_image",
    title: "CV | Vikram Rao",
    description:
      "Senior Frontend Software Developer | React.js, Next.js, TypeScript, JavaScript | English (C2), German (A1)",
    images: ["/portrait.webp"],
  },
  robots: { index: true, follow: true },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }: LayoutProps<"/[locale]">) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const SITE = await getSiteContent(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <Script
          src="https://plausible.io/js/pa-WW0ukeyodtUMxtdlm5v4m.js"
          strategy="afterInteractive"
        />
        <Script id="plausible-init" strategy="afterInteractive">
          {`
            window.plausible = window.plausible || function () {
              (plausible.q = plausible.q || []).push(arguments);
            };
            plausible.init = plausible.init || function (i) {
              plausible.o = i || {};
            };
            plausible.init();
          `}
        </Script>
      </head>
      <body className="hero">
        <NextIntlClientProvider messages={messages}>
          <PageProvider initialSite={SITE}>{children}</PageProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
