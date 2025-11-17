'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { ReviewService } from '@/services/reviewService';
import type { 
  Review,
  ReviewType,
  ReviewCategory,
  ReviewStatus,
  ReviewContent,
  ReviewMedia,
  ReviewInteraction,
  ReviewResponse,
  ReviewStats,
  ReviewAnalytics,
  ReviewSettings
} from '@/types';

export function useReviews() {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [analytics, setAnalytics] = useState<ReviewAnalytics | null>(null);
  const [settings, setSettings] = useState<ReviewSettings | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);

  const reviewService = new ReviewService();

  // Değerlendirme oluştur
  const createReview = useCallback(async (reviewData: {
    restaurantId: string;
    orderId?: string;
    productId?: string;
    type: ReviewType;
    content: ReviewContent;
    media?: ReviewMedia[];
    isAnonymous?: boolean;
    tags?: string[];
  }): Promise<string> => {
    if (!user?.uid) {
      throw new Error('Kullanıcı girişi gerekli');
    }

    try {
      setIsLoading(true);
      setError(null);

      const newReview = {
        userId: user.uid,
        restaurantId: reviewData.restaurantId,
        orderId: reviewData.orderId,
        productId: reviewData.productId,
        type: reviewData.type,
        content: reviewData.content,
        media: reviewData.media || [],
        status: ReviewStatus.PENDING,
        priority: 'normal' as const,
        isVerified: false,
        isAnonymous: reviewData.isAnonymous || false,
        helpfulCount: 0,
        reportCount: 0,
        interactions: [],
        responses: [],
        tags: reviewData.tags || [],
        metadata: {}
      };

      const reviewId = await reviewService.createReview(newReview);
      
      // Yerel state'i güncelle
      const createdReview = {
        ...newReview,
        id: reviewId,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      setReviews(prev => [createdReview, ...prev]);
      
      return reviewId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Değerlendirme oluşturulamadı';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  // Değerlendirmeleri getir
  const getReviews = useCallback(async (filters: {
    restaurantId?: string;
    productId?: string;
    userId?: string;
    type?: ReviewType;
    status?: ReviewStatus;
    rating?: number;
    hasMedia?: boolean;
    isVerified?: boolean;
    limit?: number;
    reset?: boolean;
  } = {}) => {
    try {
      setIsLoading(true);
      setError(null);

      const { reviews: fetchedReviews, lastDoc: newLastDoc } = await reviewService.getReviews({
        ...filters,
        limit: filters.limit || 20,
        startAfter: filters.reset ? undefined : lastDoc
      });

      if (filters.reset) {
        setReviews(fetchedReviews);
      } else {
        setReviews(prev => [...prev, ...fetchedReviews]);
      }

      setLastDoc(newLastDoc);
      setHasMore(fetchedReviews.length === (filters.limit || 20));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Değerlendirmeler yüklenemedi';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [lastDoc]);

  // Değerlendirme güncelle
  const updateReview = useCallback(async (reviewId: string, updates: Partial<Review>): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      await reviewService.updateReview(reviewId, updates);

      // Yerel state'i güncelle
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, ...updates, updatedAt: new Date() }
          : review
      ));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Değerlendirme güncellenemedi';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Değerlendirme sil
  const deleteReview = useCallback(async (reviewId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      await reviewService.deleteReview(reviewId);

      // Yerel state'den kaldır
      setReviews(prev => prev.filter(review => review.id !== reviewId));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Değerlendirme silinemedi';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Değerlendirme etkileşimi ekle
  const addInteraction = useCallback(async (reviewId: string, interaction: Omit<ReviewInteraction, 'createdAt'>): Promise<void> => {
    if (!user?.uid) {
      throw new Error('Kullanıcı girişi gerekli');
    }

    try {
      setIsLoading(true);
      setError(null);

      await reviewService.addInteraction(reviewId, interaction);

      // Yerel state'i güncelle
      setReviews(prev => prev.map(review => {
        if (review.id !== reviewId) return review;

        const existingInteraction = review.interactions.find(
          i => i.userId === interaction.userId && i.type === interaction.type
        );

        let newInteractions = [...review.interactions];
        let newHelpfulCount = review.helpfulCount;
        let newReportCount = review.reportCount;

        if (existingInteraction) {
          // Etkileşimi kaldır
          newInteractions = newInteractions.filter(i => i !== existingInteraction);
          if (interaction.type === 'helpful') newHelpfulCount--;
          if (interaction.type === 'report') newReportCount--;
        } else {
          // Yeni etkileşim ekle
          newInteractions.push({
            ...interaction,
            createdAt: new Date()
          });
          if (interaction.type === 'helpful') newHelpfulCount++;
          if (interaction.type === 'report') newReportCount++;
        }

        return {
          ...review,
          interactions: newInteractions,
          helpfulCount: newHelpfulCount,
          reportCount: newReportCount
        };
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Etkileşim eklenemedi';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  // Değerlendirme yanıtı ekle
  const addResponse = useCallback(async (reviewId: string, responseData: {
    content: string;
    isPublic: boolean;
    responderType: 'restaurant' | 'admin';
  }): Promise<string> => {
    if (!user?.uid) {
      throw new Error('Kullanıcı girişi gerekli');
    }

    try {
      setIsLoading(true);
      setError(null);

      const responseId = await reviewService.addResponse({
        reviewId,
        responderId: user.uid,
        responderType: responseData.responderType,
        content: responseData.content,
        isPublic: responseData.isPublic,
        status: 'pending'
      });

      // Yerel state'i güncelle
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, responses: [...review.responses, responseId] }
          : review
      ));

      return responseId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Yanıt eklenemedi';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  // Değerlendirme raporla
  const reportReview = useCallback(async (reviewId: string, reportData: {
    reason: 'inappropriate' | 'spam' | 'fake' | 'offensive' | 'irrelevant' | 'other';
    description: string;
    evidence?: string[];
  }): Promise<string> => {
    if (!user?.uid) {
      throw new Error('Kullanıcı girişi gerekli');
    }

    try {
      setIsLoading(true);
      setError(null);

      const reportId = await reviewService.reportReview({
        reviewId,
        reporterId: user.uid,
        reason: reportData.reason,
        description: reportData.description,
        evidence: reportData.evidence,
        status: 'pending'
      });

      // Yerel state'i güncelle
      setReviews(prev => prev.map(review => 
        review.id === reviewId 
          ? { ...review, status: ReviewStatus.FLAGGED, priority: 'high' as const }
          : review
      ));

      return reportId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Rapor oluşturulamadı';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [user?.uid]);

  // Değerlendirme istatistiklerini getir
  const getReviewStats = useCallback(async (restaurantId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const fetchedStats = await reviewService.getReviewStats(restaurantId);
      setStats(fetchedStats);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'İstatistikler yüklenemedi';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Değerlendirme analitiklerini getir
  const getReviewAnalytics = useCallback(async (restaurantId: string, period: 'week' | 'month' | 'year' = 'month'): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const fetchedAnalytics = await reviewService.getReviewAnalytics(restaurantId, period);
      setAnalytics(fetchedAnalytics);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analitikler yüklenemedi';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Değerlendirme ayarlarını getir
  const getReviewSettings = useCallback(async (restaurantId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      const fetchedSettings = await reviewService.getReviewSettings(restaurantId);
      setSettings(fetchedSettings);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ayarlar yüklenemedi';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Değerlendirme ayarlarını güncelle
  const updateReviewSettings = useCallback(async (restaurantId: string, newSettings: Partial<ReviewSettings>): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);

      await reviewService.updateReviewSettings(restaurantId, newSettings);

      // Yerel state'i güncelle
      setSettings(prev => prev ? { ...prev, ...newSettings } : null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ayarlar güncellenemedi';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Daha fazla değerlendirme yükle
  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      getReviews();
    }
  }, [isLoading, hasMore, getReviews]);

  // Değerlendirmeleri sıfırla
  const resetReviews = useCallback(() => {
    setReviews([]);
    setLastDoc(null);
    setHasMore(true);
  }, []);

  // Hata temizle
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Kullanıcının değerlendirmesini kontrol et
  const getUserReview = useCallback((restaurantId: string, productId?: string): Review | null => {
    if (!user?.uid) return null;
    
    return reviews.find(review => 
      review.userId === user.uid && 
      review.restaurantId === restaurantId &&
      (!productId || review.productId === productId)
    ) || null;
  }, [reviews, user?.uid]);

  // Değerlendirme puanını hesapla
  const calculateAverageRating = useCallback((reviews: Review[]): number => {
    if (reviews.length === 0) return 0;
    
    const totalRating = reviews.reduce((sum, review) => sum + review.content.rating, 0);
    return Math.round((totalRating / reviews.length) * 10) / 10;
  }, []);

  // Puan dağılımını hesapla
  const calculateRatingDistribution = useCallback((reviews: Review[]): Record<number, number> => {
    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    
    reviews.forEach(review => {
      const rating = review.content.rating;
      if (rating >= 1 && rating <= 5) {
        distribution[rating as keyof typeof distribution]++;
      }
    });
    
    return distribution;
  }, []);

  // Kategori ortalamalarını hesapla
  const calculateCategoryAverages = useCallback((reviews: Review[]): Record<ReviewCategory, number> => {
    const categoryTotals: Record<ReviewCategory, { total: number; count: number }> = {} as any;
    
    reviews.forEach(review => {
      if (review.content.categoryRatings) {
        Object.entries(review.content.categoryRatings).forEach(([category, rating]) => {
          if (!categoryTotals[category as ReviewCategory]) {
            categoryTotals[category as ReviewCategory] = { total: 0, count: 0 };
          }
          categoryTotals[category as ReviewCategory].total += rating;
          categoryTotals[category as ReviewCategory].count++;
        });
      }
    });
    
    const averages: Record<ReviewCategory, number> = {} as any;
    Object.entries(categoryTotals).forEach(([category, data]) => {
      averages[category as ReviewCategory] = data.count > 0 ? data.total / data.count : 0;
    });
    
    return averages;
  }, []);

  return {
    // State
    reviews,
    stats,
    analytics,
    settings,
    isLoading,
    error,
    hasMore,

    // Actions
    createReview,
    getReviews,
    updateReview,
    deleteReview,
    addInteraction,
    addResponse,
    reportReview,
    getReviewStats,
    getReviewAnalytics,
    getReviewSettings,
    updateReviewSettings,
    loadMore,
    resetReviews,
    clearError,

    // Utilities
    getUserReview,
    calculateAverageRating,
    calculateRatingDistribution,
    calculateCategoryAverages
  };
} 