'use client';

import { useState, useEffect } from 'react';
import { useCart } from '@/hooks/useCart';
import { 
  ShoppingCart, 
  Truck, 
  Gift, 
  Percent, 
  Target,
  Info,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface AdvancedCartSummaryProps {
  className?: string;
  showProgress?: boolean;
  showSavings?: boolean;
  showDeliveryInfo?: boolean;
}

export default function AdvancedCartSummary({
  className = "",
  showProgress = true,
  showSavings = true,
  showDeliveryInfo = true
}: AdvancedCartSummaryProps) {
  const { 
    cartItems, 
    subtotal, 
    deliveryFee, 
    total, 
    totalItems,
    hasItems 
  } = useCart();

  const [deliveryTime, setDeliveryTime] = useState<number>(30);
  const [estimatedSavings, setEstimatedSavings] = useState<number>(0);
  const [freeDeliveryThreshold] = useState<number>(50);
  const [progressToFreeDelivery, setProgressToFreeDelivery] = useState<number>(0);

  // Teslimat süresi hesaplama
  useEffect(() => {
    if (cartItems.length === 0) return;

    // Sepetteki ürünlerin hazırlama sürelerini hesapla
    const totalPrepTime = cartItems.reduce((sum, item) => {
      return sum + ((item.product.preparationTime || 15) * item.quantity);
    }, 0);

    // Ortalama hazırlama süresi + teslimat süresi
    const avgPrepTime = totalPrepTime / totalItems;
    const estimatedDelivery = Math.max(25, Math.min(60, avgPrepTime + 20));
    
    setDeliveryTime(estimatedDelivery);
  }, [cartItems, totalItems]);

  // Tasarruf hesaplama
  useEffect(() => {
    if (cartItems.length === 0) return;

    // Ürünlerin orijinal fiyatlarından tasarruf hesapla
    const savings = cartItems.reduce((sum, item) => {
      const originalPrice = item.product.originalPrice || item.product.price;
      const currentPrice = item.price || item.product.price;
      return sum + ((originalPrice - currentPrice) * item.quantity);
    }, 0);

    setEstimatedSavings(savings);
  }, [cartItems]);

  // Ücretsiz teslimat için ilerleme
  useEffect(() => {
    if (subtotal >= freeDeliveryThreshold) {
      setProgressToFreeDelivery(100);
    } else {
      setProgressToFreeDelivery((subtotal / freeDeliveryThreshold) * 100);
    }
  }, [subtotal, freeDeliveryThreshold]);

  // Sepet özeti
  const cartSummary = {
    items: cartItems.length,
    totalItems,
    subtotal,
    deliveryFee,
    total,
    estimatedSavings,
    progressToFreeDelivery,
    deliveryTime,
    hasFreeDelivery: subtotal >= freeDeliveryThreshold,
    needsMoreForFreeDelivery: freeDeliveryThreshold - subtotal
  };

  if (!hasItems) {
    return (
      <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${className}`}>
        <div className="text-center py-8">
          <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Sepetiniz Boş</h3>
          <p className="text-gray-600">Lezzetli yemekler ekleyerek başlayın</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 ${className}`}>
      {/* Başlık */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-900">Sipariş Özeti</h3>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <ShoppingCart className="h-4 w-4" />
          <span>{cartSummary.items} ürün</span>
        </div>
      </div>

      {/* Ücretsiz Teslimat İlerlemesi */}
      {showProgress && (
        <div className="mb-6">
          {cartSummary.hasFreeDelivery ? (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Ücretsiz Teslimat!</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                ₺{freeDeliveryThreshold} üzeri siparişlerde teslimat ücretsiz
              </p>
            </div>
          ) : (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-blue-700">
                  <Target className="h-5 w-5" />
                  <span className="font-medium">Ücretsiz Teslimat İçin</span>
                </div>
                <span className="text-sm text-blue-600">
                  ₺{cartSummary.needsMoreForFreeDelivery.toFixed(2)} daha
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${cartSummary.progressToFreeDelivery}%` }}
                />
              </div>
              <p className="text-xs text-blue-600 mt-1">
                ₺{subtotal.toFixed(2)} / ₺{freeDeliveryThreshold}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tasarruf Bilgisi */}
      {showSavings && estimatedSavings > 0 && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-yellow-700">
            <Gift className="h-5 w-5" />
            <span className="font-medium">Tasarruf Ediyorsunuz!</span>
          </div>
          <p className="text-sm text-yellow-600 mt-1">
            Bu siparişte ₺{estimatedSavings.toFixed(2)} tasarruf ettiniz
          </p>
        </div>
      )}

      {/* Teslimat Bilgisi */}
      {showDeliveryInfo && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="flex items-center gap-2 text-gray-700 mb-2">
            <Truck className="h-5 w-5" />
            <span className="font-medium">Teslimat Bilgileri</span>
          </div>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Tahmini teslimat süresi: {deliveryTime} dakika</span>
            </div>
            <div className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              <span>Minimum sipariş tutarı: ₺{freeDeliveryThreshold}</span>
            </div>
          </div>
        </div>
      )}

      {/* Fiyat Detayları */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Ara Toplam</span>
          <span className="font-medium">₺{subtotal.toFixed(2)}</span>
        </div>

        {estimatedSavings > 0 && (
          <div className="flex justify-between items-center text-green-600">
            <span className="flex items-center gap-1">
              <Percent className="h-4 w-4" />
              Tasarruf
            </span>
            <span className="font-medium">-₺{estimatedSavings.toFixed(2)}</span>
          </div>
        )}

        <div className="flex justify-between items-center">
          <span className="text-gray-600">Teslimat Ücreti</span>
          <span className={`font-medium ${cartSummary.hasFreeDelivery ? 'text-green-600' : ''}`}>
            {cartSummary.hasFreeDelivery ? 'Ücretsiz' : `₺${deliveryFee.toFixed(2)}`}
          </span>
        </div>

        {cartSummary.hasFreeDelivery && (
          <div className="text-xs text-green-600 text-center">
            ✓ ₺{freeDeliveryThreshold} üzeri siparişlerde teslimat ücretsiz
          </div>
        )}

        <div className="border-t border-gray-200 pt-3">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold text-gray-900">Toplam</span>
            <span className="text-xl font-bold text-gray-900">₺{total.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Sepet İstatistikleri */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{totalItems}</div>
          <div className="text-xs text-gray-600">Toplam Ürün</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{cartSummary.items}</div>
          <div className="text-xs text-gray-600">Farklı Ürün</div>
        </div>
      </div>

      {/* Uyarılar */}
      <div className="mt-4 space-y-2">
        {cartItems.length > 0 && cartItems.some(item => !item.product.restaurantId) && (
          <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
            <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-red-700">
              <p className="font-medium">Restoran Bilgisi Eksik</p>
              <p>Bazı ürünlerde restoran bilgisi bulunamadı</p>
            </div>
          </div>
        )}

        {subtotal < 20 && (
          <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <Info className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-yellow-700">
              <p className="font-medium">Düşük Sipariş Tutarı</p>
              <p>Minimum sipariş tutarı ₺{freeDeliveryThreshold} olmalıdır</p>
            </div>
          </div>
        )}
      </div>

      {/* Özel Notlar */}
      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start gap-2">
          <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-700">
            <p className="font-medium">Önemli Bilgiler</p>
            <ul className="mt-1 space-y-1 text-xs">
              <li>• Siparişler ortalama {deliveryTime} dakikada teslim edilir</li>
              <li>• ₺{freeDeliveryThreshold} üzeri siparişlerde teslimat ücretsiz</li>
              <li>• Kapıda nakit veya kart ile ödeme yapabilirsiniz</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 