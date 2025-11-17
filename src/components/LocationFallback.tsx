'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, Search, AlertCircle, CheckCircle, Globe } from 'lucide-react';

interface LocationFallbackProps {
  onLocationSelect: (address: string, lat: number, lng: number, city?: string, district?: string) => void;
  className?: string;
}

// Türkiye'nin büyük şehirleri ve koordinatları
const TURKEY_CITIES = [
  { name: 'İstanbul', lat: 41.0082, lng: 28.9784, district: 'Fatih' },
  { name: 'Ankara', lat: 39.9334, lng: 32.8597, district: 'Çankaya' },
  { name: 'İzmir', lat: 38.4192, lng: 27.1287, district: 'Konak' },
  { name: 'Bursa', lat: 40.1826, lng: 29.0665, district: 'Osmangazi' },
  { name: 'Antalya', lat: 36.8969, lng: 30.7133, district: 'Muratpaşa' },
  { name: 'Adana', lat: 37.0000, lng: 35.3213, district: 'Seyhan' },
  { name: 'Konya', lat: 37.8667, lng: 32.4833, district: 'Meram' },
  { name: 'Gaziantep', lat: 37.0662, lng: 37.3833, district: 'Şahinbey' },
  { name: 'Kayseri', lat: 38.7312, lng: 35.4787, district: 'Melikgazi' },
  { name: 'Eskişehir', lat: 39.7667, lng: 30.5256, district: 'Odunpazarı' }
];

