'use client';

import { useState, useEffect } from 'react';
import { useNotifications } from '@/hooks/useNotifications';
import { 
  Bell, 
  BellOff, 
  Settings, 
  Check, 
  X, 
  Trash2, 
  MoreVertical,
  Clock,
  Star,
  AlertCircle,
  ShoppingBag,
  Truck,
  Gift,
  MessageSquare,
  UserPlus,
  TrendingUp,
  Shield,
  Zap
} from 'lucide-react';
import type { NotificationType, NotificationRecord } from '@/types';

export default function NotificationCenter() {
  const {
    isSupported,
    permission,
    isSubscribed,
    notificationHistory,
    preferences,
    unreadCount,
    isLoading,
    requestPermission,
    subscribeToNotifications,
    unsubscribeFromNotifications,
    markAsRead,
    markAllAsRead,
    sendTestNotification
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'unread' | 'settings'>('all');
  const [selectedNotification, setSelectedNotification] = useState<NotificationRecord | null>(null);

  // Bildirim türü ikonunu getir
  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case 'order_status_update':
      case 'order_confirmed':
      case 'order_ready':
      case 'order_delivered':
      case 'order_cancelled':
        return <ShoppingBag className="h-5 w-5 text-blue-500" />;
      case 'promotion':
        return <Gift className="h-5 w-5 text-purple-500" />;
      case 'new_restaurant':
        return <Star className="h-5 w-5 text-yellow-500" />;
      case 'price_drop':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'review_response':
        return <MessageSquare className="h-5 w-5 text-indigo-500" />;
      case 'friend_request':
      case 'follow':
        return <UserPlus className="h-5 w-5 text-pink-500" />;
      case 'loyalty_points':
        return <Zap className="h-5 w-5 text-orange-500" />;
      case 'system_update':
        return <Settings className="h-5 w-5 text-gray-500" />;
      case 'security_alert':
        return <Shield className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  // Bildirim türü rengini getir
  const getNotificationColor = (type: NotificationType) => {
    switch (type) {
      case 'order_status_update':
      case 'order_confirmed':
      case 'order_ready':
      case 'order_delivered':
      case 'order_cancelled':
        return 'border-l-blue-500 bg-blue-50';
      case 'promotion':
        return 'border-l-purple-500 bg-purple-50';
      case 'new_restaurant':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'price_drop':
        return 'border-l-green-500 bg-green-50';
      case 'review_response':
        return 'border-l-indigo-500 bg-indigo-50';
      case 'friend_request':
      case 'follow':
        return 'border-l-pink-500 bg-pink-50';
      case 'loyalty_points':
        return 'border-l-orange-500 bg-orange-50';
      case 'system_update':
        return 'border-l-gray-500 bg-gray-50';
      case 'security_alert':
        return 'border-l-red-500 bg-red-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  // Bildirim türü etiketini getir
  const getNotificationLabel = (type: NotificationType) => {
    switch (type) {
      case 'order_status_update':
        return 'Sipariş Güncellemesi';
      case 'order_confirmed':
        return 'Sipariş Onaylandı';
      case 'order_ready':
        return 'Sipariş Hazır';
      case 'order_delivered':
        return 'Sipariş Teslim Edildi';
      case 'order_cancelled':
        return 'Sipariş İptal Edildi';
      case 'promotion':
        return 'Promosyon';
      case 'new_restaurant':
        return 'Yeni Restoran';
      case 'price_drop':
        return 'Fiyat Düşüşü';
      case 'review_response':
        return 'Değerlendirme Yanıtı';
      case 'friend_request':
        return 'Arkadaşlık İsteği';
      case 'follow':
        return 'Takip';
      case 'loyalty_points':
        return 'Sadakat Puanı';
      case 'system_update':
        return 'Sistem Güncellemesi';
      case 'security_alert':
        return 'Güvenlik Uyarısı';
      default:
        return 'Bildirim';
    }
  };

  // Zaman formatını getir
  const getTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Az önce';
    if (diffInMinutes < 60) return `${diffInMinutes} dakika önce`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} gün önce`;
    
    return date.toLocaleDateString('tr-TR');
  };

  // Filtrelenmiş bildirimleri getir
  const getFilteredNotifications = () => {
    if (!notificationHistory) return [];
    
    switch (activeTab) {
      case 'unread':
        return notificationHistory.notifications.filter(n => n.status !== 'read');
      default:
        return notificationHistory.notifications;
    }
  };

  const filteredNotifications = getFilteredNotifications();

  return (
    <div className="relative">
      {/* Bildirim Butonu */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
      >
        <Bell className="h-6 w-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Bildirim Paneli */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Başlık */}
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Bildirimler</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Tümünü okundu işaretle
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Tab Navigasyonu */}
            <div className="flex mt-3 border-b border-gray-200">
              <button
                onClick={() => setActiveTab('all')}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'all'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Tümü ({notificationHistory?.notifications.length || 0})
              </button>
              <button
                onClick={() => setActiveTab('unread')}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'unread'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Okunmamış ({unreadCount})
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'settings'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Settings className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* İçerik */}
          <div className="max-h-96 overflow-y-auto">
            {activeTab === 'settings' ? (
              <NotificationSettings
                isSupported={isSupported}
                permission={permission}
                isSubscribed={isSubscribed}
                preferences={preferences}
                requestPermission={requestPermission}
                subscribeToNotifications={subscribeToNotifications}
                unsubscribeFromNotifications={unsubscribeFromNotifications}
                sendTestNotification={sendTestNotification}
              />
            ) : (
              <NotificationList
                notifications={filteredNotifications}
                isLoading={isLoading}
                getNotificationIcon={getNotificationIcon}
                getNotificationColor={getNotificationColor}
                getNotificationLabel={getNotificationLabel}
                getTimeAgo={getTimeAgo}
                markAsRead={markAsRead}
                selectedNotification={selectedNotification}
                setSelectedNotification={setSelectedNotification}
              />
            )}
          </div>
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

// Bildirim Listesi Komponenti
function NotificationList({
  notifications,
  isLoading,
  getNotificationIcon,
  getNotificationColor,
  getNotificationLabel,
  getTimeAgo,
  markAsRead,
  selectedNotification,
  setSelectedNotification
}: {
  notifications: NotificationRecord[];
  isLoading: boolean;
  getNotificationIcon: (type: NotificationType) => JSX.Element;
  getNotificationColor: (type: NotificationType) => string;
  getNotificationLabel: (type: NotificationType) => string;
  getTimeAgo: (date: Date) => string;
  markAsRead: (id: string) => void;
  selectedNotification: NotificationRecord | null;
  setSelectedNotification: (notification: NotificationRecord | null) => void;
}) {
  if (isLoading) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-start space-x-3">
              <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="p-8 text-center">
        <BellOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-500">Henüz bildiriminiz yok</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${
            getNotificationColor(notification.type)
          } ${notification.status !== 'read' ? 'bg-blue-50' : ''}`}
          onClick={() => {
            if (notification.status !== 'read') {
              markAsRead(notification.id);
            }
            setSelectedNotification(notification);
          }}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              {getNotificationIcon(notification.type)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">
                  {notification.content.title}
                </p>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">
                    {getTimeAgo(notification.createdAt)}
                  </span>
                  {notification.status !== 'read' && (
                    <div className="h-2 w-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {notification.content.body}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {getNotificationLabel(notification.type)}
                </span>
                {notification.status === 'read' && (
                  <Check className="h-4 w-4 text-green-500" />
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Bildirim Ayarları Komponenti
function NotificationSettings({
  isSupported,
  permission,
  isSubscribed,
  preferences,
  requestPermission,
  subscribeToNotifications,
  unsubscribeFromNotifications,
  sendTestNotification
}: {
  isSupported: boolean;
  permission: NotificationPermission;
  isSubscribed: boolean;
  preferences: any;
  requestPermission: () => Promise<NotificationPermission>;
  subscribeToNotifications: () => Promise<boolean>;
  unsubscribeFromNotifications: () => Promise<void>;
  sendTestNotification: () => Promise<void>;
}) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubscribe = async () => {
    setIsUpdating(true);
    try {
      if (permission === 'default') {
        const newPermission = await requestPermission();
        if (newPermission !== 'granted') return;
      }
      await subscribeToNotifications();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUnsubscribe = async () => {
    setIsUpdating(true);
    try {
      await unsubscribeFromNotifications();
    } finally {
      setIsUpdating(false);
    }
  };

  const handleTestNotification = async () => {
    setIsUpdating(true);
    try {
      await sendTestNotification();
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-4 space-y-4">
      {/* Durum */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Bildirim Durumu</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Tarayıcı Desteği:</span>
            <span className={isSupported ? 'text-green-600' : 'text-red-600'}>
              {isSupported ? 'Destekleniyor' : 'Desteklenmiyor'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">İzin Durumu:</span>
            <span className={
              permission === 'granted' ? 'text-green-600' : 
              permission === 'denied' ? 'text-red-600' : 'text-yellow-600'
            }>
              {permission === 'granted' ? 'Verildi' : 
               permission === 'denied' ? 'Reddedildi' : 'Beklemede'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Abonelik:</span>
            <span className={isSubscribed ? 'text-green-600' : 'text-red-600'}>
              {isSubscribed ? 'Aktif' : 'Pasif'}
            </span>
          </div>
        </div>
      </div>

      {/* Aksiyonlar */}
      <div className="space-y-2">
        {!isSubscribed ? (
          <button
            onClick={handleSubscribe}
            disabled={!isSupported || isUpdating}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUpdating ? 'İşleniyor...' : 'Bildirimleri Etkinleştir'}
          </button>
        ) : (
          <button
            onClick={handleUnsubscribe}
            disabled={isUpdating}
            className="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUpdating ? 'İşleniyor...' : 'Bildirimleri Devre Dışı Bırak'}
          </button>
        )}

        {isSubscribed && (
          <button
            onClick={handleTestNotification}
            disabled={isUpdating}
            className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isUpdating ? 'Gönderiliyor...' : 'Test Bildirimi Gönder'}
          </button>
        )}
      </div>

      {/* Bilgi */}
      <div className="text-xs text-gray-500">
        <p>• Bildirimler sipariş durumu, promosyonlar ve önemli güncellemeler için gönderilir</p>
        <p>• Bildirim tercihlerinizi profil sayfasından düzenleyebilirsiniz</p>
        <p>• Sessiz saatler ve bildirim türü tercihleri ayarlanabilir</p>
      </div>
    </div>
  );
} 