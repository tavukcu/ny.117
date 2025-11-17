'use client';

import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Search, X, CheckCircle, Loader2 } from 'lucide-react';
import { useLocation } from '@/hooks/useLocation';
import toast from 'react-hot-toast';

interface LocationHeroProps {
  onLocationSelected?: (location: { lat: number; lng: number; address: string }) => void;
}

interface SearchResult {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

export default function LocationHero({ onLocationSelected }: LocationHeroProps) {
  const { getCurrentLocation } = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout>();

  // Google Places Autocomplete API
  const searchPlaces = async (query: string) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      const response = await fetch(`/api/places/autocomplete?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.predictions) {
        setSearchResults(data.predictions);
        setShowSearchResults(true);
      }
    } catch (error) {
      console.error('Places API error:', error);
      // Fallback: Mock data
      const mockResults = [
        {
          place_id: '1',
          description: `${query}, Manisa, Türkiye`,
          structured_formatting: {
            main_text: query,
            secondary_text: 'Manisa, Türkiye'
          }
        }
      ];
      setSearchResults(mockResults);
      setShowSearchResults(true);
    }
  };

  // Search input değişikliklerini handle et
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowSearchResults(false);
    
    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      searchPlaces(value);
    }, 300);
  };

  // Search result seçimi
  const handleSearchResultSelect = async (result: SearchResult) => {
    setSearchQuery(result.description);
    setShowSearchResults(false);
    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/places/geocode?place_id=${result.place_id}`);
      const data = await response.json();
      
      if (data.results && data.results[0]) {
        const location = data.results[0].geometry.location;
        const newLocation = {
          lat: location.lat,
          lng: location.lng,
          address: result.description
        };
        
        setSelectedLocation(newLocation);
        onLocationSelected?.(newLocation);
        toast.success('📍 Konum seçildi!');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      const mockLocation = {
        lat: 38.4237 + Math.random() * 0.01,
        lng: 27.1428 + Math.random() * 0.01,
        address: result.description
      };
      
      setSelectedLocation(mockLocation);
      onLocationSelected?.(mockLocation);
      toast.success('📍 Konum seçildi!');
    } finally {
      setIsLoading(false);
    }
  };

  // Mevcut konum alma
  const handleGetCurrentLocation = async () => {
    setIsLoading(true);
    
    try {
      const result = await getCurrentLocation(false);
      
      if (result && result.position) {
        const newLocation = {
          lat: result.position.coords.latitude,
          lng: result.position.coords.longitude,
          address: result.address?.formatted || `${result.position.coords.latitude}, ${result.position.coords.longitude}`
        };
        
        setSelectedLocation(newLocation);
        setSearchQuery(newLocation.address);
        onLocationSelected?.(newLocation);
        toast.success('🎯 Mevcut konum alındı!');
      }
    } catch (error: any) {
      console.error('Konum alma hatası:', error);
      toast.error('Konum alınamadı. Lütfen konum iznini kontrol edin.');
    } finally {
      setIsLoading(false);
    }
  };

  // Konum temizleme
  const handleClearLocation = () => {
    setSelectedLocation(null);
    setSearchQuery('');
    setShowSearchResults(false);
  };

  return (
    <section className="py-6 bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          {/* Başlık */}
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              <span className="text-blue-600">Nerede</span> yemek istiyorsunuz?
            </h1>
            <p className="text-gray-600">Konumunuzu seçin, size en yakın restoranları bulalım</p>
          </div>

          {/* Ana Konum Kartı */}
          <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100">
            
            {/* Arama Bölümü */}
            <div className="relative mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Adres, mahalle veya ilçe yazın..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                />
                {searchQuery && (
                  <button
                    onClick={handleClearLocation}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Arama Sonuçları */}
              {showSearchResults && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-gray-200 z-50 max-h-64 overflow-y-auto">
                  {searchResults.map((result) => (
                    <button
                      key={result.place_id}
                      onClick={() => handleSearchResultSelect(result)}
                      className="w-full text-left p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center gap-3">
                        <MapPin className="h-4 w-4 text-blue-500 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-gray-900 text-sm">
                            {result.structured_formatting.main_text}
                          </div>
                          <div className="text-xs text-gray-500">
                            {result.structured_formatting.secondary_text}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mevcut Konum Butonu */}
            <div className="flex justify-center mb-4">
              <button
                onClick={handleGetCurrentLocation}
                disabled={isLoading}
                className="flex items-center gap-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Navigation className="h-4 w-4" />
                )}
                <span>Mevcut Konumumu Kullan</span>
              </button>
            </div>

            {/* Seçilen Konum Gösterimi */}
            {selectedLocation && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-semibold text-green-800">Seçilen Konum</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-green-600" />
                  <span className="text-green-700 text-sm">{selectedLocation.address}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
} 