import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import '../globals.css';
import { Toaster } from 'react-hot-toast';
import RealTimeStatusBar from '@/components/RealTimeStatusBar';
import FloatingHomeButton from '@/components/FloatingHomeButton';
import DeliveryRatingProvider from '@/components/DeliveryRatingProvider';
import ComplaintButton from '@/components/ComplaintButton';

import { notFound } from 'next/navigation';

// Google Inter fontunu yüklüyoruz
const inter = Inter({ subsets: ['latin'] });

// Desteklenen diller
const locales = ['tr', 'en'];

// Viewport ayarları
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#34d399',
};

// Sayfa meta verileri
export const metadata: Metadata = {
  title: 'NeYisek.com - Lezzetli Yemekler Kapınızda',
  description: 'NeYisek.com ile favori yemeklerinizi online sipariş edin. Hızlı teslimat, kaliteli hizmet.',
  keywords: 'yemek sipariş, online yemek, ev yemeği, fast food, pizza, burger',
  authors: [{ name: 'NeYisek.com' }],
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon.ico', sizes: '16x16', type: 'image/x-icon' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  robots: 'index, follow',
  openGraph: {
    title: 'NeYisek.com - Lezzetli Yemekler Kapınızda',
    description: 'En sevdiğiniz yemekleri hızlı ve güvenli bir şekilde sipariş edin.',
    type: 'website',
    locale: 'tr_TR',
    url: 'https://neyisek.com',
    siteName: 'NeYisek.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NeYisek.com - Lezzetli Yemekler Kapınızda',
    description: 'En sevdiğiniz yemekleri hızlı ve güvenli bir şekilde sipariş edin.',
  }
};

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Geçersiz locale kontrolü
  if (!locales.includes(locale as any)) notFound();

  return (
    <html lang={locale} className="scroll-smooth">
      <body className={`${inter.className} antialiased`}>
        {/* Ana içerik alanı */}
        <div className="min-h-screen flex flex-col">
          {children}
        </div>
        
        {/* Floating Home Button */}
        <FloatingHomeButton />
        
        {/* Real-time status bar */}
        <RealTimeStatusBar className="fixed bottom-0 left-0 right-0 z-40" />
        
        {/* Delivery Rating Modal Provider */}
        <DeliveryRatingProvider>
          {/* Floating Complaint Button */}
          <ComplaintButton variant="floating" size="md" />
        </DeliveryRatingProvider>
        
        {/* Toast bildirimler için container */}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10B981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#EF4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  );
}

// Statik path'leri oluştur
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
} 