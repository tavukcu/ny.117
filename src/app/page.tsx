'use client';

import { useState, useEffect } from 'react';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import Header from '@/components/Header';
import AdvertisementBanner from '@/components/AdvertisementBanner';
import GuestWelcomeBanner from '@/components/GuestWelcomeBanner';
import LocationHero from '@/components/LocationHero';
import { AnalyticsService } from '@/services/analyticsService';
import { PerformanceService } from '@/services/performanceService';
import { RemoteConfigService } from '@/services/remoteConfigService';
import { 
  Clock, 
  ShieldCheck, 
  Truck,
  Star,
  ArrowRight,
  ChefHat,
  Heart,
  Users,
  TrendingUp,
  Award,
  MapPin,
  Phone,
  CreditCard,
  BarChart3,
  UserPlus,
  Zap,
  Store,
  RefreshCw,
  Tag,
  Brain,
  Navigation,
  Target,
  Filter,
  SlidersHorizontal,
  Search
} from 'lucide-react';
import Link from 'next/link';
import { CategoryService } from '@/services/categoryService';
import { RestaurantService } from '@/services/restaurantService';
import { LocationService } from '@/services/locationService';
import type { Category, RestaurantInfo } from '@/types';
import toast from 'react-hot-toast';
import SmartRecommendations from '@/components/SmartRecommendations';
import RestaurantStatusBadge from '@/components/RestaurantStatusBadge';
import OrderButton from '@/components/OrderButton';
import Badge from '@/components/ui/Badge';
import StatCard from '@/components/ui/StatCard';
import CategoryPill from '@/components/ui/CategoryPill';

