'use client';

import { useState, useEffect } from 'react';
import { useReviews } from '@/hooks/useReviews';
import ReviewCard from './ReviewCard';
import ReviewForm from './ReviewForm';
import { 
  Filter, 
  SortAsc, 
  SortDesc, 
  Star, 
  MessageSquare,
  Plus,
  X
} from 'lucide-react';
import type { 
  Review, 
  ReviewType, 
  ReviewStatus, 
  ReviewCategory 
} from '@/types';

interface ReviewListProps {
  restaurantId: string;
  productId?: string;
  type?: ReviewType;
  showCreateButton?: boolean;
  maxReviews?: number;
  showFilters?: boolean;
  showStats?: boolean;
}

export default function ReviewList({
  restaurantId,
  productId,
  type = 'restaurant',
  showCreateButton = true,
  maxReviews = 10,
  showFilters = true,
  showStats = true
}: ReviewListProps) {
  const { 
    reviews, 
    stats, 
    getReviews, 
    createReview,
    isLoading,
    error 
  } = useReviews();
  
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const [filters, setFilters] = useState({
    rating: 0,
    status: 'all' as ReviewStatus | 'all',
    category: 'all' as ReviewCategory | 'all',
    hasMedia: false,
    isVerified: false
  });
  const [sortBy, setSortBy] = useState<'date' | 'rating' | 'helpful'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);

  // Değerlendirmeleri yükle
  useEffect(() => {
    const loadReviews = async () => {
      await getReviews({
        restaurantId,
        productId,
        type,
        limit: maxReviews
      });
    };
    
    loadReviews();
  }, [restaurantId, productId, type, maxReviews]);

  // Filtrelenmiş ve sıralanmış değerlendirmeler
  const filteredReviews = reviews
    .filter(review => {
      if (filters.rating > 0 && review.content.overallRating < filters.rating) return false;
      if (filters.status !== 'all' && review.status !== filters.status) return false;
      if (filters.hasMedia && (!review.content.media || review.content.media.length === 0)) return false;
      if (filters.isVerified && !review.isVerified) return false;
      return true;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          break;
        case 'rating':
          comparison = b.content.overallRating - a.content.overallRating;
          break;
        case 'helpful':
          comparison = b.helpfulCount - a.helpfulCount;
          break;
      }
      
      return sortOrder === 'asc' ? -comparison : comparison;
    });

  // İstatistik kartı
  const renderStatsCard = () => {
    if (!stats || !showStats) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Değerlendirme İstatistikleri</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{stats.totalReviews}</div>
            <div className="text-sm text-gray-600">Toplam Değerlendirme</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-500 flex items-center justify-center gap-1">
              <Star className="h-5 w-5 fill-current" />
              {stats.averageRating.toFixed(1)}
            </div>
            <div className="text-sm text-gray-600">Ortalama Puan</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.verifiedReviews}</div>
            <div className="text-sm text-gray-600">Doğrulanmış</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.responseRate}%</div>
            <div className="text-sm text-gray-600">Yanıt Oranı</div>
          </div>
        </div>
        
        {/* Puan dağılımı */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Puan Dağılımı</h4>
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
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  // Filtre paneli
  const renderFiltersPanel = () => {
    if (!showFilters) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtreler
          </h3>
          <button
            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
            className="text-gray-400 hover:text-gray-600"
          >
            {showFiltersPanel ? <X className="h-5 w-5" /> : <Filter className="h-5 w-5" />}
          </button>
        </div>

        {showFiltersPanel && (
          <div className="space-y-4">
            {/* Puan filtresi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Puan
              </label>
              <div className="flex gap-2">
                {[0, 1, 2, 3, 4, 5].map(rating => (
                  <button
                    key={rating}
                    onClick={() => setFilters(prev => ({ ...prev, rating }))}
                    className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                      filters.rating === rating
                        ? 'bg-yellow-500 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {rating === 0 ? 'Tümü' : `${rating}+`}
                  </button>
                ))}
              </div>
            </div>

            {/* Durum filtresi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Durum
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ 
                  ...prev, 
                  status: e.target.value as ReviewStatus | 'all' 
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">Tümü</option>
                <option value="approved">Onaylanmış</option>
                <option value="pending">Beklemede</option>
                <option value="rejected">Reddedilmiş</option>
              </select>
            </div>

            {/* Diğer filtreler */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasMedia"
                  checked={filters.hasMedia}
                  onChange={(e) => setFilters(prev => ({ ...prev, hasMedia: e.target.checked }))}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="hasMedia" className="text-sm text-gray-700">
                  Sadece medyalı değerlendirmeler
                </label>
              </div>
              
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isVerified"
                  checked={filters.isVerified}
                  onChange={(e) => setFilters(prev => ({ ...prev, isVerified: e.target.checked }))}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label htmlFor="isVerified" className="text-sm text-gray-700">
                  Sadece doğrulanmış değerlendirmeler
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Sıralama paneli
  const renderSortPanel = () => {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-700">Sırala:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'date' | 'rating' | 'helpful')}
              className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="date">Tarih</option>
              <option value="rating">Puan</option>
              <option value="helpful">Faydalı</option>
            </select>
            
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
            </button>
          </div>
          
          <div className="text-sm text-gray-600">
            {filteredReviews.length} değerlendirme
          </div>
        </div>
      </div>
    );
  };

  // Değerlendirme oluşturma başarılı
  const handleReviewCreated = (reviewId: string) => {
    setShowCreateForm(false);
    // Değerlendirmeleri yeniden yükle
    getReviews({
      restaurantId,
      productId,
      type,
      limit: maxReviews
    });
  };

  return (
    <div className="space-y-6">
      {/* İstatistikler */}
      {renderStatsCard()}

      {/* Başlık ve Değerlendirme Ekleme Butonu */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          Değerlendirmeler
        </h2>
        
        {showCreateButton && (
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <MessageSquare className="h-4 w-4" />
            Değerlendirme Yap
          </button>
        )}
      </div>

      {/* Filtreler */}
      {renderFiltersPanel()}

      {/* Sıralama */}
      {renderSortPanel()}

      {/* Değerlendirme Formu */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <ReviewForm
              restaurantId={restaurantId}
              productId={productId}
              type={type}
              onSuccess={handleReviewCreated}
              onCancel={() => setShowCreateForm(false)}
            />
          </div>
        </div>
      )}

      {/* Hata Mesajı */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2 text-red-800">
            <span className="font-medium">Hata:</span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Değerlendirme Listesi */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredReviews.length > 0 ? (
        <div className="space-y-4">
          {filteredReviews.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              showActions={true}
              showResponse={true}
              onEdit={(review) => setSelectedReview(review)}
              onDelete={(reviewId) => {
                // Silme işlemi
                console.log('Delete review:', reviewId);
              }}
              onReport={(review) => {
                // Raporlama işlemi
                console.log('Report review:', review);
              }}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Henüz değerlendirme yok
          </h3>
          <p className="text-gray-600 mb-4">
            Bu {type === 'restaurant' ? 'restoran' : 'ürün'} için henüz değerlendirme yapılmamış.
          </p>
          {showCreateButton && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              İlk Değerlendirmeyi Yap
            </button>
          )}
        </div>
      )}

      {/* Daha Fazla Yükle Butonu */}
      {filteredReviews.length >= maxReviews && (
        <div className="text-center">
          <button
            onClick={() => {
              // Daha fazla değerlendirme yükle
              console.log('Load more reviews');
            }}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Daha Fazla Göster
          </button>
        </div>
      )}
    </div>
  );
} 