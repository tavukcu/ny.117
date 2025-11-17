'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MapPin, Loader2, Navigation, Search, Home, Building2, Clock } from 'lucide-react';

interface EnhancedMapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (address: string, lat: number, lng: number, city?: string, district?: string, placeId?: string) => void;
  onAddressChange?: (address: string) => void;
  className?: string;
  showSearch?: boolean;
  showPlaces?: boolean;
  showDirections?: boolean;
}

const EnhancedMapPicker: React.FC<EnhancedMapPickerProps> = ({
  initialLat = 41.0082,
  initialLng = 28.9784,
  onLocationSelect,
  onAddressChange,
  className = '',
  showSearch = true,
  showPlaces = true,
  showDirections = false
}) => {
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [currentLat, setCurrentLat] = useState(initialLat);
  const [currentLng, setCurrentLng] = useState(initialLng);
  const [currentAddress, setCurrentAddress] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [nearbyPlaces, setNearbyPlaces] = useState<any[]>([]);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);
  const geocoderRef = useRef<google.maps.Geocoder | null>(null);
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null);
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const directionsServiceRef = useRef<google.maps.DirectionsService | null>(null);
  const directionsRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    loadGoogleMaps();
  }, []);

  useEffect(() => {
    if (mapInstanceRef.current && showPlaces) {
      searchNearbyPlaces();
    }
  }, [currentLat, currentLng, showPlaces]);

  const loadGoogleMaps = () => {
    if (typeof window !== 'undefined' && (window as any).google?.maps) {
      initializeMap();
      return;
    }

    if (typeof window !== 'undefined') {
      const script = document.createElement('script');
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyAYMnjI4xCKVxmXZId0VgkgqgROJHslJ5A';
      
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry&callback=initGoogleMaps&language=tr&region=TR&v=beta`;
      script.async = true;
      script.defer = true;
      
      (window as any).initGoogleMaps = () => {
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
                setLocationError('Google Maps API hatası - API key ayarlarını kontrol edin');
              }
            };
            setTimeout(checkAPI, 100);
          } else {
            throw new Error('Google Maps API tam yüklenmedi');
          }
        } catch (error) {
          console.error('Google Maps başlatma hatası:', error);
          setLocationError('Google Maps API hatası - API key ayarlarını kontrol edin');
        }
      };
      
      script.onerror = (error) => {
        console.error('Google Maps yükleme hatası:', error);
        setLocationError('Google Maps API yüklenemedi - API key veya billing kontrolü gerekli');
      };
      
      script.onload = () => {
        console.log('Google Maps script yüklendi');
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
      
      // 20 saniye timeout
      setTimeout(() => {
        if (!isMapLoaded) {
          setLocationError('Google Maps yükleme timeout - API ayarlarını kontrol edin');
        }
      }, 20000);
    }
  };

  const initializeMap = () => {
    if (!mapRef.current || !(window as any).google?.maps) {
      console.error('Google Maps API yüklenmedi');
      setLocationError('Google Maps API yüklenemedi');
      return;
    }

    const google = (window as any).google;
    
    // API'nin gerekli bileşenlerinin varlığını kontrol et
    if (!google.maps.Map || !google.maps.Marker || !google.maps.Geocoder) {
      console.error('Google Maps API bileşenleri eksik');
      setLocationError('Google Maps API bileşenleri eksik');
      return;
    }
    
    // Harita oluştur
    mapInstanceRef.current = new google.maps.Map(mapRef.current, {
      center: { lat: currentLat, lng: currentLng },
      zoom: 15,
      mapTypeControl: true,
      streetViewControl: true,
      fullscreenControl: true,
      zoomControl: true,
      styles: [
        {
          featureType: 'poi.business',
          stylers: [{ visibility: 'on' }]
        }
      ]
    });

    // Ana marker
    markerRef.current = new google.maps.Marker({
      position: { lat: currentLat, lng: currentLng },
      map: mapInstanceRef.current,
      draggable: true,
      animation: google.maps.Animation.DROP,
      title: 'Teslimat Adresi',
      icon: {
        url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
        scaledSize: new google.maps.Size(40, 40)
      }
    });

    // InfoWindow
    infoWindowRef.current = new google.maps.InfoWindow();

    // Geocoder
    geocoderRef.current = new google.maps.Geocoder();

    // Places Service
    if (mapInstanceRef.current) {
      placesServiceRef.current = new google.maps.places.PlacesService(mapInstanceRef.current);
    }

    // Directions Service
    if (showDirections) {
      directionsServiceRef.current = new google.maps.DirectionsService();
      directionsRendererRef.current = new google.maps.DirectionsRenderer({
        map: mapInstanceRef.current,
        suppressMarkers: true
      });
    }

    // SearchBox
    if (showSearch && searchInputRef.current) {
      searchBoxRef.current = new google.maps.places.SearchBox(searchInputRef.current);
      
      // Harita sınırlarına göre arama sonuçlarını filtrele
      if (mapInstanceRef.current) {
        mapInstanceRef.current.addListener('bounds_changed', () => {
          if (searchBoxRef.current && mapInstanceRef.current) {
            searchBoxRef.current.setBounds(mapInstanceRef.current.getBounds() as google.maps.LatLngBounds);
          }
        });
      }

      // Arama sonucu seçildiğinde
      if (searchBoxRef.current) {
        searchBoxRef.current.addListener('places_changed', () => {
          const places = searchBoxRef.current?.getPlaces();
          if (!places || places.length === 0) return;

          const place = places[0];
          if (!place.geometry || !place.geometry.location) return;

          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          
          updateMapLocation(lat, lng);
          
          if (place.place_id) {
            setSelectedPlaceId(place.place_id);
            getPlaceDetails(place.place_id);
          }
        });
      }
    }

    // Event listeners
    if (markerRef.current) {
      markerRef.current.addListener('dragend', (e: any) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        updateMapLocation(lat, lng);
      });
    }

    if (mapInstanceRef.current) {
      mapInstanceRef.current.addListener('click', (e: any) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        updateMapLocation(lat, lng);
      });
    }

    setIsMapLoaded(true);
    
    // İlk konum bilgisini al
    reverseGeocode(currentLat, currentLng);
  };

  const updateMapLocation = (lat: number, lng: number) => {
    if (!mapInstanceRef.current || !markerRef.current) return;

    const position = { lat, lng };
    mapInstanceRef.current.setCenter(position);
    markerRef.current.setPosition(position);
    setCurrentLat(lat);
    setCurrentLng(lng);
    reverseGeocode(lat, lng);
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    if (!geocoderRef.current) return;

    setIsGeocoding(true);
    
    geocoderRef.current.geocode(
      { 
        location: { lat, lng },
        language: 'tr',
        region: 'TR'
      },
      (results: any, status: any) => {
        if (status === 'OK' && results && results[0]) {
          const result = results[0];
          const address = result.formatted_address;
          
          let city = '';
          let district = '';
          
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
          onLocationSelect(address, lat, lng, city, district, result.place_id);
          if (onAddressChange) {
            onAddressChange(address);
          }

          // InfoWindow göster
          if (infoWindowRef.current && markerRef.current) {
            infoWindowRef.current.setContent(`
              <div style="padding: 8px;">
                <strong>Seçili Adres:</strong><br/>
                ${address}
              </div>
            `);
            infoWindowRef.current.open(mapInstanceRef.current, markerRef.current);
          }
        }
        setIsGeocoding(false);
      }
    );
  };

  const searchNearbyPlaces = () => {
    if (!placesServiceRef.current || !mapInstanceRef.current) return;

    const request = {
      location: { lat: currentLat, lng: currentLng },
      radius: 1000, // 1km yarıçap
      type: 'restaurant'
    };

    placesServiceRef.current.nearbySearch(request, (results, status) => {
      if (status === 'OK' && results) {
        setNearbyPlaces(results.slice(0, 5)); // İlk 5 restoran
        
        // Haritaya marker ekle
        results.slice(0, 5).forEach((place) => {
          if (!place.geometry?.location) return;
          
          const marker = new google.maps.Marker({
            position: place.geometry.location,
            map: mapInstanceRef.current,
            title: place.name,
            icon: {
              url: 'https://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              scaledSize: new google.maps.Size(30, 30)
            }
          });

          marker.addListener('click', () => {
            if (infoWindowRef.current) {
              infoWindowRef.current.setContent(`
                <div style="padding: 8px;">
                  <strong>${place.name}</strong><br/>
                  ${place.vicinity || ''}<br/>
                  ${place.rating ? `⭐ ${place.rating}` : ''}
                </div>
              `);
              infoWindowRef.current.open(mapInstanceRef.current, marker);
            }
          });
        });
      }
    });
  };

  const getPlaceDetails = (placeId: string) => {
    if (!placesServiceRef.current) return;

    const request = {
      placeId: placeId,
      fields: ['name', 'formatted_address', 'geometry', 'formatted_phone_number', 'opening_hours', 'website', 'rating']
    };

    placesServiceRef.current.getDetails(request, (place, status) => {
      if (status === 'OK' && place) {
        console.log('Place details:', place);
      }
    });
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Tarayıcınız konum hizmetlerini desteklemiyor');
      return;
    }

    setIsGettingLocation(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        updateMapLocation(lat, lng);
        setIsGettingLocation(false);
      },
      (error) => {
        setLocationError('Konum alınamadı');
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  return (
    <div className={`relative ${className}`}>
      {/* Arama Kutusu */}
      {showSearch && (
        <div className="absolute top-4 left-4 right-4 z-10 max-w-md">
          <div className="relative">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Adres ara..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 pr-4 bg-white border border-gray-300 rounded-lg shadow-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <Search className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      )}

      {/* Harita Container */}
      <div 
        className="w-full bg-gray-100 rounded-lg border border-gray-300 relative overflow-hidden"
        style={{ height: '500px' }}
      >
        <div
          ref={mapRef}
          className="w-full h-full"
        />
        
        {/* Loading Overlay */}
        {!isMapLoaded && !locationError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <Loader2 className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-2" />
              <p className="text-sm text-gray-600">Harita yükleniyor...</p>
              <p className="text-xs text-gray-500 mt-1">Google Maps API bağlantısı kuruluyor...</p>
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {locationError && (
          <div className="absolute inset-0 flex items-center justify-center bg-red-50 border-2 border-red-200 rounded-lg">
            <div className="text-center p-6 max-w-md">
              <div className="bg-red-100 rounded-full p-3 w-fit mx-auto mb-4">
                <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-red-900 mb-2">Google Maps Hatası</h3>
              <p className="text-sm text-red-700 mb-4">{locationError}</p>
              <div className="space-y-2 text-xs text-red-600">
                <p>• Google Cloud Console'da API key ayarlarını kontrol edin</p>
                <p>• Billing hesabınızın aktif olduğundan emin olun</p>
                <p>• Gerekli API'lerin etkinleştirildiğini doğrulayın</p>
              </div>
              <button
                onClick={() => {
                  setLocationError('');
                  loadGoogleMaps();
                }}
                className="mt-4 px-4 py-2 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
              >
                Tekrar Dene
              </button>
            </div>
          </div>
        )}

        {/* Konum Butonu */}
        <button
          onClick={getCurrentLocation}
          disabled={isGettingLocation}
          className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
          title="Konumuma git"
        >
          {isGettingLocation ? (
            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
          ) : (
            <Navigation className="h-5 w-5 text-blue-500" />
          )}
        </button>
      </div>
      
      {/* Alt Bilgi */}
      <div className="mt-3">
        {isGeocoding ? (
          <div className="flex items-center text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            Adres çözümleniyor...
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-700">
              <strong>Seçili Adres:</strong> {currentAddress || 'Haritadan bir konum seçin'}
            </p>
            {nearbyPlaces.length > 0 && (
              <div className="mt-2">
                <p className="text-sm font-medium text-gray-700 mb-1">Yakındaki Restoranlar:</p>
                <div className="flex flex-wrap gap-2">
                  {nearbyPlaces.map((place, index) => (
                    <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {place.name}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedMapPicker; 