// Firebase Cloud Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Firebase yapılandırması
const firebaseConfig = {
  apiKey: "AIzaSyBXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "neyisek-xxxxx.firebaseapp.com",
  projectId: "neyisek-xxxxx",
  storageBucket: "neyisek-xxxxx.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnop"
};

// Firebase'i başlat
firebase.initializeApp(firebaseConfig);

// Messaging servisini al
const messaging = firebase.messaging();

// Arka plan mesajlarını işle
messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: payload.notification.icon || '/icon-192x192.png',
    badge: payload.notification.badge || '/badge-72x72.png',
    tag: payload.data?.tag || 'neyisek-notification',
    data: payload.data || {},
    requireInteraction: payload.data?.requireInteraction === 'true',
    silent: payload.data?.silent === 'true',
    vibrate: payload.data?.vibrate ? JSON.parse(payload.data.vibrate) : [200, 100, 200],
    actions: payload.data?.actions ? JSON.parse(payload.data.actions) : [],
    image: payload.notification.image,
    dir: 'ltr',
    lang: 'tr-TR'
  };

  // Bildirimi göster
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Bildirim tıklama olayını işle
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);

  event.notification.close();

  // Bildirim verilerini al
  const notificationData = event.notification.data;
  const clickAction = notificationData?.clickAction;

  // Varsayılan aksiyon
  let urlToOpen = '/';

  // Bildirim türüne göre URL belirle
  if (notificationData?.type === 'order_status_update' || 
      notificationData?.type === 'order_confirmed' ||
      notificationData?.type === 'order_ready' ||
      notificationData?.type === 'order_delivered' ||
      notificationData?.type === 'order_cancelled') {
    urlToOpen = `/orders/${notificationData.orderId}`;
  } else if (notificationData?.type === 'promotion') {
    urlToOpen = notificationData.promotionUrl || '/promotions';
  } else if (notificationData?.type === 'new_restaurant') {
    urlToOpen = `/restaurants/${notificationData.restaurantId}`;
  } else if (notificationData?.type === 'review_response') {
    urlToOpen = `/reviews/${notificationData.reviewId}`;
  } else if (notificationData?.type === 'friend_request') {
    urlToOpen = '/profile?tab=social';
  } else if (notificationData?.type === 'loyalty_points') {
    urlToOpen = '/profile?tab=loyalty';
  } else if (notificationData?.type === 'system_update') {
    urlToOpen = '/profile?tab=settings';
  } else if (notificationData?.type === 'security_alert') {
    urlToOpen = '/profile?tab=security';
  } else if (clickAction) {
    urlToOpen = clickAction;
  }

  // Pencereyi aç
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Açık pencere var mı kontrol et
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }

      // Yeni pencere aç
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Bildirim kapatma olayını işle
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);

  const notificationData = event.notification.data;
  
  // Analytics için kapatma olayını gönder
  if (notificationData?.analytics) {
    // Analytics verisi gönder
    fetch('/api/analytics/notification-closed', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        notificationId: notificationData.notificationId,
        type: notificationData.type,
        timestamp: Date.now()
      })
    }).catch(error => {
      console.error('Analytics error:', error);
    });
  }
});

// Push mesajı olayını işle (eski API)
self.addEventListener('push', (event) => {
  console.log('Push event received:', event);

  if (event.data) {
    const payload = event.data.json();
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: payload.notification.icon || '/icon-192x192.png',
      badge: payload.notification.badge || '/badge-72x72.png',
      tag: payload.data?.tag || 'neyisek-notification',
      data: payload.data || {},
      requireInteraction: payload.data?.requireInteraction === 'true',
      silent: payload.data?.silent === 'true',
      vibrate: payload.data?.vibrate ? JSON.parse(payload.data.vibrate) : [200, 100, 200],
      actions: payload.data?.actions ? JSON.parse(payload.data.actions) : [],
      image: payload.notification.image,
      dir: 'ltr',
      lang: 'tr-TR'
    };

    event.waitUntil(
      self.registration.showNotification(notificationTitle, notificationOptions)
    );
  }
});

// Service Worker yüklendiğinde
self.addEventListener('install', (event) => {
  console.log('Service Worker installed');
  self.skipWaiting();
});

// Service Worker aktif olduğunda
self.addEventListener('activate', (event) => {
  console.log('Service Worker activated');
  event.waitUntil(self.clients.claim());
});

// Mesaj olayını işle (ana thread ile iletişim)
self.addEventListener('message', (event) => {
  console.log('Message received in service worker:', event.data);

  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Hata yakalama
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
});

// Promise rejection yakalama
self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled rejection:', event.reason);
}); 