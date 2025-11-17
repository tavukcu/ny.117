'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import { 
  Home, 
  Search, 
  ArrowLeft, 
  UtensilsCrossed, 
  MapPin, 
  Phone,
  AlertTriangle,
  Star,
  Clock,
  CheckCircle
} from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />
      
      {/* 404 Content */}
      <section className="py-20 min-h-screen flex items-center">
        <div className="container-responsive">
          <div className="max-w-4xl mx-auto text-center">
            
            {/* 404 Icon */}
            <div className="mb-8">
              <div className="relative inline-block">
                <div className="w-32 h-32 bg-gradient-to-br from-green-500 to-yellow-500 rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-3 shadow-2xl">
                  <AlertTriangle className="h-16 w-16 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-sm">404</span>
                </div>
              </div>
            </div>

            {/* Main Content */}
            <div className="space-y-6">
              <h1 className="text-6xl md:text-8xl font-bold text-gray-800 mb-4">
                4<span className="text-green-500">0</span>4
              </h1>
              
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
                Sayfa Bulunamadı
              </h2>
              
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto leading-relaxed">
                Aradığınız sayfa mevcut değil veya taşınmış olabilir. 
                Endişelenmeyin, lezzetli yemeklerimiz hâlâ burada!
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              <Link
                href="/"
                className="group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center justify-center gap-3">
                  <Home className="h-5 w-5" />
                  <span>Ana Sayfa</span>
                </div>
              </Link>
              
              <Link
                href="/menu"
                className="group bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center justify-center gap-3">
                  <UtensilsCrossed className="h-5 w-5" />
                  <span>Menü</span>
                </div>
              </Link>
              
              <Link
                href="/restaurants"
                className="group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center justify-center gap-3">
                  <MapPin className="h-5 w-5" />
                  <span>Restoranlar</span>
                </div>
              </Link>
              
              <Link
                href="/contact"
                className="group bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center justify-center gap-3">
                  <Phone className="h-5 w-5" />
                  <span>İletişim</span>
                </div>
              </Link>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="w-16 h-16 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Hızlı Teslimat</h3>
                <p className="text-gray-600">
                  30 dakikada kapınızda, sıcacık ve taze!
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="w-16 h-16 bg-yellow-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Kaliteli Yemekler</h3>
                <p className="text-gray-600">
                  En iyi restoranlardan seçkin lezzetler.
                </p>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100">
                <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">Güvenli Ödeme</h3>
                <p className="text-gray-600">
                  SSL korumalı güvenli ödeme sistemi.
                </p>
              </div>
            </div>

            {/* Search Suggestion */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-8 border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                Aradığınızı Bulamadınız mı?
              </h3>
              <p className="text-gray-600 mb-6">
                Menümüzdeki lezzetli yemekleri keşfedin veya size yardımcı olmamız için bizimle iletişime geçin.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/menu"
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-2"
                >
                  <Search className="h-5 w-5" />
                  Menüyü Keşfet
                </Link>
                <Link
                  href="/help"
                  className="bg-white hover:bg-gray-50 text-gray-800 font-bold py-3 px-6 rounded-xl border-2 border-gray-300 hover:border-gray-400 transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-2"
                >
                  <Phone className="h-5 w-5" />
                  Yardım Al
                </Link>
              </div>
            </div>

            {/* Back Button */}
            <div className="mt-12">
              <button
                onClick={() => window.history.back()}
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 font-medium"
              >
                <ArrowLeft className="h-5 w-5" />
                Önceki Sayfaya Dön
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="container-responsive">
          <div className="text-center max-w-3xl mx-auto">
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
              Neyisek.com'da Lezzet Sizi Bekliyor!
            </h2>
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              Binlerce restoran, binlerce lezzet. Size en yakın restorandan siparişinizi verin.
            </p>
            <div className="flex items-center justify-center gap-2 mb-8">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-6 w-6 fill-current" />
                ))}
              </div>
              <span className="text-gray-300 text-lg ml-2">4.8/5 Müşteri Memnuniyeti</span>
            </div>
            <Link
              href="/"
              className="bg-gradient-to-r from-green-500 to-yellow-500 hover:from-green-600 hover:to-yellow-600 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl inline-flex items-center gap-3"
            >
              <Home className="h-6 w-6" />
              Ana Sayfaya Git
              <ArrowLeft className="h-5 w-5 rotate-180" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}