// Ana sayfa komponenti
export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [restaurants, setRestaurants] = useState<RestaurantInfo[]>([]);
  const [allRestaurants, setAllRestaurants] = useState<RestaurantInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [performanceTraceId, setPerformanceTraceId] = useState<string>('');
  const [locationSelected, setLocationSelected] = useState(false);
  
  // Yakındaki restoranlar için state'ler
  const [nearbyRestaurants, setNearbyRestaurants] = useState<RestaurantInfo[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number, address: string} | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showNearbySection, setShowNearbySection] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Firebase Analytics ve Performance Monitoring
  useEffect(() => {
    // Performance monitoring başlat
    const traceId = PerformanceService.startPageLoadTrace('home_page');
    setPerformanceTraceId(traceId);

    // Remote Config'i başlat
    RemoteConfigService.initialize().then((success) => {
      if (success) {
        console.log('🔧 Remote Config başlatıldı');
        
        // Maintenance mode kontrolü
        if (RemoteConfigService.isMaintenanceMode()) {
          toast.error('Site bakımda. Lütfen daha sonra tekrar deneyin.');
        }
        
        // Welcome message göster
        const welcomeMessage = RemoteConfigService.getWelcomeMessage();
        if (welcomeMessage !== 'Hoş geldiniz!') {
          toast.success(welcomeMessage);
        }
      }
    });

    // Analytics sayfa görüntüleme
    AnalyticsService.trackPageView('home_page', 'Ana Sayfa');

    // Cleanup function
    return () => {
      if (traceId) {
        PerformanceService.stopPageLoadTrace(traceId, {
          categories_count: categories.length,
          restaurants_count: restaurants.length
        });
      }
    };
  }, []);

  // Sayfa tamamen yüklendiğinde performance tracking'i tamamla
  useEffect(() => {
    if (!loading && performanceTraceId) {
      setTimeout(() => {
        PerformanceService.stopPageLoadTrace(performanceTraceId, {
          categories_loaded: categories.length,
          restaurants_loaded: restaurants.length,
          load_time_ms: Math.round(performance.now())
        });
        
        // Sayfa performance metrikleri
        PerformanceService.trackPageLoadTime('home_page');
        
        // Memory usage takibi
        PerformanceService.trackMemoryUsage();
      }, 1000);
    }
  }, [loading, performanceTraceId, categories.length, restaurants.length]);

  useEffect(() => {
    loadData(true);
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && !loading && !refreshing) {
        handleRefresh();
      }
    };

    const handleWindowFocus = () => {
      if (!loading && !refreshing) {
        handleRefresh();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [loading, refreshing]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden && !loading && !refreshing) {
        handleRefresh();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loading, refreshing]);

  const loadData = async (forceRefresh: boolean = false) => {
    try {
      setLoading(true);
      
      // Performance tracking başlat
      const loadTraceId = PerformanceService.startCustomTrace('load_homepage_data', {
        force_refresh: forceRefresh.toString()
      });
      
      const categoriesPromise = CategoryService.getActiveCategories();
      const restaurantsPromise = RestaurantService.getActiveRestaurants();

      const [categoriesData, restaurantsData] = await Promise.all([
        categoriesPromise,
        restaurantsPromise
      ]);

      setCategories(categoriesData);
      setRestaurants(restaurantsData);
      setAllRestaurants(restaurantsData);

      // Performance tracking tamamla
      PerformanceService.stopCustomTrace(loadTraceId, {
        categories_loaded: categoriesData.length,
        restaurants_loaded: restaurantsData.length
      });

      // Analytics: Data loading event
      AnalyticsService.trackCustomEvent('homepage_data_loaded', {
        categories_count: categoriesData.length,
        restaurants_count: restaurantsData.length,
        force_refresh: forceRefresh
      });

    } catch (error) {
      console.error('Data loading error:', error);
      toast.error('Veriler yüklenirken bir hata oluştu');
      
      // Analytics: Error tracking
      AnalyticsService.trackCustomEvent('homepage_data_load_error', {
        error_message: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
      setLoadingRestaurants(false);
    }
  };

  // Kullanıcının konumunu al
  const getUserLocation = async () => {
    if (!navigator.geolocation) {
      toast.error('Tarayıcınız konum hizmetlerini desteklemiyor');
      return;
    }

    setLocationLoading(true);
    
    try {
      const position = await LocationService.getCurrentPosition();
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      
      let addressText = `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
      
      try {
        // Adresi çöz
        const address = await LocationService.reverseGeocode(lat, lng);
        addressText = (address as any).formatted || address.street || addressText;
      } catch (geocodeError) {
        console.warn('Adres çözümlemesi başarısız, koordinatlar kullanılıyor:', geocodeError);
      }
      
      const locationData = { 
        lat, 
        lng, 
        address: addressText
      };
      
      setUserLocation(locationData);
      setLocationSelected(true);
      findNearbyRestaurants(lat, lng);
      setShowNearbySection(true);
      
      toast.success(`🎯 Konumunuz tespit edildi: ${locationData.address}`);
      
      // Analytics: Location access
      AnalyticsService.trackCustomEvent('user_location_accessed', {
        latitude: lat,
        longitude: lng,
        address: locationData.address
      });
    } catch (error) {
      console.error('Konum alınamadı:', error);
      toast.error('Konum alınamadı. Lütfen konum iznini kontrol edin.');
    } finally {
      setLocationLoading(false);
    }
  };

  // Yakındaki restoranları bul
  const findNearbyRestaurants = (lat: number, lng: number) => {
    if (!allRestaurants.length) return;

    // Mesafe hesaplama fonksiyonu
    const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
      const R = 6371; // Dünya'nın yarıçapı (km)
      const dLat = (lat2 - lat1) * Math.PI / 180;
      const dLng = (lng2 - lng1) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      return R * c;
    };

    // Restoranları mesafeye göre sırala
    const nearby = allRestaurants
      .map(restaurant => ({
        ...restaurant,
        distance: calculateDistance(
          lat, 
          lng, 
          restaurant.address.coordinates?.lat || 0, 
          restaurant.address.coordinates?.lng || 0
        )
      }))
      .filter(restaurant => restaurant.distance <= 10) // 10km içindeki restoranlar
      .sort((a, b) => a.distance - b.distance)
      .slice(0, 6); // En yakın 6 restoran

    setNearbyRestaurants(nearby);
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      
      // Analytics: Refresh action
      AnalyticsService.trackCustomEvent('homepage_refresh', {
        trigger: 'manual_refresh'
      });
      
      await loadData(true);
    } catch (error) {
      console.error('Yenileme hatası:', error);
      toast.error('Kategoriler yenileme hatası');
    } finally {
      setRefreshing(false);
    }
  };

  const handleLocationSelected = (location: { lat: number; lng: number; address: string }) => {
    setUserLocation({ lat: location.lat, lng: location.lng, address: location.address });
    setLocationSelected(true);
    findNearbyRestaurants(location.lat, location.lng);
    setShowNearbySection(true);
    
    toast.success(`📍 Konum seçildi: ${location.address}`);
    
    // Analytics: Location selected
    AnalyticsService.trackCustomEvent('location_selected', {
      latitude: location.lat,
      longitude: location.lng,
      address: location.address
    });
  };

  const activeRestaurantMessage = userLocation
    ? `${(userLocation.address?.split(',')[0] || 'Çevrende').trim()} için ${nearbyRestaurants.length || restaurants.length || 0} restoran şu anda sipariş almaya hazır.`
    : `${restaurants.length || 0} restoran şu anda sipariş almaya hazır.`;

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-green-50/30">
      <Header />
      
      {/* Ana Layout - Sol Filtreleme + Sağ İçerik */}
      <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6">
        
        {/* Mobil Filtre Butonu */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="lg:hidden w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all duration-200"
        >
          <Filter className="h-5 w-5" />
          <span>{showFilters ? 'Filtreleri Gizle' : 'Filtreleri Göster'}</span>
        </button>
        
        {/* Sol Modern Filtre Sidebar */}
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block lg:w-80 lg:sticky lg:top-24 lg:h-[calc(100vh-6rem)]`}>
          <div className="bg-white/80 backdrop-blur-lg shadow-lg rounded-2xl p-4 md:p-5 border border-gray-100">
            
            {/* Filtre Header */}
            <div className="mb-6">
              <h3 className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-4 flex items-center gap-2">
                <Filter className="h-4 w-4" />
              Filtreler
            </h3>
              
              {/* Mevcut Konum Butonu - Premium */}
              <button
                onClick={getUserLocation}
                disabled={locationLoading}
                className="w-full h-11 rounded-xl bg-green-600 hover:bg-green-700 text-white font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {locationLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Konum alınıyor...</span>
                  </>
                ) : (
                  <>
                    <Navigation className="h-5 w-5" />
                    <span>Mevcut Konumumu Kullan</span>
                  </>
                )}
              </button>
              
              {/* Konum Durumu */}
                {locationSelected && userLocation ? (
                <div className="mt-3 p-3 bg-green-50 rounded-xl border border-green-200">
                  <div className="flex items-center gap-2 text-green-700 text-sm font-medium mb-1">
                      <MapPin className="h-4 w-4" />
                      <span>Konum aktif</span>
                    </div>
                  <div className="text-xs text-gray-600 pl-6 line-clamp-2">
                      {userLocation.address}
                    </div>
                  </div>
                ) : (
                <div className="mt-3 flex items-center gap-2 text-gray-500 text-xs">
                  <MapPin className="h-3 w-3" />
                    <span>Yakındaki restoranlar için konum gerekli</span>
                  </div>
                )}
            </div>

            {/* Kategoriler - Chip Tarzı */}
            <div className="mb-6">
              <h4 className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-3">Kategoriler</h4>
              <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto">
                {categories.map((category) => (
                  <CategoryPill
                      key={category.id}
                    id={category.id}
                    name={category.name}
                    icon={category.icon}
                      href={`/menu?category=${category.id}`}
                  />
                ))}
              </div>
            </div>

            {/* İstatistikler - Modern Card Grid */}
            <div>
              <h4 className="text-xs uppercase tracking-wide text-gray-400 font-semibold mb-3">İstatistikler</h4>
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  value={allRestaurants.length}
                  label="Restoran"
                />
                <StatCard
                  value={categories.length}
                  label="Kategori"
                />
                {locationSelected && (
                  <StatCard
                    value={nearbyRestaurants.length}
                    label="Yakında"
                    className="col-span-2 bg-green-50"
                  />
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Sağ İçerik Alanı */}
        <div className="flex-1 min-w-0">
          
          {/* Modern Hero Section */}
          <section className="bg-gradient-to-r from-green-50 via-white to-yellow-50 rounded-3xl border border-green-100 shadow-sm px-4 py-5 md:px-6 md:py-7 mb-8">
            <div className="max-w-4xl mx-auto space-y-5">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold text-[#0F9D58]">
                  Bugün ne yesek?
                </h1>
                <p className="text-base md:text-lg text-slate-600">
                  Adresini seç, çevrendeki restoranları gör ve siparişini dakikalar içinde Neyisek’ten ver.
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-green-500" />
                  {activeRestaurantMessage}
                </p>
              </div>

              <div className="rounded-3xl bg-emerald-50/70 border border-emerald-100 shadow-sm p-4">
                <div className="flex flex-col md:flex-row items-stretch gap-3">
                  <div className="flex-1 flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                    <Search className="h-5 w-5 text-slate-400 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Adresini yaz veya seç..."
                      className="flex-1 bg-transparent focus:outline-none text-gray-900 placeholder-slate-400"
                    />
                  </div>
                  <button
                    onClick={getUserLocation}
                    disabled={locationLoading}
                    className="w-full md:w-auto bg-[#00C853] hover:bg-[#00b44a] text-white font-semibold px-6 py-3 rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {locationLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Konum alınıyor...</span>
                      </>
                    ) : (
                      <>
                        <Navigation className="h-5 w-5" />
                        <span>Konumumu Kullan</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </section>
          
          {/* 2. CATEGORIES SECTION - Second Priority */}
          <section className="py-20 lg:py-32 bg-white">
        <div className="container-responsive">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-100 to-amber-100 border border-yellow-200 rounded-full px-6 py-3 mb-8">
              <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
              <span className="text-yellow-700 font-medium">Kategoriler</span>
          </div>

            <h2 className="text-4xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-600">
                Her Damak Zevkine
              </span>
              <br />
              <span className="text-gray-900">Uygun Lezzetler</span>
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Favori kategorinizi seçin ve size uygun restoranları keşfedin
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 text-center animate-pulse shadow-sm">
                  <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
              {/* All Categories Button */}
              <Link
                href="/menu"
                className="group bg-gray-100 hover:bg-gray-200 rounded-xl p-4 text-center transition-colors duration-200"
              >
                <div className="text-3xl mb-2">🍽️</div>
                <h3 className="font-semibold text-gray-900 text-sm mb-1">Tümü</h3>
                <p className="text-xs text-gray-600">{restaurants.length} restoran</p>
              </Link>

              {categories.map((category, index) => {
                // Basit renk paleti
                const colors = [
                  'bg-red-500 hover:bg-red-600',     // Kırmızı
                  'bg-orange-500 hover:bg-orange-600', // Turuncu  
                  'bg-yellow-500 hover:bg-yellow-600', // Sarı
                  'bg-green-500 hover:bg-green-600',   // Yeşil
                  'bg-blue-500 hover:bg-blue-600',     // Mavi
                  'bg-purple-500 hover:bg-purple-600', // Mor
                  'bg-pink-500 hover:bg-pink-600',     // Pembe
                  'bg-indigo-500 hover:bg-indigo-600', // İndigo
                  'bg-teal-500 hover:bg-teal-600',     // Teal
                  'bg-amber-500 hover:bg-amber-600',   // Amber
                ];
                
                const colorClass = colors[index % colors.length];
                
                return (
                  <Link
                    key={category.id}
                    href={`/menu?category=${category.id}`}
                    className={`group ${colorClass} text-white rounded-xl p-4 text-center transition-colors duration-200`}
                  >
                    <div className="text-3xl mb-2">
                      {category.icon || '🍽️'}
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{category.name}</h3>
                    <p className="text-xs opacity-90">{category.description}</p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 3. NEARBY RESTAURANTS - Third Priority (if location selected) */}
      {locationSelected && showNearbySection && (
      <section className="py-20 lg:py-32 bg-gradient-to-br from-blue-50 to-indigo-50/30">
        <div className="container-responsive">
          {/* Section Header */}
          <div className="flex flex-col lg:flex-row items-center justify-between mb-20 gap-8">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 rounded-full px-6 py-3 mb-8">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-blue-700 font-medium">Yakındaki Restoranlar</span>
              </div>
              
              <h2 className="text-4xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  Konumunuza En Yakın
                </span>
                <br />
                <span className="text-gray-900">Lezzet Durakları</span>
              </h2>
              <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl leading-relaxed">
                Bulunduğunuz konuma en yakın, hızlı teslimat yapan restoranları keşfedin
              </p>
            </div>
            
                <div className="flex items-center gap-2 text-blue-600 font-medium">
                  <Target className="h-5 w-5" />
                  <span>📍 {userLocation?.address || 'Konum tespit ediliyor...'}</span>
            </div>
          </div>

          {/* Yakındaki Restoranlar Grid */}
            {nearbyRestaurants.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {nearbyRestaurants.map((restaurant) => (
                <Link
                  key={restaurant.id}
                  href={`/restaurant/${restaurant.id}`}
                  className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:scale-105"
                >
                  <div className="relative h-64 overflow-hidden">
                    <ImageWithFallback
                      src={restaurant.coverImageUrl || ''}
                      alt={restaurant.name}
                      width={300}
                      height={256}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      fallbackSrc="/images/restaurant-placeholder.svg"
                    />
                    <div className="absolute top-6 left-6">
                      <RestaurantStatusBadge 
                        restaurant={restaurant} 
                        variant="compact"
                        className="shadow-lg"
                      />
                    </div>
                    {/* Mesafe Badge */}
                    <div className="absolute top-6 right-6 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold shadow-lg">
                      {(restaurant as any).distance?.toFixed(1) || '0.0'} km
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors duration-300">
                      {restaurant.name}
                    </h3>
                    <p className="text-gray-600 mb-6 line-clamp-2 leading-relaxed">
                      {restaurant.description}
                    </p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-5 w-5 ${
                                i < Math.floor(restaurant.rating || 0) ? 'fill-current' : ''
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-gray-700 font-semibold">
                          {restaurant.rating?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-600 bg-gray-100 px-3 py-2 rounded-full">
                        <Clock className="h-4 w-4" />
                        <span className="font-medium">{restaurant.estimatedDeliveryTime || 30} dk</span>
                      </div>
                    </div>

                    {/* Order Button */}
                    <OrderButton
                      restaurant={restaurant}
                      onOrderClick={() => {
                        window.location.href = `/restaurant/${restaurant.id}`;
                      }}
                      className="w-full"
                      size="md"
                    />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-8xl mb-8">🏪</div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Yakında Restoran Bulunamadı
              </h3>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                10km yarıçapında aktif restoran bulunmuyor. Daha geniş bir alanda arama yapmayı deneyin.
              </p>
            </div>
          )}
        </div>
      </section>
      )}

      {/* 4. POPULAR RESTAURANTS - Fourth Priority */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-gray-50 to-green-50/30">
        <div className="container-responsive">
          {/* Section Header with Refresh Button */}
          <div className="flex flex-col lg:flex-row items-center justify-between mb-20 gap-8">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 rounded-full px-6 py-3 mb-8">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-700 font-medium">Popüler Restoranlar</span>
              </div>
              
              <h2 className="text-4xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-600">
                  En Çok Tercih Edilen
                </span>
                <br />
                <span className="text-gray-900">Lezzet Noktaları</span>
              </h2>
              <p className="text-xl lg:text-2xl text-gray-600 max-w-3xl leading-relaxed">
                Müşterilerimizin favorisi olan, kaliteli ve lezzetli yemekler sunan restoranlar
              </p>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-white hover:bg-gray-50 border-2 border-gray-200 hover:border-green-300 text-gray-700 hover:text-green-700 font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-3 shadow-lg hover:shadow-xl"
            >
              <RefreshCw className={`h-6 w-6 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="text-lg">Yenile</span>
            </button>
          </div>

          {loadingRestaurants ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl shadow-xl overflow-hidden animate-pulse">
                  <div className="h-64 bg-gray-200"></div>
                  <div className="p-8">
                    <div className="h-7 bg-gray-200 rounded mb-4"></div>
                    <div className="h-5 bg-gray-200 rounded mb-6 w-2/3"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                      <div className="h-5 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : restaurants.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {restaurants.slice(0, 6).map((restaurant) => (
                <Link
                  key={restaurant.id}
                  href={`/restaurant/${restaurant.id}`}
                  className="group bg-white rounded-2xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden border border-gray-100 hover:border-green-200 hover:-translate-y-1"
                >
                  {/* Restoran Resmi */}
                  <div className="relative h-32 overflow-hidden bg-gradient-to-br from-green-100 to-yellow-100">
                    <ImageWithFallback
                      src={restaurant.coverImageUrl || ''}
                      alt={restaurant.name}
                      width={300}
                      height={128}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      fallbackSrc="/images/restaurant-placeholder.svg"
                    />
                    <div className="absolute top-4 left-4">
                      <RestaurantStatusBadge 
                        restaurant={restaurant} 
                        variant="compact"
                        className="shadow-lg"
                      />
                    </div>
                  </div>
                  
                  {/* Restoran Bilgileri */}
                  <div className="p-4 flex flex-col gap-3">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-green-600 transition-colors duration-200">
                        {restaurant.name}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2 line-clamp-1">
                        {restaurant.categoryIds?.length ? restaurant.categoryIds.join(', ') : 'Lezzetli Yemekler'}
                      </p>
                    </div>
                    
                    {/* Puan ve Teslimat Süresi */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <div className="flex text-yellow-400">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-3.5 w-3.5 ${
                                i < Math.floor(restaurant.rating || 0) ? 'fill-current' : ''
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-gray-700">
                          {restaurant.rating?.toFixed(1) || '0.0'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-gray-600 bg-gray-50 px-2 py-1 rounded-full">
                        <Clock className="h-3 w-3" />
                        <span className="text-xs font-medium">{restaurant.estimatedDeliveryTime || 30}-{restaurant.estimatedDeliveryTime ? restaurant.estimatedDeliveryTime + 10 : 40} dk</span>
                      </div>
                    </div>
                    
                    {/* Min. Sepet */}
                    {restaurant.minimumOrderAmount && (
                      <div className="text-xs text-gray-500">
                        Min. sepet: {restaurant.minimumOrderAmount} ₺
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="text-8xl mb-8">🍽️</div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Henüz restoran bulunmuyor
              </h3>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Yakında yeni restoranlar eklenecek.
              </p>
            </div>
          )}

          {restaurants.length > 6 && (
            <div className="text-center mt-16">
              <Link 
                href="/restaurants" 
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-5 px-12 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl inline-flex items-center gap-4 text-xl"
              >
                <span>Tüm Restoranları Görüntüle</span>
                <ArrowRight className="h-6 w-6" />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Features Section - Golden Ratio Design */}
      <section id="features" className="py-20 lg:py-32 bg-white">
        <div className="container-responsive">
          {/* Section Header */}
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-100 to-purple-100 border border-blue-200 rounded-full px-6 py-3 mb-8">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
              <span className="text-blue-700 font-medium">Neden NeYisek?</span>
            </div>
            
            <h2 className="text-4xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                Modern Teknoloji ile
              </span>
              <br />
              <span className="text-gray-900">Geleneksel Lezzetler</span>
            </h2>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Yenilikçi çözümlerle mükemmel yemek deneyimi sunan platform
            </p>
          </div>

          {/* Features Grid - Golden Ratio Layout */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
            {/* Fast Delivery Feature */}
            <div className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-10 hover:shadow-2xl transition-all duration-500 border border-green-100 transform hover:scale-105">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 w-fit mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Truck className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">Hızlı Teslimat</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Ortalama 25 dakikada kapınızda. GPS takip sistemi ile siparişinizi anlık olarak takip edin.
                <span className="block mt-4 text-green-600 font-semibold">
                  ⚡ Ekspres teslimat seçeneği ile 15 dakikada!
                </span>
              </p>
            </div>

            {/* Secure Payment Feature */}
            <div className="group bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-10 hover:shadow-2xl transition-all duration-500 border border-blue-100 transform hover:scale-105">
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 w-fit mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <ShieldCheck className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">Güvenli Ödeme</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                256-bit SSL şifreleme ile güvenli ödeme. Kredi kartı, banka kartı ve dijital cüzdan desteği.
                <span className="block mt-4 text-blue-600 font-semibold">
                  🔒 Blockchain tabanlı güvenlik
                </span>
              </p>
            </div>

            {/* 24/7 Support Feature */}
            <div className="group bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-10 hover:shadow-2xl transition-all duration-500 border border-purple-100 transform hover:scale-105">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 w-fit mb-8 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                <Clock className="h-10 w-10 text-white" />
              </div>
              <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6">7/24 Destek</h3>
              <p className="text-gray-600 leading-relaxed text-lg">
                Her zaman yanınızdayız. Canlı destek, telefon ve e-posta ile 7/24 müşteri hizmetleri.
                <span className="block mt-4 text-purple-600 font-semibold">
                  💬 AI destekli anlık yanıt
                </span>
              </p>
            </div>
          </div>

          {/* Additional Features Row */}
          <div className="grid md:grid-cols-2 gap-8 lg:gap-10 mt-10">
            {/* Quality Assurance */}
            <div className="group bg-gradient-to-br from-yellow-50 to-orange-50 rounded-3xl p-10 hover:shadow-2xl transition-all duration-500 border border-yellow-100 transform hover:scale-105">
              <div className="flex items-start gap-6">
                <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-2xl p-6 flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Award className="h-10 w-10 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Kalite Garantisi</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    Tüm restoranlarımız düzenli kalite kontrolünden geçer. 
                    <span className="text-yellow-600 font-semibold"> %100 memnuniyet garantisi</span> ile 
                    her siparişinizde kaliteli hizmet alırsınız.
                  </p>
                </div>
              </div>
            </div>

            {/* Smart Recommendations */}
            <div className="group bg-gradient-to-br from-teal-50 to-cyan-50 rounded-3xl p-10 hover:shadow-2xl transition-all duration-500 border border-teal-100 transform hover:scale-105">
              <div className="flex items-start gap-6">
                <div className="bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl p-6 flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Brain className="h-10 w-10 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">Akıllı Öneriler</h3>
                  <p className="text-gray-600 leading-relaxed text-lg">
                    AI destekli öneri sistemi ile damak zevkinize uygun yemekleri keşfedin. 
                    <span className="text-teal-600 font-semibold"> Kişiselleştirilmiş menü</span> deneyimi yaşayın.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Banner Advertisement */}
      <div className="container-responsive">
        <AdvertisementBanner position="banner" />
      </div>

      {/* Restaurant CTA Section - Golden Ratio Design */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="container-responsive">
          {/* Golden Ratio Grid: 1.618 ratio for content areas */}
          <div className="grid lg:grid-cols-golden gap-16 lg:gap-20 items-center">
            
            {/* Left Column - Main Content (Golden Ratio: 1.618 part) */}
            <div className="space-y-10 text-center lg:text-left">
              {/* Badge */}
              <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full px-6 py-3">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-300 font-medium">Restoran Ortaklığı</span>
              </div>

              {/* Main Heading */}
              <div className="space-y-8">
                <h2 className="text-5xl lg:text-7xl xl:text-8xl font-black leading-tight">
                  <span className="block text-white mb-2">
                  Restoranınızı
                  </span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
                    Büyütün!
                  </span>
                </h2>
                
                <p className="text-xl lg:text-2xl xl:text-3xl text-gray-300 leading-relaxed max-w-4xl mx-auto lg:mx-0">
                  NeYisek.com ile dijital dönüşümünüzü tamamlayın. 
                  <span className="text-green-400 font-semibold"> Binlerce müşteriye</span> ulaşın, 
                  satışlarınızı artırın ve işinizi büyütün.
                </p>
              </div>

              {/* Stats Grid - Golden Ratio proportions */}
              <div className="grid grid-cols-3 gap-8 pt-8">
                <div className="text-center">
                  <div className="text-4xl lg:text-5xl xl:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400 mb-3">
                    +250%
                  </div>
                  <div className="text-gray-300 font-medium text-lg">Satış Artışı</div>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl lg:text-5xl xl:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400 mb-3">
                    15K+
                  </div>
                  <div className="text-gray-300 font-medium text-lg">Aylık Sipariş</div>
                </div>
                
                <div className="text-center">
                  <div className="text-4xl lg:text-5xl xl:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-blue-400 mb-3">
                    98%
                  </div>
                  <div className="text-gray-300 font-medium text-lg">Memnuniyet</div>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-6 pt-8">
                <Link 
                  href="/restaurants/apply"
                  className="group bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-6 px-12 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl inline-flex items-center justify-center gap-4 text-xl"
                >
                  <Store className="h-7 w-7" />
                  <span>Başvuru Yap</span>
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
                
                <Link 
                  href="/restaurant-login" 
                  className="group bg-white/10 backdrop-blur-xl border border-white/20 hover:bg-white/20 text-white font-bold py-6 px-12 rounded-2xl transition-all duration-300 transform hover:scale-105 inline-flex items-center justify-center gap-4 text-xl"
                >
                  <UserPlus className="h-7 w-7" />
                  <span>Panel Girişi</span>
                  <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
                </Link>
              </div>
            </div>

            {/* Right Column - Feature Cards (Golden Ratio: 1 part) */}
            <div className="space-y-8">
              <div className="grid gap-8">
                {/* AI Analytics Card */}
                <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-10 transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-start gap-6">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-5 flex-shrink-0">
                      <BarChart3 className="h-10 w-10 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                        AI Destekli Analitikler
                      </h3>
                      <p className="text-gray-300 leading-relaxed text-lg">
                        Yapay zeka ile satış trendlerinizi analiz edin, gelecek tahminleri yapın ve 
                        <span className="text-blue-300 font-semibold"> %60 daha etkili</span> pazarlama stratejileri geliştirin.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Real-time Management Card */}
                <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-10 transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-start gap-6">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-5 flex-shrink-0">
                      <Zap className="h-10 w-10 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                        Gerçek Zamanlı Yönetim
                      </h3>
                      <p className="text-gray-300 leading-relaxed text-lg">
                        Siparişlerinizi, stok durumunuzu ve müşteri geri bildirimlerini 
                        <span className="text-green-300 font-semibold"> anlık olarak</span> takip edin ve yönetin.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Smart Payment Card */}
                <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl p-10 transform hover:scale-105 transition-all duration-300">
                  <div className="flex items-start gap-6">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-5 flex-shrink-0">
                      <CreditCard className="h-10 w-10 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                        Akıllı Ödeme Sistemi
                      </h3>
                      <p className="text-gray-300 leading-relaxed text-lg">
                        Blockchain tabanlı güvenli ödemeler, 
                        <span className="text-purple-300 font-semibold"> anında transfer</span> ve 
                        düşük komisyon oranları ile kazancınızı maksimize edin.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

        </div>
      </div>
      
      {/* Footer - tam genişlik */}
      <footer className="bg-gray-900 text-white py-20">
        <div className="container-responsive">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">NeYisek.com</h3>
              <p className="text-gray-400 mb-4">
                En lezzetli yemekleri kapınıza kadar getiriyoruz.
              </p>
                </div>
              </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 NeYisek.com. Tüm hakları saklıdır.</p>
          </div>
        </div>
      </footer>

      {/* Popup Advertisement */}
      <AdvertisementBanner position="popup" />
    </main>
  );
} 