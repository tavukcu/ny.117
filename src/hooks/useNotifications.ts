'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { ClientNotificationService } from '@/services/clientNotificationService';
import type { 
  NotificationSendRequest,
  NotificationRecord,
  UserNotificationPreferences,
  NotificationStats,
  NotificationCampaign,
  NotificationHistory
} from '@/types';

// Ana bildirim hook'u
export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<UserNotificationPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const notificationService = new ClientNotificationService();

  // Bildirim geçmişini yükle
  const loadNotificationHistory = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);
      
      const history = await notificationService.getNotificationHistory(user.uid);
      setNotifications(history.notifications);
      setUnreadCount(history.unreadCount);
      setPreferences(history.preferences);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bildirim geçmişi yüklenemedi');
      console.error('Error loading notification history:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Bildirim gönder
  const sendNotification = useCallback(async (notification: NotificationSendRequest) => {
    if (!user?.uid) throw new Error('Kullanıcı girişi gerekli');

    try {
      setError(null);
      return await notificationService.sendToUser(user.uid, notification);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bildirim gönderilemedi');
      throw err;
    }
  }, [user?.uid]);

  // Bildirimi okundu olarak işaretle
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      setError(null);
      await notificationService.markAsRead(notificationId);
      
      // Yerel state'i güncelle
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, status: 'read' as const, readAt: new Date() }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bildirim işaretlenemedi');
      throw err;
    }
  }, []);

  // Tercihleri güncelle
  const updatePreferences = useCallback(async (newPreferences: Partial<UserNotificationPreferences>) => {
    if (!user?.uid) throw new Error('Kullanıcı girişi gerekli');

    try {
      setError(null);
      await notificationService.updateUserPreferences(user.uid, newPreferences);
      
      if (preferences) {
        setPreferences({ ...preferences, ...newPreferences });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tercihler güncellenemedi');
      throw err;
    }
  }, [user?.uid, preferences]);

  // Gerçek zamanlı bildirim dinle
  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = notificationService.subscribeToNotifications(user.uid, (newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
      if (newNotification.status !== 'read') {
        setUnreadCount(prev => prev + 1);
      }
    });

    return unsubscribe;
  }, [user?.uid]);

  // İlk yükleme
  useEffect(() => {
    loadNotificationHistory();
  }, [loadNotificationHistory]);

  return {
    notifications,
    unreadCount,
    preferences,
    loading,
    error,
    sendNotification,
    markAsRead,
    updatePreferences,
    refresh: loadNotificationHistory
  };
}

// Admin bildirim hook'u
export function useAdminNotifications() {
  const { user } = useAuth();
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const notificationService = new ClientNotificationService();

  // İstatistikleri yükle
  const loadStats = useCallback(async (period: 'day' | 'week' | 'month' = 'day') => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);
      
      const statsData = await notificationService.getNotificationStats(period);
      setStats(statsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'İstatistikler yüklenemedi');
      console.error('Error loading notification stats:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Çoklu kullanıcıya bildirim gönder
  const sendToMultipleUsers = useCallback(async (userIds: string[], notification: NotificationSendRequest) => {
    try {
      setError(null);
      return await notificationService.sendToMultipleUsers(userIds, notification);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bildirimler gönderilemedi');
      throw err;
    }
  }, []);

  // Tüm kullanıcılara bildirim gönder
  const sendToAllUsers = useCallback(async (notification: NotificationSendRequest) => {
    try {
      setError(null);
      await notificationService.sendToAllUsers(notification);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bildirimler gönderilemedi');
      throw err;
    }
  }, []);

  // Kampanya oluştur
  const createCampaign = useCallback(async (campaign: Omit<NotificationCampaign, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null);
      return await notificationService.createCampaign(campaign);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kampanya oluşturulamadı');
      throw err;
    }
  }, []);

  // Kampanya gönder
  const sendCampaign = useCallback(async (campaignId: string) => {
    try {
      setError(null);
      await notificationService.sendCampaign(campaignId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Kampanya gönderilemedi');
      throw err;
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return {
    stats,
    loading,
    error,
    loadStats,
    sendToMultipleUsers,
    sendToAllUsers,
    createCampaign,
    sendCampaign
  };
}

// Restoran bildirim hook'u
export function useRestaurantNotifications(restaurantId?: string) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const notificationService = new ClientNotificationService();

  // Restoran bildirimlerini yükle
  const loadRestaurantNotifications = useCallback(async () => {
    if (!user?.uid || !restaurantId) return;

    try {
      setLoading(true);
      setError(null);
      
      // Restoran bildirimlerini filtrele
      const history = await notificationService.getNotificationHistory(user.uid, 100);
      const restaurantNotifications = history.notifications.filter(
        n => n.metadata?.restaurantId === restaurantId
      );
      setNotifications(restaurantNotifications);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Restoran bildirimleri yüklenemedi');
      console.error('Error loading restaurant notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.uid, restaurantId]);

  // Restoran müşterilerine bildirim gönder
  const sendToRestaurantCustomers = useCallback(async (notification: NotificationSendRequest) => {
    if (!restaurantId) throw new Error('Restoran ID gerekli');

    try {
      setError(null);
      // Bu işlem API route üzerinden yapılacak
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          target: 'restaurant_customers',
          restaurantId,
          notification
        })
      });

      if (!response.ok) {
        throw new Error('Bildirim gönderilemedi');
      }

      return await response.json();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bildirim gönderilemedi');
      throw err;
    }
  }, [restaurantId]);

  useEffect(() => {
    loadRestaurantNotifications();
  }, [loadRestaurantNotifications]);

  return {
    notifications,
    loading,
    error,
    sendToRestaurantCustomers,
    refresh: loadRestaurantNotifications
  };
}

// Kullanıcı bildirim hook'u (basit)
export function useUserNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationRecord[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const notificationService = new ClientNotificationService();

  // Bildirimleri yükle
  const loadNotifications = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const history = await notificationService.getNotificationHistory(user.uid, 20);
      setNotifications(history.notifications);
      setUnreadCount(history.unreadCount);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  // Bildirimi okundu olarak işaretle
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
    setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId 
            ? { ...n, status: 'read' as const, readAt: new Date() }
            : n
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    refresh: loadNotifications
  };
} 