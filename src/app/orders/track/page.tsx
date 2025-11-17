'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { 
  Search,
  Phone,
  Package,
  Clock,
  CheckCircle,
  Truck,
  MapPin,
  AlertCircle,
  Eye,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import type { Order } from '@/types';
import { OrderStatus } from '@/types';

// Misafir sipariş takip sayfası
export default function OrderTrackingPage() {
  const router = useRouter();
  const { user, guestUser } = useAuth();
  const [orderId, setOrderId] = useState('');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sipariş sorgulama
  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!orderId.trim() || !phone.trim()) {
      toast.error('Lütfen sipariş numarası ve telefon numarası girin');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/orders/track?orderId=${orderId}&phone=${phone}`);
      const result = await response.json();

      if (result.success) {
        setOrder(result.order);
        toast.success('Sipariş bulundu!');
      } else {
        setError(result.error || 'Sipariş bulunamadı');
        toast.error(result.error || 'Sipariş bulunamadı');
      }
    } catch (error) {
      console.error('Sipariş takip hatası:', error);
      setError('Sipariş takip edilirken bir hata oluştu');
      toast.error('Sipariş takip edilirken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  // Sipariş durumu metni
  const getStatusText = (status: OrderStatus) => {
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
        return 'Bilinmiyor';
    }
  };

  // Sipariş durumu ikonu
  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return <Clock className="h-5 w-5 text-yellow-500" />;
      case OrderStatus.CONFIRMED:
        return <CheckCircle className="h-5 w-5 text-blue-500" />;
      case OrderStatus.PREPARING:
        return <Package className="h-5 w-5 text-orange-500" />;
      case OrderStatus.READY:
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case OrderStatus.DELIVERING:
        return <Truck className="h-5 w-5 text-purple-500" />;
      case OrderStatus.DELIVERED:
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case OrderStatus.CANCELLED:
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  // Sipariş durumu rengi
  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.CONFIRMED:
        return 'bg-blue-100 text-blue-800';
      case OrderStatus.PREPARING:
        return 'bg-orange-100 text-orange-800';
      case OrderStatus.READY:
        return 'bg-green-100 text-green-800';
      case OrderStatus.DELIVERING:
        return 'bg-purple-100 text-purple-800';
      case OrderStatus.DELIVERED:
        return 'bg-green-100 text-green-800';
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Başlık */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors duration-200 mb-4">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Ana Sayfa</span>
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sipariş Takibi
          </h1>
          <p className="text-gray-600">
            Sipariş numarası ve telefon numarası ile siparişinizi takip edin
          </p>
        </div>

        {/* Sipariş Sorgulama Formu */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <form onSubmit={handleTrackOrder} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Sipariş Numarası */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sipariş Numarası
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    placeholder="Sipariş numaranızı girin"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Telefon Numarası */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefon Numarası
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="05XX XXX XX XX"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Sorgulama Butonu */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sipariş Aranıyor...
                </>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  Siparişi Takip Et
                </>
              )}
            </button>
          </form>
        </div>

        {/* Hata Mesajı */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Sipariş Detayları */}
        {order && (
          <div className="space-y-6">
            {/* Sipariş Durumu */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Sipariş Durumu
                </h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
              </div>

              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                {getStatusIcon(order.status)}
                <div>
                  <p className="font-medium text-gray-900">
                    {getStatusText(order.status)}
                  </p>
                  <p className="text-sm text-gray-600">
                    Son güncelleme: {new Date(order.updatedAt).toLocaleString('tr-TR')}
                  </p>
                </div>
              </div>
            </div>

            {/* Sipariş Bilgileri */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Sipariş Bilgileri
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Sipariş Numarası</p>
                  <p className="font-medium text-gray-900">{order.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Sipariş Tarihi</p>
                  <p className="font-medium text-gray-900">
                    {new Date(order.createdAt).toLocaleString('tr-TR')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Toplam Tutar</p>
                  <p className="font-medium text-gray-900">₺{order.total.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Ödeme Yöntemi</p>
                  <p className="font-medium text-gray-900">
                    {order.paymentMethod === 'cash_on_delivery' ? 'Kapıda Ödeme' : 'Kredi Kartı'}
                  </p>
                </div>
              </div>
            </div>

            {/* Teslimat Adresi */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-600" />
                Teslimat Adresi
              </h3>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-900">
                  {order.deliveryAddress.street}, {order.deliveryAddress.district}, {order.deliveryAddress.city}
                </p>
                {order.deliveryAddress.zipCode && (
                  <p className="text-sm text-gray-600 mt-1">
                    Posta Kodu: {order.deliveryAddress.zipCode}
                  </p>
                )}
              </div>
            </div>

            {/* Sipariş İçeriği */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Sipariş İçeriği
              </h3>
              
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4">
                      {item.product.imageUrl && (
                        <img 
                          src={item.product.imageUrl} 
                          alt={item.product.name}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      )}
                      <div>
                        <h4 className="font-medium text-gray-900">{item.product.name}</h4>
                        <p className="text-sm text-gray-600">Adet: {item.quantity}</p>
                        {item.specialInstructions && (
                          <p className="text-sm text-gray-500 mt-1">
                            Not: {item.specialInstructions}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ₺{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detaylı Görünüm Butonu */}
            <div className="text-center">
              <Link
                href={`/orders/${order.id}`}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors duration-200"
              >
                <Eye className="h-5 w-5" />
                Detaylı Görünüm
              </Link>
            </div>
          </div>
        )}

        {/* Bilgi Kutusu */}
        {!order && !error && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <h3 className="font-medium text-blue-900 mb-2">
                  Sipariş Takibi Hakkında
                </h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Sipariş numarası e-posta veya SMS ile size gönderilmiştir</li>
                  <li>• Telefon numarası sipariş verirken kullandığınız numara olmalıdır</li>
                  <li>• Sipariş durumu gerçek zamanlı olarak güncellenir</li>
                  <li>• Sorun yaşıyorsanız müşteri hizmetleri ile iletişime geçin</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 