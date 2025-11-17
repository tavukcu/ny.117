'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
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

export default function OrderTrackingPage() {
  const params = useParams();
  const orderId = params.id as string;
  
  const [order, setOrder] = useState<Order | null>(null);
  const [tracking, setTracking] = useState<OrderTracking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
      if (!orderId) return;

    const loadOrderData = async () => {
      try {
        setIsLoading(true);
        
        // Sipariş bilgilerini yükle
        const orderData = await OrderService.getOrderById(orderId);
        if (!orderData) {
          setError('Sipariş bulunamadı');
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

    loadOrderData();

    // Gerçek zamanlı takip aboneliği
    const unsubscribe = OrderTrackingService.subscribeToOrderTracking(
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

    return () => unsubscribe();
  }, [orderId]);

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