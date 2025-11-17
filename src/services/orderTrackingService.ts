import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  onSnapshot,
  serverTimestamp,
  Timestamp 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { 
  Order, 
  OrderTracking, 
  OrderStatus, 
  DeliveryStatus, 
  DeliveryDriver,
  User 
} from '@/types';

export class OrderTrackingService {
  
  // Sipariş takip bilgilerini getir
  static async getOrderTracking(orderId: string): Promise<OrderTracking | null> {
    try {
      const orderDoc = await getDoc(doc(db, 'orders', orderId));
      if (!orderDoc.exists()) {
        return null;
      }
      
      const orderData = orderDoc.data();
      return orderData.tracking || null;
    } catch (error) {
      console.error('Sipariş takip bilgileri getirilemedi:', error);
      return null;
    }
  }

  // Sipariş durumunu güncelle
  static async updateOrderStatus(
    orderId: string, 
    status: OrderStatus, 
    updatedBy: 'system' | 'restaurant' | 'driver' | 'customer',
    description?: string,
    metadata?: Record<string, any>
  ): Promise<boolean> {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);
      
      if (!orderDoc.exists()) {
        throw new Error('Sipariş bulunamadı');
      }

      const orderData = orderDoc.data() as Order;
      const tracking = orderData.tracking || this.createInitialTracking(orderId);
      
      // Durum güncellemesi ekle
      const statusUpdate = {
        status,
        timestamp: new Date(),
        description: description || this.getStatusDescription(status),
        updatedBy,
        metadata
      };

      tracking.statusUpdates.push(statusUpdate);
      tracking.status = status;

      // Zaman damgasını güncelle
      const timestampKey = this.getTimestampKey(status);
      if (timestampKey) {
        tracking.timestamps[timestampKey] = new Date();
      }

      // Teslimat durumunu güncelle
      tracking.deliveryStatus = this.mapOrderStatusToDeliveryStatus(status);

      // Firestore'u güncelle
      await updateDoc(orderRef, {
        status,
        tracking,
        updatedAt: serverTimestamp()
      });

      // Bildirim gönder
      await this.sendStatusNotification(orderData, statusUpdate);

