import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy, 
  limit,
  Timestamp,
  addDoc,
  deleteDoc,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  increment,
  startAfter,
  QueryDocumentSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { 
  Review, 
  ReviewType,
  ReviewCategory,
  ReviewStatus,
  ReviewPriority,
  ReviewContent,
  ReviewMedia,
  ReviewInteraction,
  ReviewResponse,
  ReviewStats,
  ReviewModeration,
  ReviewReport,
  ReviewCampaign,
  ReviewAnalytics,
  ReviewSettings,
  User
} from '@/types';

export class ReviewService {
  
  // Değerlendirme oluştur
  async createReview(reviewData: Omit<Review, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      // Sipariş doğrulaması kontrol et
      if (reviewData.orderId) {
        const isVerified = await this.verifyOrder(reviewData.userId, reviewData.orderId);
        reviewData.isVerified = isVerified;
      }

      // Otomatik moderasyon
      const moderationResult = await this.autoModerate(reviewData);
      reviewData.status = moderationResult.status;
      reviewData.priority = moderationResult.priority;

      // Değerlendirme kaydını oluştur
      const reviewRef = await addDoc(collection(db, 'reviews'), {
        ...reviewData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      // İstatistikleri güncelle
      await this.updateReviewStats(reviewData.restaurantId);
      
      // Restoran puanını güncelle
      await this.updateRestaurantRating(reviewData.restaurantId);

      // Bildirim gönder
      await this.sendReviewNotification(reviewData);
      
      return reviewRef.id;
    } catch (error) {
      console.error('Error creating review:', error);
      throw error;
    }
  }

  // Değerlendirme getir
  async getReview(reviewId: string): Promise<Review | null> {
    try {
      const reviewDoc = await getDoc(doc(db, 'reviews', reviewId));
      if (reviewDoc.exists()) {
        return reviewDoc.data() as Review;
      }
      return null;
    } catch (error) {
      console.error('Error getting review:', error);
      throw error;
    }
  }

  // Değerlendirmeleri listele
  async getReviews(filters: {
    restaurantId?: string;
    productId?: string;
    userId?: string;
    type?: ReviewType;
    status?: ReviewStatus;
    rating?: number;
    hasMedia?: boolean;
    isVerified?: boolean;
    limit?: number;
    startAfter?: QueryDocumentSnapshot;
  }): Promise<{ reviews: Review[]; lastDoc: QueryDocumentSnapshot | null }> {
    try {
      let q = collection(db, 'reviews');

      // Filtreleri uygula
      if (filters.restaurantId) {
        q = query(q, where('restaurantId', '==', filters.restaurantId));
      }
      if (filters.productId) {
        q = query(q, where('productId', '==', filters.productId));
      }
      if (filters.userId) {
        q = query(q, where('userId', '==', filters.userId));
      }
      if (filters.type) {
        q = query(q, where('type', '==', filters.type));
      }
      if (filters.status) {
        q = query(q, where('status', '==', filters.status));
      }
      if (filters.rating) {
        q = query(q, where('content.rating', '>=', filters.rating));
      }
      if (filters.isVerified !== undefined) {
        q = query(q, where('isVerified', '==', filters.isVerified));
      }

      // Sıralama
      q = query(q, orderBy('createdAt', 'desc'));

      // Sayfalama
      if (filters.startAfter) {
        q = query(q, startAfter(filters.startAfter));
      }
      if (filters.limit) {
        q = query(q, limit(filters.limit));
      }

      const snapshot = await getDocs(q);
      const reviews = snapshot.docs.map(doc => doc.data() as Review);
      const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

      // Medya filtresi (client-side)
      let filteredReviews = reviews;
      if (filters.hasMedia) {
        filteredReviews = reviews.filter(review => review.media && review.media.length > 0);
      }

      return { reviews: filteredReviews, lastDoc };
    } catch (error) {
      console.error('Error getting reviews:', error);
      throw error;
    }
  }

  // Değerlendirme güncelle
  async updateReview(reviewId: string, updates: Partial<Review>): Promise<void> {
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      await updateDoc(reviewRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });

      // İstatistikleri güncelle
      const review = await this.getReview(reviewId);
      if (review) {
        await this.updateReviewStats(review.restaurantId);
        await this.updateRestaurantRating(review.restaurantId);
      }
    } catch (error) {
      console.error('Error updating review:', error);
      throw error;
    }
  }

  // Değerlendirme sil
  async deleteReview(reviewId: string): Promise<void> {
    try {
      const review = await this.getReview(reviewId);
      if (!review) throw new Error('Review not found');

      await deleteDoc(doc(db, 'reviews', reviewId));

      // İstatistikleri güncelle
      await this.updateReviewStats(review.restaurantId);
      await this.updateRestaurantRating(review.restaurantId);
    } catch (error) {
      console.error('Error deleting review:', error);
      throw error;
    }
  }

  // Değerlendirme etkileşimi ekle
  async addInteraction(reviewId: string, interaction: Omit<ReviewInteraction, 'createdAt'>): Promise<void> {
    try {
      const reviewRef = doc(db, 'reviews', reviewId);
      
      // Mevcut etkileşimi kontrol et
      const review = await this.getReview(reviewId);
      if (!review) throw new Error('Review not found');

      const existingInteraction = review.interactions.find(
        i => i.userId === interaction.userId && i.type === interaction.type
      );

      if (existingInteraction) {
        // Etkileşimi kaldır
        await updateDoc(reviewRef, {
          interactions: arrayRemove(existingInteraction),
          helpfulCount: interaction.type === 'helpful' ? increment(-1) : increment(0),
          reportCount: interaction.type === 'report' ? increment(-1) : increment(0)
        });
      } else {
        // Yeni etkileşim ekle
        const newInteraction: ReviewInteraction = {
          ...interaction,
          createdAt: Timestamp.now() as any
        };

        await updateDoc(reviewRef, {
          interactions: arrayUnion(newInteraction),
          helpfulCount: interaction.type === 'helpful' ? increment(1) : increment(0),
          reportCount: interaction.type === 'report' ? increment(1) : increment(0)
        });
      }
    } catch (error) {
      console.error('Error adding interaction:', error);
      throw error;
    }
  }

  // Değerlendirme yanıtı ekle
  async addResponse(responseData: Omit<ReviewResponse, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const responseRef = await addDoc(collection(db, 'review_responses'), {
        ...responseData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      // Değerlendirmeye yanıt referansını ekle
      const reviewRef = doc(db, 'reviews', responseData.reviewId);
      await updateDoc(reviewRef, {
        responses: arrayUnion(responseRef.id)
      });

      return responseRef.id;
    } catch (error) {
      console.error('Error adding response:', error);
      throw error;
    }
  }

  // Değerlendirme raporu oluştur
  async reportReview(reportData: Omit<ReviewReport, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const reportRef = await addDoc(collection(db, 'review_reports'), {
        ...reportData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      // Değerlendirmeyi işaretle
      const reviewRef = doc(db, 'reviews', reportData.reviewId);
      await updateDoc(reviewRef, {
        status: ReviewStatus.FLAGGED,
        priority: ReviewPriority.HIGH
      });

      return reportRef.id;
    } catch (error) {
      console.error('Error reporting review:', error);
      throw error;
    }
  }

  // Değerlendirme moderasyonu
  async moderateReview(moderationData: Omit<ReviewModeration, 'id' | 'createdAt'>): Promise<string> {
    try {
      const moderationRef = await addDoc(collection(db, 'review_moderations'), {
        ...moderationData,
        createdAt: Timestamp.now()
      });

      // Değerlendirme durumunu güncelle
      const reviewRef = doc(db, 'reviews', moderationData.reviewId);
      await updateDoc(reviewRef, {
        status: moderationData.action === 'approve' ? ReviewStatus.APPROVED : 
               moderationData.action === 'reject' ? ReviewStatus.REJECTED :
               moderationData.action === 'hide' ? ReviewStatus.HIDDEN : ReviewStatus.FLAGGED,
        moderatedBy: moderationData.moderatorId,
        moderatedAt: Timestamp.now(),
        moderationNotes: moderationData.notes
      });

      return moderationRef.id;
    } catch (error) {
      console.error('Error moderating review:', error);
      throw error;
    }
  }

  // Değerlendirme istatistiklerini getir
  async getReviewStats(restaurantId: string): Promise<ReviewStats> {
    try {
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('restaurantId', '==', restaurantId),
        where('status', '==', ReviewStatus.APPROVED)
      );
      
      const snapshot = await getDocs(reviewsQuery);
      const reviews = snapshot.docs.map(doc => doc.data() as Review);

      return this.calculateReviewStats(reviews);
    } catch (error) {
      console.error('Error getting review stats:', error);
      throw error;
    }
  }

  // Değerlendirme analitiklerini getir
  async getReviewAnalytics(restaurantId: string, period: 'week' | 'month' | 'year' = 'month'): Promise<ReviewAnalytics> {
    try {
      const startDate = this.getStartDate(period);
      
      const reviewsQuery = query(
        collection(db, 'reviews'),
        where('restaurantId', '==', restaurantId),
        where('createdAt', '>=', startDate)
      );

      const snapshot = await getDocs(reviewsQuery);
      const reviews = snapshot.docs.map(doc => doc.data() as Review);

      return this.calculateReviewAnalytics(reviews, period);
    } catch (error) {
      console.error('Error getting review analytics:', error);
      throw error;
    }
  }

  // Değerlendirme kampanyası oluştur
  async createCampaign(campaignData: Omit<ReviewCampaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const campaignRef = await addDoc(collection(db, 'review_campaigns'), {
        ...campaignData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      return campaignRef.id;
    } catch (error) {
      console.error('Error creating campaign:', error);
      throw error;
    }
  }

  // Değerlendirme ayarlarını getir
  async getReviewSettings(restaurantId: string): Promise<ReviewSettings> {
    try {
      const settingsRef = doc(db, 'review_settings', restaurantId);
      const settingsDoc = await getDoc(settingsRef);
      
      if (settingsDoc.exists()) {
        return settingsDoc.data() as ReviewSettings;
      }

      // Varsayılan ayarları döndür
      return this.getDefaultReviewSettings();
    } catch (error) {
      console.error('Error getting review settings:', error);
      throw error;
    }
  }

  // Değerlendirme ayarlarını güncelle
  async updateReviewSettings(restaurantId: string, settings: Partial<ReviewSettings>): Promise<void> {
    try {
      const settingsRef = doc(db, 'review_settings', restaurantId);
      await setDoc(settingsRef, {
        ...this.getDefaultReviewSettings(),
        ...settings
      }, { merge: true });
    } catch (error) {
      console.error('Error updating review settings:', error);
      throw error;
    }
  }

  // Yardımcı metodlar
  private async verifyOrder(userId: string, orderId: string): Promise<boolean> {
    try {
      const orderDoc = await getDoc(doc(db, 'orders', orderId));
      if (!orderDoc.exists()) return false;

      const order = orderDoc.data();
      return order.userId === userId && order.status === 'delivered';
    } catch (error) {
      console.error('Error verifying order:', error);
      return false;
    }
  }

  private async autoModerate(review: Review): Promise<{ status: ReviewStatus; priority: ReviewPriority }> {
    // Basit otomatik moderasyon kuralları
    const text = review.content.text.toLowerCase();
    const rating = review.content.rating;

    // Spam kontrolü
    const spamWords = ['spam', 'fake', 'bot', 'test'];
    const isSpam = spamWords.some(word => text.includes(word));

    // Uygunsuz içerik kontrolü
    const inappropriateWords = ['küfür', 'hakaret', 'müstehcen'];
    const isInappropriate = inappropriateWords.some(word => text.includes(word));

    // Çok kısa yorum kontrolü
    const isTooShort = text.length < 10;

    // Aşırı puan kontrolü
    const isExtremeRating = rating === 1 || rating === 5;

    if (isSpam || isInappropriate) {
      return { status: ReviewStatus.REJECTED, priority: ReviewPriority.HIGH };
    }

    if (isTooShort || isExtremeRating) {
      return { status: ReviewStatus.PENDING, priority: ReviewPriority.NORMAL };
    }

    return { status: ReviewStatus.APPROVED, priority: ReviewPriority.LOW };
  }

  private async updateReviewStats(restaurantId: string): Promise<void> {
    try {
      const stats = await this.getReviewStats(restaurantId);
      const statsRef = doc(db, 'review_stats', restaurantId);
      await setDoc(statsRef, stats);
    } catch (error) {
      console.error('Error updating review stats:', error);
    }
  }

  private async updateRestaurantRating(restaurantId: string): Promise<void> {
    try {
      const stats = await this.getReviewStats(restaurantId);
      const restaurantRef = doc(db, 'restaurants', restaurantId);
      await updateDoc(restaurantRef, {
        rating: stats.averageRating,
        reviewCount: stats.totalReviews
      });
    } catch (error) {
      console.error('Error updating restaurant rating:', error);
    }
  }

  private async sendReviewNotification(review: Review): Promise<void> {
    try {
      // Restoran sahibine bildirim gönder
      const restaurantDoc = await getDoc(doc(db, 'restaurants', review.restaurantId));
      if (restaurantDoc.exists()) {
        const restaurant = restaurantDoc.data();
        if (restaurant.ownerId) {
          // Push notification servisi ile bildirim gönder
          // Bu kısım push notification sistemi ile entegre edilecek
        }
      }
    } catch (error) {
      console.error('Error sending review notification:', error);
    }
  }

  private calculateReviewStats(reviews: Review[]): ReviewStats {
    const stats: ReviewStats = {
      totalReviews: reviews.length,
      averageRating: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      categoryAverages: {} as any,
      recentReviews: 0,
      responseRate: 0,
      helpfulRate: 0,
      verifiedReviews: 0,
      anonymousReviews: 0,
      byStatus: {} as any,
      byType: {} as any,
      byMonth: {},
      topTags: [],
      sentimentAnalysis: { positive: 0, neutral: 0, negative: 0 }
    };

    if (reviews.length === 0) return stats;

    // Temel hesaplamalar
    let totalRating = 0;
    let totalHelpful = 0;
    let totalResponses = 0;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    reviews.forEach(review => {
      // Puan dağılımı
      const rating = review.content.rating;
      stats.ratingDistribution[rating]++;
      totalRating += rating;

      // Kategori ortalamaları
      if (review.content.categoryRatings) {
        Object.entries(review.content.categoryRatings).forEach(([category, rating]) => {
          if (!stats.categoryAverages[category]) {
            stats.categoryAverages[category] = { total: 0, count: 0 };
          }
          stats.categoryAverages[category].total += rating;
          stats.categoryAverages[category].count++;
        });
      }

      // Son 30 gün
      if (review.createdAt >= thirtyDaysAgo) {
        stats.recentReviews++;
      }

      // Etkileşimler
      totalHelpful += review.helpfulCount;
      totalResponses += review.responses.length;

      // Doğrulama durumu
      if (review.isVerified) stats.verifiedReviews++;
      if (review.isAnonymous) stats.anonymousReviews++;

      // Durum dağılımı
      stats.byStatus[review.status] = (stats.byStatus[review.status] || 0) + 1;
      stats.byType[review.type] = (stats.byType[review.type] || 0) + 1;

      // Aylık dağılım
      const month = new Date(review.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' });
      stats.byMonth[month] = (stats.byMonth[month] || 0) + 1;

      // Etiketler
      review.tags.forEach(tag => {
        const existingTag = stats.topTags.find(t => t.tag === tag);
        if (existingTag) {
          existingTag.count++;
        } else {
          stats.topTags.push({ tag, count: 1 });
        }
      });

      // Duygu analizi
      if (rating >= 4) stats.sentimentAnalysis.positive++;
      else if (rating <= 2) stats.sentimentAnalysis.negative++;
      else stats.sentimentAnalysis.neutral++;
    });

    // Ortalamaları hesapla
    stats.averageRating = totalRating / reviews.length;
    stats.helpfulRate = totalHelpful / reviews.length;
    stats.responseRate = (totalResponses / reviews.length) * 100;

    // Kategori ortalamalarını hesapla
    Object.keys(stats.categoryAverages).forEach(category => {
      const cat = stats.categoryAverages[category];
      stats.categoryAverages[category] = cat.total / cat.count;
    });

    // En popüler etiketleri sırala
    stats.topTags.sort((a, b) => b.count - a.count);
    stats.topTags = stats.topTags.slice(0, 10);

    return stats;
  }

  private calculateReviewAnalytics(reviews: Review[], period: string): ReviewAnalytics {
    const analytics: ReviewAnalytics = {
      totalReviews: reviews.length,
      averageRating: 0,
      ratingTrend: [],
      categoryPerformance: {} as any,
      reviewsByHour: {},
      reviewsByDay: {},
      reviewsByMonth: {},
      reviewerDemographics: {
        newCustomers: 0,
        returningCustomers: 0,
        anonymousReviews: 0,
        verifiedReviews: 0
      },
      contentAnalysis: {
        averageTextLength: 0,
        mediaUsage: 0,
        tagUsage: [],
        sentimentTrend: []
      },
      engagementMetrics: {
        responseRate: 0,
        averageResponseTime: 0,
        helpfulRate: 0,
        reportRate: 0
      }
    };

    if (reviews.length === 0) return analytics;

    // Temel hesaplamalar
    let totalRating = 0;
    let totalTextLength = 0;
    let totalMediaUsage = 0;
    let totalHelpful = 0;
    let totalReports = 0;
    let totalResponses = 0;
    const userIds = new Set<string>();
    const tagCounts: Record<string, number> = {};

    reviews.forEach(review => {
      totalRating += review.content.rating;
      totalTextLength += review.content.text.length;
      if (review.media && review.media.length > 0) totalMediaUsage++;
      totalHelpful += review.helpfulCount;
      totalReports += review.reportCount;
      totalResponses += review.responses.length;
      userIds.add(review.userId);

      // Saat dağılımı
      const hour = new Date(review.createdAt).getHours();
      analytics.reviewsByHour[hour] = (analytics.reviewsByHour[hour] || 0) + 1;

      // Gün dağılımı
      const day = new Date(review.createdAt).toLocaleDateString('tr-TR', { weekday: 'long' });
      analytics.reviewsByDay[day] = (analytics.reviewsByDay[day] || 0) + 1;

      // Ay dağılımı
      const month = new Date(review.createdAt).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' });
      analytics.reviewsByMonth[month] = (analytics.reviewsByMonth[month] || 0) + 1;

      // Kategori performansı
      if (review.content.categoryRatings) {
        Object.entries(review.content.categoryRatings).forEach(([category, rating]) => {
          if (!analytics.categoryPerformance[category]) {
            analytics.categoryPerformance[category] = { totalRating: 0, count: 0 };
          }
          analytics.categoryPerformance[category].totalRating += rating;
          analytics.categoryPerformance[category].count++;
        });
      }

      // Etiket kullanımı
      review.tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });

      // Demografik bilgiler
      if (review.isAnonymous) analytics.reviewerDemographics.anonymousReviews++;
      if (review.isVerified) analytics.reviewerDemographics.verifiedReviews++;
    });

    // Ortalamaları hesapla
    analytics.averageRating = totalRating / reviews.length;
    analytics.contentAnalysis.averageTextLength = totalTextLength / reviews.length;
    analytics.contentAnalysis.mediaUsage = (totalMediaUsage / reviews.length) * 100;
    analytics.engagementMetrics.helpfulRate = totalHelpful / reviews.length;
    analytics.engagementMetrics.reportRate = totalReports / reviews.length;
    analytics.engagementMetrics.responseRate = (totalResponses / reviews.length) * 100;

    // Kategori performansını hesapla
    Object.keys(analytics.categoryPerformance).forEach(category => {
      const cat = analytics.categoryPerformance[category];
      analytics.categoryPerformance[category] = {
        averageRating: cat.totalRating / cat.count,
        totalReviews: cat.count,
        trend: 'stable' // Bu değer daha gelişmiş analiz gerektirir
      };
    });

    // Etiket kullanımını sırala
    analytics.contentAnalysis.tagUsage = Object.entries(tagCounts)
      .map(([tag, count]) => ({ tag, frequency: count }))
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, 10);

    // Demografik bilgileri tamamla
    analytics.reviewerDemographics.returningCustomers = userIds.size;
    analytics.reviewerDemographics.newCustomers = reviews.length - userIds.size;

    return analytics;
  }

  private getStartDate(period: string): Date {
    const now = new Date();
    switch (period) {
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      case 'year':
        return new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }
  }

  private getDefaultReviewSettings(): ReviewSettings {
    return {
      allowAnonymousReviews: true,
      requireOrderVerification: false,
      requireMinimumTextLength: true,
      minimumTextLength: 10,
      maximumTextLength: 1000,
      allowPhotos: true,
      allowVideos: false,
      maxMediaCount: 5,
      maxFileSize: 5,
      allowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
      autoModeration: true,
      requireApproval: false,
      profanityFilter: true,
      spamDetection: true,
      notifyOnNewReview: true,
      notifyOnReport: true,
      notifyOnResponse: true,
      allowReviewCampaigns: true,
      maxCampaignDuration: 30,
      maxIncentiveValue: 50,
      showReviewerName: true,
      showReviewerPhoto: true,
      showReviewDate: true,
      showVerifiedBadge: true
    };
  }
} 