import { Address } from '@/types';

// Google Maps gelişmiş özellikler
export class EnhancedLocationService {
  private static geocoder: google.maps.Geocoder | null = null;
  private static placesService: google.maps.places.PlacesService | null = null;
  private static directionsService: google.maps.DirectionsService | null = null;
  private static distanceMatrixService: google.maps.DistanceMatrixService | null = null;
  private static elevationService: google.maps.ElevationService | null = null;

  // Servisleri başlat
  static async initializeServices(map?: google.maps.Map) {
    if (!window.google?.maps) {
      console.error('Google Maps API yüklenmedi');
      throw new Error('Google Maps API yüklenmedi');
    }

    try {
      this.geocoder = new google.maps.Geocoder();
      this.directionsService = new google.maps.DirectionsService();
      this.distanceMatrixService = new google.maps.DistanceMatrixService();
      this.elevationService = new google.maps.ElevationService();

      if (map) {
        this.placesService = new google.maps.places.PlacesService(map);
      }
    } catch (error) {
      console.error('Google Maps servisleri başlatma hatası:', error);
      throw new Error('Google Maps servisleri başlatılamadı');
    }
  }

  // 1. Gelişmiş Geocoding (Batch işlemler dahil)
  static async batchGeocode(addresses: string[]): Promise<Array<{
    address: string;
    coordinates: { lat: number; lng: number } | null;
    placeId: string | null;
  }>> {
    if (!this.geocoder) {
      try {
        await this.initializeServices();
      } catch (error) {
        console.error('Geocoder başlatılamadı:', error);
        return addresses.map(address => ({ address, coordinates: null, placeId: null }));
      }
    }

    const results = await Promise.all(
      addresses.map(async (address) => {
        try {
          const response = await this.geocoder!.geocode({ address });
          if (response.results[0]) {
            return {
              address,
              coordinates: {
                lat: response.results[0].geometry.location.lat(),
                lng: response.results[0].geometry.location.lng()
              },
              placeId: response.results[0].place_id
            };
          }
        } catch (error) {
          console.error(`Geocoding hatası: ${address}`, error);
        }
        return { address, coordinates: null, placeId: null };
      })
    );

    return results;
  }

