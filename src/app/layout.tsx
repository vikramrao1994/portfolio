import type { Metadata } from 'next';

import Footer from '@/components/Footer';
import Header  from '@/components/Header';

import { BodyProvider, FooterProvider, HeaderProvider } from './providers';

export const metadata: Metadata = {
  title: 'CV',
  description: 'My CV built with Next.js and Kern Design System',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <header>
          <HeaderProvider>
            <Header />
          </HeaderProvider>
        </header>
        <main>
          <BodyProvider>
            {children}
          </BodyProvider>
        </main>
        <footer>
          <FooterProvider>
            <Footer />
          </FooterProvider>
        </footer>
      </body>
    </html>
  );
}