      return true;
    } catch (error) {
      console.error('Sipariş durumu güncellenemedi:', error);
      return false;
    }
  }

  // Teslimatçı atama
  static async assignDriver(
    orderId: string, 
    driver: DeliveryDriver
  ): Promise<boolean> {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);
      
      if (!orderDoc.exists()) {
        throw new Error('Sipariş bulunamadı');
      }

      const orderData = orderDoc.data() as Order;
      const tracking = orderData.tracking || this.createInitialTracking(orderId);
      
      tracking.driver = driver;
      tracking.deliveryStatus = DeliveryStatus.DRIVER_ASSIGNED;
      tracking.timestamps.driverAssigned = new Date();

      // Durum güncellemesi ekle
      tracking.statusUpdates.push({
        status: OrderStatus.ASSIGNED,
        timestamp: new Date(),
        description: `${driver.name} teslimatçınız atandı`,
        updatedBy: 'system',
        metadata: { driverId: driver.id }
      });

      await updateDoc(orderRef, {
        status: OrderStatus.ASSIGNED,
        tracking,
        updatedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Teslimatçı atanamadı:', error);
      return false;
    }
  }

  // Konum güncelleme
  static async updateLocation(
    orderId: string,
    lat: number,
    lng: number,
    status: OrderStatus,
    description?: string
  ): Promise<boolean> {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);
      
      if (!orderDoc.exists()) {
        throw new Error('Sipariş bulunamadı');
      }

      const orderData = orderDoc.data() as Order;
      const tracking = orderData.tracking || this.createInitialTracking(orderId);
      
      // Konum geçmişine ekle
      tracking.locationHistory.push({
        lat,
        lng,
        timestamp: new Date(),
        status,
        description
      });

      // Teslimatçı konumunu güncelle
      if (tracking.driver) {
        tracking.driver.currentLocation = {
          lat,
          lng,
          timestamp: new Date()
        };
      }

      await updateDoc(orderRef, {
        tracking,
        updatedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Konum güncellenemedi:', error);
      return false;
    }
  }

  // Gerçek zamanlı takip
  static subscribeToOrderTracking(
    orderId: string,
    callback: (tracking: OrderTracking) => void
  ): () => void {
    const orderRef = doc(db, 'orders', orderId);
    
    return onSnapshot(orderRef, (doc) => {
      if (doc.exists()) {
        const orderData = doc.data() as Order;
        const tracking = orderData.tracking || this.createInitialTracking(orderId);
        callback(tracking);
      }
    });
  }

  // Müşteri etkileşimi ekle
  static async addCustomerInteraction(
    orderId: string,
    type: 'call_driver' | 'call_restaurant' | 'cancel_request' | 'modify_request',
    notes?: string
  ): Promise<boolean> {
    try {
      const orderRef = doc(db, 'orders', orderId);
      const orderDoc = await getDoc(orderRef);
      
      if (!orderDoc.exists()) {
        throw new Error('Sipariş bulunamadı');
      }

      const orderData = orderDoc.data() as Order;
      const tracking = orderData.tracking || this.createInitialTracking(orderId);
      
      tracking.customerInteractions.push({
        type,
        timestamp: new Date(),
        status: 'pending',
        notes
      });

      await updateDoc(orderRef, {
        tracking,
        updatedAt: serverTimestamp()
      });

      return true;
    } catch (error) {
      console.error('Müşteri etkileşimi eklenemedi:', error);
      return false;
    }
  }

  // Tahmini teslimat süresini hesapla
  static calculateEstimatedDeliveryTime(
    preparationTime: number,
    distance: number,
    trafficFactor: number = 1.0
  ): number {
    const baseDeliveryTime = distance * 2; // km başına 2 dakika
    const totalTime = (preparationTime + baseDeliveryTime) * trafficFactor;
    return Math.round(totalTime);
  }

  // Gerçek süreleri hesapla
  static calculateActualTimes(tracking: OrderTracking): {
    preparation?: number;
    delivery?: number;
    total?: number;
  } {
    const timestamps = tracking.timestamps;
    const actualTimes: any = {};

    // Hazırlama süresi
    if (timestamps.confirmed && timestamps.ready) {
      actualTimes.preparation = Math.round(
        (timestamps.ready.getTime() - timestamps.confirmed.getTime()) / (1000 * 60)
      );
    }

    // Teslimat süresi
    if (timestamps.pickedUp && timestamps.delivered) {
      actualTimes.delivery = Math.round(
        (timestamps.delivered.getTime() - timestamps.pickedUp.getTime()) / (1000 * 60)
      );
    }

    // Toplam süre
    if (timestamps.orderPlaced && timestamps.delivered) {
      actualTimes.total = Math.round(
        (timestamps.delivered.getTime() - timestamps.orderPlaced.getTime()) / (1000 * 60)
      );
    }

    return actualTimes;
  }

  // Yardımcı metodlar
  private static createInitialTracking(orderId: string): OrderTracking {
    return {
      orderId,
      status: OrderStatus.PENDING,
      deliveryStatus: DeliveryStatus.NOT_STARTED,
      timestamps: {
        orderPlaced: new Date()
      },
      estimatedTimes: {
        preparation: 0,
        delivery: 0,
        total: 0
      },
      actualTimes: {},
      locationHistory: [],
      statusUpdates: [],
      notifications: [],
      customerInteractions: []
    };
  }

  private static getStatusDescription(status: OrderStatus): string {
    const descriptions: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'Siparişiniz alındı ve onay bekliyor',
      [OrderStatus.CONFIRMED]: 'Siparişiniz onaylandı',
      [OrderStatus.PREPARING]: 'Yemeğiniz hazırlanıyor',
      [OrderStatus.READY]: 'Yemeğiniz hazır, teslimatçı bekleniyor',
      [OrderStatus.ASSIGNED]: 'Teslimatçınız atandı',
      [OrderStatus.PICKED_UP]: 'Teslimatçınız yemeğinizi aldı',
      [OrderStatus.DELIVERING]: 'Yemeğiniz yolda',
      [OrderStatus.ARRIVED]: 'Teslimatçınız adresinize vardı',
      [OrderStatus.DELIVERED]: 'Siparişiniz teslim edildi',
      [OrderStatus.CANCELLED]: 'Siparişiniz iptal edildi',
      [OrderStatus.REFUNDED]: 'Siparişiniz iade edildi'
    };
    return descriptions[status];
  }

  private static getTimestampKey(status: OrderStatus): keyof OrderTracking['timestamps'] | null {
    const timestampKeys: Record<OrderStatus, keyof OrderTracking['timestamps']> = {
      [OrderStatus.CONFIRMED]: 'confirmed',
      [OrderStatus.PREPARING]: 'preparing',
      [OrderStatus.READY]: 'ready',
      [OrderStatus.ASSIGNED]: 'driverAssigned',
      [OrderStatus.PICKED_UP]: 'pickedUp',
      [OrderStatus.DELIVERING]: 'delivering',
      [OrderStatus.ARRIVED]: 'arrived',
      [OrderStatus.DELIVERED]: 'delivered',
      [OrderStatus.CANCELLED]: 'cancelled'
    };
    return timestampKeys[status] || null;
  }

  private static mapOrderStatusToDeliveryStatus(status: OrderStatus): DeliveryStatus {
    const mapping: Record<OrderStatus, DeliveryStatus> = {
      [OrderStatus.PENDING]: DeliveryStatus.NOT_STARTED,
      [OrderStatus.CONFIRMED]: DeliveryStatus.NOT_STARTED,
      [OrderStatus.PREPARING]: DeliveryStatus.NOT_STARTED,
      [OrderStatus.READY]: DeliveryStatus.ASSIGNING_DRIVER,
      [OrderStatus.ASSIGNED]: DeliveryStatus.DRIVER_ASSIGNED,
      [OrderStatus.PICKED_UP]: DeliveryStatus.DRIVER_ON_WAY,
      [OrderStatus.DELIVERING]: DeliveryStatus.DRIVER_ON_WAY,
      [OrderStatus.ARRIVED]: DeliveryStatus.DRIVER_ARRIVED,
      [OrderStatus.DELIVERED]: DeliveryStatus.DELIVERED,
      [OrderStatus.CANCELLED]: DeliveryStatus.FAILED,
      [OrderStatus.REFUNDED]: DeliveryStatus.FAILED
    };
    return mapping[status];
  }

  private static async sendStatusNotification(
    order: Order,
    statusUpdate: OrderTracking['statusUpdates'][0]
  ): Promise<void> {
    try {
      // Bildirim kaydı ekle
      const notification = {
        type: 'in_app' as const,
        sent: true,
        timestamp: new Date(),
        content: statusUpdate.description
      };

      // Push notification gönder (Firebase Cloud Messaging)
      if (order.user.phoneNumber) {
        // SMS gönder
        await this.sendSMSNotification(order.user.phoneNumber, statusUpdate.description);
      }

      // E-posta gönder
      if (order.user.email) {
        await this.sendEmailNotification(order.user.email, order, statusUpdate);
      }

    } catch (error) {
      console.error('Bildirim gönderilemedi:', error);
    }
  }

  private static async sendSMSNotification(phoneNumber: string, message: string): Promise<void> {
    // SMS servisi entegrasyonu burada yapılacak
    console.log(`SMS gönderildi: ${phoneNumber} - ${message}`);
  }

  private static async sendEmailNotification(
    email: string,
    order: Order,
    statusUpdate: OrderTracking['statusUpdates'][0]
  ): Promise<void> {
    // E-posta servisi entegrasyonu burada yapılacak
    console.log(`E-posta gönderildi: ${email} - ${statusUpdate.description}`);
  }
} 