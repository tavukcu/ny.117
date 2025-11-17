'use client';

import { useState, useEffect } from 'react';
import { MapPin, Navigation, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import UnifiedMapPicker from '@/components/UnifiedMapPicker';

export default function TestLocationPage() {
  const [locationInfo, setLocationInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<string>('unknown');

  // Konum izinlerini kontrol et
  const checkPermission = async () => {
    try {
      if (typeof window !== 'undefined' && navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        setPermissionStatus(permission.state);
        
        permission.addEventListener('change', () => {
          setPermissionStatus(permission.state);
        });
      } else {
        setPermissionStatus('not-supported');
      }
    } catch (err) {
      console.error('Permission check error:', err);
      setPermissionStatus('error');
    }
  };

  // useEffect ile checkPermission'ı çağır
  useEffect(() => {
    checkPermission();
  }, []);

  // Basit konum testi
  const testLocation = () => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      setError('Tarayıcınız konum hizmetlerini desteklemiyor');
      return;
    }

    setIsLoading(true);
    setError(null);

    console.log('Konum testi başlatılıyor...');
    const startTime = Date.now();

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const endTime = Date.now();
        const info = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          altitude: position.coords.altitude,
          altitudeAccuracy: position.coords.altitudeAccuracy,
          heading: position.coords.heading,
          speed: position.coords.speed,
          timestamp: new Date(position.timestamp).toLocaleString('tr-TR'),
          responseTime: `${endTime - startTime}ms`
        };
        
        console.log('Konum başarıyla alındı:', info);
        setLocationInfo(info);
        setIsLoading(false);
        
        // Google Maps URL oluştur
        const mapsUrl = `https://www.google.com/maps?q=${info.latitude},${info.longitude}`;
        console.log('Google Maps URL:', mapsUrl);
      },
      (error) => {
        const endTime = Date.now();
        setIsLoading(false);
        console.error('Konum hatası:', {
          code: error.code,
          message: error.message,
          responseTime: `${endTime - startTime}ms`
        });
        
        switch(error.code) {
          case error.PERMISSION_DENIED:
            setError('Konum izni reddedildi. Tarayıcı ayarlarından konum iznini açın.');
            break;
          case error.POSITION_UNAVAILABLE:
            setError('Konum bilgisi alınamıyor. GPS sinyali zayıf olabilir.');
            break;
          case error.TIMEOUT:
            setError(`Konum alma işlemi ${endTime - startTime}ms sonra zaman aşımına uğradı.`);
            break;
          default:
            setError(`Bilinmeyen hata: ${error.message}`);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 30000, // 30 saniye
        maximumAge: 0
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Konum Testi</h1>
        
        {/* İzin Durumu */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Konum İzni Durumu</h2>
          
          <div className="flex items-center gap-3">
            {permissionStatus === 'granted' && (
              <>
                <CheckCircle className="h-6 w-6 text-green-500" />
                <span className="text-green-700">Konum izni verilmiş</span>
              </>
            )}
            {permissionStatus === 'denied' && (
              <>
                <AlertCircle className="h-6 w-6 text-red-500" />
                <span className="text-red-700">Konum izni reddedilmiş</span>
              </>
            )}
            {permissionStatus === 'prompt' && (
              <>
                <AlertCircle className="h-6 w-6 text-yellow-500" />
                <span className="text-yellow-700">Konum izni sorulacak</span>
              </>
            )}
            {permissionStatus === 'unknown' && (
              <>
                <AlertCircle className="h-6 w-6 text-gray-500" />
                <span className="text-gray-700">İzin durumu bilinmiyor</span>
              </>
            )}
          </div>
          
          {permissionStatus === 'denied' && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">
                Konum hizmetlerini kullanabilmek için:
              </p>
              <ol className="list-decimal list-inside text-sm text-red-700 mt-2 space-y-1">
                <li>Tarayıcınızın adres çubuğundaki kilit/bilgi simgesine tıklayın</li>
                <li>Site ayarlarını açın</li>
                <li>Konum iznini "İzin ver" olarak değiştirin</li>
                <li>Sayfayı yenileyin</li>
              </ol>
            </div>
          )}
        </div>

        {/* Basit Konum Testi */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basit Konum Testi</h2>
          
          <button
            onClick={testLocation}
            disabled={isLoading}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Konum alınıyor...
              </>
            ) : (
              <>
                <Navigation className="h-5 w-5" />
                Konumumu Al
              </>
            )}
          </button>
          
          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-700">{error}</p>
            </div>
          )}
          
          {locationInfo && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">Konum Bilgileri:</h3>
              <dl className="space-y-1 text-sm">
                <div className="flex gap-2">
                  <dt className="font-medium text-green-700">Enlem:</dt>
                  <dd className="text-green-600">{locationInfo.latitude}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="font-medium text-green-700">Boylam:</dt>
                  <dd className="text-green-600">{locationInfo.longitude}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="font-medium text-green-700">Doğruluk:</dt>
                  <dd className="text-green-600">{locationInfo.accuracy} metre</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="font-medium text-green-700">Zaman:</dt>
                  <dd className="text-green-600">{locationInfo.timestamp}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="font-medium text-green-700">Yanıt Süresi:</dt>
                  <dd className="text-green-600">{locationInfo.responseTime}</dd>
                </div>
                <div className="col-span-2 mt-4">
                  <a 
                    href={`https://www.google.com/maps?q=${locationInfo.latitude},${locationInfo.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <MapPin className="h-4 w-4" />
                    Google Maps'te Göster
                  </a>
                </div>
              </dl>
            </div>
          )}
        </div>

        {/* Harita ile Test */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Harita ile Konum Testi</h2>
          
          <UnifiedMapPicker
            onLocationSelect={(address, lat, lng, city, district) => {
              console.log('Harita konum seçimi:', { address, lat, lng, city, district });
            }}
            height="400px"
            showSearch={true}
            showCitySelector={false}
            showCurrentLocation={true}
            placeholder="Adres ara..."
          />
        </div>

        {/* Sorun Giderme */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Konum Sorunları İçin:</h3>
          
          <div className="space-y-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-1">1. Tarayıcı İzinleri:</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Chrome: Ayarlar → Gizlilik ve güvenlik → Site ayarları → Konum</li>
                <li>Safari: Tercihler → Web Siteleri → Konum</li>
                <li>Firefox: Ayarlar → Gizlilik ve Güvenlik → İzinler → Konum</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-1">2. Sistem İzinleri (macOS):</h4>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Sistem Tercihleri → Güvenlik ve Gizlilik → Gizlilik → Konum Hizmetleri</li>
                <li>Tarayıcınızın işaretli olduğundan emin olun</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-1">3. HTTPS Gereksinimi:</h4>
              <p className="ml-4">Konum hizmetleri sadece HTTPS veya localhost üzerinde çalışır.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 