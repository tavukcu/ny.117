'use client';

import { useState } from 'react';
import { Clock, MapPin, Star } from 'lucide-react';
import Link from 'next/link';

interface Order {
  id: string;
  orderNumber: string;
  restaurantName: string;
  total: number;
  status: 'pending' | 'preparing' | 'delivering' | 'completed' | 'cancelled';
  createdAt: Date;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export default function ProfileOrderHistory() {
  const [orders, setOrders] = useState<Order[]>([
    {
      id: '1',
      orderNumber: '#12345',
      restaurantName: 'Pizza Palace',
      total: 85.50,
      status: 'completed',
      createdAt: new Date('2024-01-15'),
      items: [
        { name: 'Margherita Pizza', quantity: 1, price: 45.00 },
        { name: 'Coca Cola', quantity: 2, price: 20.25 }
      ]
    },
    {
      id: '2',
      orderNumber: '#12344',
      restaurantName: 'Burger House',
      total: 65.00,
      status: 'delivering',
      createdAt: new Date('2024-01-14'),
      items: [
        { name: 'Classic Burger', quantity: 2, price: 32.50 }
      ]
    }
  ]);

  const getStatusText = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'Beklemede';
      case 'preparing': return 'Hazırlanıyor';
      case 'delivering': return 'Yolda';
      case 'completed': return 'Tamamlandı';
      case 'cancelled': return 'İptal Edildi';
      default: return status;
    }
  };

  const getStatusColor = (status: Order['status']) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'delivering': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Sipariş Geçmişim</h3>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order.id} className="card p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">{order.orderNumber}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
                <p className="text-gray-600">{order.restaurantName}</p>
                <p className="text-gray-500 text-sm">
                  {order.createdAt.toLocaleDateString('tr-TR')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-gray-900">₺{order.total.toFixed(2)}</p>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <div className="space-y-1 mb-3">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>{item.quantity}x {item.name}</span>
                    <span>₺{item.price.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/orders/${order.id}`}
                  className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                >
                  Detayları Gör
                </Link>
                {order.status === 'completed' && (
                  <button className="text-gray-600 hover:text-gray-800 text-sm flex items-center gap-1">
                    <Star className="h-4 w-4" />
                    Değerlendir
                  </button>
                )}
                {order.status === 'delivering' && (
                  <Link
                    href={`/orders/${order.id}/track`}
                    className="text-primary-600 hover:text-primary-800 text-sm flex items-center gap-1"
                  >
                    <MapPin className="h-4 w-4" />
                    Takip Et
                  </Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {orders.length === 0 && (
        <div className="text-center py-8">
          <Clock className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Henüz sipariş geçmişi yok</p>
        </div>
      )}
    </div>
  );
} 