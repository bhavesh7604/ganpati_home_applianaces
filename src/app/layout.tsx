import type { Metadata, Viewport } from 'next';
import './globals.css';
import { site } from '@/lib/config';
import { CartProvider } from '@/components/CartProvider';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: { default: `${site.name}: kitchenware and home appliances`, template: `%s | ${site.name}` },
  description: `${site.name}, Takhatgarh, Pali. Stainless steel utensils, brass utensils, mixer grinders, gas stoves, coolers, irons and more.`,
  openGraph: { siteName: site.name, type: 'website', locale: 'en_IN' },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#0c1d22' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;500;600;700&family=Young+Serif&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen flex flex-col">
        <CartProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
