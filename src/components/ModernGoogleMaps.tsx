"use client";
import React, { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface ModernGoogleMapsProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  onMapClick?: (lat: number, lng: number) => void;
  selectedLocation?: { lat: number; lng: number; address: string } | null;
  className?: string;
}

const ModernGoogleMaps: React.FC<ModernGoogleMapsProps> = ({
  center = { lat: 38.4237, lng: 27.1428 },
  zoom = 12,
  onMapClick,
  selectedLocation,
  className = "",
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [marker, setMarker] = useState<any>(null);
  const [googleLoaded, setGoogleLoaded] = useState(false);

  // Google Maps yükleme
  useEffect(() => {
    const loadGoogleMaps = () => {
      const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      if (!apiKey) {
        setError("Google Maps API key bulunamadı");
        setLoading(false);
        return;
      }

      // Google Maps zaten yüklü mü?
      if (window.google && window.google.maps) {
        setGoogleLoaded(true);
        return;
      }

      // Script zaten var mı?
      const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existingScript) {
        const checkGoogle = setInterval(() => {
          if (window.google && window.google.maps) {
            clearInterval(checkGoogle);
            setGoogleLoaded(true);
          }
        }, 100);
        return;
      }

      // Yeni script ekle
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        setGoogleLoaded(true);
      };
      
      script.onerror = () => {
        setError("Google Maps yüklenemedi");
        setLoading(false);
      };
      
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  // Harita başlatma
  useEffect(() => {
    if (!googleLoaded || !mapRef.current) return;

    try {
      const mapOptions = {
        center: { lat: center.lat, lng: center.lng },
        zoom: zoom,
        mapTypeId: window.google.maps.MapTypeId.ROADMAP,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
        zoomControl: true,
        zoomControlOptions: {
          position: window.google.maps.ControlPosition.RIGHT_CENTER,
        },
        gestureHandling: 'cooperative',
      };

      const newMap = new window.google.maps.Map(mapRef.current, mapOptions);
      setMap(newMap);

      // Harita tıklama olayı
      newMap.addListener('click', (event: any) => {
        const lat = event.latLng.lat();
        const lng = event.latLng.lng();
        onMapClick?.(lat, lng);
      });

      setLoading(false);
    } catch (err) {
      console.error('Harita başlatma hatası:', err);
      setError("Harita başlatılamadı");
      setLoading(false);
    }
  }, [googleLoaded, center, zoom, onMapClick]);

  // Seçili konum güncelleme
  useEffect(() => {
    if (!map || !selectedLocation) return;

    // Eski marker'ı temizle
    if (marker) {
      marker.setMap(null);
    }

    // Yeni marker ekle
    const newMarker = new window.google.maps.Marker({
      position: { lat: selectedLocation.lat, lng: selectedLocation.lng },
      map: map,
      title: selectedLocation.address,
      animation: window.google.maps.Animation.DROP
    });

    setMarker(newMarker);
    map.setCenter({ lat: selectedLocation.lat, lng: selectedLocation.lng });
    map.setZoom(16);
  }, [map, selectedLocation, marker]);

  if (error) {
    return (
      <div className={`w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center ${className}`}>
        <div className="text-center">
          <div className="text-red-500 mb-2">⚠️</div>
          <p className="text-gray-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`w-full h-48 bg-gray-100 rounded-xl flex items-center justify-center ${className}`}>
        <div className="text-center">
          <Loader2 className="h-6 w-6 animate-spin text-gray-400 mb-2" />
          <p className="text-gray-600 text-sm">Harita yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapRef} 
      className={`w-full h-48 rounded-lg ${className}`}
      style={{ minHeight: '192px' }}
    />
  );
};

export default ModernGoogleMaps; 