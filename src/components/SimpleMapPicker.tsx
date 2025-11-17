'use client';

import React from 'react';
import EnhancedMapPicker from './EnhancedMapPicker';

interface SimpleMapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (address: string, lat: number, lng: number, city?: string, district?: string) => void;
  onAddressChange?: (address: string) => void;
  className?: string;
  useCurrentLocation?: boolean;
}

const SimpleMapPicker: React.FC<SimpleMapPickerProps> = ({
  initialLat = 41.0082,
  initialLng = 28.9784,
  onLocationSelect,
  onAddressChange,
  className = '',
  useCurrentLocation = true
}) => {
  // EnhancedMapPicker'a yönlendir
  return (
    <EnhancedMapPicker
      initialLat={initialLat}
      initialLng={initialLng}
      onLocationSelect={onLocationSelect}
      onAddressChange={onAddressChange}
      className={className}
      showSearch={true}
      showPlaces={true}
      showDirections={false}
    />
  );
};

export default SimpleMapPicker; 