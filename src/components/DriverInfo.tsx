'use client';

import type { DeliveryDriver } from '@/types';
import { 
  User, 
  Phone, 
  Star, 
  Truck, 
  Car, 
  Bike, 
  MapPin, 
  Clock,
  Award,
  Navigation
} from 'lucide-react';

interface DriverInfoProps {
  driver: DeliveryDriver;
}

export default function DriverInfo({ driver }: DriverInfoProps) {
  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType) {
      case 'car': return Car;
      case 'motorcycle': return Truck;
      case 'bicycle': return Bike;
      case 'scooter': return Truck;
      default: return Truck;
    }
  };

  const getVehicleName = (vehicleType: string) => {
    switch (vehicleType) {
      case 'car': return 'Araba';
      case 'motorcycle': return 'Motosiklet';
      case 'bicycle': return 'Bisiklet';
      case 'scooter': return 'Scooter';
      default: return 'Araç';
    }
  };

  const formatRating = (rating: number) => {
    return rating.toFixed(1);
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRatingText = (rating: number) => {
    if (rating >= 4.5) return 'Mükemmel';
    if (rating >= 4.0) return 'Çok İyi';
    if (rating >= 3.5) return 'İyi';
    if (rating >= 3.0) return 'Orta';
    return 'Kötü';
  };

  const VehicleIcon = getVehicleIcon(driver.vehicle.type);

  return (
    <div className="space-y-4">
      {/* Teslimatçı Profili */}
      <div className="flex items-center gap-4">
        {/* Profil Fotoğrafı */}
        <div className="flex-shrink-0">
          {driver.photoUrl ? (
            <img 
              src={driver.photoUrl} 
              alt={driver.name}
              className="w-16 h-16 rounded-full object-cover border-2 border-green-200"
            />
          ) : (
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
              <User className="h-8 w-8 text-white" />
            </div>
          )}
        </div>

        {/* Teslimatçı Bilgileri */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">{driver.name}</h3>
          
          {/* Puan */}
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className={`font-semibold ${getRatingColor(driver.rating)}`}>
                {formatRating(driver.rating)}
              </span>
            </div>
            <span className="text-sm text-gray-600">
              ({getRatingText(driver.rating)})
            </span>
          </div>

          {/* Toplam Teslimat */}
          <div className="flex items-center gap-2 mt-1">
            <Award className="h-4 w-4 text-blue-500" />
            <span className="text-sm text-gray-600">
              {driver.totalDeliveries} teslimat tamamladı
            </span>
          </div>
        </div>

        {/* Online Durumu */}
        <div className="flex-shrink-0">
          <div className={`px-3 py-1 rounded-full text-xs font-medium ${
            driver.isOnline 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {driver.isOnline ? 'Çevrimiçi' : 'Çevrimdışı'}
          </div>
        </div>
      </div>

      {/* Araç Bilgileri */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Araç Bilgileri</h4>
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <VehicleIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="flex-1">
            <p className="font-medium text-gray-900">
              {getVehicleName(driver.vehicle.type)}
            </p>
            {driver.vehicle.model && (
              <p className="text-sm text-gray-600">{driver.vehicle.model}</p>
            )}
            {driver.vehicle.plateNumber && (
              <p className="text-sm text-gray-600">Plaka: {driver.vehicle.plateNumber}</p>
            )}
          </div>
        </div>
      </div>

      {/* İletişim Bilgileri */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">İletişim</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">{driver.phone}</span>
          </div>
        </div>
      </div>

      {/* Mevcut Konum */}
      {driver.currentLocation && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Mevcut Konum</h4>
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                Son güncelleme: {new Date(driver.currentLocation.timestamp).toLocaleTimeString('tr-TR')}
              </span>
            </div>
            {driver.estimatedArrival && (
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  Tahmini varış: {new Date(driver.estimatedArrival).toLocaleTimeString('tr-TR')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hızlı İşlemler */}
      <div className="grid grid-cols-2 gap-3">
        <button className="bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2">
          <Phone className="h-4 w-4" />
          Ara
        </button>
        <button className="bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2">
          <Navigation className="h-4 w-4" />
          Takip Et
        </button>
      </div>

      {/* Teslimat İstatistikleri */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3">Teslimat İstatistikleri</h4>
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {formatRating(driver.rating)}
            </div>
            <div className="text-xs text-gray-600">Ortalama Puan</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {driver.totalDeliveries}
            </div>
            <div className="text-xs text-gray-600">Toplam Teslimat</div>
          </div>
        </div>
      </div>
    </div>
  );
} 