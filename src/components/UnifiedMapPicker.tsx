'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  MapPin, 
  Search, 
  Navigation, 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  Target,
  RefreshCw
} from 'lucide-react';
import { TURKISH_CITIES, POPULAR_CITIES, getCityById, getDistrictsByCity, City, District } from '@/data/cities';
import toast from 'react-hot-toast';

interface UnifiedMapPickerProps {
  // Temel props
  initialLat?: number;
  initialLng?: number;
  initialAddress?: string;
  initialCity?: string;
  initialDistrict?: string;
  
  // Callback'ler
  onLocationSelect: (address: string, lat: number, lng: number, city?: string, district?: string, placeId?: string) => void;
  onAddressChange?: (address: string) => void;
  onCityChange?: (cityId: string, cityName: string) => void;
  onDistrictChange?: (districtId: string, districtName: string) => void;
  
  // Özelleştirme
  className?: string;
  height?: string;
  showSearch?: boolean;
  showCitySelector?: boolean;
  showCurrentLocation?: boolean;
  showNearbyPlaces?: boolean;
  placeholder?: string;
  
  // Davranış
  autoCenter?: boolean;
  draggableMarker?: boolean;
  zoomLevel?: number;
  
  // Stil
  theme?: 'light' | 'dark';
  accentColor?: string;
}

