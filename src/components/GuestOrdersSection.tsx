'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  Package,
  Clock,
  CheckCircle,
  Truck,
  AlertCircle,
  Eye,
  Search,
  Phone,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { OrderStatus } from '@/types';

interface GuestOrder {
  id: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  phone: string;
  items: Array<{
    product: { name: string };
    quantity: number;
  }>;
}

export default function GuestOrdersSection() {
  const { guestUser } = useAuth();
  const router = useRouter();
  const [guestOrders, setGuestOrders] = useState<GuestOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGuestOrders();
  }, [guestUser]);

  // Misafir kullanıcı siparişlerini localStorage'dan yükle
  const loadGuestOrders = () => {
    try {
      const storedOrders = localStorage.getItem('guestOrders');
      if (storedOrders) {
        const orders = JSON.parse(storedOrders);
        // Sadece bu misafir kullanıcının siparişlerini filtrele
        const userOrders = orders.filter((order: GuestOrder) => 
          guestUser && order.phone === guestUser.phone
        );
        setGuestOrders(userOrders);
      }
    } catch (error) {
      console.error('Misafir siparişleri yüklenirken hata:', error);
    } finally {
      setLoading(false);
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

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-8 h-8 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Siparişleriniz yükleniyor...</p>
      </div>
    );
  }

  if (guestOrders.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Henüz Siparişiniz Yok
        </h3>
        <p className="text-gray-500 mb-6">
          Misafir olarak verdiğiniz siparişler burada görünecek
        </p>
        <div className="space-y-3">
          <Link
            href="/orders/track"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            <Search className="h-4 w-4" />
            Sipariş Takip Et
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 ml-2"
          >
            <Package className="h-4 w-4" />
            Sipariş Ver
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Başlık */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          Misafir Siparişlerim
        </h3>
        <Link
          href="/orders/track"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          <Search className="h-4 w-4" />
          Sipariş Takip Et
        </Link>
      </div>

      {/* Bilgi Kutusu */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <p className="text-sm text-blue-800">
              Misafir kullanıcı olarak verdiğiniz siparişler sadece bu cihazda görünür. 
              Detaylı takip için sipariş numarası ve telefon numaranızı kullanın.
            </p>
          </div>
        </div>
      </div>

      {/* Siparişler Listesi */}
      <div className="space-y-4">
        {guestOrders.map((order) => (
          <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-1">
                  Sipariş #{order.id.slice(-8)}
                </h4>
                <p className="text-sm text-gray-600">
                  {new Date(order.createdAt).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                {getStatusText(order.status)}
              </span>
            </div>

            <div className="flex items-center gap-4 mb-4">
              {getStatusIcon(order.status)}
              <div className="flex-1">
                <p className="text-sm text-gray-600">
                  {order.items.length} ürün • ₺{order.total.toFixed(2)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {order.items.map(item => `${item.quantity}x ${item.product.name}`).join(', ')}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-gray-100">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                {order.phone}
              </div>
              <Link
                href={`/orders/track`}
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                <Eye className="h-4 w-4" />
                Detaylı Takip
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Alt Bilgi */}
      <div className="text-center pt-6 border-t border-gray-200">
        <p className="text-sm text-gray-600 mb-4">
          Daha fazla özellik için hesap oluşturun
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200"
        >
          Hesap Oluştur
        </Link>
      </div>
    </div>
  );
} 