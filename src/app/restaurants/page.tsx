'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { RestaurantService } from '@/services/restaurantService';
import { CategoryService } from '@/services/categoryService';
import { useLocation } from '@/hooks/useLocation';
import RestaurantMap from '@/components/RestaurantMap';
import { 
  Search, 
  Filter, 
  MapPin, 
  Star, 
  Clock, 
  Truck, 
  Heart,
  SlidersHorizontal,
  Grid3X3,
  List,
  Navigation,
  Target,
  X,
  Map
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import type { RestaurantInfo, Category } from '@/types';
import RestaurantStatusBadge from '@/components/RestaurantStatusBadge';
import OrderButton from '@/components/OrderButton';
import BackToHomeButton from '@/components/BackToHomeButton';

function RestaurantsPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { coordinates: userLocation, getCurrentLocation, loading: locationLoading } = useLocation();
  
  // States
  const [restaurants, setRestaurants] = useState<RestaurantInfo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<RestaurantInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'rating' | 'distance' | 'deliveryTime' | 'name'>('rating');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [deliveryTime, setDeliveryTime] = useState<number>(60);
  const [minRating, setMinRating] = useState<number>(0);
  const [showOpenOnly, setShowOpenOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'map'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // URL parametrelerini oku
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    
    if (categoryParam) setSelectedCategory(categoryParam);
    if (searchParam) setSearchTerm(searchParam);
  }, [searchParams]);

  // Veri yükleme
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      
      const [restaurantsData, categoriesData] = await Promise.all([
        RestaurantService.getActiveRestaurants(),
        CategoryService.getAllCategories()
      ]);
      
      setRestaurants(restaurantsData);
      setCategories(categoriesData.filter(cat => cat.isActive));
      
      // Favorileri localStorage'dan yükle
      const savedFavorites = localStorage.getItem('favorites');
      if (savedFavorites) {
        setFavorites(JSON.parse(savedFavorites));
      }
      
    } catch (error) {
      console.error('Veri yükleme hatası:', error);
      toast.error('Restoranlar yüklenirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Filtreleme ve sıralama
  useEffect(() => {
    let filtered = [...restaurants];

    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(restaurant =>
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.address.district.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Kategori filtresi
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(restaurant =>
        restaurant.categoryIds?.includes(selectedCategory)
      );
    }

    // Açık restoranlar filtresi
    if (showOpenOnly) {
      filtered = filtered.filter(restaurant => restaurant.isOpen);
    }

    // Minimum puan filtresi
    if (minRating > 0) {
      filtered = filtered.filter(restaurant => (restaurant.rating || 0) >= minRating);
    }

    // Teslimat süresi filtresi
    filtered = filtered.filter(restaurant => 
      (restaurant.estimatedDeliveryTime || 30) <= deliveryTime
    );

    // Fiyat aralığı filtresi (minimum sipariş tutarı)
    filtered = filtered.filter(restaurant =>
      (restaurant.minimumOrderAmount || 0) >= priceRange[0] &&
      (restaurant.minimumOrderAmount || 0) <= priceRange[1]
    );

    // Mesafe hesaplama ve sıralama
    if (userLocation) {
      filtered = filtered.map(restaurant => ({
        ...restaurant,
        distance: calculateDistance(
          userLocation.lat,
          userLocation.lng,
          restaurant.address.coordinates?.lat || 0,
          restaurant.address.coordinates?.lng || 0
        )
      }));
    }

    // Sıralama
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'distance':
          if (userLocation) {
            return ((a as any).distance || 0) - ((b as any).distance || 0);
          }
          return 0;
        case 'deliveryTime':
          return (a.estimatedDeliveryTime || 30) - (b.estimatedDeliveryTime || 30);
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return 0;
      }
    });

    setFilteredRestaurants(filtered);
  }, [restaurants, searchTerm, selectedCategory, sortBy, priceRange, deliveryTime, minRating, showOpenOnly, userLocation]);

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

  // Favori ekleme/çıkarma
  const toggleFavorite = (restaurantId: string) => {
    const newFavorites = favorites.includes(restaurantId)
      ? favorites.filter(id => id !== restaurantId)
      : [...favorites, restaurantId];
    
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    
    toast.success(favorites.includes(restaurantId) 
      ? 'Favorilerden çıkarıldı' 
      : 'Favorilere eklendi'
    );
  };

  // Filtreleri sıfırla
  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSortBy('rating');
    setPriceRange([0, 500]);
    setDeliveryTime(60);
    setMinRating(0);
    setShowOpenOnly(false);
  };

  // Haritada restoran tıklama
  const handleRestaurantClick = (restaurant: RestaurantInfo) => {
    router.push(`/restaurant/${restaurant.id}`);
  };

  if (isLoading) {
    return (
      <main>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Restoranlar yükleniyor...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <Header />

      {/* Sayfa Başlığı */}
      <section className="bg-gradient-to-r from-green-600 to-emerald-700 text-white py-12">
        <div className="container-responsive">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              Restoranlar
            </h1>
            <p className="text-xl text-green-100 mb-6">
              En sevdiğiniz lezzetleri sunan restoranları keşfedin
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <BackToHomeButton variant="secondary" />
              {!userLocation && (
                <button
                  onClick={() => getCurrentLocation()}
                  disabled={locationLoading}
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-6 py-3 rounded-lg font-medium transition-colors duration-200 flex items-center gap-2 disabled:opacity-50"
                >
                  {locationLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Navigation className="h-4 w-4" />
                  )}
                  {locationLoading ? 'Konum Alınıyor...' : 'Konumumu Paylaş'}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Arama ve Filtreler */}
      <section className="bg-white border-b border-gray-200 sticky top-16 z-30">
        <div className="container-responsive py-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Arama Kutusu */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Restoran, yemek veya adres ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>

            {/* Filtre Butonları */}
            <div className="flex items-center gap-3">
              {/* Görünüm Modu */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'grid' ? 'bg-white shadow-sm' : 'text-gray-600'
                  }`}
                  title="Grid Görünümü"
                >
                  <Grid3X3 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'list' ? 'bg-white shadow-sm' : 'text-gray-600'
                  }`}
                  title="Liste Görünümü"
                >
                  <List className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setViewMode('map')}
                  className={`p-2 rounded-md transition-colors ${
                    viewMode === 'map' ? 'bg-white shadow-sm' : 'text-gray-600'
                  }`}
                  title="Harita Görünümü"
                >
                  <Map className="h-4 w-4" />
                </button>
              </div>

              {/* Filtreler Butonu */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  showFilters 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filtreler
              </button>
            </div>
          </div>

          {/* Gelişmiş Filtreler */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Kategori Filtresi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori
                  </label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="all">Tüm Kategoriler</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sıralama */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sırala
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="rating">En Yüksek Puan</option>
                    <option value="distance">En Yakın</option>
                    <option value="deliveryTime">En Hızlı Teslimat</option>
                    <option value="name">İsme Göre</option>
                  </select>
                </div>

                {/* Minimum Puan */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Minimum Puan
                  </label>
                  <select
                    value={minRating}
                    onChange={(e) => setMinRating(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value={0}>Tümü</option>
                    <option value={3}>3+ Yıldız</option>
                    <option value={4}>4+ Yıldız</option>
                    <option value={4.5}>4.5+ Yıldız</option>
                  </select>
                </div>

                {/* Teslimat Süresi */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max. Teslimat Süresi
                  </label>
                  <select
                    value={deliveryTime}
                    onChange={(e) => setDeliveryTime(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value={30}>30 dakika</option>
                    <option value={45}>45 dakika</option>
                    <option value={60}>60 dakika</option>
                    <option value={90}>90 dakika</option>
                  </select>
                </div>
              </div>

              {/* Fiyat Aralığı */}
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Sipariş Tutarı: ₺{priceRange[0]} - ₺{priceRange[1]}
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="flex-1"
                  />
                  <input
                    type="range"
                    min="0"
                    max="500"
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Diğer Filtreler */}
              <div className="mt-4 flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showOpenOnly}
                    onChange={(e) => setShowOpenOnly(e.target.checked)}
                    className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">Sadece açık restoranlar</span>
                </label>

                <button
                  onClick={resetFilters}
                  className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
                >
                  <X className="h-4 w-4" />
                  Filtreleri Sıfırla
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* İçerik */}
      <section className="py-8 bg-gray-50 min-h-screen">
        <div className="container-responsive">
          {/* Sonuç Bilgisi */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {filteredRestaurants.length} Restoran
              </h2>
              {userLocation && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Target className="h-4 w-4" />
                  <span>Konumunuz: {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}</span>
                </div>
              )}
            </div>
            
            {filteredRestaurants.length > 0 && (
              <div className="text-sm text-gray-600">
                {searchTerm && `"${searchTerm}" için `}
                {selectedCategory !== 'all' && `${categories.find(c => c.id === selectedCategory)?.name} kategorisinde `}
                {filteredRestaurants.length} sonuç
              </div>
            )}
          </div>

          {/* Harita Görünümü */}
          {viewMode === 'map' ? (
            <RestaurantMap
              restaurants={filteredRestaurants}
              onRestaurantClick={handleRestaurantClick}
              className="mb-8"
            />
          ) : (
            /* Liste/Grid Görünümü */
            filteredRestaurants.length === 0 ? (
              <div className="text-center py-16">
                <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-gray-900 mb-2">
                  Restoran Bulunamadı
                </h3>
                <p className="text-gray-600 mb-6">
                  Arama kriterlerinize uygun restoran bulunamadı. Filtreleri değiştirmeyi deneyin.
                </p>
                <button
                  onClick={resetFilters}
                  className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
                >
                  Filtreleri Sıfırla
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
                : "space-y-4"
              }>
                {filteredRestaurants.map((restaurant) => (
                  <div key={restaurant.id} className={viewMode === 'grid'
                    ? "bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden"
                    : "bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6"
                  }>
                    {viewMode === 'grid' ? (
                      // Grid Görünümü
                      <>
                        {/* Restoran Resmi */}
                        <div className="relative h-48 bg-gray-200">
                          {restaurant.coverImageUrl ? (
                            <img
                              src={restaurant.coverImageUrl}
                              alt={restaurant.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <MapPin className="h-16 w-16 text-gray-400" />
                            </div>
                          )}
                          
                          {/* Favori Butonu */}
                          <button
                            onClick={() => toggleFavorite(restaurant.id)}
                            className="absolute top-3 right-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors"
                          >
                            <Heart className={`h-5 w-5 ${
                              favorites.includes(restaurant.id) 
                                ? 'fill-red-500 text-red-500' 
                                : 'text-gray-600'
                            }`} />
                          </button>

                          {/* Durum Badge'i */}
                          <div className="absolute top-3 left-3">
                            <RestaurantStatusBadge 
                              restaurant={restaurant} 
                              variant="compact"
                            />
                          </div>

                          {/* Mesafe Badge'i */}
                          {userLocation && (restaurant as any).distance && (
                            <div className="absolute bottom-3 right-3 bg-green-500 text-white px-2 py-1 rounded-full text-sm font-semibold">
                              {(restaurant as any).distance.toFixed(1)} km
                            </div>
                          )}
                        </div>

                        {/* Restoran Bilgileri */}
                        <div className="p-6">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {restaurant.name}
                          </h3>
                          
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {restaurant.description}
                          </p>

                          {/* Rating ve Bilgiler */}
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                              <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < Math.floor(restaurant.rating || 0) ? 'fill-current' : ''
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-gray-700 font-semibold">
                                {restaurant.rating?.toFixed(1) || '0.0'}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-1 text-sm text-gray-600">
                              <Clock className="h-4 w-4" />
                              <span>{restaurant.estimatedDeliveryTime || 30} dk</span>
                            </div>
                          </div>

                          {/* Kategoriler */}
                          <div className="flex flex-wrap gap-2 mb-4">
                            {restaurant.categoryIds?.slice(0, 3).map((categoryId) => {
                              const category = categories.find(cat => cat.id === categoryId);
                              return category ? (
                                <span
                                  key={categoryId}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                >
                                  {category.icon} {category.name}
                                </span>
                              ) : null;
                            })}
                          </div>

                          {/* Butonlar */}
                          <div className="flex gap-2">
                            <Link
                              href={`/restaurant/${restaurant.id}`}
                              className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors text-center"
                            >
                              Menüyü Gör
                            </Link>
                            <OrderButton
                              restaurant={restaurant}
                              onOrderClick={() => {
                                window.location.href = `/restaurant/${restaurant.id}`;
                              }}
                              size="sm"
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      // Liste Görünümü
                      <div className="flex gap-6">
                        {/* Restoran Resmi */}
                        <div className="relative w-32 h-32 bg-gray-200 rounded-lg flex-shrink-0">
                          {restaurant.coverImageUrl ? (
                            <img
                              src={restaurant.coverImageUrl}
                              alt={restaurant.name}
                              className="w-full h-full object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center rounded-lg">
                              <MapPin className="h-8 w-8 text-gray-400" />
                            </div>
                          )}
                          
                          {/* Favori Butonu */}
                          <button
                            onClick={() => toggleFavorite(restaurant.id)}
                            className="absolute top-2 right-2 p-1 bg-white/90 rounded-full hover:bg-white transition-colors"
                          >
                            <Heart className={`h-4 w-4 ${
                              favorites.includes(restaurant.id) 
                                ? 'fill-red-500 text-red-500' 
                                : 'text-gray-600'
                            }`} />
                          </button>
                        </div>

                        {/* Restoran Bilgileri */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-xl font-bold text-gray-900 mb-1">
                                {restaurant.name}
                              </h3>
                              <p className="text-gray-600 text-sm mb-2">
                                {restaurant.address.district}, {restaurant.address.city}
                              </p>
                            </div>
                            <RestaurantStatusBadge 
                              restaurant={restaurant} 
                              variant="compact"
                            />
                          </div>
                          
                          <p className="text-gray-600 mb-3 line-clamp-2">
                            {restaurant.description}
                          </p>

                          {/* Kategoriler */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            {restaurant.categoryIds?.slice(0, 3).map((categoryId) => {
                              const category = categories.find(cat => cat.id === categoryId);
                              return category ? (
                                <span
                                  key={categoryId}
                                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                                >
                                  {category.icon} {category.name}
                                </span>
                              ) : null;
                            })}
                          </div>

                          {/* Rating ve Bilgiler */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-1">
                                <div className="flex text-yellow-400">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-4 w-4 ${
                                        i < Math.floor(restaurant.rating || 0) ? 'fill-current' : ''
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="font-semibold">
                                  {restaurant.rating?.toFixed(1) || '0.0'}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-1 text-gray-600">
                                <Clock className="h-4 w-4" />
                                <span>{restaurant.estimatedDeliveryTime || 30} dk</span>
                              </div>

                              <div className="flex items-center gap-1 text-gray-600">
                                <Truck className="h-4 w-4" />
                                <span>Min. ₺{restaurant.minimumOrderAmount}</span>
                              </div>

                              {userLocation && (restaurant as any).distance && (
                                <div className="flex items-center gap-1 text-gray-600">
                                  <Navigation className="h-4 w-4" />
                                  <span>{(restaurant as any).distance.toFixed(1)} km</span>
                                </div>
                              )}
                            </div>

                            {/* Butonlar */}
                            <div className="flex gap-2">
                              <Link
                                href={`/restaurant/${restaurant.id}`}
                                className="bg-green-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors"
                              >
                                Menüyü Gör
                              </Link>
                              <OrderButton
                                restaurant={restaurant}
                                onOrderClick={() => {
                                  window.location.href = `/restaurant/${restaurant.id}`;
                                }}
                                size="sm"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </section>
    </main>
  );
}

export default function RestaurantsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <RestaurantsPageContent />
    </Suspense>
  );
} 