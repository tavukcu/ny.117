'use client';

import { useState, useEffect } from 'react';
import { useReviews } from '@/hooks/useReviews';
import { 
  Star, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  Users,
  Camera
} from 'lucide-react';
import type { ReviewCategory } from '@/types';

interface ReviewSummaryProps {
  restaurantId: string;
  productId?: string;
  showCategoryBreakdown?: boolean;
  showTrends?: boolean;
  className?: string;
}

export default function ReviewSummary({
  restaurantId,
  productId,
  showCategoryBreakdown = true,
  showTrends = true,
  className = ''
}: ReviewSummaryProps) {
  const { stats, analytics } = useReviews();
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'year'>('month');

  // Kategori etiketleri
  const categoryLabels: Record<ReviewCategory, string> = {
    food_quality: 'Yemek Kalitesi',
    service_speed: 'Hizmet Hızı',
    cleanliness: 'Temizlik',
    value_for_money: 'Fiyat/Performans',
    atmosphere: 'Atmosfer',
    delivery_time: 'Teslimat Süresi',
    packaging: 'Paketleme',
    customer_service: 'Müşteri Hizmeti',
    portion_size: 'Porsiyon Büyüklüğü',
    freshness: 'Tazelik',
    taste: 'Lezzet',
    presentation: 'Sunum'
  };

  // Trend ikonu
  const getTrendIcon = (trend: 'improving' | 'declining' | 'stable') => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  // Trend rengi
  const getTrendColor = (trend: 'improving' | 'declining' | 'stable') => {
    switch (trend) {
      case 'improving':
        return 'text-green-600';
      case 'declining':
        return 'text-red-600';
      case 'stable':
        return 'text-gray-600';
    }
  };

  // Yıldızları render et
  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const stars = [];
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    };

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`${sizeClasses[size]} ${
            i <= rating 
              ? 'text-yellow-400 fill-current' 
              : 'text-gray-300'
          }`}
        />
      );
    }

    return <div className="flex gap-0.5">{stars}</div>;
  };

  if (!stats) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      {/* Ana İstatistikler */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.totalReviews}</div>
          <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
            <MessageSquare className="h-3 w-3" />
            Toplam
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-500 flex items-center justify-center gap-1">
            <Star className="h-5 w-5 fill-current" />
            {stats.averageRating.toFixed(1)}
          </div>
          <div className="text-sm text-gray-600">Ortalama</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.verifiedReviews}</div>
          <div className="text-sm text-gray-600 flex items-center justify-center gap-1">
            <CheckCircle className="h-3 w-3" />
            Doğrulanmış
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.responseRate}%</div>
          <div className="text-sm text-gray-600">Yanıt Oranı</div>
        </div>
      </div>

      {/* Puan Dağılımı */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Puan Dağılımı</h3>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map(rating => {
            const count = stats.ratingDistribution[rating] || 0;
            const percentage = stats.totalReviews > 0 ? (count / stats.totalReviews) * 100 : 0;
            
            return (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-8">
                  <span className="text-sm text-gray-600">{rating}</span>
                  <Star className="h-3 w-3 text-yellow-400 fill-current" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-sm text-gray-600 w-12 text-right">
                  {count}
                </div>
                <div className="text-sm text-gray-500 w-12 text-right">
                  {percentage.toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Kategori Analizi */}
      {showCategoryBreakdown && stats.categoryAverages && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Kategori Analizi</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(stats.categoryAverages).map(([category, rating]) => {
              const categoryKey = category as ReviewCategory;
              const label = categoryLabels[categoryKey];
              const analyticsData = analytics?.categoryPerformance?.[categoryKey];
              const trend = analyticsData?.trend || 'stable';
              
              return (
                <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1">
                      {renderStars(rating, 'sm')}
                      <span className="text-sm font-medium text-gray-900">{rating.toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-gray-600">{label}</span>
                  </div>
                  {showTrends && (
                    <div className={`flex items-center gap-1 text-sm ${getTrendColor(trend)}`}>
                      {getTrendIcon(trend)}
                      <span className="capitalize">{trend}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Son Değerlendirmeler */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Son Değerlendirmeler</h3>
        <div className="space-y-3">
          {stats.recentReviews > 0 ? (
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-700">
                  Son 30 günde {stats.recentReviews} yeni değerlendirme
                </span>
              </div>
              <span className="text-sm text-green-600 font-medium">
                +{((stats.recentReviews / stats.totalReviews) * 100).toFixed(1)}%
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Minus className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-700">
                  Son 30 günde yeni değerlendirme yok
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Etkileşim Metrikleri */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Etkileşim Metrikleri</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center p-3 bg-blue-50 rounded-lg">
            <div className="text-xl font-bold text-blue-600">{stats.helpfulRate}%</div>
            <div className="text-sm text-blue-700">Faydalı Bulunma</div>
          </div>
          
          <div className="text-center p-3 bg-purple-50 rounded-lg">
            <div className="text-xl font-bold text-purple-600">{stats.anonymousReviews}</div>
            <div className="text-sm text-purple-700">Anonim</div>
          </div>
          
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-xl font-bold text-orange-600">{stats.reportCount || 0}</div>
            <div className="text-sm text-orange-700">Raporlanan</div>
          </div>
        </div>
      </div>

      {/* Dönem Seçici */}
      {showTrends && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Trend Analizi</h3>
          <div className="flex gap-2">
            {(['week', 'month', 'year'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  selectedPeriod === period
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {period === 'week' ? 'Hafta' : period === 'month' ? 'Ay' : 'Yıl'}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Özet Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="font-semibold text-green-700">Güçlü Yönler</span>
          </div>
          <ul className="text-sm text-green-600 space-y-1">
            <li>• Yüksek doğrulanmış değerlendirme oranı</li>
            <li>• Aktif müşteri etkileşimi</li>
            <li>• Hızlı yanıt süreleri</li>
          </ul>
        </div>
        
        <div className="p-4 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            <span className="font-semibold text-orange-700">Geliştirme Alanları</span>
          </div>
          <ul className="text-sm text-orange-600 space-y-1">
            <li>• Daha fazla medya içerikli değerlendirme</li>
            <li>• Kategori bazlı puan artışı</li>
            <li>• Müşteri memnuniyet oranı</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 