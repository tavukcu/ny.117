'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useReviews } from '@/hooks/useReviews';
import { 
  Star, 
  Camera, 
  X, 
  Play, 
  Upload,
  Smile,
  Frown,
  MessageSquare,
  Tag,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import type { 
  ReviewType, 
  ReviewCategory, 
  ReviewContent, 
  ReviewMedia,
  Review
} from '@/types';

interface ReviewFormProps {
  restaurantId: string;
  orderId?: string;
  productId?: string;
  type: ReviewType;
  onSuccess?: (reviewId: string) => void;
  onCancel?: () => void;
  editReview?: Review;
}

export default function ReviewForm({
  restaurantId,
  orderId,
  productId,
  type,
  onSuccess,
  onCancel,
  editReview
}: ReviewFormProps) {
  const { user } = useAuth();
  const { createReview, updateReview } = useReviews();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [overallRating, setOverallRating] = useState(editReview?.content.overallRating || 0);
  const [categoryRatings, setCategoryRatings] = useState<Record<ReviewCategory, number>>(
    editReview?.content.categoryRatings || {
      food_quality: 0,
      service_speed: 0,
      cleanliness: 0,
      value_for_money: 0,
      atmosphere: 0,
      delivery_time: 0,
      packaging: 0,
      customer_service: 0,
      portion_size: 0,
      freshness: 0,
      taste: 0
    }
  );
  const [title, setTitle] = useState(editReview?.content.title || '');
  const [description, setDescription] = useState(editReview?.content.description || '');
  const [pros, setPros] = useState<string[]>(editReview?.content.pros || []);
  const [cons, setCons] = useState<string[]>(editReview?.content.cons || []);
  const [tags, setTags] = useState<string[]>(editReview?.content.tags || []);
  const [media, setMedia] = useState<ReviewMedia[]>(editReview?.content.media || []);
  const [isAnonymous, setIsAnonymous] = useState(editReview?.isAnonymous || false);
  const [newTag, setNewTag] = useState('');
  const [newPro, setNewPro] = useState('');
  const [newCon, setNewCon] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Yıldızları render et
  const renderStars = (
    rating: number, 
    onRatingChange: (rating: number) => void,
    size: 'sm' | 'md' | 'lg' = 'md'
  ) => {
    const stars = [];
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6'
    };

    for (let i = 1; i <= 5; i++) {
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => onRatingChange(i)}
          className="transition-colors hover:scale-110"
        >
          <Star
            className={`${sizeClasses[size]} ${
              i <= rating 
                ? 'text-yellow-400 fill-current' 
                : 'text-gray-300 hover:text-yellow-300'
            }`}
          />
        </button>
      );
    }

    return <div className="flex gap-1">{stars}</div>;
  };

  // Medya yükleme
  const handleMediaUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const mediaItem: ReviewMedia = {
          id: Date.now().toString(),
          type: file.type.startsWith('image/') ? 'image' : 'video',
          url: e.target?.result as string,
          thumbnail: file.type.startsWith('image/') ? e.target?.result as string : undefined,
          filename: file.name,
          size: file.size,
          uploadedAt: new Date()
        };
        setMedia(prev => [...prev, mediaItem]);
      };
      reader.readAsDataURL(file);
    });
  };

  // Medya silme
  const removeMedia = (mediaId: string) => {
    setMedia(prev => prev.filter(m => m.id !== mediaId));
  };

  // Tag ekleme
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags(prev => [...prev, newTag.trim()]);
      setNewTag('');
    }
  };

  // Tag silme
  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  // Pro ekleme
  const addPro = () => {
    if (newPro.trim() && !pros.includes(newPro.trim())) {
      setPros(prev => [...prev, newPro.trim()]);
      setNewPro('');
    }
  };

  // Pro silme
  const removePro = (proToRemove: string) => {
    setPros(prev => prev.filter(pro => pro !== proToRemove));
  };

  // Con ekleme
  const addCon = () => {
    if (newCon.trim() && !cons.includes(newCon.trim())) {
      setCons(prev => [...prev, newCon.trim()]);
      setNewCon('');
    }
  };

  // Con silme
  const removeCon = (conToRemove: string) => {
    setCons(prev => prev.filter(con => con !== conToRemove));
  };

  // Form gönderme
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.uid) {
      setError('Kullanıcı girişi gerekli');
      return;
    }

    if (overallRating === 0) {
      setError('Genel puan vermelisiniz');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const reviewContent: ReviewContent = {
        overallRating,
        categoryRatings,
        title: title.trim(),
        description: description.trim(),
        pros,
        cons,
        tags,
        media
      };

      if (editReview) {
        await updateReview(editReview.id, {
          content: reviewContent,
          isAnonymous,
          updatedAt: new Date()
        });
        onSuccess?.(editReview.id);
      } else {
        const reviewId = await createReview({
          restaurantId,
          orderId,
          productId,
          type,
          content: reviewContent,
          media,
          isAnonymous,
          tags
        });
        onSuccess?.(reviewId);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Değerlendirme kaydedilemedi';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {editReview ? 'Değerlendirmeyi Düzenle' : 'Değerlendirme Yap'}
          </h2>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        )}
        </div>

      <form onSubmit={handleSubmit} className="space-y-6">
          {/* Genel Puan */}
        <div className="space-y-3">
          <label className="block text-lg font-semibold text-gray-900">
            Genel Puanınız
            </label>
          <div className="flex items-center gap-4">
            {renderStars(overallRating, setOverallRating, 'lg')}
            <span className="text-2xl font-bold text-gray-900 ml-4">
              {overallRating}/5
            </span>
          </div>
          </div>

        {/* Kategori Puanları */}
            <div className="space-y-4">
          <label className="block text-lg font-semibold text-gray-900">
            Detaylı Değerlendirme
          </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(categoryLabels).map(([key, label]) => (
              <div key={key} className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  {label}
                  </label>
                <div className="flex items-center gap-2">
                  {renderStars(
                    categoryRatings[key as ReviewCategory],
                    (rating) => setCategoryRatings(prev => ({
                      ...prev,
                      [key]: rating
                    })),
                    'sm'
                  )}
                  <span className="text-sm text-gray-600 ml-2">
                    {categoryRatings[key as ReviewCategory]}/5
                  </span>
                </div>
              </div>
            ))}
              </div>
            </div>

          {/* Başlık */}
        <div className="space-y-2">
          <label className="block text-lg font-semibold text-gray-900">
              Başlık (İsteğe bağlı)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            placeholder="Değerlendirmeniz için kısa bir başlık..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              maxLength={100}
            />
          </div>

        {/* Açıklama */}
        <div className="space-y-2">
          <label className="block text-lg font-semibold text-gray-900">
            Deneyiminizi Paylaşın
            </label>
            <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Deneyiminizi detaylı bir şekilde anlatın..."
              rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              maxLength={1000}
          />
          <div className="text-sm text-gray-500 text-right">
            {description.length}/1000
          </div>
          </div>

          {/* Artılar */}
        <div className="space-y-3">
          <label className="block text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Smile className="h-5 w-5 text-green-500" />
            Beğendiğiniz Yönler
            </label>
          <div className="space-y-2">
            {pros.map((pro, index) => (
              <div key={index} className="flex items-center gap-2 bg-green-50 p-3 rounded-lg">
                <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                <span className="flex-1 text-sm">{pro}</span>
                  <button
                    type="button"
                  onClick={() => removePro(pro)}
                    className="text-red-500 hover:text-red-700"
                  >
                  <X className="h-4 w-4" />
                  </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                value={newPro}
                onChange={(e) => setNewPro(e.target.value)}
                placeholder="Beğendiğiniz bir yön ekleyin..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPro())}
              />
            <button
              type="button"
                onClick={addPro}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
            >
                Ekle
            </button>
            </div>
          </div>
          </div>

          {/* Eksiler */}
        <div className="space-y-3">
          <label className="block text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Frown className="h-5 w-5 text-red-500" />
            Geliştirilebilir Yönler
            </label>
          <div className="space-y-2">
            {cons.map((con, index) => (
              <div key={index} className="flex items-center gap-2 bg-red-50 p-3 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                <span className="flex-1 text-sm">{con}</span>
                  <button
                    type="button"
                  onClick={() => removeCon(con)}
                    className="text-red-500 hover:text-red-700"
                  >
                  <X className="h-4 w-4" />
                  </button>
              </div>
            ))}
            <div className="flex gap-2">
              <input
                type="text"
                value={newCon}
                onChange={(e) => setNewCon(e.target.value)}
                placeholder="Geliştirilebilir bir yön ekleyin..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCon())}
              />
              <button
                type="button"
                onClick={addCon}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
              >
                Ekle
              </button>
            </div>
          </div>
        </div>

        {/* Etiketler */}
        <div className="space-y-3">
          <label className="block text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Tag className="h-5 w-5 text-blue-500" />
            Etiketler
          </label>
          <div className="space-y-2">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Etiket ekleyin..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <button
                type="button"
                onClick={addTag}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
              >
                Ekle
              </button>
            </div>
            </div>
          </div>

        {/* Medya Yükleme */}
        <div className="space-y-3">
          <label className="block text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Camera className="h-5 w-5 text-purple-500" />
            Fotoğraf/Video Ekle
          </label>
          <div className="space-y-3">
            {media.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {media.map((item) => (
                  <div key={item.id} className="relative group">
                    {item.type === 'image' ? (
                      <img
                        src={item.url}
                        alt="Review media"
                        className="w-full h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Play className="h-8 w-8 text-gray-600" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeMedia(item.id)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 transition-colors flex items-center justify-center gap-2"
            >
              <Upload className="h-5 w-5 text-gray-400" />
              <span className="text-gray-600">Fotoğraf veya video yükle</span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleMediaUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Anonim Değerlendirme */}
        <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="anonymous"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
            />
          <label htmlFor="anonymous" className="text-sm text-gray-700">
            Bu değerlendirmeyi anonim olarak paylaş
            </label>
          </div>

        {/* Hata Mesajı */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center gap-2 text-red-800">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          </div>
        )}

          {/* Butonlar */}
        <div className="flex gap-3 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
          )}
            <button
              type="submit"
            disabled={isSubmitting || overallRating === 0}
            className="flex-1 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Kaydediliyor...
              </>
            ) : (
              <>
                <MessageSquare className="h-4 w-4" />
                {editReview ? 'Güncelle' : 'Değerlendirmeyi Gönder'}
              </>
            )}
            </button>
          </div>
        </form>
    </div>
  );
} 