const UnifiedMapPicker: React.FC<UnifiedMapPickerProps> = ({
  initialLat = 38.5205,  // Manisa Ahmetli koordinatları
  initialLng = 27.9380,  // Manisa Ahmetli koordinatları
  initialAddress = '',
  initialCity = '45',    // Manisa il kodu
  initialDistrict = '',
  onLocationSelect,
  onAddressChange,
  onCityChange,
  onDistrictChange,
  className = '',
  height = '400px',
  showSearch = true,
  showCitySelector = true,
  showCurrentLocation = true,
  showNearbyPlaces = false,
  placeholder = 'Adres ara...',
  autoCenter = true,
  draggableMarker = true,
  zoomLevel = 15,
  theme = 'light',
  accentColor = '#10b981'
}) => {
  // State yönetimi
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Konum state'leri
  const [currentLat, setCurrentLat] = useState(initialLat);
  const [currentLng, setCurrentLng] = useState(initialLng);
  const [currentAddress, setCurrentAddress] = useState(initialAddress);
  const [selectedCity, setSelectedCity] = useState(initialCity);
  const [selectedDistrict, setSelectedDistrict] = useState(initialDistrict);
  const [availableDistricts, setAvailableDistricts] = useState<District[]>([]);
  
  // İşlem state'leri
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // UI state'leri
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);
  
  // Refs
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  
  // Google Maps yükleme - Sadece temel API
  const loadGoogleMaps = useCallback(() => {
    if (typeof window !== 'undefined' && (window as any).google?.maps) {
      initializeMap();
      return;
    }

    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyAYMnjI4xCKVxmXZId0VgkgqgROJHslJ5A';
      
      // Minimal API - sadece core harita
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initUnifiedGoogleMaps&language=tr&region=TR&libraries=places,geometry&v=beta`;
      script.async = true;
      script.defer = true;
      
      (window as any).initUnifiedGoogleMaps = () => {
        try {
          // API'nin tamamen yüklendiğinden emin ol
          if ((window as any).google && (window as any).google.maps) {
            // API'nin tamamen hazır olmasını bekle
            const checkAPI = () => {
              try {
                if ((window as any).google.maps.Map && (window as any).google.maps.Marker) {
                  initializeMap();
                } else {
                  setTimeout(checkAPI, 50);
                }
              } catch (error) {
                console.error('API hazırlık kontrolü hatası:', error);
                setError('Harita yüklenemedi. Lütfen sayfayı yenileyin.');
                setIsLoading(false);
              }
            };
            setTimeout(checkAPI, 100);
          } else {
            throw new Error('Google Maps API tam yüklenmedi');
          }
        } catch (error) {
          console.error('Google Maps başlatma hatası:', error);
          setError('Harita yüklenemedi. Lütfen sayfayı yenileyin.');
          setIsLoading(false);
        }
      };
      
      script.onerror = () => {
        console.error('Google Maps API script yükleme hatası');
        setError('Google Maps API yüklenemedi. İnternet bağlantınızı kontrol edin.');
        setIsLoading(false);
      };

      // Script yükleme başarısız olursa fallback
      script.onload = () => {
        console.log('Google Maps API script yüklendi');
        // Script yüklendi ama callback çağrılmadıysa
        setTimeout(() => {
          if (!isMapLoaded) {
            console.log('Callback çağrılmadı, manuel başlatma deneniyor');
            try {
              if ((window as any).google && (window as any).google.maps) {
                initializeMap();
              }
            } catch (error) {
              console.error('Manuel başlatma hatası:', error);
            }
          }
        }, 2000);
      };
      

      
      document.head.appendChild(script);
      
      // Timeout
      setTimeout(() => {
        if (!isMapLoaded) {
          console.error('Harita yükleme zaman aşımı');
          setError('Harita yükleme zaman aşımı. Sayfayı yenileyin.');
          setIsLoading(false);
        }
      }, 20000);
    }
  }, [isMapLoaded]);

  // Harita başlatma - Basitleştirilmiş
  const initializeMap = useCallback(() => {
    if (!mapRef.current || !(window as any).google?.maps) {
      console.error('Google Maps API yüklenmedi');
      setError('Google Maps API yüklenemedi');
      setIsLoading(false);
      return;
    }

    const google = (window as any).google;
    
    try {
      // API'nin gerekli bileşenlerinin varlığını kontrol et
      if (!google.maps.Map || !google.maps.Marker || !google.maps.Geocoder) {
        console.error('Google Maps API bileşenleri eksik');
        setError('Google Maps API bileşenleri eksik');
        setIsLoading(false);
        return;
      }

      // Basit harita konfigürasyonu
      mapInstanceRef.current = new google.maps.Map(mapRef.current, {
        center: { lat: currentLat, lng: currentLng },
        zoom: zoomLevel,
        disableDefaultUI: true,
        zoomControl: true,
        gestureHandling: 'greedy',
        backgroundColor: '#f5f5f5',
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: theme === 'dark' ? [
          { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
          { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
          { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] }
        ] : []
      });

      // Güvenli marker oluşturma - sadece standart Marker API kullan
      try {
        markerRef.current = new google.maps.Marker({
          position: { lat: currentLat, lng: currentLng },
          map: mapInstanceRef.current,
          draggable: draggableMarker,
          title: 'Seçili Konum',
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 8,
            fillColor: accentColor,
            fillOpacity: 1,
            strokeColor: '#ffffff',
            strokeWeight: 2
          }
        }) as any;

        // Drag event
        if (draggableMarker) {
          (markerRef.current as any).addListener('dragend', (e: any) => {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            updateMapLocation(lat, lng);
          });
        }
      } catch (error) {
        console.error('Marker oluşturma hatası:', error);
        // Basit marker fallback
        markerRef.current = new google.maps.Marker({
          position: { lat: currentLat, lng: currentLng },
          map: mapInstanceRef.current,
          draggable: draggableMarker,
          title: 'Seçili Konum'
        }) as any;
      }

      // InfoWindow
      infoWindowRef.current = new google.maps.InfoWindow();

      // Geocoder
      geocoderRef.current = new google.maps.Geocoder();

      // Map click event
      if (mapInstanceRef.current) {
        mapInstanceRef.current.addListener('click', (e: any) => {
          const lat = e.latLng.lat();
          const lng = e.latLng.lng();
          updateMapLocation(lat, lng);
        });
      }

      setIsMapLoaded(true);
      setIsLoading(false);
      setError(null);
      
      // İlk reverse geocoding
      if (initialAddress) {
        setCurrentAddress(initialAddress);
      } else {
        reverseGeocode(currentLat, currentLng);
      }
      
    } catch (error) {
      console.error('Harita başlatma hatası:', error);
      setError('Harita başlatılamadı. Sayfayı yenileyin.');
      setIsLoading(false);
    }
  }, [currentLat, currentLng, zoomLevel, theme, accentColor, draggableMarker, initialAddress]);

  // Konum güncelleme
  const updateMapLocation = useCallback((lat: number, lng: number) => {
    if (!mapInstanceRef.current || !markerRef.current) return;

    const position = { lat, lng };
    
    if (autoCenter) {
      mapInstanceRef.current.setCenter(position);
    }
    
    // Marker pozisyonunu güncelle
    if ((markerRef.current as any).setPosition) {
      (markerRef.current as any).setPosition(position);
    } else if (markerRef.current.position) {
      markerRef.current.position = position;
    }
    
    setCurrentLat(lat);
    setCurrentLng(lng);
    
    // Reverse geocoding
    reverseGeocode(lat, lng);
  }, [autoCenter]);

  // Reverse geocoding - Basitleştirilmiş
  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    if (!geocoderRef.current) {
      console.error('Geocoder mevcut değil');
      return;
    }

    setIsGeocoding(true);
    console.log('Reverse geocoding başlatılıyor:', { lat, lng });
    
    try {
      const results = await new Promise<google.maps.GeocoderResult[]>((resolve, reject) => {
        const request = {
          location: { lat, lng },
          language: 'tr',
          region: 'TR'
        };
        
        geocoderRef.current!.geocode(
          request,
          (results, status) => {
            console.log('Geocoding sonucu:', { status, resultCount: results?.length });
            if (status === 'OK' && results) {
              resolve(results);
            } else {
              reject(new Error(status));
            }
          }
        );
      });

      if (results && results[0]) {
        const result = results[0];
        const address = result.formatted_address;
        
        console.log('Bulunan adres:', {
          formatted_address: address,
          place_id: result.place_id,
          types: result.types,
          components: result.address_components.map(c => ({
            long_name: c.long_name,
            types: c.types
          }))
        });
        
        let city = '';
        let district = '';
        const placeId = result.place_id;
        
        // Adres bileşenlerini parse et
        for (const component of result.address_components) {
          if (component.types.includes('administrative_area_level_1')) {
            city = component.long_name;
          }
          if (component.types.includes('administrative_area_level_2') || 
              component.types.includes('sublocality_level_1')) {
            district = component.long_name;
          }
        }
        
        setCurrentAddress(address);
        
        // Callbacks
        onLocationSelect(address, lat, lng, city, district, placeId);
        if (onAddressChange) {
          onAddressChange(address);
        }

        // InfoWindow göster
        showInfoWindow(address, city, district);
      }
    } catch (error) {
      // Sessiz hata - kullanıcıyı rahatsız etme
      console.warn('Geocoding hatası:', error);
    } finally {
      setIsGeocoding(false);
    }
  }, [onLocationSelect, onAddressChange]);

  // InfoWindow göster
  const showInfoWindow = useCallback((address: string, city?: string, district?: string) => {
    if (!infoWindowRef.current || !markerRef.current || !mapInstanceRef.current) return;

    const content = `
      <div style="padding: 8px; max-width: 250px; font-family: system-ui, -apple-system, sans-serif;">
        <div style="font-weight: 600; color: ${accentColor}; margin-bottom: 6px; font-size: 14px;">
          📍 Seçili Konum
        </div>
        <div style="font-size: 13px; line-height: 1.3; color: #374151;">
          ${address}
        </div>
        ${city && district ? `
          <div style="font-size: 11px; color: #6b7280; margin-top: 4px;">
            ${district}, ${city}
          </div>
        ` : ''}
      </div>
    `;

    infoWindowRef.current.setContent(content);
    
    // Marker pozisyonunu al
    let markerPosition;
    if ((markerRef.current as any).getPosition) {
      markerPosition = (markerRef.current as any).getPosition();
    } else if (markerRef.current.position) {
      markerPosition = markerRef.current.position;
    }

    if (markerPosition) {
      infoWindowRef.current.setPosition(markerPosition);
      infoWindowRef.current.open(mapInstanceRef.current);
    }
  }, [accentColor]);

  // Mevcut konum al
  const getCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      toast.error('Tarayıcınız konum hizmetlerini desteklemiyor');
      return;
    }

    setIsGettingLocation(true);

    // Önce konum izinlerini kontrol et
    try {
      if (navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        console.log('Konum izni durumu:', permission.state);
        
        if (permission.state === 'denied') {
          toast.error('Konum izni reddedilmiş. Tarayıcı ayarlarından konum iznini açın.');
          setIsGettingLocation(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Konum izni kontrolü başarısız:', err);
    }

    console.log('Konum alınmaya çalışılıyor...');
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        const accuracy = position.coords.accuracy;
        
        console.log('Konum başarıyla alındı:', { 
          lat, 
          lng, 
          accuracy: `${accuracy} metre`,
          timestamp: new Date(position.timestamp).toLocaleString('tr-TR')
        });
        
        updateMapLocation(lat, lng);
        setIsGettingLocation(false);
        toast.success(`Konumunuz başarıyla alındı (±${Math.round(accuracy)}m hassasiyet)`);
      },
      (error) => {
        setIsGettingLocation(false);
        console.error('Konum hatası detayları:', {
          code: error.code,
          message: error.message,
          PERMISSION_DENIED: error.PERMISSION_DENIED,
          POSITION_UNAVAILABLE: error.POSITION_UNAVAILABLE,
          TIMEOUT: error.TIMEOUT
        });
        
        // Detaylı hata mesajları
        switch(error.code) {
          case error.PERMISSION_DENIED:
            toast.error('Konum izni reddedildi. Lütfen tarayıcı ayarlarından konum iznini açın.');
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error('Konum bilgisi alınamıyor. GPS sinyali zayıf veya internet bağlantınızı kontrol edin.');
            break;
          case error.TIMEOUT:
            toast.error('Konum alma işlemi zaman aşımına uğradı. Lütfen tekrar deneyin.');
            break;
          default:
            toast.error(`Konum alınamadı: ${error.message}`);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 20000, // 20 saniye
        maximumAge: 0
      }
    );
  }, [updateMapLocation]);

  // Adres arama - Basitleştirilmiş
  const searchAddress = useCallback((address: string) => {
    if (!geocoderRef.current || !address.trim()) return;

    setIsGeocoding(true);
    
    geocoderRef.current.geocode(
      { 
        address: address,
        language: 'tr',
        region: 'TR'
      },
      (results, status) => {
        setIsGeocoding(false);
        if (status === 'OK' && results && results[0]) {
          const result = results[0];
          const location = result.geometry.location;
          const lat = location.lat();
          const lng = location.lng();
          
          updateMapLocation(lat, lng);
          toast.success('Adres bulundu');
        } else {
          toast.error('Adres bulunamadı');
        }
      }
    );
  }, [updateMapLocation]);

  // İl değişikliği
  useEffect(() => {
    if (selectedCity) {
      const districts = getDistrictsByCity(selectedCity);
      setAvailableDistricts(districts);
      
      if (selectedDistrict && !districts.find(d => d.id === selectedDistrict)) {
        setSelectedDistrict('');
        onDistrictChange?.('', '');
      }
    } else {
      setAvailableDistricts([]);
      setSelectedDistrict('');
      onDistrictChange?.('', '');
    }
  }, [selectedCity]);
  
  // İlk yüklemede ilçeleri yükle
  useEffect(() => {
    if (initialCity && !selectedCity) {
      const districts = getDistrictsByCity(initialCity);
      setAvailableDistricts(districts);
    }
  }, [initialCity]);

  // Component mount
  useEffect(() => {
    loadGoogleMaps();
  }, [loadGoogleMaps]);

  // İl seçimi
  const handleCitySelect = (cityId: string) => {
    const city = getCityById(cityId);
    if (city) {
      setSelectedCity(cityId);
      setShowCityDropdown(false);
      onCityChange?.(cityId, city.name);
    }
  };

  // İlçe seçimi
  const handleDistrictSelect = (districtId: string) => {
    const district = availableDistricts.find(d => d.id === districtId);
    if (district) {
      setSelectedDistrict(districtId);
      setShowDistrictDropdown(false);
      onDistrictChange?.(districtId, district.name);
    }
  };

  const selectedCityData = selectedCity ? getCityById(selectedCity) : null;
  const selectedDistrictData = selectedDistrict ? availableDistricts.find(d => d.id === selectedDistrict) : null;

  return (
    <div className={`unified-map-picker ${className}`}>
      {/* Üst Kontroller */}
      <div className="space-y-4 mb-4">
        {/* Şehir Seçici */}
        {showCitySelector && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* İl Seçimi */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İl Seçiniz
              </label>
              
              {/* Popüler Şehirler */}
              <div className="mb-3">
                <div className="flex flex-wrap gap-2">
                  {POPULAR_CITIES.map(cityId => {
                    const city = getCityById(cityId);
                    return city ? (
                      <button
                        key={cityId}
                        type="button"
                        onClick={() => handleCitySelect(cityId)}
                        className={`px-3 py-1 text-sm rounded-full border transition-all ${
                          selectedCity === cityId
                            ? 'border-green-500 bg-green-50 text-green-700'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-green-300'
                        }`}
                      >
                        {city.name}
                      </button>
                    ) : null;
                  })}
                </div>
              </div>

              {/* İl Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowCityDropdown(!showCityDropdown)}
                  className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg hover:border-green-500 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                >
                  {selectedCityData ? selectedCityData.name : 'Tüm iller...'}
                </button>
                
                {showCityDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {TURKISH_CITIES.map(city => (
                      <button
                        key={city.id}
                        type="button"
                        onClick={() => handleCitySelect(city.id)}
                        className="w-full px-4 py-2 text-left hover:bg-green-50 hover:text-green-700 transition-colors"
                      >
                        {city.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* İlçe Seçimi */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İlçe Seçiniz
              </label>
              
              <div className="mt-8">
                <button
                  type="button"
                  onClick={() => setShowDistrictDropdown(!showDistrictDropdown)}
                  disabled={!selectedCity}
                  className="w-full px-4 py-3 text-left bg-white border border-gray-300 rounded-lg hover:border-green-500 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {selectedDistrictData ? selectedDistrictData.name : 'İlçe seçiniz...'}
                </button>
                
                {showDistrictDropdown && availableDistricts.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {availableDistricts.map(district => (
                      <button
                        key={district.id}
                        type="button"
                        onClick={() => handleDistrictSelect(district.id)}
                        className="w-full px-4 py-2 text-left hover:bg-green-50 hover:text-green-700 transition-colors"
                      >
                        {district.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Adres Arama */}
        {showSearch && (
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detaylı Adres
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder={placeholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    searchAddress(searchQuery);
                  }
                }}
                className="w-full px-4 py-3 pl-12 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
              />
              <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
              <button
                type="button"
                onClick={() => searchAddress(searchQuery)}
                disabled={isGeocoding || !searchQuery.trim()}
                className="absolute right-3 top-2.5 p-1 text-green-600 hover:text-green-700 disabled:opacity-50"
              >
                {isGeocoding ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Target className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Harita Alanı */}
      <div className="relative">
        <div 
          className="w-full bg-gray-100 rounded-lg border border-gray-300 relative overflow-hidden"
          style={{ height }}
        >
          {/* Harita */}
          <div
            ref={mapRef}
            className="w-full h-full"
          />
          
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-95">
              <div className="text-center">
                <Loader2 className="h-8 w-8 text-green-500 animate-spin mx-auto mb-3" />
                <p className="text-sm text-gray-600 font-medium">Harita yükleniyor...</p>
                <p className="text-xs text-gray-500 mt-1">Google Maps bağlantısı kuruluyor</p>
              </div>
            </div>
          )}

          {/* Error Overlay */}
          {error && (
            <div className="absolute inset-0 flex items-center justify-center bg-red-50 border-2 border-red-200">
              <div className="text-center p-6 max-w-md">
                <div className="bg-red-100 rounded-full p-3 w-fit mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-red-900 mb-2">Harita Hatası</h3>
                <p className="text-sm text-red-700 mb-4">{error}</p>
                <button
                  onClick={() => {
                    setError(null);
                    setIsLoading(true);
                    loadGoogleMaps();
                  }}
                  className="px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
                >
                  <RefreshCw className="h-4 w-4 inline mr-2" />
                  Tekrar Dene
                </button>
              </div>
            </div>
          )}

          {/* Kontrol Butonları */}
          {isMapLoaded && (
            <div className="absolute top-4 right-4">
              {/* Mevcut Konum */}
              {showCurrentLocation && (
                <button
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="bg-white p-3 rounded-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                  title="Konumuma git"
                >
                  {isGettingLocation ? (
                    <Loader2 className="h-5 w-5 animate-spin text-green-500" />
                  ) : (
                    <Navigation className="h-5 w-5 text-green-500" />
                  )}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Alt Bilgi */}
      <div className="mt-4 space-y-3">
        {/* Geocoding Durumu */}
        {isGeocoding && (
          <div className="flex items-center text-sm text-gray-600">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Adres çözümleniyor...
          </div>
        )}

        {/* Seçili Adres */}
        {currentAddress && !isGeocoding && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-green-900 mb-1">Seçili Adres</p>
                <p className="text-sm text-green-700">{currentAddress}</p>
                {selectedCityData && selectedDistrictData && (
                  <p className="text-xs text-green-600 mt-1">
                    {selectedDistrictData.name}, {selectedCityData.name}
                  </p>
                )}
                <p className="text-xs text-green-600 mt-1">
                  Koordinatlar: {currentLat.toFixed(6)}, {currentLng.toFixed(6)}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Kullanım Talimatları */}
        <div className="text-xs text-gray-500 space-y-1">
          {draggableMarker && <p>• Marker'ı sürükleyerek konumu ayarlayabilirsiniz</p>}
          <p>• Haritaya tıklayarak yeni konum seçebilirsiniz</p>
          {showCurrentLocation && <p>• Konum butonuna tıklayarak mevcut konumunuzu kullanabilirsiniz</p>}
        </div>
      </div>
    </div>
  );
};

export default UnifiedMapPicker; 