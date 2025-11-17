'use client';

import { useState, useEffect } from 'react';
import { RestaurantService } from '@/services/restaurantService';
import { ProductService } from '@/services/productService';
import ImageWithFallback from '@/components/ui/ImageWithFallback';
import Image from 'next/image';

export default function DebugImagesPage() {
  const [restaurants, setRestaurants] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('🔍 Restoran verileri yükleniyor...');
        const restaurantData = await RestaurantService.getRestaurants();
        console.log('📝 Bulunan restoranlar:', restaurantData.length);
        setRestaurants(restaurantData.slice(0, 5)); // İlk 5 restoran

        console.log('🔍 Ürün verileri yükleniyor...');
        const productData = await ProductService.getProducts();
        console.log('📝 Bulunan ürünler:', productData.length);
        setProducts(productData.slice(0, 10)); // İlk 10 ürün

      } catch (error) {
        console.error('❌ Veri yükleme hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const testImageUrls = [
    '/images/restaurant-placeholder.svg',
    '/images/restaurant-placeholder.jpg',
    '/logo.png',
    '/logo.svg',
    'https://firebasestorage.googleapis.com/v0/b/neyisek-6b8bc.firebasestorage.app/o/test%2Fconnection-test.txt?alt=media'
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🖼️ Görsel Debug Sayfası
        </h1>

        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">Veriler yükleniyor...</span>
          </div>
        )}

        {/* Test Görselleri */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Test Görselleri</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {testImageUrls.map((url, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2 truncate">{url}</h3>
                
                <div className="space-y-2">
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Next.js Image:</p>
                    <Image
                      src={url}
                      alt={`Test ${index + 1}`}
                      width={150}
                      height={100}
                      className="w-full h-20 object-cover border"
                      onError={(e) => {
                        console.error('❌ Next.js Image Error:', url);
                        const target = e.target as HTMLImageElement;
                        target.style.backgroundColor = '#fee2e2';
                        target.style.color = '#dc2626';
                      }}
                      onLoad={() => console.log('✅ Next.js Image Loaded:', url)}
                    />
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 mb-1">ImageWithFallback:</p>
                    <ImageWithFallback
                      src={url}
                      alt={`Test ${index + 1}`}
                      width={150}
                      height={100}
                      className="w-full h-20 object-cover border"
                      onError={() => console.error('❌ ImageWithFallback Error:', url)}
                    />
                  </div>
                  
                  <div>
                    <p className="text-xs text-gray-500 mb-1">HTML img:</p>
                    <img
                      src={url}
                      alt={`Test ${index + 1}`}
                      className="w-full h-20 object-cover border"
                      onError={(e) => {
                        console.error('❌ HTML img Error:', url);
                        const target = e.target as HTMLImageElement;
                        target.style.backgroundColor = '#fee2e2';
                        target.alt = 'HATA!';
                      }}
                      onLoad={() => console.log('✅ HTML img Loaded:', url)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Restoran Görselleri */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Restoran Görselleri ({restaurants.length})</h2>
          {restaurants.length === 0 ? (
            <p className="text-gray-500">Hiç restoran bulunamadı.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {restaurants.map((restaurant) => (
                <div key={restaurant.id} className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-2">{restaurant.name}</h3>
                  <p className="text-xs text-gray-500 mb-2 break-all">
                    URL: {restaurant.coverImageUrl || 'URL YOK'}
                  </p>
                  
                  <ImageWithFallback
                    src={restaurant.coverImageUrl || ''}
                    alt={restaurant.name}
                    width={200}
                    height={120}
                    className="w-full h-24 object-cover border rounded"
                    fallbackSrc="/images/restaurant-placeholder.svg"
                    onError={() => console.error('❌ Restoran görseli yüklenemedi:', restaurant.coverImageUrl)}
                  />
                  
                  <div className="mt-2 text-xs">
                    <p>Durum: {restaurant.isOpen ? '🟢 Açık' : '🔴 Kapalı'}</p>
                    <p>Kategori: {restaurant.category}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ürün Görselleri */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Ürün Görselleri ({products.length})</h2>
          {products.length === 0 ? (
            <p className="text-gray-500">Hiç ürün bulunamadı.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {products.map((product) => (
                <div key={product.id} className="border rounded-lg p-3">
                  <h3 className="text-sm font-medium mb-2 truncate">{product.name}</h3>
                  <p className="text-xs text-gray-500 mb-2 break-all">
                    URL: {product.imageUrl || 'URL YOK'}
                  </p>
                  
                  <ImageWithFallback
                    src={product.imageUrl || ''}
                    alt={product.name}
                    width={150}
                    height={100}
                    className="w-full h-16 object-cover border rounded"
                    fallbackSrc="/images/restaurant-placeholder.svg"
                    onError={() => console.error('❌ Ürün görseli yüklenemedi:', product.imageUrl)}
                  />
                  
                  <div className="mt-2 text-xs">
                    <p>Fiyat: ₺{product.price}</p>
                    <p>Kategori: {product.category}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Konsol Loglama */}
        <div className="bg-gray-800 text-green-400 rounded-lg p-4 mt-8">
          <h3 className="text-lg font-semibold mb-2">🔍 Debug Console</h3>
          <p className="text-sm">
            Browser console'u (F12) açın ve yukarıdaki görsellerin yüklenme durumunu kontrol edin.
            <br />
            ✅ = Başarılı, ❌ = Hatalı görsel yükleme işlemleri konsola yazılacak.
          </p>
        </div>
      </div>
    </div>
  );
}