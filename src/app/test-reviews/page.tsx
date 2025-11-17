'use client';

import { useState } from 'react';
import ReviewList from '@/components/ReviewList';
import ReviewSummary from '@/components/ReviewSummary';
import ReviewForm from '@/components/ReviewForm';
import { 
  Star, 
  MessageSquare, 
  BarChart3, 
  Filter,
  Plus
} from 'lucide-react';

export default function TestReviewsPage() {
  const [activeTab, setActiveTab] = useState<'list' | 'summary' | 'form'>('list');
  const [selectedRestaurantId] = useState('test-restaurant-1');

  const tabs = [
    { id: 'list', label: 'Değerlendirme Listesi', icon: MessageSquare },
    { id: 'summary', label: 'Özet ve İstatistikler', icon: BarChart3 },
    { id: 'form', label: 'Değerlendirme Formu', icon: Plus }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            ⭐ Değerlendirme Sistemi Test Sayfası
          </h1>
          <p className="text-gray-600">
            Neyisek.com platformu için gelişmiş değerlendirme sistemi bileşenlerini test edin.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                      activeTab === tab.id
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-8">
          {activeTab === 'list' && (
            <div>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Değerlendirme Listesi
                </h2>
                <p className="text-gray-600 mb-4">
                  Bu bileşen, restoran veya ürün değerlendirmelerini listeler, filtreleme ve sıralama özellikleri sunar.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <h4 className="font-medium text-green-800 mb-2">Özellikler:</h4>
                    <ul className="text-green-700 space-y-1">
                      <li>• Gerçek zamanlı değerlendirme listesi</li>
                      <li>• Gelişmiş filtreleme seçenekleri</li>
                      <li>• Çoklu sıralama kriterleri</li>
                      <li>• İstatistik kartları</li>
                      <li>• Değerlendirme oluşturma formu</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-blue-800 mb-2">Kullanım:</h4>
                    <ul className="text-blue-700 space-y-1">
                      <li>• Restoran sayfalarında</li>
                      <li>• Ürün detay sayfalarında</li>
                      <li>• Kullanıcı profil sayfalarında</li>
                      <li>• Admin panelinde</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <ReviewList
                restaurantId={selectedRestaurantId}
                showCreateButton={true}
                maxReviews={5}
                showFilters={true}
                showStats={true}
              />
            </div>
          )}

          {activeTab === 'summary' && (
            <div>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Değerlendirme Özeti ve İstatistikler
                </h2>
                <p className="text-gray-600 mb-4">
                  Bu bileşen, değerlendirme verilerinin detaylı analizini ve görsel özetini sunar.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <h4 className="font-medium text-purple-800 mb-2">Özellikler:</h4>
                    <ul className="text-purple-700 space-y-1">
                      <li>• Genel istatistik kartları</li>
                      <li>• Puan dağılımı grafikleri</li>
                      <li>• Kategori bazlı analiz</li>
                      <li>• Trend göstergeleri</li>
                      <li>• Etkileşim metrikleri</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-orange-50 rounded-lg">
                    <h4 className="font-medium text-orange-800 mb-2">Kullanım:</h4>
                    <ul className="text-orange-700 space-y-1">
                      <li>• Restoran dashboard'unda</li>
                      <li>• Admin analitik sayfalarında</li>
                      <li>• Raporlama sisteminde</li>
                      <li>• Müşteri profil sayfalarında</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <ReviewSummary
                  restaurantId={selectedRestaurantId}
                  showCategoryBreakdown={true}
                  showTrends={true}
                />
                
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Sistem Özellikleri
                  </h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                      <h4 className="font-semibold text-green-800 mb-2">Gelişmiş Özellikler</h4>
                      <ul className="text-green-700 space-y-1 text-sm">
                        <li>• Çoklu kategori puanlama sistemi</li>
                        <li>• Medya desteği (fotoğraf/video)</li>
                        <li>• Otomatik moderasyon</li>
                        <li>• Etkileşim sistemi (beğeni, raporlama)</li>
                        <li>• Yanıt ve yorum sistemi</li>
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                      <h4 className="font-semibold text-purple-800 mb-2">Analitik Özellikler</h4>
                      <ul className="text-purple-700 space-y-1 text-sm">
                        <li>• Gerçek zamanlı istatistikler</li>
                        <li>• Trend analizi</li>
                        <li>• Kategori performans takibi</li>
                        <li>• Müşteri demografik analizi</li>
                        <li>• Karşılaştırmalı raporlar</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'form' && (
            <div>
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Değerlendirme Formu
                </h2>
                <p className="text-gray-600 mb-4">
                  Bu bileşen, kullanıcıların detaylı ve kapsamlı değerlendirmeler oluşturmasını sağlar.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <h4 className="font-medium text-yellow-800 mb-2">Form Özellikleri:</h4>
                    <ul className="text-yellow-700 space-y-1">
                      <li>• Çoklu kategori puanlama</li>
                      <li>• Medya yükleme desteği</li>
                      <li>• Artı/eksi listesi</li>
                      <li>• Etiket sistemi</li>
                      <li>• Anonim değerlendirme seçeneği</li>
                    </ul>
                  </div>
                  <div className="p-3 bg-indigo-50 rounded-lg">
                    <h4 className="font-medium text-indigo-800 mb-2">Doğrulama:</h4>
                    <ul className="text-indigo-700 space-y-1">
                      <li>• Sipariş doğrulama</li>
                      <li>• Otomatik moderasyon</li>
                      <li>• Spam koruması</li>
                      <li>• İçerik filtreleme</li>
                      <li>• Kullanıcı yetki kontrolü</li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <ReviewForm
                restaurantId={selectedRestaurantId}
                type="restaurant"
                onSuccess={(reviewId) => {
                  console.log('Review created:', reviewId);
                  alert('Değerlendirme başarıyla oluşturuldu!');
                }}
                onCancel={() => {
                  console.log('Review creation cancelled');
                }}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Değerlendirme Sistemi Hakkında
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Teknik Özellikler</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• TypeScript ile tip güvenliği</li>
                <li>• Firebase Firestore entegrasyonu</li>
                <li>• Gerçek zamanlı güncellemeler</li>
                <li>• Responsive tasarım</li>
                <li>• Accessibility uyumlu</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Güvenlik</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• Kullanıcı yetki kontrolü</li>
                <li>• Otomatik spam koruması</li>
                <li>• İçerik moderasyonu</li>
                <li>• Veri doğrulama</li>
                <li>• Güvenli dosya yükleme</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Performans</h4>
              <ul className="text-gray-600 space-y-1">
                <li>• Lazy loading</li>
                <li>• Pagination desteği</li>
                <li>• Önbellek optimizasyonu</li>
                <li>• Görsel sıkıştırma</li>
                <li>• CDN entegrasyonu</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 