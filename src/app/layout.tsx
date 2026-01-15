import type { Metadata } from "next";
import "@/styles/global.scss";
import { PageProvider } from "./providers";
import Script from "next/script";

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
  alternates: {
    canonical: "https://www.vikramrao.me",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
        <PageProvider>{children}</PageProvider>
      </body>
    </html>
  );
}