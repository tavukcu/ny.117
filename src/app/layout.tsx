import type { Metadata } from 'next'
import './globals.css'

// Sayfa meta verileri
export const metadata: Metadata = {
  title: 'NeYisek.com - Lezzetli Yemekler Kapınızda',
  description: 'NeYisek.com ile favori yemeklerinizi online sipariş edin. Hızlı teslimat, kaliteli hizmet.',
}

// Ana layout komponenti
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html className="scroll-smooth">
      <head>
        {/* Favicon ve diğer meta taglar */}
        <link rel="icon" type="image/png" href="/favicon.png" />
        <link rel="icon" type="image/x-icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="msapplication-TileColor" content="#4caf50" />
        
        {/* Google Analytics */}
        <script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-NSQ8R89N9V"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-NSQ8R89N9V');
            `
          }}
        />
        
        {/* Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              "url": "https://www.neyisek.com",
              "logo": "https://www.neyisek.com/favicon.png",
              "name": "NeYisek.com",
              "description": "Lezzetli Yemekler Kapınızda - Online Yemek Sipariş Platformu",
              "foundingDate": "2024",
              "address": {
                "@type": "PostalAddress",
                "addressCountry": "TR"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "contactType": "customer service",
                "availableLanguage": "Turkish"
              },
              "sameAs": [
                "https://www.neyisek.com"
              ]
            })
          }}
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
} 