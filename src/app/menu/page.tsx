'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import Header from '@/components/Header';
import StarRating from '@/components/StarRating';
import { ProductService } from '@/services/productService';
import { CategoryService } from '@/services/categoryService';
import { RestaurantService } from '@/services/restaurantService';
import { useCart } from '@/hooks/useCart';
import { 
  Search, 
  Filter, 
  ShoppingCart, 
  Plus, 
  Minus,
  Clock,
  Star,
  MapPin,
  Store,
  UtensilsCrossed,
  ChevronDown,
  ChevronUp,
  X,
  SlidersHorizontal
} from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';
import type { Product, Category, RestaurantInfo } from '@/types';
import BackToHomeButton from '@/components/BackToHomeButton';

// Ana menü sayfası - Suspense ile sarılmış
export default function MenuPage() {
  return (
    <Suspense fallback={
      <main>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Menü yükleniyor...</p>
          </div>
        </div>
      </main>
    }>
      <MenuPageContent />
    </Suspense>
  );
}

// MenuPage içeriği
function MenuPageContent() {
  const searchParams = useSearchParams();
  const {
    cartItems,
    addToCart: addToCartGlobal,
    updateQuantity,
    removeFromCart: removeFromCartGlobal,
    getItemQuantity,
    totalItems
  } = useCart();

  // States
  const [products, setProducts] = useState<Product[]>([]);
  const [restaurants, setRestaurants] = useState<RestaurantInfo[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<RestaurantInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'restaurants' | 'products'>('restaurants');
  
  // Filtre states
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState<string>('popularity');
  const [minRating, setMinRating] = useState<number>(0);
  const [showOnlyOpen, setShowOnlyOpen] = useState<boolean>(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);

  // URL parametrelerini oku
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
      // Kategori seçildiğinde önce restoranları göster, sonra kullanıcı ürünlere geçebilir
      setActiveTab('restaurants');
    }
  }, [searchParams]);

  // Veri yükleme
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        console.log('🔄 MenuPage: Veriler yükleniyor...');
        
        // Paralel veri yükleme
        const [categoriesData, productsData, restaurantsData] = await Promise.all([
          CategoryService.getAllCategories(),
          ProductService.getAllProducts(),
          RestaurantService.getActiveRestaurants()
        ]);
        
        console.log('📊 MenuPage: Veriler yüklendi:', {
          kategoriler: categoriesData.length,
          ürünler: productsData.products.length,
          restoranlar: restaurantsData.length
        });
        
        setCategories(categoriesData.filter(cat => cat.isActive));
        setProducts(productsData.products.filter(product => product.isActive));
        setRestaurants(restaurantsData);
        
        // Restoran detaylarını logla
        restaurantsData.forEach((restaurant, index) => {
          console.log(`🏪 Restoran ${index + 1}:`, {
            id: restaurant.id,
            name: restaurant.name,
            isOpen: restaurant.isOpen,
            categoryIds: restaurant.categoryIds
          });
        });
        
      } catch (error) {
        console.error('❌ MenuPage: Veri yükleme hatası:', error);
        toast.error('Veriler yüklenirken hata oluştu');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Filtreleme
  useEffect(() => {
    console.log('🔍 MenuPage: Filtreleme başlıyor...', {
      selectedCategory,
      searchTerm,
      totalRestaurants: restaurants.length,
      totalProducts: products.length
    });
    
    // Ürün filtreleme
    let filteredProds = products;
    
    // Kategori filtresi
    if (selectedCategory !== 'all') {
      filteredProds = filteredProds.filter(product => product.categoryId === selectedCategory);
    }
    
    // Arama filtresi
    if (searchTerm) {
      filteredProds = filteredProds.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Fiyat filtresi
    filteredProds = filteredProds.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );
    
    // Rating filtresi
    if (minRating > 0) {
      filteredProds = filteredProds.filter(product => 
        (product.rating || 0) >= minRating
      );
    }
    
    // Sıralama
    switch (sortBy) {
      case 'price-low':
        filteredProds.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        filteredProds.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        filteredProds.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'name':
        filteredProds.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default: // popularity
        filteredProds.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    }
    
    setFilteredProducts(filteredProds);

    // Restoran filtreleme
    let filteredRests = restaurants;
    
    // Kategori filtresi
    if (selectedCategory !== 'all') {
      filteredRests = filteredRests.filter(restaurant => 
        restaurant.categoryIds?.includes(selectedCategory)
      );
    }
    
    // Arama filtresi
    if (searchTerm) {
      filteredRests = filteredRests.filter(restaurant => 
        restaurant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        restaurant.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Sadece açık restoranlar
    if (showOnlyOpen) {
      filteredRests = filteredRests.filter(restaurant => restaurant.isOpen);
    }
    
    // Rating filtresi
    if (minRating > 0) {
      filteredRests = filteredRests.filter(restaurant => 
        (restaurant.rating || 0) >= minRating
      );
    }
    
    // Sıralama
    switch (sortBy) {
      case 'rating':
        filteredRests.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'name':
        filteredRests.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'delivery-time':
        filteredRests.sort((a, b) => (a.estimatedDeliveryTime || 30) - (b.estimatedDeliveryTime || 30));
        break;
      default: // popularity
        filteredRests.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));
    }
    
    setFilteredRestaurants(filteredRests);
    
    console.log('✅ MenuPage: Filtreleme tamamlandı:', {
      filteredRestaurants: filteredRests.length,
      filteredProducts: filteredProds.length
    });
  }, [products, restaurants, selectedCategory, searchTerm, priceRange, sortBy, minRating, showOnlyOpen]);

  // Sepete ekleme
  const addToCart = (product: Product) => {
    addToCartGlobal(product, 1);
    toast.success(`${product.name} sepete eklendi`);
  };

  // Sepetten çıkarma
  const removeFromCart = (productId: string) => {
    removeFromCartGlobal(productId);
  };

  // Kategori bulma yardımcı fonksiyonu
  const getCategoryName = (categoryId: string) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Bilinmeyen Kategori';
  };

  if (isLoading) {
    return (
      <main>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="spinner mx-auto mb-4"></div>
            <p className="text-gray-600">Menü yükleniyor...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      {/* Header */}
      <Header />

      {/* Sayfa Başlığı */}
      <section className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-12 page-content">
        <div className="container-responsive">
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold mb-4">
              {selectedCategory !== 'all' && categories.find(cat => cat.id === selectedCategory) 
                ? `${categories.find(cat => cat.id === selectedCategory)?.name} Kategorisi`
                : 'Menü & Restoranlar'
              }
            </h1>
            <p className="text-xl text-green-100 mb-6">
              {selectedCategory !== 'all' && categories.find(cat => cat.id === selectedCategory)
                ? `${categories.find(cat => cat.id === selectedCategory)?.name} kategorisindeki restoranları ve lezzetli yemekleri keşfedin`
                : 'En sevdiğiniz restoranları ve lezzetli yemekleri keşfedin'
              }
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <BackToHomeButton variant="secondary" />
              {selectedCategory !== 'all' && (
                <Link
                  href="/menu"
                  className="bg-white/20 hover:bg-white/30 text-white border border-white/30 px-6 py-3 rounded-lg font-medium transition-colors duration-200"
                >
                  Tüm Kategoriler
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Ana İçerik - Yemeksepeti Tarzı Layout */}
      <div className="flex min-h-screen bg-gray-50">
        
        {/* Sol Filtreleme Sidebar */}
        <div className={`${isSidebarOpen ? 'w-80' : 'w-0'} transition-all duration-300 overflow-hidden`}>
          <div className="w-80 h-screen sticky top-20 bg-white border-r border-gray-200 overflow-y-auto page-content">
            
            {/* Sidebar Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5" />
                  Filtreler
                </h3>
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="lg:hidden p-1 hover:bg-gray-100 rounded"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-6">
              
              {/* Tab Navigation */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">İçerik Türü</h4>
                <div className="space-y-1">
                  <button
                    onClick={() => setActiveTab('restaurants')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                      activeTab === 'restaurants'
                        ? 'bg-primary-50 text-primary-600 border border-primary-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <Store className="h-4 w-4" />
                    Restoranlar ({filteredRestaurants.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('products')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                      activeTab === 'products'
                        ? 'bg-primary-50 text-primary-600 border border-primary-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <UtensilsCrossed className="h-4 w-4" />
                    Ürünler ({filteredProducts.length})
                  </button>
                </div>
              </div>

              {/* Kategoriler */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Kategoriler</h4>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      selectedCategory === 'all'
                        ? 'bg-primary-50 text-primary-600 border border-primary-200'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    Tümü ({activeTab === 'restaurants' ? restaurants.length : products.length})
                  </button>
                  {categories.map((category) => {
                    const count = activeTab === 'restaurants' 
                      ? restaurants.filter(r => r.categoryIds?.includes(category.id)).length
                      : products.filter(p => p.categoryId === category.id).length;
                    
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                          selectedCategory === category.id
                            ? 'bg-primary-50 text-primary-600 border border-primary-200'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <span>{category.icon}</span>
                        <span className="flex-1">{category.name}</span>
                        <span className="text-xs text-gray-500">({count})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Fiyat Aralığı - Sadece ürünler için */}
              {activeTab === 'products' && (
                <div className="space-y-2">
                  <h4 className="font-medium text-gray-900">Fiyat Aralığı</h4>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={priceRange[0]}
                        onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                        placeholder="Min"
                      />
                      <span className="text-gray-500">-</span>
                      <input
                        type="number"
                        value={priceRange[1]}
                        onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                        className="w-20 px-2 py-1 text-sm border border-gray-300 rounded"
                        placeholder="Max"
                      />
                      <span className="text-sm text-gray-500">₺</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Minimum Puan */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Minimum Puan</h4>
                <div className="space-y-1">
                  {[0, 3, 4, 4.5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setMinRating(rating)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                        minRating === rating
                          ? 'bg-primary-50 text-primary-600 border border-primary-200'
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <div className="flex items-center">
                        {rating === 0 ? (
                          <span>Tümü</span>
                        ) : (
                          <>
                            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                            <span className="ml-1">{rating}+</span>
                          </>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Sadece Açık Restoranlar - Restoranlar için */}
              {activeTab === 'restaurants' && (
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showOnlyOpen}
                      onChange={(e) => setShowOnlyOpen(e.target.checked)}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">Sadece açık restoranlar</span>
                  </label>
                </div>
              )}

              {/* Sıralama */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Sıralama</h4>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="popularity">Popülerlik</option>
                  <option value="rating">Puan</option>
                  <option value="name">İsim</option>
                  {activeTab === 'products' && (
                    <>
                      <option value="price-low">Fiyat (Düşük → Yüksek)</option>
                      <option value="price-high">Fiyat (Yüksek → Düşük)</option>
                    </>
                  )}
                  {activeTab === 'restaurants' && (
                    <option value="delivery-time">Teslimat Süresi</option>
                  )}
                </select>
              </div>

            </div>
          </div>
        </div>

        {/* Sağ İçerik Alanı */}
        <div className="flex-1 flex flex-col page-content">
          
          {/* Üst Bar - Arama ve Sidebar Toggle */}
          <div className="bg-white border-b border-gray-200 p-4 sticky top-20 z-20">
            <div className="flex items-center gap-4">
              
              {/* Sidebar Toggle */}
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <SlidersHorizontal className="h-5 w-5 text-gray-600" />
              </button>

              {/* Arama Kutusu */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder={activeTab === 'restaurants' ? 'Restoran ara...' : 'Ürün ara...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>

              {/* Sonuç Sayısı */}
              <div className="text-sm text-gray-600">
                {activeTab === 'restaurants' ? filteredRestaurants.length : filteredProducts.length} sonuç
              </div>
            </div>
          </div>

          {/* İçerik Alanı */}
          <div className="flex-1 p-6">
            {activeTab === 'restaurants' ? (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Restoranlar ({filteredRestaurants.length})
                </h2>
              
              {filteredRestaurants.length === 0 ? (
                <div className="text-center py-12">
                  <Store className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Bu kategoride restoran bulunamadı
                  </h3>
                  <p className="text-gray-500">
                    Farklı bir kategori seçmeyi deneyin veya arama terimini değiştirin.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredRestaurants.map((restaurant) => (
                    <div key={restaurant.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                      {/* Restoran Resmi */}
                      <div className="relative h-48 bg-gray-200">
                        <ImageWithFallback
                          src={restaurant.coverImageUrl || ''}
                          alt={restaurant.name}
                          width={400}
                          height={192}
                          className="w-full h-full object-cover"
                          fallbackSrc="/images/restaurant-placeholder.svg"
                        />
                        
                        {/* Durum Badge'i */}
                        <div className="absolute top-3 left-3">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            restaurant.isOpen 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {restaurant.isOpen ? '🟢 Açık' : '🔴 Kapalı'}
                          </span>
                        </div>
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
                            <StarRating 
                              rating={restaurant.rating || 0} 
                              size="sm" 
                              showValue 
                            />
                            <span className="text-sm text-gray-500">
                              ({restaurant.reviewCount || 0})
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1 text-sm text-gray-500">
                            <Clock className="h-4 w-4" />
                            <span>{restaurant.estimatedDeliveryTime || 30}-{(restaurant.estimatedDeliveryTime || 30) + 15} dk</span>
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

                        {/* Restoran Sayfasına Git Butonu */}
                        <Link
                          href={`/restaurant/${restaurant.id}`}
                          className="w-full bg-primary-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-600 transition-colors duration-200 text-center block"
                        >
                          Restoranı Görüntüle
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Ürünler ({filteredProducts.length})
              </h2>
              
              {filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <UtensilsCrossed className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Bu kategoride ürün bulunamadı
                  </h3>
                  <p className="text-gray-500">
                    Farklı bir kategori seçmeyi deneyin veya arama terimini değiştirin.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden">
                      {/* Ürün Resmi - Tıklanabilir */}
                      <Link href={`/product/${product.id}`}>
                        <div className="relative h-48 bg-gray-200 cursor-pointer hover:opacity-90 transition-opacity">
                          <ImageWithFallback
                            src={product.imageUrl || ''}
                            alt={product.name}
                            width={300}
                            height={192}
                            className="w-full h-full object-cover"
                            fallbackSrc="/images/restaurant-placeholder.svg"
                          />
                        </div>
                      </Link>

                      {/* Ürün Bilgileri */}
                      <div className="p-4">
                        {/* Ürün Adı - Tıklanabilir */}
                        <Link href={`/product/${product.id}`}>
                          <h3 className="text-lg font-bold text-gray-900 mb-2 hover:text-primary-600 transition-colors cursor-pointer">
                            {product.name}
                          </h3>
                        </Link>
                        
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                          {product.description}
                        </p>

                        {/* Kategori ve Rating */}
                        <div className="mb-3 flex items-center justify-between">
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                            {getCategoryName(product.categoryId)}
                          </span>
                          
                          {/* Ürün Puanı */}
                          <div className="flex items-center gap-1">
                            <StarRating 
                              rating={product.rating || 0} 
                              size="sm" 
                            />
                            <span className="text-xs text-gray-500">
                              ({product.reviewCount || 0})
                            </span>
                          </div>
                        </div>

                        {/* Fiyat ve Sepet */}
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-primary-600">
                            ₺{product.price.toFixed(2)}
                          </span>
                          
                          <div className="flex items-center gap-2">
                            {getItemQuantity(product.id) > 0 ? (
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateQuantity(product.id, getItemQuantity(product.id) - 1)}
                                  className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
                                >
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="font-medium min-w-[20px] text-center">
                                  {getItemQuantity(product.id)}
                                </span>
                                <button
                                  onClick={() => updateQuantity(product.id, getItemQuantity(product.id) + 1)}
                                  className="p-1 rounded-full bg-primary-500 text-white hover:bg-primary-600 transition-colors duration-200"
                                >
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => addToCart(product)}
                                className="p-2 rounded-full bg-primary-500 text-white hover:bg-primary-600 transition-colors duration-200"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          </div>
        </div>
      </div>
    </main>
  );
}