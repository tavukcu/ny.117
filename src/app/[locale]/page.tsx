'use client';

import { useState, useEffect } from 'react';
import Header from '@/components/Header';
import AdvertisementBanner from '@/components/AdvertisementBanner';
import GuestWelcomeBanner from '@/components/GuestWelcomeBanner';
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
  Filter
} from 'lucide-react';
import Link from 'next/link';
import { CategoryService } from '@/services/categoryService';
import { RestaurantService } from '@/services/restaurantService';
import type { Category, RestaurantInfo } from '@/types';
import toast from 'react-hot-toast';
import SmartRecommendations from '@/components/SmartRecommendations';
import RestaurantStatusBadge from '@/components/RestaurantStatusBadge';
import OrderButton from '@/components/OrderButton';

// Ana sayfa komponenti
export default function HomePage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [restaurants, setRestaurants] = useState<RestaurantInfo[]>([]);
  const [allRestaurants, setAllRestaurants] = useState<RestaurantInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [performanceTraceId, setPerformanceTraceId] = useState<string>('');
  
  // Yakındaki restoranlar için state'ler
  const [nearbyRestaurants, setNearbyRestaurants] = useState<RestaurantInfo[]>([]);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [showNearbySection, setShowNearbySection] = useState(false);

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
  const getUserLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Tarayıcınız konum hizmetlerini desteklemiyor');
      return;
    }

    setLocationLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserLocation({ lat, lng });
        findNearbyRestaurants(lat, lng);
        setShowNearbySection(true);
        setLocationLoading(false);
        
        // Analytics: Location access
        AnalyticsService.trackCustomEvent('user_location_accessed', {
          latitude: lat,
          longitude: lng
        });
      },
      (error) => {
        console.error('Konum alınamadı:', error);
        toast.error('Konum alınamadı. Lütfen konum iznini kontrol edin.');
        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
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

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <GuestWelcomeBanner />
      <AdvertisementBanner position="hero" className="relative z-20" />





      {/* Categories Section - Golden Ratio Layout */}
      <section className="py-0 lg:py-0 bg-white -mt-32 lg:-mt-96">
        <div className="container-responsive">
          {/* NY-01.png Logo - Centered at the top */}
          <div className="text-center mb-0 -mt-24 lg:-mt-80 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer rounded-full"></div>
            <img 
              src="/NY-01.png" 
              alt="NY-01 Logo" 
              className="h-160 w-160 sm:h-200 sm:w-200 md:h-240 md:w-240 lg:h-280 lg:w-280 xl:h-320 xl:w-320 mx-auto object-contain rounded-full drop-shadow-2xl relative z-10 bg-transparent" 
            />
          </div>

          {/* Section Header - Golden Ratio spacing */}
          <div className="text-center mb-0 -mt-32 lg:-mt-96">
            <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-6 leading-tight">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-blue-600">
                Her Damak Zevkine
              </span>
              <br />
              <span className="text-yellow-500">Uygun Lezzetler</span>
            </h2>

          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center items-center gap-4 sm:gap-6 lg:gap-8 place-items-center">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-3xl p-6 sm:p-8 text-center animate-pulse shadow-lg w-full max-w-[200px]">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 rounded-full mx-auto mb-4 sm:mb-6"></div>
                  <div className="h-4 sm:h-5 bg-gray-200 rounded mb-2 sm:mb-3"></div>
                  <div className="h-3 sm:h-4 bg-gray-200 rounded w-2/3 mx-auto"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center items-center gap-4 sm:gap-6 lg:gap-8 place-items-center">
              {/* All Categories Button */}
              <Link
                href="/menu"
                className={`group bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 rounded-3xl p-6 sm:p-8 text-center hover:shadow-2xl transition-all duration-500 border-2 transform hover:scale-105 border-gray-200 hover:border-gray-300 w-full max-w-[200px] aspect-square flex flex-col justify-center pointer-events-auto cursor-pointer relative z-10`}
              >
                <div className="text-4xl sm:text-5xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">🍽️</div>
                <h3 className="font-bold text-gray-900 mb-2 text-base sm:text-lg">Tümü</h3>
                <p className="text-xs sm:text-sm text-gray-700 font-medium">{restaurants.length} restoran</p>
              </Link>

              {categories.map((category, index) => {
                // İştah açıcı gradient renk paleti
                const colorPalettes = [
                  'bg-gradient-to-br from-red-400 to-pink-500 hover:from-red-500 hover:to-pink-600', // Kırmızı-Pembe (Et, Pizza)
                  'bg-gradient-to-br from-orange-400 to-red-500 hover:from-orange-500 hover:to-red-600', // Turuncu-Kırmızı (Fast Food)
                  'bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600', // Sarı-Turuncu (Kahvaltı, Tatlı)
                  'bg-gradient-to-br from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600', // Yeşil (Salata, Vegan)
                  'bg-gradient-to-br from-blue-400 to-cyan-500 hover:from-blue-500 hover:to-cyan-600', // Mavi (Deniz Ürünleri)
                  'bg-gradient-to-br from-purple-400 to-pink-500 hover:from-purple-500 hover:to-pink-600', // Mor-Pembe (Tatlı, İçecek)
                  'bg-gradient-to-br from-indigo-400 to-purple-500 hover:from-indigo-500 hover:to-purple-600', // İndigo-Mor (Kahve)
                  'bg-gradient-to-br from-pink-400 to-rose-500 hover:from-pink-500 hover:to-rose-600', // Pembe-Gül (Dondurma)
                  'bg-gradient-to-br from-teal-400 to-green-500 hover:from-teal-500 hover:to-green-600', // Teal-Yeşil (Sağlıklı)
                  'bg-gradient-to-br from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600', // Amber-Sarı (Türk Mutfağı)
                  'bg-gradient-to-br from-lime-400 to-green-500 hover:from-lime-500 hover:to-green-600', // Lime-Yeşil (Meyve)
                  'bg-gradient-to-br from-rose-400 to-pink-500 hover:from-rose-500 hover:to-pink-600' // Gül-Pembe (Romantik)
                ];
                
                const colorClass = colorPalettes[index % colorPalettes.length];
                
                return (
                  <Link
                    key={category.id}
                    href={`/menu?category=${category.id}`}
                    className={`group ${colorClass} rounded-3xl p-6 sm:p-8 text-center hover:shadow-2xl transition-all duration-500 border-2 transform hover:scale-105 border-white/20 hover:border-white/40 w-full max-w-[200px] aspect-square flex flex-col justify-center pointer-events-auto cursor-pointer relative z-10`}
                  >
                    <div className="text-4xl sm:text-5xl mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300 drop-shadow-lg">
                      {category.icon || '🍽️'}
                    </div>
                    <h3 className="font-bold text-white mb-2 text-base sm:text-lg drop-shadow-md">{category.name}</h3>
                    <p className="text-xs sm:text-sm text-white/90 font-medium drop-shadow-sm">{category.description}</p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Yakındaki Restoranlar Section */}
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
            
            <div className="flex items-center gap-4">
              {!showNearbySection ? (
                <button
                  onClick={getUserLocation}
                  disabled={locationLoading}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {locationLoading ? (
                    <RefreshCw className="h-6 w-6 animate-spin" />
                  ) : (
                    <Navigation className="h-6 w-6" />
                  )}
                  <span className="text-lg">
                    {locationLoading ? 'Konum Alınıyor...' : 'Yakındakileri Bul'}
                  </span>
                </button>
              ) : (
                <div className="flex items-center gap-2 text-blue-600 font-medium">
                  <Target className="h-5 w-5" />
                  <span>Konumunuz: {userLocation?.lat.toFixed(4)}, {userLocation?.lng.toFixed(4)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Yakındaki Restoranlar Grid */}
          {!showNearbySection ? (
            <div className="text-center py-20">
              <div className="text-8xl mb-8">📍</div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Konumunuzu Paylaşın
              </h3>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Size en yakın restoranları görmek için konum iznini verin
              </p>
              <button
                onClick={getUserLocation}
                disabled={locationLoading}
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-2xl transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-3 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {locationLoading ? (
                  <RefreshCw className="h-6 w-6 animate-spin" />
                ) : (
                  <Navigation className="h-6 w-6" />
                )}
                <span className="text-lg">
                  {locationLoading ? 'Konum Alınıyor...' : 'Konumumu Paylaş'}
                </span>
              </button>
            </div>
          ) : nearbyRestaurants.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {nearbyRestaurants.map((restaurant) => (
                <Link
                  key={restaurant.id}
                  href={`/restaurant/${restaurant.id}`}
                  className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:scale-105"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={restaurant.coverImageUrl || '/images/restaurant-placeholder.svg'}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
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

      {/* Restaurants Section - Golden Ratio Layout */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-gray-50 to-green-50/30">
        <div className="container-responsive">
          {/* Section Header with Refresh Button */}
          <div className="flex flex-col lg:flex-row items-center justify-between mb-20 gap-8">
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-3 bg-gradient-to-r from-yellow-100 to-amber-100 border border-yellow-200 rounded-full px-6 py-3 mb-8">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-yellow-700 font-medium">Popüler Restoranlar</span>
              </div>
              
              <h2 className="text-4xl lg:text-6xl font-black text-gray-900 mb-6 leading-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-600 to-amber-600">
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
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
              {restaurants.slice(0, 6).map((restaurant) => (
                <Link
                  key={restaurant.id}
                  href={`/restaurant/${restaurant.id}`}
                  className="group bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100 hover:border-green-200 transform hover:scale-105"
                >
                  <div className="relative h-64 overflow-hidden">
                    <img
                      src={restaurant.coverImageUrl || '/images/restaurant-placeholder.svg'}
                      alt={restaurant.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-6 left-6">
                      <RestaurantStatusBadge 
                        restaurant={restaurant} 
                        variant="compact"
                        className="shadow-lg"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  
                  <div className="p-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-green-600 transition-colors duration-300">
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
                        // Restoran sayfasına yönlendir
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
                  href="/restaurant-apply" 
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

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="container-responsive">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">NeYisek.com</h3>
              <p className="text-gray-400 mb-4">
                Lezzetli yemekleri kapınıza getiren güvenilir adresiniz.
              </p>
              <div className="flex items-center gap-2">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <span className="text-gray-400 text-sm">4.8/5</span>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Hızlı Linkler</h4>
              <ul className="space-y-2">
                <li><Link href="/menu" className="text-gray-400 hover:text-white transition-colors duration-200">Menü</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-white transition-colors duration-200">Hakkımızda</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors duration-200">İletişim</Link></li>
                <li><Link href="/delivery-areas" className="text-gray-400 hover:text-white transition-colors duration-200">Teslimat Alanları</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">Müşteri Hizmetleri</h4>
              <ul className="space-y-2">
                <li><Link href="/help" className="text-gray-400 hover:text-white transition-colors duration-200">Yardım</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors duration-200">Gizlilik Politikası</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors duration-200">Kullanım Şartları</Link></li>
                <li><Link href="/returns" className="text-gray-400 hover:text-white transition-colors duration-200">İade ve Değişim</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">İletişim</h4>
              <ul className="space-y-2 text-gray-400">
                <li>📞 0 236 7684106</li>
                <li>📧 info@neyisek.com</li>
                <li>📍 Ahmetli/Manisa/TÜRKİYE</li>
                <li>🕒 7/24 Hizmet</li>
              </ul>
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