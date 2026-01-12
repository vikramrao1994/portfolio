import type { Metadata } from "next";
import "@/styles/global.scss";
import { PageProvider } from "./providers";

export const metadata: Metadata = {
  title: "CV | Vikram Rao",
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
      <body className="hero">
        <PageProvider>{children}</PageProvider>
      </body>
    </html>
  );
}