const LocationFallback: React.FC<LocationFallbackProps> = ({
  onLocationSelect,
  className = ''
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'gps' | 'manual' | 'city'>('gps');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [manualAddress, setManualAddress] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [gpsStatus, setGpsStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [gpsError, setGpsError] = useState('');

  // GPS konum alma
  const getCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setGpsError('Tarayıcınız GPS desteklemiyor');
      setGpsStatus('error');
      return;
    }

    setIsGettingLocation(true);
    setGpsStatus('loading');
    setGpsError('');

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
          }
        );
      });

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      
      // Türkiye sınırları kontrolü (yaklaşık)
      if (lat >= 35.8 && lat <= 42.1 && lng >= 25.7 && lng <= 44.8) {
        // Türkiye içinde - yakın şehri bul
        const nearestCity = findNearestCity(lat, lng);
        const address = `${nearestCity.district}, ${nearestCity.name}`;
        
        setGpsStatus('success');
        onLocationSelect(address, lat, lng, nearestCity.name, nearestCity.district);
      } else {
        // Türkiye dışında - varsayılan İstanbul
        setGpsStatus('success');
        onLocationSelect('İstanbul, Türkiye', 41.0082, 28.9784, 'İstanbul', 'Fatih');
      }
    } catch (error: any) {
      console.error('GPS hatası:', error);
      let errorMessage = 'Konum alınamadı';
      
      switch (error.code) {
        case 1:
          errorMessage = 'Konum izni verilmedi';
          break;
        case 2:
          errorMessage = 'Konum bulunamadı';
          break;
        case 3:
          errorMessage = 'Konum alma zaman aşımı';
          break;
        default:
          errorMessage = 'GPS hatası oluştu';
      }
      
      setGpsError(errorMessage);
      setGpsStatus('error');
    } finally {
      setIsGettingLocation(false);
    }
  };

  // En yakın şehri bul
  const findNearestCity = (lat: number, lng: number) => {
    let nearest = TURKEY_CITIES[0];
    let minDistance = calculateDistance(lat, lng, nearest.lat, nearest.lng);

    for (const city of TURKEY_CITIES) {
      const distance = calculateDistance(lat, lng, city.lat, city.lng);
      if (distance < minDistance) {
        minDistance = distance;
        nearest = city;
      }
    }

    return nearest;
  };

  // İki nokta arası mesafe hesaplama (Haversine formula)
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Dünya yarıçapı (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Şehir seçimi
  const handleCitySelect = (cityName: string) => {
    const city = TURKEY_CITIES.find(c => c.name === cityName);
    if (city) {
      const address = `${city.district}, ${city.name}`;
      onLocationSelect(address, city.lat, city.lng, city.name, city.district);
      setSelectedCity(cityName);
    }
  };

  // Manuel adres girişi
  const handleManualSubmit = () => {
    if (manualAddress.trim()) {
      // Varsayılan İstanbul koordinatları ile
      onLocationSelect(manualAddress.trim(), 41.0082, 28.9784, 'İstanbul', 'Fatih');
    }
  };

  return (
    <div className={`bg-white rounded-xl shadow-lg border border-gray-200 p-6 ${className}`}>
      {/* Başlık */}
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 rounded-lg p-2">
          <MapPin className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Konum Seçimi</h3>
          <p className="text-sm text-gray-600">Teslimat adresinizi belirleyin</p>
        </div>
      </div>

      {/* Seçim Butonları */}
      <div className="grid grid-cols-3 gap-2 mb-6">
        <button
          onClick={() => setSelectedMethod('gps')}
          className={`p-3 rounded-lg text-sm font-medium transition-colors ${
            selectedMethod === 'gps'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Navigation className="h-4 w-4 mx-auto mb-1" />
          GPS Konum
        </button>
        <button
          onClick={() => setSelectedMethod('city')}
          className={`p-3 rounded-lg text-sm font-medium transition-colors ${
            selectedMethod === 'city'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Globe className="h-4 w-4 mx-auto mb-1" />
          Şehir Seç
        </button>
        <button
          onClick={() => setSelectedMethod('manual')}
          className={`p-3 rounded-lg text-sm font-medium transition-colors ${
            selectedMethod === 'manual'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <Search className="h-4 w-4 mx-auto mb-1" />
          Manuel Giriş
        </button>
      </div>

      {/* GPS Konum */}
      {selectedMethod === 'gps' && (
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Navigation className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 mb-1">GPS ile Konum Tespit</h4>
                <p className="text-sm text-blue-700 mb-3">
                  Mevcut konumunuzu otomatik olarak tespit edelim
                </p>
                <button
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isGettingLocation ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      Konum Alınıyor...
                    </>
                  ) : (
                    <>
                      <Navigation className="h-4 w-4" />
                      Konumumu Tespit Et
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* GPS Durumu */}
          {gpsStatus === 'success' && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Konum başarıyla tespit edildi!</span>
            </div>
          )}

          {gpsStatus === 'error' && (
            <div className="flex items-start gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-5 w-5 mt-0.5" />
              <div>
                <p className="text-sm font-medium">GPS Hatası</p>
                <p className="text-sm">{gpsError}</p>
                <p className="text-xs mt-1">Lütfen başka bir yöntem deneyin.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Şehir Seçimi */}
      {selectedMethod === 'city' && (
        <div className="space-y-4">
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-3">Şehir Seçin</h4>
            <div className="grid grid-cols-2 gap-2">
              {TURKEY_CITIES.map((city) => (
                <button
                  key={city.name}
                  onClick={() => handleCitySelect(city.name)}
                  className={`p-3 text-left rounded-lg border transition-colors ${
                    selectedCity === city.name
                      ? 'border-green-500 bg-green-100 text-green-900'
                      : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                  }`}
                >
                  <div className="font-medium">{city.name}</div>
                  <div className="text-sm text-gray-600">{city.district}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Manuel Giriş */}
      {selectedMethod === 'manual' && (
        <div className="space-y-4">
          <div className="bg-orange-50 rounded-lg p-4">
            <h4 className="font-medium text-orange-900 mb-3">Adres Girin</h4>
            <textarea
              value={manualAddress}
              onChange={(e) => setManualAddress(e.target.value)}
              placeholder="Örnek: Atatürk Mahallesi, Cumhuriyet Caddesi No:123, Kadıköy/İstanbul"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
              rows={3}
            />
            <button
              onClick={handleManualSubmit}
              disabled={!manualAddress.trim()}
              className="mt-3 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
            >
              Adresi Kaydet
            </button>
          </div>
        </div>
      )}

      {/* Bilgi Notu */}
      <div className="mt-6 p-3 bg-gray-50 rounded-lg">
        <p className="text-xs text-gray-600">
          💡 <strong>İpucu:</strong> GPS çalışmıyorsa şehir seçimi veya manuel adres girişi kullanabilirsiniz. 
          Seçtiğiniz konum teslimat adresi olarak kaydedilecektir.
        </p>
      </div>
    </div>
  );
};

export default LocationFallback; 