'use client';

import { useState } from 'react';
import type { OrderTracking, OrderStatus } from '@/types';
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Truck, 
  MapPin, 
  User, 
  Zap,
  Navigation,
  Phone,
  MessageSquare
} from 'lucide-react';

interface OrderStatusTimelineProps {
  tracking: OrderTracking;
}

export default function OrderStatusTimeline({ tracking }: OrderStatusTimelineProps) {
  const [expandedUpdates, setExpandedUpdates] = useState<Set<number>>(new Set());

  const toggleUpdate = (index: number) => {
    const newExpanded = new Set(expandedUpdates);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedUpdates(newExpanded);
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

  const getStatusColor = (status: OrderStatus, isCompleted: boolean) => {
    if (!isCompleted) {
      return 'text-gray-400 bg-gray-100';
    }

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

  const getStatusDescription = (status: OrderStatus): string => {
    const descriptions: Record<OrderStatus, string> = {
      PENDING: 'Siparişiniz alındı ve onay bekliyor',
      CONFIRMED: 'Siparişiniz restoran tarafından onaylandı',
      PREPARING: 'Yemeğiniz hazırlanıyor',
      READY: 'Yemeğiniz hazır, teslimatçı bekleniyor',
      ASSIGNED: 'Teslimatçınız atandı',
      PICKED_UP: 'Teslimatçınız yemeğinizi aldı',
      DELIVERING: 'Yemeğiniz yolda',
      ARRIVED: 'Teslimatçınız adresinize vardı',
      DELIVERED: 'Siparişiniz başarıyla teslim edildi',
      CANCELLED: 'Siparişiniz iptal edildi',
      REFUNDED: 'Siparişiniz iade edildi'
    };
    return descriptions[status];
  };

  const getUpdatedByText = (updatedBy: string): string => {
    const texts: Record<string, string> = {
      system: 'Sistem',
      restaurant: 'Restoran',
      driver: 'Teslimatçı',
      customer: 'Siz'
    };
    return texts[updatedBy] || updatedBy;
  };

  const getUpdatedByIcon = (updatedBy: string) => {
    switch (updatedBy) {
      case 'restaurant':
        return <MapPin className="h-3 w-3" />;
      case 'driver':
        return <Truck className="h-3 w-3" />;
      case 'customer':
        return <User className="h-3 w-3" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString('tr-TR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date): string => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Bugün';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Dün';
    } else {
      return date.toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short'
      });
    }
  };

  // Durum güncellemelerini sırala (en yeni en üstte)
  const sortedUpdates = [...tracking.statusUpdates].sort(
    (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
  );

  return (
    <div className="space-y-4">
      {/* Mevcut Durum */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              {(() => {
                const Icon = getStatusIcon(tracking.status);
                return <Icon className="h-5 w-5 text-white" />;
              })()}
            </div>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-green-900">
              {getStatusDescription(tracking.status)}
            </h3>
            <p className="text-sm text-green-700">
              Son güncelleme: {formatTime(tracking.statusUpdates[tracking.statusUpdates.length - 1]?.timestamp || new Date())}
            </p>
          </div>
        </div>
      </div>

      {/* Durum Geçmişi */}
      <div className="space-y-3">
        <h4 className="font-medium text-gray-900">Durum Geçmişi</h4>
        
        {sortedUpdates.map((update, index) => {
          const isExpanded = expandedUpdates.has(index);
          const isLatest = index === 0;
          const Icon = getStatusIcon(update.status);
          const isCompleted = true; // Geçmiş durumlar tamamlanmış sayılır

          return (
            <div key={index} className="relative">
              {/* Zaman çizelgesi çizgisi */}
              {index < sortedUpdates.length - 1 && (
                <div className="absolute left-5 top-10 w-0.5 h-8 bg-gray-200"></div>
              )}

              <div className="flex gap-3">
                {/* Durum ikonu */}
                <div className="flex-shrink-0">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    isLatest ? 'bg-green-500' : 'bg-gray-200'
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      isLatest ? 'text-white' : 'text-gray-500'
                    }`} />
                  </div>
                </div>

                {/* Durum detayları */}
                <div className="flex-1 min-w-0">
                  <div 
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      isLatest ? 'bg-green-50 border border-green-200' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => toggleUpdate(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h5 className={`font-medium ${
                          isLatest ? 'text-green-900' : 'text-gray-900'
                        }`}>
                          {update.description}
                        </h5>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">
                            {formatTime(update.timestamp)} • {formatDate(update.timestamp)}
                          </span>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            {getUpdatedByIcon(update.updatedBy)}
                            <span>{getUpdatedByText(update.updatedBy)}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Genişletme/daraltma ikonu */}
                      <button className="flex-shrink-0 ml-2">
                        <MessageSquare className={`h-4 w-4 ${
                          isLatest ? 'text-green-600' : 'text-gray-400'
                        }`} />
                      </button>
                    </div>

                    {/* Genişletilmiş detaylar */}
                    {isExpanded && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs font-medium text-gray-500">Durum:</span>
                            <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                              getStatusColor(update.status, isCompleted)
                            }`}>
                              {update.status}
                            </span>
                          </div>
                          
                          {update.metadata && Object.keys(update.metadata).length > 0 && (
                            <div>
                              <span className="text-xs font-medium text-gray-500">Detaylar:</span>
                              <div className="mt-1 text-xs text-gray-600">
                                {Object.entries(update.metadata).map(([key, value]) => (
                                  <div key={key} className="flex justify-between">
                                    <span className="capitalize">{key}:</span>
                                    <span>{String(value)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Müşteri Etkileşimleri */}
      {tracking.customerInteractions.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="font-medium text-gray-900">Müşteri Etkileşimleri</h4>
          
          {tracking.customerInteractions.map((interaction, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <Phone className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-blue-900">
                  {interaction.type === 'call_driver' && 'Teslimatçı Arandı'}
                  {interaction.type === 'call_restaurant' && 'Restoran Arandı'}
                  {interaction.type === 'cancel_request' && 'İptal Talebi'}
                  {interaction.type === 'modify_request' && 'Değişiklik Talebi'}
                </p>
                <p className="text-xs text-blue-700">
                  {formatTime(interaction.timestamp)} • {formatDate(interaction.timestamp)}
                </p>
                {interaction.notes && (
                  <p className="text-xs text-blue-600 mt-1">{interaction.notes}</p>
                )}
              </div>
              <div className="flex-shrink-0">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  interaction.status === 'approved' ? 'bg-green-100 text-green-800' :
                  interaction.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {interaction.status === 'approved' ? 'Onaylandı' :
                   interaction.status === 'rejected' ? 'Reddedildi' :
                   'Beklemede'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Bildirim Geçmişi */}
      {tracking.notifications.length > 0 && (
        <div className="mt-6 space-y-3">
          <h4 className="font-medium text-gray-900">Bildirim Geçmişi</h4>
          
          {tracking.notifications.map((notification, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  notification.sent ? 'bg-green-500' : 'bg-red-500'
                }`}>
                  {notification.sent ? (
                    <CheckCircle className="h-4 w-4 text-white" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-white" />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {notification.type === 'sms' && 'SMS Bildirimi'}
                  {notification.type === 'email' && 'E-posta Bildirimi'}
                  {notification.type === 'push' && 'Push Bildirimi'}
                  {notification.type === 'in_app' && 'Uygulama İçi Bildirim'}
                </p>
                <p className="text-xs text-gray-600">{notification.content}</p>
                <p className="text-xs text-gray-500">
                  {formatTime(notification.timestamp)} • {formatDate(notification.timestamp)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 