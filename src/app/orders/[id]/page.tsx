'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { OrderTrackingService } from '@/services/orderTrackingService';
import { OrderService } from '@/services/orderService';
import type { Order, OrderTracking, OrderStatus, DeliveryDriver } from '@/types';
import Header from '@/components/Header';
import { 
  Clock,
  MapPin,
  Phone, 
  MessageSquare, 
  Truck, 
  CheckCircle,
  AlertCircle,
  Navigation,
  Star,
  User,
  Car,
  Bike,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';
import OrderTrackingMap from '@/components/OrderTrackingMap';
import OrderStatusTimeline from '@/components/OrderStatusTimeline';
import DriverInfo from '@/components/DriverInfo';
import { sendOrderStatus } from '@/lib/whatsapp';

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.id as string;
  const { user, guestUser } = useAuth();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [tracking, setTracking] = useState<OrderTracking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!orderId) return;

    // İlk yükleme
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        
        // Sipariş bilgilerini yükle
        const orderData = await OrderService.getOrder(orderId);
        if (!orderData) {
          setError('Sipariş bulunamadı');
          setIsLoading(false);
          return;
        }

        // Güvenlik kontrolü: Sipariş müşteriye ait mi?
        const currentUserId = user?.uid || guestUser?.id;
        if (orderData.userId !== currentUserId && !user?.isAdmin) {
          setError('Bu siparişi görüntüleme yetkiniz yok');
          setIsLoading(false);
          return;
        }

        setOrder(orderData);

        // Takip bilgilerini yükle
        const trackingData = await OrderTrackingService.getOrderTracking(orderId);
        setTracking(trackingData);

      } catch (error) {
        console.error('Sipariş yüklenirken hata:', error);
        setError('Sipariş bilgileri yüklenirken hata oluştu');
        toast.error('Sipariş bilgileri yüklenemedi');
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();

    // Real-time Order dinleme (Firestore onSnapshot)
    const orderRef = doc(db, 'orders', orderId);
    const unsubscribeOrder = onSnapshot(
      orderRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setError('Sipariş bulunamadı');
          return;
        }

        const data = snapshot.data();
        const orderData: Order = {
          id: snapshot.id,
          ...data,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          estimatedDeliveryTime: data.estimatedDeliveryTime?.toDate() || new Date(),
          actualDeliveryTime: data.actualDeliveryTime?.toDate(),
          statusHistory: data.statusHistory?.map((item: any) => ({
            ...item,
            at: item.at?.toDate ? item.at.toDate() : item.at
          })) || []
        } as Order;

        // Güvenlik kontrolü
        const currentUserId = user?.uid || guestUser?.id;
        if (orderData.userId !== currentUserId && !user?.isAdmin) {
          setError('Bu siparişi görüntüleme yetkiniz yok');
          return;
        }

        // Önceki durumla karşılaştır ve bildirim göster
        if (order && order.status !== orderData.status) {
          const statusLabels: Record<OrderStatus, string> = {
            [OrderStatus.PENDING]: 'Onay Bekliyor',
            [OrderStatus.CONFIRMED]: 'Sipariş Onaylandı',
            [OrderStatus.PREPARING]: 'Hazırlanıyor',
            [OrderStatus.READY]: 'Hazır',
            [OrderStatus.ASSIGNED]: 'Kurye Atandı',
            [OrderStatus.PICKED_UP]: 'Kurye Aldı',
            [OrderStatus.DELIVERING]: 'Yolda',
            [OrderStatus.ARRIVED]: 'Adrese Vardı',
            [OrderStatus.DELIVERED]: 'Teslim Edildi',
            [OrderStatus.CANCELLED]: 'İptal Edildi',
            [OrderStatus.REFUNDED]: 'İade Edildi'
          };
          
          const statusMessage = statusLabels[orderData.status] || orderData.status;
          toast.success(`Sipariş durumu güncellendi: ${statusMessage}`);

          const phoneNumber =
            orderData.deliveryAddress?.phone ||
            orderData.user?.phoneNumber ||
            '';
          if (phoneNumber) {
            void sendOrderStatus(phoneNumber, statusMessage).then((result) => {
              if (!result.success) {
                console.warn('WhatsApp bildirimi gönderilemedi:', result.error);
              }
            });
          }
        }

        setOrder(orderData);
      },
      (error) => {
        console.error('Real-time order dinleme hatası:', error);
        toast.error('Sipariş güncellemeleri alınamıyor');
      }
    );

    // Gerçek zamanlı takip aboneliği
    const unsubscribeTracking = OrderTrackingService.subscribeToOrderTracking(
      orderId,
      (trackingData) => {
        setTracking(trackingData);
        
        // Yeni durum güncellemesi varsa bildirim göster
        if (trackingData.statusUpdates.length > 0) {
          const latestUpdate = trackingData.statusUpdates[trackingData.statusUpdates.length - 1];
          toast.success(latestUpdate.description);
        }
      }
    );

    return () => {
      unsubscribeOrder();
      unsubscribeTracking();
    };
  }, [orderId, user, guestUser]);

  const handleCallDriver = async () => {
    if (!tracking?.driver?.phone) {
      toast.error('Teslimatçı telefon numarası bulunamadı');
      return;
    }

    try {
      await OrderTrackingService.addCustomerInteraction(
        orderId,
        'call_driver',
        'Müşteri teslimatçıyı aradı'
      );
      
      // Telefon uygulamasını aç
      window.location.href = `tel:${tracking.driver.phone}`;
      toast.success('Teslimatçı aranıyor...');
    } catch (error) {
      toast.error('Arama başlatılamadı');
    }
  };

  const handleCallRestaurant = async () => {
    if (!order?.restaurant?.phone) {
      toast.error('Restoran telefon numarası bulunamadı');
      return;
    }

    try {
      await OrderTrackingService.addCustomerInteraction(
        orderId,
        'call_restaurant',
        'Müşteri restoranı aradı'
      );
      
      window.location.href = `tel:${order.restaurant.phone}`;
      toast.success('Restoran aranıyor...');
    } catch (error) {
      toast.error('Arama başlatılamadı');
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    const colors: Record<OrderStatus, string> = {
      PENDING: 'text-yellow-600 bg-yellow-50',
      CONFIRMED: 'text-blue-600 bg-blue-50',
      PREPARING: 'text-orange-600 bg-orange-50',
      READY: 'text-purple-600 bg-purple-50',
      ASSIGNED: 'text-indigo-600 bg-indigo-50',
      PICKED_UP: 'text-green-600 bg-green-50',
      DELIVERING: 'text-green-600 bg-green-50',
      ARRIVED: 'text-green-600 bg-green-50',
      DELIVERED: 'text-green-600 bg-green-50',
      CANCELLED: 'text-red-600 bg-red-50',
      REFUNDED: 'text-gray-600 bg-gray-50'
    };
    return colors[status] || 'text-gray-600 bg-gray-50';
  };

  const getStatusIcon = (status: OrderStatus) => {
    const icons: Record<OrderStatus, any> = {
      PENDING: Clock,
      CONFIRMED: CheckCircle,
      PREPARING: Zap,
      READY: CheckCircle,
      ASSIGNED: User,
      PICKED_UP: Truck,
      DELIVERING: Navigation,
      ARRIVED: MapPin,
      DELIVERED: CheckCircle,
      CANCELLED: AlertCircle,
      REFUNDED: AlertCircle
    };
    return icons[status] || Clock;
  };

  const getVehicleIcon = (vehicleType: string) => {
    switch (vehicleType) {
      case 'car': return Car;
      case 'motorcycle': return Motorcycle;
      case 'bicycle': return Bike;
      case 'scooter': return Motorcycle;
      default: return Car;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !order || !tracking) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Sipariş Bulunamadı</h1>
            <p className="text-gray-600 mb-6">{error || 'Sipariş bilgileri yüklenemedi'}</p>
            <button 
              onClick={() => window.history.back()}
              className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors"
            >
              Geri Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(tracking.status);
  const estimatedDeliveryTime = new Date(order.estimatedDeliveryTime);
  const isDelivered = tracking.status === 'DELIVERED';
  const isDelivering = tracking.status === 'DELIVERING' || tracking.status === 'ARRIVED';

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Sipariş Başlığı */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sipariş #{order.id.slice(-8)}</h1>
              <p className="text-gray-600">{order.restaurant.name}</p>
            </div>
            <div className={`px-4 py-2 rounded-full flex items-center gap-2 ${getStatusColor(tracking.status)}`}>
              <StatusIcon className="h-5 w-5" />
              <span className="font-medium">{tracking.status}</span>
            </div>
          </div>

          {/* Tahmini Teslimat Süresi */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              <span>Tahmini Teslimat: {estimatedDeliveryTime.toLocaleTimeString('tr-TR', { 
                hour: '2-digit', 
                minute: '2-digit' 
              })}</span>
                  </div>
            {tracking.driver?.estimatedArrival && (
              <div className="flex items-center gap-2">
                <Navigation className="h-4 w-4" />
                <span>Teslimatçı Tahmini: {new Date(tracking.driver.estimatedArrival).toLocaleTimeString('tr-TR', { 
                        hour: '2-digit',
                        minute: '2-digit'
                })}</span>
                        </div>
                      )}
                    </div>
                  </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sol Kolon - Harita ve Teslimatçı */}
          <div className="lg:col-span-2 space-y-6">
            {/* Harita */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Canlı Takip</h2>
              <OrderTrackingMap 
                order={order}
                tracking={tracking}
                driver={tracking.driver}
              />
                </div>

            {/* Teslimatçı Bilgileri */}
            {tracking.driver && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Teslimatçınız</h2>
                <DriverInfo driver={tracking.driver} />
                
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleCallDriver}
                    className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    Teslimatçıyı Ara
                  </button>
                  <button
                    onClick={handleCallRestaurant}
                    className="flex-1 bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Phone className="h-4 w-4" />
                    Restoranı Ara
                  </button>
                </div>
              </div>
                        )}
                      </div>

          {/* Sağ Kolon - Durum Zaman Çizelgesi ve Sipariş Detayları */}
          <div className="space-y-6">
            {/* Durum Zaman Çizelgesi */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Sipariş Durumu</h2>
              <OrderStatusTimeline tracking={tracking} />
              
              {/* Status History (Telegram'dan gelen güncellemeler) */}
              {order?.statusHistory && order.statusHistory.length > 0 && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Durum Geçmişi</h3>
                  <div className="space-y-3">
                    {order.statusHistory
                      .slice()
                      .reverse()
                      .map((historyItem, index) => {
                        const statusLabels: Record<OrderStatus, string> = {
                          [OrderStatus.PENDING]: 'Onay Bekliyor',
                          [OrderStatus.CONFIRMED]: 'Sipariş Onaylandı',
                          [OrderStatus.PREPARING]: 'Hazırlanıyor',
                          [OrderStatus.READY]: 'Hazır',
                          [OrderStatus.ASSIGNED]: 'Kurye Atandı',
                          [OrderStatus.PICKED_UP]: 'Kurye Aldı',
                          [OrderStatus.DELIVERING]: 'Yolda',
                          [OrderStatus.ARRIVED]: 'Adrese Vardı',
                          [OrderStatus.DELIVERED]: 'Teslim Edildi',
                          [OrderStatus.CANCELLED]: 'İptal Edildi',
                          [OrderStatus.REFUNDED]: 'İade Edildi'
                        };
                        
                        const statusColors: Record<OrderStatus, string> = {
                          [OrderStatus.PENDING]: 'bg-yellow-100 text-yellow-800',
                          [OrderStatus.CONFIRMED]: 'bg-blue-100 text-blue-800',
                          [OrderStatus.PREPARING]: 'bg-orange-100 text-orange-800',
                          [OrderStatus.READY]: 'bg-purple-100 text-purple-800',
                          [OrderStatus.ASSIGNED]: 'bg-indigo-100 text-indigo-800',
                          [OrderStatus.PICKED_UP]: 'bg-green-100 text-green-800',
                          [OrderStatus.DELIVERING]: 'bg-green-100 text-green-800',
                          [OrderStatus.ARRIVED]: 'bg-green-100 text-green-800',
                          [OrderStatus.DELIVERED]: 'bg-green-100 text-green-800',
                          [OrderStatus.CANCELLED]: 'bg-red-100 text-red-800',
                          [OrderStatus.REFUNDED]: 'bg-gray-100 text-gray-800'
                        };
                        
                        const historyDate = historyItem.at instanceof Date 
                          ? historyItem.at 
                          : historyItem.at?.toDate 
                          ? historyItem.at.toDate() 
                          : new Date();
                        
                        const updatedByText = historyItem.by.startsWith('telegram:')
                          ? 'Telegram Bot'
                          : historyItem.by.startsWith('restaurant:')
                          ? 'Restoran'
                          : historyItem.by.startsWith('admin:')
                          ? 'Admin'
                          : 'Sistem';
                        
                        return (
                          <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[historyItem.status]}`}>
                              {statusLabels[historyItem.status] || historyItem.status}
                            </div>
                            <div className="flex-1 text-sm text-gray-600">
                              {historyDate.toLocaleString('tr-TR', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </div>
                            <div className="text-xs text-gray-500">
                              {updatedByText}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              )}
            </div>

            {/* Sipariş Detayları */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Sipariş Detayları</h2>
              
              <div className="space-y-4">
                {/* Ürünler */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Sipariş Edilenler</h3>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-gray-600">
                          {item.quantity}x {item.product.name}
                          </span>
                        <span className="font-medium">₺{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>

                <hr />

                {/* Toplam */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Ara Toplam</span>
                    <span>₺{order.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Teslimat Ücreti</span>
                    <span>₺{order.deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg border-t pt-2">
                    <span>Toplam</span>
                    <span>₺{order.total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Ödeme Yöntemi */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Ödeme Yöntemi</h3>
                  <p className="text-sm text-gray-600">
                    {order.paymentMethod === 'CASH_ON_DELIVERY' ? 'Kapıda Nakit' : 'Kapıda Kredi Kartı'}
                  </p>
                </div>

                {/* Teslimat Adresi */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Teslimat Adresi</h3>
                  <p className="text-sm text-gray-600">
                    {order.deliveryAddress.street}<br />
                    {order.deliveryAddress.district}, {order.deliveryAddress.city}
                  </p>
                </div>

                {/* Özel Talimatlar */}
                {order.specialInstructions && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Özel Talimatlar</h3>
                    <p className="text-sm text-gray-600">{order.specialInstructions}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 