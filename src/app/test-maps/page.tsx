'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import EnhancedLocationService from '@/services/enhancedLocationService';
import { 
  MapPin, 
  Navigation, 
  Search, 
  Building, 
  Route, 
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react';
import toast from 'react-hot-toast';

// UnifiedMapPicker'ı client-side'da yükle
const UnifiedMapPicker = dynamic(
  () => import('@/components/UnifiedMapPicker'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full h-[500px] bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Harita yükleniyor...</p>
        </div>
      </div>
    )
  }
);

export default function TestMapsPage() {
  const [selectedLocation, setSelectedLocation] = useState<any>(null);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Test fonksiyonları
  const runAllTests = async () => {
    if (!selectedLocation) {
      toast.error('Önce haritadan bir konum seçin');
      return;
    }

    setIsLoading(true);
    const results: any[] = [];

    try {
      // 1. Adres Doğrulama Testi
      const validationResult = await EnhancedLocationService.validateAndStandardizeAddress(
        selectedLocation.address
      );
      results.push({
        test: 'Adres Doğrulama',
        success: validationResult.isValid,
        data: validationResult
      });

      // 2. Yakındaki Yerler Testi
      const nearbyCategories = await EnhancedLocationService.searchNearbyByCategory(
        selectedLocation.coordinates,
        ['restaurant', 'cafe', 'bakery'],
        2000
      );
      results.push({
        test: 'Yakındaki Yerler',
        success: true,
        data: {
          restaurant: nearbyCategories.get('restaurant')?.length || 0,
          cafe: nearbyCategories.get('cafe')?.length || 0,
          bakery: nearbyCategories.get('bakery')?.length || 0
        }
      });

      // 3. Batch Geocoding Testi
      const testAddresses = [
        'Taksim Meydanı, İstanbul',
        'Kızılay, Ankara',
        'Konak Meydanı, İzmir'
      ];
      const batchResults = await EnhancedLocationService.batchGeocode(testAddresses);
      results.push({
        test: 'Batch Geocoding',
        success: batchResults.every(r => r.coordinates !== null),
        data: batchResults
      });

      // 4. Mesafe Matrisi Testi
      if (batchResults[0].coordinates && batchResults[1].coordinates) {
        const distanceMatrix = await EnhancedLocationService.calculateDistanceMatrix(
          [selectedLocation.coordinates],
          [batchResults[0].coordinates, batchResults[1].coordinates]
        );
        results.push({
          test: 'Mesafe Matrisi',
          success: true,
          data: distanceMatrix
        });
      }

      // 5. Yükseklik Testi
      const elevationData = await EnhancedLocationService.getElevation([
        selectedLocation.coordinates
      ]);
      results.push({
        test: 'Yükseklik Bilgisi',
        success: true,
        data: elevationData[0]
      });

      // 6. Street View Testi
      const streetViewData = await EnhancedLocationService.verifyLocationWithStreetView(
        selectedLocation.coordinates
      );
      results.push({
        test: 'Street View Doğrulama',
        success: streetViewData.hasStreetView,
        data: streetViewData
      });

      // 7. Teslimat Bölgesi Testi
      const testPolygon = [
        { lat: 41.0082, lng: 28.9784 }, // Taksim
        { lat: 41.0049, lng: 28.9764 }, // Galata
        { lat: 41.0054, lng: 28.9850 }, // Karaköy
        { lat: 41.0122, lng: 28.9850 }  // Tophane
      ];
      const inDeliveryZone = EnhancedLocationService.isLocationInDeliveryZone(
        selectedLocation.coordinates,
        testPolygon
      );
      results.push({
        test: 'Teslimat Bölgesi Kontrolü',
        success: true,
        data: { inZone: inDeliveryZone }
      });

      setTestResults(results);
      toast.success('Tüm testler tamamlandı!');
    } catch (error) {
      console.error('Test hatası:', error);
      toast.error('Testler sırasında hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Google Maps Test Sayfası
          </h1>
          <p className="text-gray-600 mb-6">
            Google Maps API'nin tüm özelliklerini test edin
          </p>

          {/* Özellik Listesi */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <MapPin className="w-8 h-8 text-blue-600 mb-2" />
              <h3 className="font-semibold text-blue-900">Gelişmiş Geocoding</h3>
              <p className="text-sm text-blue-700">
                Batch işlemler, adres doğrulama, standardizasyon
              </p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <Building className="w-8 h-8 text-green-600 mb-2" />
              <h3 className="font-semibold text-green-900">Places API</h3>
              <p className="text-sm text-green-700">
                Yakındaki yerler, detaylı bilgiler, kategorileme
              </p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <Route className="w-8 h-8 text-purple-600 mb-2" />
              <h3 className="font-semibold text-purple-900">Directions & Distance</h3>
              <p className="text-sm text-purple-700">
                Rota hesaplama, mesafe matrisi, alternatif rotalar
              </p>
            </div>
          </div>
        </div>

        {/* Harita */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Gelişmiş Harita Seçici
          </h2>
          <UnifiedMapPicker
            onLocationSelect={(address: string, lat: number, lng: number, city?: string, district?: string) => {
              setSelectedLocation({ address, lat, lng, city, district });
              toast.success('Konum seçildi!');
            }}
            height="500px"
            showSearch={true}
            showCitySelector={true}
            showCurrentLocation={true}
            showNearbyPlaces={true}
            className="mb-4"
          />
        </div>

        {/* Seçilen Konum Bilgileri */}
        {selectedLocation && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Seçilen Konum Bilgileri
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Adres:</p>
                <p className="font-medium">{selectedLocation.address}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Koordinatlar:</p>
                <p className="font-medium">
                  {selectedLocation.coordinates.lat.toFixed(6)}, 
                  {selectedLocation.coordinates.lng.toFixed(6)}
                </p>
              </div>
              {selectedLocation.city && (
                <div>
                  <p className="text-sm text-gray-600">Şehir:</p>
                  <p className="font-medium">{selectedLocation.city}</p>
                </div>
              )}
              {selectedLocation.district && (
                <div>
                  <p className="text-sm text-gray-600">İlçe:</p>
                  <p className="font-medium">{selectedLocation.district}</p>
                </div>
              )}
              {selectedLocation.postalCode && (
                <div>
                  <p className="text-sm text-gray-600">Posta Kodu:</p>
                  <p className="font-medium">{selectedLocation.postalCode}</p>
                </div>
              )}
              {selectedLocation.placeId && (
                <div>
                  <p className="text-sm text-gray-600">Place ID:</p>
                  <p className="font-medium text-xs">{selectedLocation.placeId}</p>
                </div>
              )}
            </div>

            <button
              onClick={runAllTests}
              disabled={isLoading}
              className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Testler Çalışıyor...' : 'Tüm Testleri Çalıştır'}
            </button>
          </div>
        )}

        {/* Test Sonuçları */}
        {testResults.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Test Sonuçları
            </h2>
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${
                    result.success 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {result.test}
                    </h3>
                    {result.success ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                  </div>
                  <pre className="text-xs text-gray-700 overflow-x-auto">
                    {JSON.stringify(result.data, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* API Kullanım Bilgileri */}
        <div className="bg-blue-50 rounded-lg p-6 mt-6">
          <div className="flex items-start">
            <Info className="w-6 h-6 text-blue-600 mr-3 mt-1" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">
                Google Maps API Özellikleri
              </h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Maps JavaScript API - Harita görüntüleme ve etkileşim</li>
                <li>• Places API - Yer arama ve detayları</li>
                <li>• Geocoding API - Adres-koordinat dönüşümü</li>
                <li>• Distance Matrix API - Mesafe ve süre hesaplama</li>
                <li>• Directions API - Rota planlama</li>
                <li>• Elevation API - Yükseklik bilgisi</li>
                <li>• Street View API - Sokak görünümü doğrulama</li>
                <li>• Geometry Library - Geometrik hesaplamalar</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 