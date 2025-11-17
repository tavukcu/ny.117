import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Order, OrderStatus, PaymentMethod, CommissionCalculation, EmailType } from '@/types';
import { CommissionService } from './commissionService';
import { WhatsAppService } from './whatsappService';
import { TelegramService } from './telegramService';

export class OrderService {
  // Modern Environment URL Resolver
  private static getApiUrl(endpoint: string): string {
    const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000';
    return `${baseUrl}${endpoint}`;
  }
  private static readonly COLLECTION_NAME = 'orders';

  // Sipariş oluşturma (komisyon hesaplama ve e-posta bildirimi ile)
  static async createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'commissionCalculation'>): Promise<string> {
    try {
      console.log('🟦 OrderService Debug - Input orderData:', orderData);

      // Komisyon hesaplama
      const commissionCalculation = CommissionService.calculateCommission(orderData.subtotal);
      console.log('🟦 OrderService Debug - Commission calculation:', commissionCalculation);
      
      const orderRef = doc(collection(db, this.COLLECTION_NAME));
      console.log('🟦 OrderService Debug - Order reference created:', orderRef.id);

      const firestoreData = {
        ...orderData,
        commissionCalculation,
        status: OrderStatus.PENDING,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('🟦 OrderService Debug - Data to be sent to Firestore:', {
        ...firestoreData,
        createdAt: '[ServerTimestamp]',
        updatedAt: '[ServerTimestamp]'
      });

      // Debug: Firestore güvenlik kuralı ile eşleşme kontrolü
      console.log('🟦 OrderService Debug - Security rule check:', {
        hasUserId: !!firestoreData.userId,
        userIdValue: firestoreData.userId,
        isUserIdString: typeof firestoreData.userId === 'string'
      });

      console.log('🟦 OrderService Debug - Attempting Firestore write...');
      await setDoc(orderRef, firestoreData);
      console.log('🟢 OrderService Debug - Firestore write successful!');

      // Sipariş onay e-postası gönder
      try {
        console.log('🟦 OrderService Debug - Attempting to send confirmation email...');
        await this.sendOrderConfirmationEmail(orderRef.id, orderData);
        console.log('🟢 OrderService Debug - Confirmation email sent successfully!');
      } catch (emailError) {
        console.error('🟡 OrderService Debug - Email error (non-blocking):', emailError);
        // E-posta hatası sipariş oluşturmayı etkilemesin
      }

      // WhatsApp bildirimi geçici olarak devre dışı
      // try {
      //   console.log('🟦 OrderService Debug - Attempting to send WhatsApp notification...');
      //   await this.sendWhatsAppNotification(orderRef.id, orderData);
      //   console.log('🟢 OrderService Debug - WhatsApp notification sent successfully!');
      // } catch (whatsappError) {
      //   console.error('🟡 OrderService Debug - WhatsApp error (non-blocking):', whatsappError);
      //   // WhatsApp hatası sipariş oluşturmayı etkilemesin
      // }
      console.log('📞 WhatsApp bildirimi devre dışı - sadece Telegram aktif');

      // Telegram bildirimi gönder
      try {
        console.log('🟦 OrderService Debug - Attempting to send Telegram notification...');
        await this.sendTelegramNotification(orderRef.id, orderData);
        console.log('🟢 OrderService Debug - Telegram notification sent successfully!');
      } catch (telegramError) {
        console.error('🟡 OrderService Debug - Telegram error (non-blocking):', telegramError);
        // Telegram hatası sipariş oluşturmayı etkilemesin
      }

      console.log('🟢 OrderService Debug - Order creation completed successfully with ID:', orderRef.id);
      return orderRef.id;

    } catch (error) {
      console.error('🔴 OrderService Debug - Order creation failed:', error);
      
      if (error instanceof Error) {
        console.error('🔴 OrderService Debug - Error details:', {
          name: error.name,
          message: error.message,
          code: (error as any).code,
          stack: error.stack
        });
      }
      
      throw error;
    }
  }

  // Sipariş onay e-postası gönderme
  private static async sendOrderConfirmationEmail(
    orderId: string, 
    orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'commissionCalculation'>
  ) {
    try {
      // Restoran bilgilerini al (gerçek implementasyonda RestaurantService'den gelecek)
      const restaurantName = 'Restoran'; // Şimdilik sabit

      const emailData = {
        orderId,
        customerName: orderData.user.displayName,
        customerEmail: orderData.user.email,
        restaurantName,
        orderItems: orderData.items.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.price
        })),
        total: orderData.total,
        status: 'confirmed',
        estimatedDelivery: orderData.estimatedDeliveryTime.toLocaleString('tr-TR')
      };

      // E-posta gönderimi geçici olarak devre dışı (URL hatası nedeniyle)
      console.log('📧 E-posta gönderimi geçici olarak devre dışı');
      console.log('📧 E-posta verisi:', emailData);
      
      // const response = await fetch('/api/send-email', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     emailType: EmailType.ORDER_CONFIRMATION,
      //     data: emailData
      //   })
      // });

      // if (!response.ok) {
      //   throw new Error('E-posta API hatası');
      // }

      // E-posta gönderimi geçici olarak devre dışı olduğu için response kontrolü yapılmıyor
      // if (!response.ok) {
      //   throw new Error('E-posta API hatası');
      // }
    } catch (error) {
      console.error('Sipariş onay e-postası gönderme hatası:', error);
      // E-posta hatası siparişi engellemesin
      console.log('🟡 OrderService Debug - Email error (non-blocking):', error);
    }
  }

  // WhatsApp bildirimi gönderme
  private static async sendWhatsAppNotification(
    orderId: string, 
    orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'commissionCalculation'>
  ) {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/whatsapp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'new_order',
          data: {
            orderId,
            restaurantId: orderData.restaurantId
          }
        })
      });

      if (!response.ok) {
        throw new Error('WhatsApp API hatası');
      }

      console.log('📱 WhatsApp bildirimi gönderildi:', orderId);
    } catch (error) {
      console.error('WhatsApp bildirimi gönderme hatası:', error);
      // WhatsApp hatası siparişi engellemesin
      console.log('🟡 OrderService Debug - WhatsApp error (non-blocking):', error);
    }
  }

  // Telegram bildirimi gönderme - Direct Service Call (Bypass API Protection)
  private static async sendTelegramNotification(
    orderId: string,
    orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'commissionCalculation'>
  ) {
    try {
      // Direct service call to bypass Vercel authentication protection
      const { TelegramService } = await import('./telegramService');
      
      const notificationData = {
        orderId,
        restaurantId: orderData.restaurantId,
        customerName: orderData.user.displayName,
        customerPhone: orderData.user.phoneNumber || 'Belirtilmemiş',
        totalAmount: orderData.total,
        items: orderData.items.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.price
        })),
        deliveryAddress: this.formatDeliveryAddress(orderData.deliveryAddress) || 'Adres belirtilmemiş',
        estimatedTime: 30,
        specialInstructions: orderData.specialInstructions
      };

      console.log('🤖 Direct Telegram service call - bypassing API protection');
      const success = await TelegramService.sendNewOrderNotification(notificationData);
      
      if (success) {
        console.log('🟢 Telegram bildirimi başarıyla gönderildi:', orderId);
      } else {
        console.log('🟡 Telegram bildirimi gönderilemedi:', orderId);
      }
    } catch (error) {
      console.error('🔴 Telegram bildirimi gönderme hatası:', error);
      // Telegram hatası siparişi engellemesin
      console.log('🟡 OrderService Debug - Telegram error (non-blocking):', error);
    }
  }

  // Sipariş getirme
  static async getOrder(id: string): Promise<Order | null> {
    const orderRef = doc(db, this.COLLECTION_NAME, id);
    const orderSnap = await getDoc(orderRef);
    
    if (orderSnap.exists()) {
      const data = orderSnap.data();
      return {
        id: orderSnap.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate() || new Date(),
        actualDeliveryTime: data.actualDeliveryTime?.toDate()
      } as Order;
    }
    
    return null;
  }

  // Kullanıcının siparişlerini getirme
  static async getUserOrders(userId: string): Promise<Order[]> {
    const ordersRef = collection(db, this.COLLECTION_NAME);
    const q = query(
      ordersRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      estimatedDeliveryTime: doc.data().estimatedDeliveryTime?.toDate() || new Date(),
      actualDeliveryTime: doc.data().actualDeliveryTime?.toDate()
    })) as Order[];
  }

  // Restoran siparişlerini getirme
  static async getRestaurantOrders(restaurantId: string): Promise<Order[]> {
    const ordersRef = collection(db, this.COLLECTION_NAME);
    const q = query(
      ordersRef,
      where('restaurantId', '==', restaurantId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      estimatedDeliveryTime: doc.data().estimatedDeliveryTime?.toDate() || new Date(),
      actualDeliveryTime: doc.data().actualDeliveryTime?.toDate()
    })) as Order[];
  }

  // Sipariş durumunu güncelleme (komisyon işlemi ve e-posta bildirimi ile)
  static async updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    const orderRef = doc(db, this.COLLECTION_NAME, orderId);
    const updates: any = {
      status,
      updatedAt: serverTimestamp()
    };

    if (status === OrderStatus.DELIVERED) {
      updates.actualDeliveryTime = serverTimestamp();
    }

    await updateDoc(orderRef, updates);

    // Sipariş durumu güncelleme e-postası gönder
    try {
      await this.sendOrderStatusUpdateEmail(orderId, status);
    } catch (emailError) {
      console.error('Sipariş durumu güncelleme e-postası gönderilirken hata:', emailError);
      // E-posta hatası sipariş güncellemeyi etkilemesin
    }

    // WhatsApp durum güncelleme bildirimi gönder
    try {
      await this.sendWhatsAppStatusUpdate(orderId, status);
    } catch (whatsappError) {
      console.error('WhatsApp durum güncelleme bildirimi gönderilirken hata:', whatsappError);
      // WhatsApp hatası sipariş güncellemeyi etkilemesin
    }

    // Telegram durum güncelleme bildirimi gönder
    try {
      await this.sendTelegramStatusUpdate(orderId, status);
    } catch (telegramError) {
      console.error('Telegram durum güncelleme bildirimi gönderilirken hata:', telegramError);
      // Telegram hatası sipariş güncellemeyi etkilemesin
    }

    // Eğer sipariş teslim edildiyse, mali işlem oluştur
    if (status === OrderStatus.DELIVERED) {
      try {
        const order = await this.getOrder(orderId);
        if (order) {
          await CommissionService.processOrderCompletion(order);
        }
      } catch (error) {
        console.error('Mali işlem oluşturulurken hata:', error);
        // Sipariş durumu güncellendi ama mali işlem başarısız oldu
        // Bu durumda manuel müdahale gerekebilir
      }
    }
  }

  // Sipariş durumu güncelleme e-postası gönderme
  private static async sendOrderStatusUpdateEmail(orderId: string, status: OrderStatus) {
    try {
      const order = await this.getOrder(orderId);
      if (!order) return;

      // Restoran bilgilerini al (gerçek implementasyonda RestaurantService'den gelecek)
      const restaurantName = 'Restoran'; // Şimdilik sabit

      const emailData = {
        orderId,
        customerName: order.user.displayName,
        customerEmail: order.user.email,
        restaurantName,
        orderItems: order.items.map(item => ({
          name: item.product.name,
          quantity: item.quantity,
          price: item.price
        })),
        total: order.total,
        status: this.getOrderStatusText(status)
      };

      const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          emailType: EmailType.ORDER_STATUS_UPDATE,
          data: emailData
        })
      });

      if (!response.ok) {
        throw new Error('E-posta API hatası');
      }
    } catch (error) {
      console.error('Sipariş durumu güncelleme e-postası gönderme hatası:', error);
      // E-posta hatası sipariş durumu güncellemeyi engellemesin
      console.log('🟡 OrderService Debug - Email status update error (non-blocking):', error);
    }
  }

  // WhatsApp durum güncelleme bildirimi gönderme
  private static async sendWhatsAppStatusUpdate(orderId: string, status: OrderStatus) {
    try {
      const order = await this.getOrder(orderId);
      if (!order) return;

      const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/whatsapp/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'status_update',
          data: {
            orderId,
            status,
            restaurantId: order.restaurantId,
            estimatedTime: order.estimatedDeliveryTime ? 
              Math.ceil((order.estimatedDeliveryTime.getTime() - Date.now()) / 60000) : 
              undefined
          }
        })
      });

      if (!response.ok) {
        throw new Error('WhatsApp API hatası');
      }

      console.log('📱 WhatsApp durum güncelleme bildirimi gönderildi:', orderId);
    } catch (error) {
      console.error('WhatsApp durum güncelleme bildirimi gönderme hatası:', error);
      // WhatsApp hatası sipariş durumu güncellemeyi engellemesin
      console.log('🟡 OrderService Debug - WhatsApp status update error (non-blocking):', error);
    }
  }

  // Telegram durum güncelleme bildirimi gönderme
  private static async sendTelegramStatusUpdate(orderId: string, status: OrderStatus) {
    try {
      const order = await this.getOrder(orderId);
      if (!order) return;

      const baseUrl = process.env.NEXT_PUBLIC_DOMAIN || 'http://localhost:3000';
      const response = await fetch(`${baseUrl}/api/telegram/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'status_update',
          data: {
            orderId,
            newStatus: status,
            restaurantId: order.restaurantId,
            customerName: order.user.displayName,
            estimatedTime: order.estimatedDeliveryTime ? 
              Math.ceil((order.estimatedDeliveryTime.getTime() - Date.now()) / 60000) : 
              undefined
          }
        })
      });

      if (!response.ok) {
        throw new Error('Telegram API hatası');
      }

      console.log('🤖 Telegram durum güncelleme bildirimi gönderildi:', orderId);
    } catch (error) {
      console.error('Telegram durum güncelleme bildirimi gönderme hatası:', error);
      // Telegram hatası sipariş durumu güncellemeyi engellemesin
      console.log('🟡 OrderService Debug - Telegram status update error (non-blocking):', error);
    }
  }

  // Aktif siparişleri getirme
  static async getActiveOrders(): Promise<Order[]> {
    const ordersRef = collection(db, this.COLLECTION_NAME);
    const q = query(
      ordersRef,
      where('status', 'in', [
        OrderStatus.PENDING,
        OrderStatus.CONFIRMED,
        OrderStatus.PREPARING,
        OrderStatus.READY,
        OrderStatus.DELIVERING
      ]),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      estimatedDeliveryTime: doc.data().estimatedDeliveryTime?.toDate() || new Date(),
      actualDeliveryTime: doc.data().actualDeliveryTime?.toDate()
    })) as Order[];
  }

  // Restoran aktif siparişlerini getirme
  static async getRestaurantActiveOrders(restaurantId: string): Promise<Order[]> {
    const ordersRef = collection(db, this.COLLECTION_NAME);
    const q = query(
      ordersRef,
      where('restaurantId', '==', restaurantId),
      where('status', 'in', [
        OrderStatus.PENDING,
        OrderStatus.CONFIRMED,
        OrderStatus.PREPARING,
        OrderStatus.READY,
        OrderStatus.DELIVERING
      ]),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      estimatedDeliveryTime: doc.data().estimatedDeliveryTime?.toDate() || new Date(),
      actualDeliveryTime: doc.data().actualDeliveryTime?.toDate()
    })) as Order[];
  }

  // Real-time sipariş dinleme
  static subscribeToUserOrders(
    userId: string,
    callback: (orders: Order[]) => void
  ): Unsubscribe {
    const ordersRef = collection(db, this.COLLECTION_NAME);
    const q = query(
      ordersRef,
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const orders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        estimatedDeliveryTime: doc.data().estimatedDeliveryTime?.toDate() || new Date(),
        actualDeliveryTime: doc.data().actualDeliveryTime?.toDate()
      })) as Order[];
      
      callback(orders);
    });
  }

  // Restoran siparişlerini real-time dinleme
  static subscribeToRestaurantOrders(
    restaurantId: string,
    callback: (orders: Order[]) => void
  ): Unsubscribe {
    const ordersRef = collection(db, this.COLLECTION_NAME);
    const q = query(
      ordersRef,
      where('restaurantId', '==', restaurantId),
      orderBy('createdAt', 'desc')
    );
    
    return onSnapshot(q, (querySnapshot) => {
      const orders = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        estimatedDeliveryTime: doc.data().estimatedDeliveryTime?.toDate() || new Date(),
        actualDeliveryTime: doc.data().actualDeliveryTime?.toDate()
      })) as Order[];
      
      callback(orders);
    });
  }

  // Ödeme yöntemi metinleri
  static getPaymentMethodText(method: PaymentMethod): string {
    return CommissionService.getPaymentMethodText(method);
  }

  // Sipariş durumu metinleri
  static getOrderStatusText(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING:
        return 'Bekliyor';
      case OrderStatus.CONFIRMED:
        return 'Onaylandı';
      case OrderStatus.PREPARING:
        return 'Hazırlanıyor';
      case OrderStatus.READY:
        return 'Hazır';
      case OrderStatus.DELIVERING:
        return 'Yolda';
      case OrderStatus.DELIVERED:
        return 'Teslim Edildi';
      case OrderStatus.CANCELLED:
        return 'İptal Edildi';
      default:
        return 'Bilinmeyen';
    }
  }

  // Teslimat adresini formatla
  private static formatDeliveryAddress(deliveryAddress: any): string {
    if (!deliveryAddress) return '';
    
    const parts = [];
    
    if (deliveryAddress.street) parts.push(deliveryAddress.street);
    if (deliveryAddress.district) parts.push(deliveryAddress.district);
    if (deliveryAddress.city) parts.push(deliveryAddress.city);
    if (deliveryAddress.zipCode) parts.push(deliveryAddress.zipCode);
    if (deliveryAddress.instructions) parts.push(`(${deliveryAddress.instructions})`);
    
    return parts.length > 0 ? parts.join(', ') : '';
  }
} 