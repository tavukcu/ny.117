'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/useCart';
import { ProductService } from '@/services/productService';
import { useAuth } from '@/hooks/useAuth';
import { 
  Sparkles, 
  Plus, 
  Star, 
  Clock, 
  TrendingUp,
  X,
  ShoppingBag
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import type { Product } from '@/types';

interface SmartCartRecommendationsProps {
  className?: string;
  maxItems?: number;
}

export default function SmartCartRecommendations({ 
  className = "", 
  maxItems = 4 
}: SmartCartRecommendationsProps) {
  const { cartItems, addToCart } = useCart();
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(true);

  // Sepet içeriğine göre öneriler oluştur
  useEffect(() => {
    if (cartItems.length === 0) {
      setRecommendations([]);
      return;
    }

    generateRecommendations();
  }, [cartItems]);

  const generateRecommendations = async () => {
    setLoading(true);
    try {
      // Sepetteki ürünlerin kategorilerini al
      const cartCategories = Array.from(
        new Set(cartItems.map(item => item.categoryId).filter(Boolean))
      );

      // Sepetteki restoranları al
      const cartRestaurants = Array.from(
        new Set(cartItems.map(item => item.product.restaurantId).filter(Boolean))
      );

      // Öneri stratejileri
      const strategies = [
        // 1. Aynı restorandan popüler ürünler
        ...cartRestaurants.map(restaurantId => ({
          type: 'popular_from_restaurant',
          restaurantId,
          priority: 10
        })),
        // 2. Aynı kategorilerden benzer ürünler
        ...cartCategories.map(categoryId => ({
          type: 'similar_category',
          categoryId,
          priority: 8
        })),
        // 3. Tamamlayıcı ürünler (içecek, tatlı, vs.)
        ...cartCategories.map(categoryId => ({
          type: 'complementary',
          categoryId,
          priority: 6
        })),
        // 4. Trend ürünler
        {
          type: 'trending',
          priority: 4
        }
      ];

      // Önerileri topla
      const allRecommendations: Product[] = [];
      const seenProductIds = new Set(cartItems.map(item => item.productId));

      for (const strategy of strategies) {
        if (allRecommendations.length >= maxItems * 2) break;

        try {
          let products: Product[] = [];

          switch (strategy.type) {
            case 'popular_from_restaurant':
              if (strategy.restaurantId) {
                const restaurantProducts = await ProductService.getProductsByRestaurant(strategy.restaurantId);
                products = restaurantProducts
                  .filter(p => !seenProductIds.has(p.id) && p.isActive)
                  .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                  .slice(0, 3);
              }
              break;

            case 'similar_category':
              if (strategy.categoryId) {
                const categoryProducts = await ProductService.getProductsByCategory(strategy.categoryId);
                products = categoryProducts
                  .filter(p => !seenProductIds.has(p.id) && p.isActive)
                  .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                  .slice(0, 2);
              }
              break;

            case 'complementary':
              if (strategy.categoryId) {
                // Tamamlayıcı kategoriler (içecek, tatlı, vs.)
                const complementaryCategories = ['beverages', 'desserts', 'sides'];
                const complementaryProducts = await Promise.all(
                  complementaryCategories.map(cat => 
                    ProductService.getProductsByCategory(cat).catch(() => [])
                  )
                );
                products = complementaryProducts
                  .flat()
                  .filter(p => !seenProductIds.has(p.id) && p.isActive)
                  .sort((a, b) => (b.rating || 0) - (a.rating || 0))
                  .slice(0, 2);
              }
              break;

            case 'trending':
              const allProducts = await ProductService.getAllProducts();
              products = allProducts.products
                .filter(p => !seenProductIds.has(p.id) && p.isActive)
                .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
                .slice(0, 2);
              break;
          }

          // Ürünleri ekle ve ID'leri kaydet
          products.forEach(product => {
            if (!seenProductIds.has(product.id)) {
              allRecommendations.push(product);
              seenProductIds.add(product.id);
            }
          });

        } catch (error) {
          console.error(`Öneri stratejisi hatası (${strategy.type}):`, error);
        }
      }

      // Önerileri karıştır ve sınırla
      const shuffled = allRecommendations.sort(() => Math.random() - 0.5);
      setRecommendations(shuffled.slice(0, maxItems));

    } catch (error) {
      console.error('Öneri oluşturma hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sepete hızlı ekleme
  const quickAddToCart = (product: Product) => {
    addToCart(product, 1);
    toast.success(`${product.name} sepete eklendi!`);
  };

  // Öneri kapatma
  const closeRecommendations = () => {
    setShowRecommendations(false);
    localStorage.setItem('hideCartRecommendations', 'true');
  };

  // Önerileri gizleme durumunu kontrol et
  useEffect(() => {
    const hideRecommendations = localStorage.getItem('hideCartRecommendations');
    if (hideRecommendations === 'true') {
      setShowRecommendations(false);
    }
  }, []);

  if (!showRecommendations || cartItems.length === 0 || recommendations.length === 0) {
    return null;
  }

  return (
    <div className={`bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 ${className}`}>
      {/* Başlık */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
            <h3 className="font-bold text-gray-900">Akıllı Öneriler</h3>
            <p className="text-sm text-gray-600">Sepetinize uygun lezzetler</p>
          </div>
        </div>
        <button
          onClick={closeRecommendations}
          className="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Öneriler */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(maxItems)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
              <div className="w-full h-24 bg-gray-200 rounded-lg mb-3"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
                              ))}
                            </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {recommendations.map((product) => (
            <div key={product.id} className="bg-white rounded-xl p-4 hover:shadow-lg transition-shadow group">
              {/* Ürün Görseli */}
              <div className="relative mb-3">
                {product.imageUrl ? (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                    <ShoppingBag className="h-8 w-8 text-gray-400" />
                </div>
              )}

                {/* Hızlı Ekleme Butonu */}
                <button
                  onClick={() => quickAddToCart(product)}
                  className="absolute top-2 right-2 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-green-600"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>

              {/* Ürün Bilgileri */}
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 text-sm line-clamp-2">
                  {product.name}
                    </h4>
                
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-green-600">
                    ₺{product.price.toFixed(2)}
                          </span>
                  
                              <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    <span className="text-xs text-gray-600">
                      {product.rating?.toFixed(1) || '0.0'}
                                </span>
                  </div>
                </div>

                {/* Özellikler */}
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{product.preparationTime || 15} dk</span>
                  </div>
                  
                  {product.isVegetarian && (
                    <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                      🌱
                              </span>
                  )}
                  
                  {product.isVegan && (
                    <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                      🌿
                    </span>
                  )}
              </div>

                {/* Detay Linki */}
                <Link
                  href={`/product/${product.id}`}
                  className="block text-xs text-purple-600 hover:text-purple-700 font-medium mt-2"
                >
                  Detayları gör →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Alt Bilgi */}
      <div className="mt-4 p-3 bg-white/50 rounded-lg">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <TrendingUp className="h-4 w-4" />
          <span>Bu öneriler sepetinizdeki ürünlere göre kişiselleştirilmiştir</span>
        </div>
      </div>
    </div>
  );
} 