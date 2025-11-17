# 🤖 Restoran Telegram Kurulum Rehberi

## 📱 Dinçer Tavukçuluk İçin Telegram Kurulumu

### 🎯 Amaç
**Dinçer Tavukçuluk** gibi restoranlara yeni sipariş geldiğinde otomatik olarak Telegram mesajı gönderilmesi.

## 🚀 Kurulum Adımları

### 1️⃣ **Restoran Sahibi Tarafı**

#### A) Telegram Bot'u Bulma
1. Telegram'da `@neyisek_bot` (veya kurduğunuz bot adı) arayın
2. Bota `/start` komutunu gönderin

#### B) Setup Token Alma
1. Restoran paneline giriş yapın: `/restaurant/settings`
2. **Bildirimler** sekmesine gidin
3. **Telegram Kurulumu** butonuna tıklayın
4. **Setup Token** oluşturun

#### C) Bot'a Token Gönderme
1. Telegram'da bot'a setup token'ınızı gönderin
2. Bot size onay mesajı gönderecek
3. Chat ID otomatik olarak kaydedilecek

### 2️⃣ **Sistem Tarafı (Otomatik)**

```typescript
// Restoran setup token oluşturma
POST /api/restaurants/{restaurantId}/telegram
{
  "action": "generate_setup_token"
}

// Response:
{
  "setupToken": "SETUP_rest123_1234567890",
  "instructions": [
    "1. Telegram'da @neyisek_bot botunu bulun",
    "2. Bota /start komutunu gönderin", 
    "3. Setup token'ınızı gönderin: SETUP_rest123_1234567890",
    "4. Bot size onay mesajı gönderecek"
  ]
}
```

### 3️⃣ **Mesaj Akışı**

```
Müşteri Dinçer Tavukçuluk'tan sipariş verir
              ↓
OrderService.createOrder()
              ↓  
TelegramService.sendNewOrderNotification()
              ↓
getRestaurantTelegramId("dincer-tavukculuk-id")
              ↓
Firebase'den chatId: "987654321" 
              ↓
Bot mesajı "987654321" chat ID'sine gönderir
              ↓
📱 Dinçer Tavukçuluk'un Telegram'ına mesaj gelir!
```

## 📝 Örnek Mesaj İçeriği

```
🆕 YENİ SİPARİŞ! #ABC123

🏪 Dinçer Tavukçuluk
👤 Müşteri: Ahmet Yılmaz  
📞 Telefon: 0555 123 45 67

🛒 Sipariş Detayları:
• 2x Tavuk Döner (₺45.00)
• 1x Ayran (₺8.00)
• 1x Patates Kızartması (₺15.00)

💰 Toplam: ₺68.00

📍 Teslimat Adresi:
Atatürk Cad. No:123
Çankaya/Ankara

📝 Özel Not: Az tuzlu olsun

⏰ Tahmini Hazırlanma: 30 dk

[✅ Onayla] [❌ Reddet] [📞 Ara]
```

## 🔧 Teknik Detaylar

### Firebase Restoran Yapısı
```javascript
restaurants/{restaurantId} = {
  name: "Dinçer Tavukçuluk",
  notifications: {
    telegram: {
      chatId: "987654321",        // Bot'un mesaj göndereceği chat ID
      isEnabled: true,            // Telegram bildirimi aktif mi?
      setupAt: "2024-01-01",     // Kurulum tarihi
      setupToken: null           // Kurulum sonrası temizlenir
    }
  }
}
```

### Fallback Sistemi
Eğer restoran Telegram kurulumu yapmamışsa:
- Mesaj admin chat ID'sine gönderilir
- Console'da uyarı mesajı gösterilir
- Sipariş işlemi kesintisiz devam eder

## 🎛️ Admin Paneli Kontrolü

Admin panelinden restoran Telegram durumunu kontrol edebilirsiniz:

```typescript
// GET /api/restaurants/{restaurantId}/telegram
{
  "telegram": {
    "isEnabled": true,
    "isConfigured": true, 
    "setupAt": "2024-01-01T10:30:00Z"
  }
}
```

## 🚨 Sorun Giderme

### Problem: Restoran mesaj alamıyor
**Çözüm:** 
1. Setup token yeniden oluştur
2. Bot'u yeniden başlat (/start)
3. Chat ID'nin doğru kaydedildiğini kontrol et

### Problem: Bot yanıt vermiyor  
**Çözüm:**
1. `TELEGRAM_BOT_TOKEN` environment variable'ını kontrol et
2. Bot'un aktif olduğunu doğrula
3. Webhook URL'ini kontrol et

## ✅ Test Etme

1. Restoran kurulumunu tamamlayın
2. Test siparişi verin
3. Hem admin hem restoran mesaj almalı
4. Mesaj içeriği ve butonlar çalışmalı

---

**Not:** Bu sistem hem admin'e hem de restorana aynı anda mesaj gönderir. Admin merkezi kontrol için, restoran kendi siparişlerini yönetmek için kullanır.