  // 2. Detaylı yer bilgisi al
  static async getPlaceDetails(placeId: string): Promise<google.maps.places.PlaceResult | null> {
    if (!this.placesService) {
      throw new Error('Places service başlatılmamış. Önce harita ile initialize edin.');
    }

    return new Promise((resolve, reject) => {
      this.placesService!.getDetails(
        {
          placeId,
          fields: [
            'name',
            'formatted_address',
            'formatted_phone_number',
            'geometry',
            'rating',
            'reviews',
            'opening_hours',
            'website',
            'photos',
            'price_level',
            'types',
            'user_ratings_total',
            'vicinity',
            'plus_code',
            'utc_offset_minutes'
          ]
        },
        (result, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && result) {
            resolve(result);
          } else {
            reject(new Error(`Place details hatası: ${status}`));
          }
        }
      );
    });
  }

  // 3. Yakındaki yerleri kategoriye göre ara
  static async searchNearbyByCategory(
    location: { lat: number; lng: number },
    categories: string[],
    radius: number = 5000
  ): Promise<Map<string, google.maps.places.PlaceResult[]>> {
    if (!this.placesService) {
      throw new Error('Places service başlatılmamış');
    }

    const categoryResults = new Map<string, google.maps.places.PlaceResult[]>();

    for (const category of categories) {
      const results = await new Promise<google.maps.places.PlaceResult[]>((resolve) => {
        this.placesService!.nearbySearch(
          {
            location,
            radius,
            type: category,
            language: 'tr'
          },
          (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK && results) {
              resolve(results);
            } else {
              resolve([]);
            }
          }
        );
      });

      categoryResults.set(category, results);
    }

    return categoryResults;
  }

  // 4. Gelişmiş rota hesaplama (alternatif rotalar dahil)
  static async calculateAdvancedRoute(
    origin: { lat: number; lng: number },
    destination: { lat: number; lng: number },
    options?: {
      mode?: google.maps.TravelMode;
      avoidHighways?: boolean;
      avoidTolls?: boolean;
      avoidFerries?: boolean;
      provideRouteAlternatives?: boolean;
      optimizeWaypoints?: boolean;
      waypoints?: Array<{ location: { lat: number; lng: number } }>;
    }
  ): Promise<{
    routes: google.maps.DirectionsRoute[];
    bestRoute: {
      distance: string;
      duration: string;
      steps: google.maps.DirectionsStep[];
      warnings: string[];
      fare?: google.maps.TransitFare;
    };
  }> {
    if (!this.directionsService) {
      try {
        await this.initializeServices();
      } catch (error) {
        console.error('Directions service başlatılamadı:', error);
        throw new Error('Rota hesaplama servisi başlatılamadı');
      }
    }

    const request: google.maps.DirectionsRequest = {
      origin,
      destination,
      travelMode: options?.mode || google.maps.TravelMode.DRIVING,
      avoidHighways: options?.avoidHighways || false,
      avoidTolls: options?.avoidTolls || false,
      avoidFerries: options?.avoidFerries || false,
      provideRouteAlternatives: options?.provideRouteAlternatives !== false,
      optimizeWaypoints: options?.optimizeWaypoints || false,
      waypoints: options?.waypoints || [],
      unitSystem: google.maps.UnitSystem.METRIC,
      region: 'TR',
      language: 'tr'
    };

    return new Promise((resolve, reject) => {
      this.directionsService!.route(request, (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          const bestRoute = result.routes[0];
          resolve({
            routes: result.routes,
            bestRoute: {
              distance: bestRoute.legs[0].distance?.text || '',
              duration: bestRoute.legs[0].duration?.text || '',
              steps: bestRoute.legs[0].steps,
              warnings: bestRoute.warnings,
              fare: bestRoute.fare
            }
          });
        } else {
          reject(new Error(`Rota hesaplama hatası: ${status}`));
        }
      });
    });
  }

  // 5. Çoklu mesafe matrisi hesaplama
  static async calculateDistanceMatrix(
    origins: Array<{ lat: number; lng: number }>,
    destinations: Array<{ lat: number; lng: number }>,
    mode: google.maps.TravelMode = google.maps.TravelMode.DRIVING,
    avoidHighways: boolean = false,
    avoidTolls: boolean = false
  ): Promise<{
    rows: google.maps.DistanceMatrixResponseRow[];
    originAddresses: string[];
    destinationAddresses: string[];
  }> {
    if (!this.distanceMatrixService) {
      try {
        await this.initializeServices();
      } catch (error) {
        console.error('Distance matrix service başlatılamadı:', error);
        throw new Error('Mesafe hesaplama servisi başlatılamadı');
      }
    }

    return new Promise((resolve, reject) => {
      this.distanceMatrixService!.getDistanceMatrix(
        {
          origins,
          destinations,
          travelMode: mode,
          avoidHighways,
          avoidTolls,
          unitSystem: google.maps.UnitSystem.METRIC,
          region: 'TR',
          language: 'tr'
        },
        (response, status) => {
          if (status === google.maps.DistanceMatrixStatus.OK && response) {
            resolve({
              rows: response.rows,
              originAddresses: response.originAddresses,
              destinationAddresses: response.destinationAddresses
            });
          } else {
            reject(new Error(`Distance matrix hatası: ${status}`));
          }
        }
      );
    });
  }

  // 6. Yükseklik bilgisi al (dağlık alanlar için)
  static async getElevation(locations: Array<{ lat: number; lng: number }>): Promise<Array<{
    location: { lat: number; lng: number };
    elevation: number;
    resolution: number;
  }>> {
    if (!this.elevationService) {
      try {
        await this.initializeServices();
      } catch (error) {
        console.error('Elevation service başlatılamadı:', error);
        throw new Error('Yükseklik hesaplama servisi başlatılamadı');
      }
    }

    return new Promise((resolve, reject) => {
      this.elevationService!.getElevationForLocations(
        { locations },
        (results, status) => {
          if (status === google.maps.ElevationStatus.OK && results) {
            resolve(results.map(r => ({
              location: {
                lat: r.location ? r.location.lat() : 0,
                lng: r.location ? r.location.lng() : 0
              },
              elevation: r.elevation,
              resolution: r.resolution || 0
            })));
          } else {
            reject(new Error(`Elevation hatası: ${status}`));
          }
        }
      );
    });
  }

  // 7. Adres doğrulama ve standardizasyon
  static async validateAndStandardizeAddress(address: string): Promise<{
    isValid: boolean;
    standardizedAddress: string;
    confidence: number;
    components: {
      streetNumber?: string;
      street?: string;
      district?: string;
      city?: string;
      state?: string;
      country?: string;
      postalCode?: string;
    };
  }> {
    if (!this.geocoder) {
      try {
        await this.initializeServices();
      } catch (error) {
        console.error('Geocoder başlatılamadı:', error);
        return {
          isValid: false,
          standardizedAddress: address,
          confidence: 0,
          components: {}
        };
      }
    }

    try {
      const response = await this.geocoder!.geocode({ address });
      
      if (response.results.length === 0) {
        return {
          isValid: false,
          standardizedAddress: address,
          confidence: 0,
          components: {}
        };
      }

      const result = response.results[0];
      const components: any = {};

      result.address_components.forEach(comp => {
        const types = comp.types;
        if (types.includes('street_number')) components.streetNumber = comp.long_name;
        if (types.includes('route')) components.street = comp.long_name;
        if (types.includes('sublocality')) components.district = comp.long_name;
        if (types.includes('administrative_area_level_2')) components.city = comp.long_name;
        if (types.includes('administrative_area_level_1')) components.state = comp.long_name;
        if (types.includes('country')) components.country = comp.long_name;
        if (types.includes('postal_code')) components.postalCode = comp.long_name;
      });

      // Güven skoru hesapla
      const confidence = result.geometry.location_type === 'ROOFTOP' ? 1.0 :
                        result.geometry.location_type === 'RANGE_INTERPOLATED' ? 0.8 :
                        result.geometry.location_type === 'GEOMETRIC_CENTER' ? 0.6 : 0.4;

      return {
        isValid: true,
        standardizedAddress: result.formatted_address,
        confidence,
        components
      };
    } catch (error) {
      return {
        isValid: false,
        standardizedAddress: address,
        confidence: 0,
        components: {}
      };
    }
  }

  // 8. Teslimat bölgesi kontrolü (polygon içinde mi?)
  static isLocationInDeliveryZone(
    location: { lat: number; lng: number },
    deliveryZonePolygon: Array<{ lat: number; lng: number }>
  ): boolean {
    if (!window.google?.maps?.geometry) {
      console.error('Google Maps Geometry library yüklenmemiş');
      return false;
    }

    const point = new google.maps.LatLng(location.lat, location.lng);
    const polygon = new google.maps.Polygon({ paths: deliveryZonePolygon });
    
    return google.maps.geometry.poly.containsLocation(point, polygon);
  }

  // 9. En yakın teslimat noktası bul
  static findNearestDeliveryPoint(
    userLocation: { lat: number; lng: number },
    deliveryPoints: Array<{
      id: string;
      name: string;
      location: { lat: number; lng: number };
    }>
  ): {
    nearest: typeof deliveryPoints[0] | null;
    distance: number;
  } {
    if (!window.google?.maps?.geometry) {
      console.error('Google Maps Geometry library yüklenmemiş');
      return { nearest: null, distance: Infinity };
    }

    let nearest = null;
    let minDistance = Infinity;

    const userLatLng = new google.maps.LatLng(userLocation.lat, userLocation.lng);

    deliveryPoints.forEach(point => {
      const pointLatLng = new google.maps.LatLng(point.location.lat, point.location.lng);
      const distance = google.maps.geometry.spherical.computeDistanceBetween(userLatLng, pointLatLng);
      
      if (distance < minDistance) {
        minDistance = distance;
        nearest = point;
      }
    });

    return { nearest, distance: minDistance };
  }

  // 10. Akıllı adres tahmini (kullanıcı yazarken)
  static async getAddressSuggestions(
    input: string,
    location?: { lat: number; lng: number },
    radius?: number
  ): Promise<google.maps.places.AutocompletePrediction[]> {
    if (!window.google?.maps?.places) {
      console.error('Google Places library yüklenmemiş');
      return [];
    }

    try {
      const service = new google.maps.places.AutocompleteService();
    
    return new Promise((resolve, reject) => {
      const request: google.maps.places.AutocompletionRequest = {
        input,
        componentRestrictions: { country: 'tr' },
        types: ['address'],
        language: 'tr'
      };

      if (location && radius) {
        request.location = new google.maps.LatLng(location.lat, location.lng);
        request.radius = radius;
      }

      service.getPlacePredictions(request, (predictions, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          resolve(predictions);
        } else {
          resolve([]);
        }
      });
    });
    } catch (error) {
      console.error('Adres önerisi alma hatası:', error);
      return [];
    }
  }

  // 11. Trafik durumu analizi
  static async analyzeTrafficConditions(
    route: google.maps.DirectionsRoute
  ): Promise<{
    overallCondition: 'light' | 'moderate' | 'heavy';
    segments: Array<{
      start: string;
      end: string;
      condition: 'light' | 'moderate' | 'heavy';
      duration: string;
    }>;
    estimatedDelay: number; // dakika cinsinden
  }> {
    // Gerçek trafik verisi Google Maps API'den gelir
    // Bu örnek implementasyon
    const segments = route.legs[0].steps.map(step => ({
      start: step.start_location.toString(),
      end: step.end_location.toString(),
      condition: 'moderate' as const,
      duration: step.duration?.text || ''
    }));

    return {
      overallCondition: 'moderate',
      segments,
      estimatedDelay: Math.floor(Math.random() * 10) + 5
    };
  }

  // 12. Görsel konum doğrulama (Street View)
  static async verifyLocationWithStreetView(
    location: { lat: number; lng: number }
  ): Promise<{
    hasStreetView: boolean;
    panoramaId?: string;
    heading?: number;
  }> {
    if (!window.google?.maps) {
      console.error('Google Maps API yüklenmemiş');
      return { hasStreetView: false };
    }

    try {
      const streetViewService = new google.maps.StreetViewService();
    
    return new Promise((resolve) => {
      streetViewService.getPanorama(
        {
          location: new google.maps.LatLng(location.lat, location.lng),
          radius: 50
        },
        (data, status) => {
          if (status === google.maps.StreetViewStatus.OK && data) {
            resolve({
              hasStreetView: true,
              panoramaId: data.location?.pano,
              heading: data.tiles?.centerHeading
            });
          } else {
            resolve({ hasStreetView: false });
          }
        }
      );
    });
    } catch (error) {
      console.error('Street View doğrulama hatası:', error);
      return { hasStreetView: false };
    }
  }
}

export default EnhancedLocationService; 