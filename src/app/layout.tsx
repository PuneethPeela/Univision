import '@/app/globals.css';
import Navbar from '@/components/Navbar';
import Providers from '@/components/Providers';
import type { Metadata } from 'next';
import { Inter, DM_Sans } from 'next/font/google';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-geist',
  weight: ['400', '600', '700'],
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'UNIVISION – AI‑Powered College Discovery',
  description: 'Discover, compare, and predict colleges with a premium UI.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${dmSans.variable} ${inter.variable}`}>
      <body className="bg-surface-900 text-onSurface">
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
        </Providers>
      </body>
    </html>
  );
}
