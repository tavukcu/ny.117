import { 
  doc, 
  setDoc, 
  getDoc, 
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
  onSnapshot
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { 
  NotificationType,
  NotificationPriority,
  NotificationStatus,
  NotificationChannel,
  NotificationTarget,
  type NotificationContent,
  type NotificationSendRequest,
  type NotificationRecord,
  type UserNotificationPreferences,
  type FCMToken,
  type NotificationStats,
  type NotificationCampaign,
  type NotificationHistory
} from '@/types';

export class PushNotificationService {
  // FCM Token kaydetme
  async saveFCMToken(userId: string, token: string, deviceInfo: FCMToken['deviceInfo']): Promise<void> {
    try {
      const tokenRef = doc(db, 'fcm_tokens', `${userId}_${token.substring(0, 20)}`);
      await setDoc(tokenRef, {
        userId,
        token,
        deviceInfo,
        isActive: true,
        lastUsed: Timestamp.now(),
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error saving FCM token:', error);
      throw error;
    }
  }

  // FCM Token silme
  async removeFCMToken(userId: string, token: string): Promise<void> {
    try {
      const tokenRef = doc(db, 'fcm_tokens', `${userId}_${token.substring(0, 20)}`);
      await deleteDoc(tokenRef);
    } catch (error) {
      console.error('Error removing FCM token:', error);
      throw error;
    }
  }

  // Kullanıcının aktif tokenlarını getir
  async getUserTokens(userId: string): Promise<FCMToken[]> {
    try {
      const tokensQuery = query(
        collection(db, 'fcm_tokens'),
        where('userId', '==', userId),
        where('isActive', '==', true)
      );
      
      const snapshot = await getDocs(tokensQuery);
      return snapshot.docs.map(doc => doc.data() as FCMToken);
    } catch (error) {
      console.error('Error getting user tokens:', error);
      throw error;
    }
  }

  // Tek kullanıcıya bildirim gönder (API route üzerinden)
  async sendToUser(userId: string, notification: NotificationSendRequest): Promise<string> {
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target: 'user',
          userId,
          notification
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send notification');
      }

      const result = await response.json();
      return result.notificationId;
    } catch (error) {
      console.error('Error sending notification to user:', error);
      throw error;
    }
  }

  // Çoklu kullanıcıya bildirim gönder (API route üzerinden)
  async sendToMultipleUsers(userIds: string[], notification: NotificationSendRequest): Promise<any> {
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target: 'multiple',
          userIds,
          notification
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send notifications');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending notification to multiple users:', error);
      throw error;
    }
  }

  // Tüm kullanıcılara bildirim gönder (API route üzerinden)
  async sendToAllUsers(notification: NotificationSendRequest): Promise<void> {
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target: 'all',
          notification
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send notifications to all users');
      }
    } catch (error) {
      console.error('Error sending notification to all users:', error);
      throw error;
    }
  }

  // Konum bazlı bildirim gönder (API route üzerinden)
  async sendLocationBasedNotification(
    centerLat: number, 
    centerLng: number, 
    radiusKm: number, 
    notification: NotificationSendRequest
  ): Promise<void> {
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target: 'location',
          centerLat,
          centerLng,
          radiusKm,
          notification
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send location-based notification');
      }
    } catch (error) {
      console.error('Error sending location-based notification:', error);
      throw error;
    }
  }

  // Bildirim kampanyası oluştur
  async createCampaign(campaign: Omit<NotificationCampaign, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const campaignRef = await addDoc(collection(db, 'notification_campaigns'), {
        ...campaign,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });

      return campaignRef.id;
    } catch (error) {
      console.error('Error creating notification campaign:', error);
      throw error;
    }
  }

  // Kampanya gönder (API route üzerinden)
  async sendCampaign(campaignId: string): Promise<void> {
    try {
      const response = await fetch('/api/notifications/campaign', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ campaignId })
      });

      if (!response.ok) {
        throw new Error('Failed to send campaign');
      }
    } catch (error) {
      console.error('Error sending campaign:', error);
      throw error;
    }
  }

  // Kullanıcı bildirim tercihlerini getir
  async getUserPreferences(userId: string): Promise<UserNotificationPreferences> {
    try {
      const prefsRef = doc(db, 'user_notification_preferences', userId);
      const prefsDoc = await getDoc(prefsRef);
      
      if (prefsDoc.exists()) {
        return prefsDoc.data() as UserNotificationPreferences;
      }

      // Varsayılan tercihler oluştur
      const defaultPreferences: UserNotificationPreferences = {
        userId,
        enabled: true,
        channels: {
          push: true,
          email: true,
          sms: false,
          inApp: true
        },
        types: {
          [NotificationType.ORDER_STATUS_UPDATE]: true,
          [NotificationType.ORDER_CONFIRMED]: true,
          [NotificationType.ORDER_READY]: true,
          [NotificationType.ORDER_DELIVERED]: true,
          [NotificationType.ORDER_CANCELLED]: true,
          [NotificationType.PROMOTION]: true,
          [NotificationType.NEW_RESTAURANT]: true,
          [NotificationType.PRICE_DROP]: true,
          [NotificationType.REVIEW_RESPONSE]: true,
          [NotificationType.FRIEND_REQUEST]: true,
          [NotificationType.FOLLOW]: true,
          [NotificationType.LOYALTY_POINTS]: true,
          [NotificationType.SYSTEM_UPDATE]: true,
          [NotificationType.SECURITY_ALERT]: true,
          [NotificationType.CUSTOM]: true
        },
        quietHours: {
          enabled: false,
          startTime: '22:00',
          endTime: '08:00',
          timezone: 'Europe/Istanbul'
        },
        frequency: {
          maxPerDay: 50,
          maxPerHour: 5
        },
        createdAt: Timestamp.now() as any,
        updatedAt: Timestamp.now() as any
      };

      await setDoc(prefsRef, defaultPreferences);
      return defaultPreferences;
    } catch (error) {
      console.error('Error getting user preferences:', error);
      throw error;
    }
  }

  // Kullanıcı bildirim tercihlerini güncelle
  async updateUserPreferences(userId: string, preferences: Partial<UserNotificationPreferences>): Promise<void> {
    try {
      const prefsRef = doc(db, 'user_notification_preferences', userId);
      await updateDoc(prefsRef, {
        ...preferences,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating user preferences:', error);
      throw error;
    }
  }

  // Bildirim geçmişini getir
  async getNotificationHistory(userId: string, limit: number = 50): Promise<NotificationHistory> {
    try {
      const notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limit)
      );
      
      const snapshot = await getDocs(notificationsQuery);
      const notifications = snapshot.docs.map(doc => doc.data() as NotificationRecord);
      
      const unreadCount = notifications.filter(n => n.status !== NotificationStatus.READ).length;
      const preferences = await this.getUserPreferences(userId);

      return {
        userId,
        notifications,
        unreadCount,
        lastReadAt: preferences.lastReadAt,
        preferences
      };
    } catch (error) {
      console.error('Error getting notification history:', error);
      throw error;
    }
  }

  // Bildirimi okundu olarak işaretle
  async markAsRead(notificationId: string): Promise<void> {
    try {
      const notificationRef = doc(db, 'notifications', notificationId);
      await updateDoc(notificationRef, {
        status: NotificationStatus.READ,
        readAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      });
      } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  // Bildirim istatistiklerini getir (API route üzerinden)
  async getNotificationStats(period: 'day' | 'week' | 'month' = 'day'): Promise<NotificationStats> {
    try {
      const response = await fetch(`/api/notifications/stats?period=${period}`);
      
      if (!response.ok) {
        throw new Error('Failed to get notification stats');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting notification stats:', error);
      throw error;
    }
  }

  // Gerçek zamanlı bildirim dinleyicisi
  subscribeToNotifications(userId: string, callback: (notification: NotificationRecord) => void): () => void {
    const notificationsQuery = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    return onSnapshot(notificationsQuery, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const notification = change.doc.data() as NotificationRecord;
          callback(notification);
        }
      });
    });
  }
} 