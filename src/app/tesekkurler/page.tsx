'use client';

import { useEffect } from "react";

// Google Analytics için tip tanımlaması
declare global {
  interface Window {
    gtag?: (command: string, targetId: string, config?: any) => void;
  }
}

export default function Tesekkurler() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.gtag && window.gtag("event", "conversion", {
        send_to: "G-NSQ8R89N9V/ads_conversion_Hakkimizda_1"
      });
    }
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white text-black">
      <div className="text-center max-w-md mx-auto">
        <div className="mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold mb-4 text-gray-900">Teşekkürler!</h1>
          <p className="text-lg text-gray-600 mb-6">
            Siparişiniz başarıyla alınmıştır.
          </p>
          <p className="text-sm text-gray-500 mb-8">
            Siparişiniz hazırlandığında size bilgi vereceğiz.
          </p>
        </div>
        
        <div className="space-y-4">
          <a 
            href="/"
            className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors duration-200 font-medium"
          >
            Ana Sayfaya Dön
          </a>
          
          <a 
            href="/orders"
            className="inline-block bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium ml-4"
          >
            Siparişlerimi Görüntüle
          </a>
        </div>
      </div>
    </div>
  );
} 