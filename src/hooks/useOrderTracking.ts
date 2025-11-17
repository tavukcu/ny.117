import { useState, useEffect, useCallback } from 'react';
import { OrderTrackingService } from '@/services/orderTrackingService';
import type { OrderTracking, OrderStatus, DeliveryDriver } from '@/types';
import toast from 'react-hot-toast';

interface UseOrderTrackingProps {
  orderId: string;
  autoSubscribe?: boolean;
}

interface UseOrderTrackingReturn {
  tracking: OrderTracking | null;
  isLoading: boolean;
  error: string | null;
  updateStatus: (
    status: OrderStatus,
    updatedBy: 'system' | 'restaurant' | 'driver' | 'customer',
    description?: string,
    metadata?: Record<string, any>
  ) => Promise<boolean>;
  assignDriver: (driver: DeliveryDriver) => Promise<boolean>;
  updateLocation: (
    lat: number,
    lng: number,
    status: OrderStatus,
    description?: string
  ) => Promise<boolean>;
  addInteraction: (
    type: 'call_driver' | 'call_restaurant' | 'cancel_request' | 'modify_request',
    notes?: string
  ) => Promise<boolean>;
  subscribe: () => () => void;
  unsubscribe: () => void;
  refresh: () => Promise<void>;
}

export function useOrderTracking({ 
  orderId, 
  autoSubscribe = true 
}: UseOrderTrackingProps): UseOrderTrackingReturn {
  const [tracking, setTracking] = useState<OrderTracking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unsubscribe, setUnsubscribe] = useState<(() => void) | null>(null);

  // Sipariş takip bilgilerini yükle
  const loadTracking = useCallback(async () => {
    if (!orderId) return;

    try {
      setIsLoading(true);
      setError(null);

      const trackingData = await OrderTrackingService.getOrderTracking(orderId);
      if (!trackingData) {
        setError('Takip bilgileri bulunamadı');
        return;
      }

      setTracking(trackingData);
    } catch (error) {
      console.error('Takip bilgileri yüklenirken hata:', error);
      setError('Takip bilgileri yüklenemedi');
      toast.error('Takip bilgileri yüklenemedi');
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  // Gerçek zamanlı abonelik
  const subscribe = useCallback(() => {
    if (!orderId) return () => {};

    const unsubscribeFn = OrderTrackingService.subscribeToOrderTracking(
      orderId,
      (trackingData) => {
        setTracking(trackingData);
        setError(null);

        // Yeni durum güncellemesi varsa bildirim göster
        if (trackingData.statusUpdates.length > 0) {
          const latestUpdate = trackingData.statusUpdates[trackingData.statusUpdates.length - 1];
          
          // Sadece son 5 saniye içindeki güncellemeleri göster
          const fiveSecondsAgo = new Date(Date.now() - 5000);
          if (latestUpdate.timestamp > fiveSecondsAgo) {
            toast.success(latestUpdate.description, {
              duration: 4000,
              position: 'top-right'
            });
          }
        }
      }
    );

    setUnsubscribe(() => unsubscribeFn);
    return unsubscribeFn;
  }, [orderId]);

  // Aboneliği iptal et
  const unsubscribeFn = useCallback(() => {
    if (unsubscribe) {
      unsubscribe();
      setUnsubscribe(null);
    }
  }, [unsubscribe]);

  // Durum güncelleme
  const updateStatus = useCallback(async (
    status: OrderStatus,
    updatedBy: 'system' | 'restaurant' | 'driver' | 'customer',
    description?: string,
    metadata?: Record<string, any>
  ): Promise<boolean> => {
    if (!orderId) return false;

    try {
      const success = await OrderTrackingService.updateOrderStatus(
        orderId,
        status,
        updatedBy,
        description,
        metadata
      );

      if (success) {
        toast.success('Durum güncellendi');
      } else {
        toast.error('Durum güncellenemedi');
      }

      return success;
    } catch (error) {
      console.error('Durum güncelleme hatası:', error);
      toast.error('Durum güncellenirken hata oluştu');
      return false;
    }
  }, [orderId]);

  // Teslimatçı atama
  const assignDriver = useCallback(async (driver: DeliveryDriver): Promise<boolean> => {
    if (!orderId) return false;

    try {
      const success = await OrderTrackingService.assignDriver(orderId, driver);

      if (success) {
        toast.success('Teslimatçı atandı');
      } else {
        toast.error('Teslimatçı atanamadı');
      }

      return success;
    } catch (error) {
      console.error('Teslimatçı atama hatası:', error);
      toast.error('Teslimatçı atanırken hata oluştu');
      return false;
    }
  }, [orderId]);

  // Konum güncelleme
  const updateLocation = useCallback(async (
    lat: number,
    lng: number,
    status: OrderStatus,
    description?: string
  ): Promise<boolean> => {
    if (!orderId) return false;

    try {
      const success = await OrderTrackingService.updateLocation(
        orderId,
        lat,
        lng,
        status,
        description
      );

      return success;
    } catch (error) {
      console.error('Konum güncelleme hatası:', error);
      return false;
    }
  }, [orderId]);

  // Müşteri etkileşimi ekleme
  const addInteraction = useCallback(async (
    type: 'call_driver' | 'call_restaurant' | 'cancel_request' | 'modify_request',
    notes?: string
  ): Promise<boolean> => {
    if (!orderId) return false;

    try {
      const success = await OrderTrackingService.addCustomerInteraction(
        orderId,
        type,
        notes
      );

      if (success) {
        const interactionText = {
          call_driver: 'Teslimatçı arama talebi gönderildi',
          call_restaurant: 'Restoran arama talebi gönderildi',
          cancel_request: 'İptal talebi gönderildi',
          modify_request: 'Değişiklik talebi gönderildi'
        };

        toast.success(interactionText[type]);
      } else {
        toast.error('Talep gönderilemedi');
      }

      return success;
    } catch (error) {
      console.error('Etkileşim ekleme hatası:', error);
      toast.error('Talep gönderilirken hata oluştu');
      return false;
    }
  }, [orderId]);

  // Verileri yenile
  const refresh = useCallback(async () => {
    await loadTracking();
  }, [loadTracking]);

  // İlk yükleme
  useEffect(() => {
    loadTracking();
  }, [loadTracking]);

  // Otomatik abonelik
  useEffect(() => {
    if (autoSubscribe && orderId) {
      const unsubscribeFn = subscribe();
      return () => unsubscribeFn();
    }
  }, [autoSubscribe, orderId, subscribe]);

  // Temizlik
  useEffect(() => {
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [unsubscribe]);

  return {
    tracking,
    isLoading,
    error,
    updateStatus,
    assignDriver,
    updateLocation,
    addInteraction,
    subscribe,
    unsubscribe: unsubscribeFn,
    refresh
  };
} 