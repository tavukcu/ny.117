'use client';

import { useState, useEffect, useRef } from 'react';
import type { Order, OrderTracking, DeliveryDriver } from '@/types';
import { MapPin, Navigation, Clock, Truck } from 'lucide-react';

interface OrderTrackingMapProps {
  order: Order;
  tracking: OrderTracking;
  driver?: DeliveryDriver;
}

export default function OrderTrackingMap({ order, tracking, driver }: OrderTrackingMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<{
    restaurant: google.maps.Marker | null;
    customer: google.maps.Marker | null;
    driver: google.maps.Marker | null;
  }>({
    restaurant: null,
    customer: null,
    driver: null
  });
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Google Maps API yükleme
  useEffect(() => {
    const loadGoogleMaps = async () => {
      if (window.google?.maps) {
        initializeMap();
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=geometry,places`;
      script.async = true;
      script.defer = true;
      script.onload = initializeMap;
      document.head.appendChild(script);
    };

    loadGoogleMaps();
  }, []);

  const initializeMap = () => {
    if (!mapRef.current || !window.google?.maps) return;

    const restaurantLocation = {
      lat: order.restaurant.address.coordinates?.lat || 41.0082,
      lng: order.restaurant.address.coordinates?.lng || 28.9784
    };

    const customerLocation = {
      lat: order.deliveryAddress.coordinates?.lat || 41.0082,
      lng: order.deliveryAddress.coordinates?.lng || 28.9784
    };

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: restaurantLocation,
      zoom: 13,
      styles: [
        {
          featureType: 'poi',
          elementType: 'labels',
          stylers: [{ visibility: 'off' }]
        }
      ]
    });

    setMap(mapInstance);

    // Restoran marker'ı
    const restaurantMarker = new window.google.maps.Marker({
      position: restaurantLocation,
      map: mapInstance,
      title: order.restaurant.name,
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="20" fill="#FF6B6B"/>
            <path d="M20 8C15.6 8 12 11.6 12 16C12 20.4 20 28 20 28S28 20.4 28 16C28 11.6 24.4 8 20 8ZM20 18C18.9 18 18 17.1 18 16C18 14.9 18.9 14 20 14C21.1 14 22 14.9 22 16C22 17.1 21.1 18 20 18Z" fill="white"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 20)
      }
    });

    // Müşteri marker'ı
    const customerMarker = new window.google.maps.Marker({
      position: customerLocation,
      map: mapInstance,
      title: 'Teslimat Adresi',
      icon: {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="20" cy="20" r="20" fill="#4ECDC4"/>
            <path d="M20 8C15.6 8 12 11.6 12 16C12 20.4 20 28 20 28S28 20.4 28 16C28 11.6 24.4 8 20 8ZM20 18C18.9 18 18 17.1 18 16C18 14.9 18.9 14 20 14C21.1 14 22 14.9 22 16C22 17.1 21.1 18 20 18Z" fill="white"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(40, 40),
        anchor: new window.google.maps.Point(20, 20)
      }
    });

    // Teslimatçı marker'ı (varsa)
    let driverMarker: google.maps.Marker | null = null;
    if (driver?.currentLocation) {
      driverMarker = new window.maps.Marker({
        position: {
          lat: driver.currentLocation.lat,
          lng: driver.currentLocation.lng
        },
        map: mapInstance,
        title: `${driver.name} - Teslimatçınız`,
        icon: {
          url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="20" cy="20" r="20" fill="#45B7D1"/>
              <path d="M12 20L18 26L28 14" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          `),
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 20)
        }
      });
    }

    setMarkers({
      restaurant: restaurantMarker,
      customer: customerMarker,
      driver: driverMarker
    });

    // Rota çizimi
    const directionsService = new window.google.maps.DirectionsService();
    const directionsRendererInstance = new window.google.maps.DirectionsRenderer({
      suppressMarkers: true,
      polylineOptions: {
        strokeColor: '#45B7D1',
        strokeWeight: 4,
        strokeOpacity: 0.8
      }
    });

    directionsRendererInstance.setMap(mapInstance);
    setDirectionsRenderer(directionsRendererInstance);

    // Rota hesaplama
    if (driver?.currentLocation) {
      calculateRoute(
        directionsService,
        directionsRendererInstance,
        { lat: driver.currentLocation.lat, lng: driver.currentLocation.lng },
        customerLocation
      );
    } else {
      calculateRoute(
        directionsService,
        directionsRendererInstance,
        restaurantLocation,
        customerLocation
      );
    }

    // Harita sınırlarını ayarla
    const bounds = new window.google.maps.LatLngBounds();
    bounds.extend(restaurantLocation);
    bounds.extend(customerLocation);
    if (driver?.currentLocation) {
      bounds.extend({ lat: driver.currentLocation.lat, lng: driver.currentLocation.lng });
    }
    mapInstance.fitBounds(bounds);

    setIsLoading(false);
  };

  const calculateRoute = (
    directionsService: google.maps.DirectionsService,
    directionsRenderer: google.maps.DirectionsRenderer,
    origin: google.maps.LatLngLiteral,
    destination: google.maps.LatLngLiteral
  ) => {
    directionsService.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode.DRIVING
      },
      (result, status) => {
        if (status === 'OK' && result) {
          directionsRenderer.setDirections(result);
        }
      }
    );
  };

  // Teslimatçı konumu güncellendiğinde
  useEffect(() => {
    if (!map || !driver?.currentLocation || !markers.driver || !directionsRenderer) return;

    const newPosition = {
      lat: driver.currentLocation.lat,
      lng: driver.currentLocation.lng
    };

    // Teslimatçı marker'ını güncelle
    markers.driver.setPosition(newPosition);

    // Rotayı güncelle
    const directionsService = new window.google.maps.DirectionsService();
    calculateRoute(
      directionsService,
      directionsRenderer,
      newPosition,
      {
        lat: order.deliveryAddress.coordinates?.lat || 41.0082,
        lng: order.deliveryAddress.coordinates?.lng || 28.9784
      }
    );
  }, [driver?.currentLocation]);

  const getDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Dünya'nın yarıçapı (km)
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const getEstimatedTime = (distance: number): number => {
    // Ortalama hız: 30 km/saat (şehir içi)
    return Math.round(distance / 30 * 60);
  };

  const restaurantLocation = {
    lat: order.restaurant.address.coordinates?.lat || 41.0082,
    lng: order.restaurant.address.coordinates?.lng || 28.9784
  };

  const customerLocation = {
    lat: order.deliveryAddress.coordinates?.lat || 41.0082,
    lng: order.deliveryAddress.coordinates?.lng || 28.9784
  };

  const distance = getDistance(
    restaurantLocation.lat,
    restaurantLocation.lng,
    customerLocation.lat,
    customerLocation.lng
  );

  const estimatedTime = getEstimatedTime(distance);

  return (
    <div className="relative">
      {/* Harita */}
      <div 
        ref={mapRef} 
        className="w-full h-80 rounded-lg overflow-hidden"
        style={{ minHeight: '320px' }}
      />

      {/* Yükleme göstergesi */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
        </div>
      )}

      {/* Konum bilgileri */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Restoran */}
        <div className="bg-red-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-5 w-5 text-red-500" />
            <h3 className="font-semibold text-gray-900">Restoran</h3>
          </div>
          <p className="text-sm text-gray-600">{order.restaurant.name}</p>
          <p className="text-sm text-gray-600">{order.restaurant.address.street}</p>
        </div>

        {/* Teslimatçı */}
        {driver && (
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Truck className="h-5 w-5 text-blue-500" />
              <h3 className="font-semibold text-gray-900">Teslimatçınız</h3>
            </div>
            <p className="text-sm text-gray-600">{driver.name}</p>
            <p className="text-sm text-gray-600">
              {driver.vehicle.type === 'car' && 'Araba'}
              {driver.vehicle.type === 'motorcycle' && 'Motosiklet'}
              {driver.vehicle.type === 'bicycle' && 'Bisiklet'}
              {driver.vehicle.type === 'scooter' && 'Scooter'}
            </p>
            {driver.currentLocation && (
              <p className="text-xs text-gray-500 mt-1">
                Son güncelleme: {new Date(driver.currentLocation.timestamp).toLocaleTimeString('tr-TR')}
              </p>
            )}
          </div>
        )}

        {/* Teslimat Adresi */}
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Navigation className="h-5 w-5 text-green-500" />
            <h3 className="font-semibold text-gray-900">Teslimat Adresi</h3>
          </div>
          <p className="text-sm text-gray-600">{order.deliveryAddress.street}</p>
          <p className="text-sm text-gray-600">
            {order.deliveryAddress.district}, {order.deliveryAddress.city}
          </p>
        </div>
      </div>

      {/* Mesafe ve süre bilgileri */}
      <div className="mt-4 bg-gray-50 p-4 rounded-lg">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <Navigation className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Mesafe</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{distance.toFixed(1)} km</p>
          </div>
          <div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Tahmini Süre</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{estimatedTime} dk</p>
          </div>
        </div>
      </div>
    </div>
  );
} 