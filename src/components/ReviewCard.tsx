'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useReviews } from '@/hooks/useReviews';
import { 
  Star, 
  ThumbsUp, 
  ThumbsDown, 
  Flag, 
  MessageSquare, 
  MoreVertical,
  Camera,
  Play,
  Heart,
  Share2,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import type { Review, ReviewCategory, ReviewInteraction } from '@/types';

interface ReviewCardProps {
  review: Review;
  showActions?: boolean;
  showResponse?: boolean;
  onEdit?: (review: Review) => void;
  onDelete?: (reviewId: string) => void;
  onReport?: (review: Review) => void;
}

export default function ReviewCard({
  review,
  showActions = true,
  showResponse = true,
  onEdit,
  onDelete,
  onReport
}: ReviewCardProps) {
  const { user } = useAuth();
  const { addInteraction, getUserReview } = useReviews();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseText, setResponseText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Kullanıcının etkileşimlerini kontrol et
  const userInteractions = review.interactions.filter(i => i.userId === user?.uid);
  const hasLiked = userInteractions.some(i => i.type === 'helpful');
  const hasDisliked = userInteractions.some(i => i.type === 'dislike');
  const hasReported = userInteractions.some(i => i.type === 'report');

  // Kullanıcının bu değerlendirmeyi düzenleyip düzenleyemeyeceğini kontrol et
  const canEdit = user?.uid === review.userId;
  const canDelete = user?.uid === review.userId;
  const canReport = user?.uid && user.uid !== review.userId;

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

  // Kategori puanlarını render et
  const renderCategoryRatings = () => {
    if (!review.content.categoryRatings) return null;

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

    return (
      <div className="mt-3 space-y-2">
        {Object.entries(review.content.categoryRatings).map(([category, rating]) => (
          <div key={category} className="flex items-center justify-between text-sm">
            <span className="text-gray-600">{categoryLabels[category as ReviewCategory]}</span>
            <div className="flex items-center gap-2">
              {renderStars(rating, 'sm')}
              <span className="text-gray-500 text-xs">{rating}/5</span>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Medya içeriğini render et
  const renderMedia = () => {
    if (!review.media || review.media.length === 0) return null;

    return (
      <div className="mt-3 grid grid-cols-2 gap-2">
        {review.media.slice(0, 4).map((media) => (
          <div key={media.id} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
            {media.type === 'image' ? (
              <img
                src={media.url}
                alt={media.alt || 'Değerlendirme fotoğrafı'}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <Play className="h-8 w-8 text-gray-400" />
              </div>
            )}
            {media.caption && (
              <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1">
                {media.caption}
              </div>
            )}
          </div>
        ))}
        {review.media.length > 4 && (
          <div className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
            <div className="text-center">
              <Camera className="h-6 w-6 text-gray-400 mx-auto mb-1" />
              <span className="text-xs text-gray-500">+{review.media.length - 4}</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Etiketleri render et
  const renderTags = () => {
    if (!review.tags || review.tags.length === 0) return null;

    return (
      <div className="mt-3 flex flex-wrap gap-1">
        {review.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    );
  };

  // Avantaj/dezavantajları render et
  const renderProsCons = () => {
    if (!review.content.pros && !review.content.cons) return null;

    return (
      <div className="mt-3 space-y-2">
        {review.content.pros && review.content.pros.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-green-700 mb-1">Avantajlar</h4>
            <ul className="space-y-1">
              {review.content.pros.map((pro, index) => (
                <li key={index} className="text-sm text-green-600 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  {pro}
                </li>
              ))}
            </ul>
          </div>
        )}
        {review.content.cons && review.content.cons.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-red-700 mb-1">Dezavantajlar</h4>
            <ul className="space-y-1">
              {review.content.cons.map((con, index) => (
                <li key={index} className="text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {con}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Etkileşim butonlarını render et
  const renderActions = () => {
    if (!showActions) return null;

    const handleInteraction = async (type: ReviewInteraction['type']) => {
      if (!user?.uid) return;

      try {
        await addInteraction(review.id, {
          userId: user.uid,
          type
        });
      } catch (error) {
        console.error('Etkileşim eklenemedi:', error);
      }
    };

    return (
      <div className="mt-3 flex items-center gap-4 text-sm">
        <button
          onClick={() => handleInteraction('helpful')}
          className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
            hasLiked 
              ? 'text-blue-600 bg-blue-50' 
              : 'text-gray-500 hover:text-blue-600 hover:bg-blue-50'
          }`}
        >
          <ThumbsUp className="h-4 w-4" />
          <span>{review.helpfulCount}</span>
        </button>

        <button
          onClick={() => handleInteraction('dislike')}
          className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
            hasDisliked 
              ? 'text-red-600 bg-red-50' 
              : 'text-gray-500 hover:text-red-600 hover:bg-red-50'
          }`}
        >
          <ThumbsDown className="h-4 w-4" />
        </button>

        <button className="flex items-center gap-1 px-2 py-1 text-gray-500 hover:text-gray-700 transition-colors">
          <MessageSquare className="h-4 w-4" />
          <span>{review.responses.length}</span>
        </button>

        <button className="flex items-center gap-1 px-2 py-1 text-gray-500 hover:text-gray-700 transition-colors">
          <Share2 className="h-4 w-4" />
        </button>

        {canReport && (
          <button
            onClick={() => onReport?.(review)}
            className={`flex items-center gap-1 px-2 py-1 rounded transition-colors ${
              hasReported 
                ? 'text-orange-600 bg-orange-50' 
                : 'text-gray-500 hover:text-orange-600 hover:bg-orange-50'
            }`}
          >
            <Flag className="h-4 w-4" />
          </button>
        )}

        {(canEdit || canDelete) && (
          <div className="relative ml-auto">
            <button className="p-1 text-gray-500 hover:text-gray-700 transition-colors">
              <MoreVertical className="h-4 w-4" />
            </button>
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
              {canEdit && (
                <button
                  onClick={() => onEdit?.(review)}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-gray-700 hover:bg-gray-50 w-full"
                >
                  <Edit className="h-4 w-4" />
                  Düzenle
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => onDelete?.(review.id)}
                  className="flex items-center gap-2 px-3 py-1 text-sm text-red-600 hover:bg-red-50 w-full"
                >
                  <Trash2 className="h-4 w-4" />
                  Sil
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Yanıt formunu render et
  const renderResponseForm = () => {
    if (!showResponseForm) return null;

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!responseText.trim()) return;

      setIsSubmitting(true);
      try {
        // Yanıt gönderme işlemi burada yapılacak
        setResponseText('');
        setShowResponseForm(false);
      } catch (error) {
        console.error('Yanıt gönderilemedi:', error);
      } finally {
        setIsSubmitting(false);
      }
    };

    return (
      <form onSubmit={handleSubmit} className="mt-3 p-3 bg-gray-50 rounded-lg">
        <textarea
          value={responseText}
          onChange={(e) => setResponseText(e.target.value)}
          placeholder="Yanıtınızı yazın..."
          className="w-full p-2 border border-gray-300 rounded-md resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
        />
        <div className="mt-2 flex gap-2">
          <button
            type="submit"
            disabled={isSubmitting || !responseText.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Gönderiliyor...' : 'Yanıtla'}
          </button>
          <button
            type="button"
            onClick={() => setShowResponseForm(false)}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            İptal
          </button>
        </div>
      </form>
    );
  };

  // Durum badge'ini render et
  const renderStatusBadge = () => {
    const statusConfig = {
      [ReviewStatus.PENDING]: { label: 'Onay Bekliyor', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
      [ReviewStatus.APPROVED]: { label: 'Onaylandı', color: 'bg-green-100 text-green-800', icon: CheckCircle },
      [ReviewStatus.REJECTED]: { label: 'Reddedildi', color: 'bg-red-100 text-red-800', icon: AlertCircle },
      [ReviewStatus.FLAGGED]: { label: 'İşaretlendi', color: 'bg-orange-100 text-orange-800', icon: Flag },
      [ReviewStatus.HIDDEN]: { label: 'Gizlendi', color: 'bg-gray-100 text-gray-800', icon: AlertCircle }
    };

    const config = statusConfig[review.status];
    if (!config) return null;

    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </div>
    );
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      {/* Başlık ve Kullanıcı Bilgileri */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
            {review.isAnonymous ? (
              <span className="text-gray-500 font-medium">A</span>
            ) : (
              <span className="text-gray-700 font-medium">
                {review.userId.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">
                {review.isAnonymous ? 'Anonim Kullanıcı' : `Kullanıcı ${review.userId.slice(-4)}`}
              </span>
              {review.isVerified && (
                <CheckCircle className="h-4 w-4 text-green-500" title="Doğrulanmış sipariş" />
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              {renderStars(review.content.rating)}
              <span>{review.content.rating}/5</span>
              <span>•</span>
              <span>{new Date(review.createdAt).toLocaleDateString('tr-TR')}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {renderStatusBadge()}
        </div>
      </div>

      {/* Başlık */}
      {review.content.title && (
        <h3 className="font-medium text-gray-900 mb-2">{review.content.title}</h3>
      )}

      {/* İçerik */}
      <div className="text-gray-700">
        {review.content.text.length > 200 && !isExpanded ? (
          <div>
            <p>{review.content.text.slice(0, 200)}...</p>
            <button
              onClick={() => setIsExpanded(true)}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-1"
            >
              Devamını oku
            </button>
          </div>
        ) : (
          <p>{review.content.text}</p>
        )}
      </div>

      {/* Kategori Puanları */}
      {renderCategoryRatings()}

      {/* Medya */}
      {renderMedia()}

      {/* Etiketler */}
      {renderTags()}

      {/* Avantaj/Dezavantajlar */}
      {renderProsCons()}

      {/* Etkileşimler */}
      {renderActions()}

      {/* Yanıt Formu */}
      {showResponse && (
        <div className="mt-3">
          <button
            onClick={() => setShowResponseForm(!showResponseForm)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            Yanıtla
          </button>
          {renderResponseForm()}
        </div>
      )}
    </div>
  );
} 