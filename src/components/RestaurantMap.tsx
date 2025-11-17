'use client';

import { useState, useEffect, useRef } from 'react';
import { useLocation } from '@/hooks/useLocation';
import { MapPin, Navigation, Target, X, Info } from 'lucide-react';
import type { RestaurantInfo } from '@/types';

interface RestaurantMapProps {
  restaurants: RestaurantInfo[];
  onRestaurantClick?: (restaurant: RestaurantInfo) => void;
  className?: string;
}

export default function RestaurantMap({ 
  restaurants, 
  onRestaurantClick,
  className = "" 
}: RestaurantMapProps) {
  const { coordinates: userLocation, getCurrentLocation, loading: locationLoading } = useLocation();
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantInfo | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Google Maps API'sini yükle
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (window.google && window.google.maps) {
        setMapLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => setMapLoaded(true);
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Haritayı başlat
  useEffect(() => {
    if (!mapLoaded || !mapRef.current) return;

    const initMap = () => {
      const defaultCenter = userLocation 
        ? { lat: userLocation.lat, lng: userLocation.lng }
        : { lat: 38.4237, lng: 27.1428 }; // İzmir merkezi

      const map = new window.google.maps.Map(mapRef.current!, {
        center: defaultCenter,
        zoom: 12,
        styles: [
          {
            featureType: 'poi',
            elementType: 'labels',
            stylers: [{ visibility: 'off' }]
          }
        ],
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false
      });

      mapInstanceRef.current = map;

      // Kullanıcı konumu marker'ı
      if (userLocation) {
        new window.google.maps.Marker({
          position: { lat: userLocation.lat, lng: userLocation.lng },
          map: map,
          icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="white" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" fill="white"/>
              </svg>
            `),
            scaledSize: new window.google.maps.Size(24, 24),
            anchor: new window.google.maps.Point(12, 12)
          },
          title: 'Konumunuz'
        });
      }

      // Restoran marker'larını ekle
      addRestaurantMarkers(map, restaurants);
    };

    initMap();
  }, [mapLoaded, userLocation, restaurants]);

  // Restoran marker'larını ekle
  const addRestaurantMarkers = (map: any, restaurants: RestaurantInfo[]) => {
    // Önceki marker'ları temizle
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    restaurants.forEach((restaurant, index) => {
      if (!restaurant.address.coordinates) return;

      const position = {
        lat: restaurant.address.coordinates.lat,
        lng: restaurant.address.coordinates.lng
      };

      // Marker ikonu
      const icon = {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="14" fill="${restaurant.isOpen ? '#10B981' : '#EF4444'}" stroke="white" stroke-width="2"/>
            <path d="M16 8C18.2091 8 20 9.79086 20 12C20 14.2091 18.2091 16 16 16C13.7909 16 12 14.2091 12 12C12 9.79086 13.7909 8 16 8Z" fill="white"/>
            <path d="M16 18C19.3137 18 22 20.6863 22 24H10C10 20.6863 12.6863 18 16 18Z" fill="white"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(32, 32),
        anchor: new window.google.maps.Point(16, 16)
      };

      const marker = new window.google.maps.Marker({
        position,
        map,
        icon,
        title: restaurant.name,
        animation: window.google.maps.Animation.DROP
      });

      // Info window içeriği
      const infoWindow = new window.google.maps.InfoWindow({
        content: `
          <div style="padding: 8px; max-width: 200px;">
            <h3 style="margin: 0 0 8px 0; font-weight: bold; color: #1F2937;">${restaurant.name}</h3>
            <p style="margin: 0 0 8px 0; color: #6B7280; font-size: 14px;">${restaurant.description}</p>
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <span style="color: #F59E0B;">★</span>
              <span style="font-weight: bold;">${restaurant.rating?.toFixed(1) || '0.0'}</span>
              <span style="color: #6B7280; font-size: 12px;">(${restaurant.reviewCount || 0})</span>
            </div>
            <div style="display: flex; align-items: center; gap: 4px; color: #6B7280; font-size: 12px;">
              <span>🕒 ${restaurant.estimatedDeliveryTime || 30} dk</span>
            </div>
            <button 
              onclick="window.restaurantMapClick && window.restaurantMapClick('${restaurant.id}')"
              style="margin-top: 8px; background: #10B981; color: white; border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px;"
            >
              Menüyü Gör
            </button>
          </div>
        `
      });

      // Marker tıklama olayı
      marker.addListener('click', () => {
        setSelectedRestaurant(restaurant);
        infoWindow.open(map, marker);
      });

      markersRef.current.push(marker);
    });

    // Global fonksiyon ekle
    (window as any).restaurantMapClick = (restaurantId: string) => {
      const restaurant = restaurants.find(r => r.id === restaurantId);
      if (restaurant && onRestaurantClick) {
        onRestaurantClick(restaurant);
      }
    };
  };

  // Haritayı kullanıcı konumuna odakla
  const centerOnUserLocation = () => {
    if (!mapInstanceRef.current || !userLocation) return;

    mapInstanceRef.current.setCenter({
      lat: userLocation.lat,
      lng: userLocation.lng
    });
    mapInstanceRef.current.setZoom(14);
  };

  // Seçili restoranı temizle
  const clearSelection = () => {
    setSelectedRestaurant(null);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Harita Kontrolleri */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {!userLocation && (
          <button
            onClick={() => getCurrentLocation()}
            disabled={locationLoading}
            className="bg-white p-3 rounded-lg shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2 text-gray-700 hover:text-gray-900 disabled:opacity-50"
          >
            {locationLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-700"></div>
            ) : (
              <Navigation className="h-4 w-4" />
            )}
            <span className="text-sm font-medium">
              {locationLoading ? 'Konum Alınıyor...' : 'Konumumu Paylaş'}
            </span>
          </button>
        )}

        {userLocation && (
          <button
            onClick={centerOnUserLocation}
            className="bg-white p-3 rounded-lg shadow-lg hover:shadow-xl transition-shadow flex items-center gap-2 text-gray-700 hover:text-gray-900"
            title="Konumuma Odaklan"
          >
            <Target className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Harita */}
      <div 
        ref={mapRef} 
        className="w-full h-96 rounded-xl shadow-lg"
        style={{ minHeight: '400px' }}
      />

      {/* Seçili Restoran Kartı */}
      {selectedRestaurant && (
        <div className="absolute bottom-4 left-4 right-4 z-10">
          <div className="bg-white rounded-lg shadow-xl p-4 max-w-sm">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-bold text-gray-900 text-lg">
                {selectedRestaurant.name}
              </h3>
              <button
                onClick={clearSelection}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {selectedRestaurant.description}
            </p>

            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-yellow-500">★</span>
                <span className="font-semibold">
                  {selectedRestaurant.rating?.toFixed(1) || '0.0'}
                </span>
                <span className="text-gray-500 text-sm">
                  ({selectedRestaurant.reviewCount || 0})
                </span>
              </div>
              
              <div className="flex items-center gap-1 text-gray-600 text-sm">
                <span>🕒 {selectedRestaurant.estimatedDeliveryTime || 30} dk</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (onRestaurantClick) {
                    onRestaurantClick(selectedRestaurant);
                  }
                }}
                className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors text-center text-sm"
              >
                Menüyü Gör
              </button>
              <button
                onClick={() => {
                  if (mapInstanceRef.current) {
                    mapInstanceRef.current.setCenter({
                      lat: selectedRestaurant.address.coordinates?.lat || 0,
                      lng: selectedRestaurant.address.coordinates?.lng || 0
                    });
                    mapInstanceRef.current.setZoom(16);
                  }
                }}
                className="p-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
                title="Haritada Göster"
              >
                <MapPin className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Harita Yükleniyor */}
      {!mapLoaded && (
        <div className="absolute inset-0 bg-gray-100 rounded-xl flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500 mx-auto mb-2"></div>
            <p className="text-gray-600 text-sm">Harita yükleniyor...</p>
          </div>
        </div>
      )}

      {/* Google Maps API Uyarısı */}
      {!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY && (
        <div className="absolute inset-0 bg-gray-100 rounded-xl flex items-center justify-center">
          <div className="text-center p-4">
            <Info className="h-8 w-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600 text-sm">
              Google Maps API anahtarı gerekli
            </p>
          </div>
        </div>
      )}
    </div>
  );
} 