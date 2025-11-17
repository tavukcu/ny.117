# 🤖 Telegram Bot Kurulum Rehberi

## ✅ Bot Hazır!
**Bot Adı:** Neyisek Sipariş Botu  
**Kullanıcı Adı:** @neyiseksiparisbot  
**Token:** 8167476570:AAGHdae2sJrcLIa6wlIm1EXrcZFaugAYc5s  

---

## 🚀 Hızlı Başlangıç

### 1. Chat ID'nizi Alın

#### Admin Chat ID için:
1. **Bot'a mesaj gönderin:** https://t.me/neyiseksiparisbot
2. **Bot'a `/start` yazın**
3. **Bu komutu çalıştırın:**
```bash
curl -s "https://api.telegram.org/bot8167476570:AAGHdae2sJrcLIa6wlIm1EXrcZFaugAYc5s/getUpdates" | jq '.result[-1].message.chat.id'
```
4. **Çıkan sayıyı kopyalayın** (örn: 123456789)

### 2. Environment Variables Ayarlayın

`.env.local` dosyanızı açın ve şu satırları ekleyin:

```env
# Telegram Bot Configuration  
TELEGRAM_BOT_TOKEN=8167476570:AAGHdae2sJrcLIa6wlIm1EXrcZFaugAYc5s

# Chat ID'leri (yukarıdaki adımdan aldığınız sayıları yazın)
TELEGRAM_ADMIN_CHAT_ID=YOUR_CHAT_ID_HERE
TELEGRAM_RESTAURANT_CHAT_ID=YOUR_CHAT_ID_HERE

# Domain (Production için gerçek domain'inizi yazın)
NEXT_PUBLIC_DOMAIN=https://your-domain.com
```

### 3. Development Server'ı Başlatın
```bash
npm run dev
```

### 4. Admin Panel'e Gidin
```
http://localhost:3001/admin/telegram
```

---

## 📱 Bot Kullanımı

### Yeni Sipariş Bildirimi
Her yeni sipariş geldiğinde bot otomatik olarak şu mesajı gönderir:

```
🆕 YENİ SİPARİŞ ALINDI!

📋 Sipariş Detayları:
🆔 Sipariş No: #12345678
👤 Müşteri: Ahmet Yılmaz
📞 Telefon: +905551234567
💰 Toplam: ₺85.50

🍽️ Sipariş İçeriği:
• 2x Pizza Margherita - ₺35.00
• 1x Cola - ₺15.50

📍 Teslimat Adresi:
Test Mahallesi, Test Sokak No:1, İzmir

⏱️ Tahmini Süre: 30 dakika

🚀 Siparişi hazırlamaya başlayabilirsiniz!

[✅ Onayla] [❌ Reddet] [👨‍🍳 Hazırlanıyor] [🚚 Yolda] [✅ Teslim Edildi]
```

### Interactive Buttons
Restoran sahibi button'lara tıklayarak sipariş durumunu güncelleyebilir:

- **✅ Onayla** → Sipariş onaylandı
- **❌ Reddet** → Sipariş iptal edildi  
- **👨‍🍳 Hazırlanıyor** → Sipariş hazırlanıyor
- **🚚 Yolda** → Sipariş yola çıktı
- **✅ Teslim Edildi** → Sipariş teslim edildi

---

## 🔧 Test Etme

### 1. Bot Status Kontrolü
```bash
curl -s "https://api.telegram.org/bot8167476570:AAGHdae2sJrcLIa6wlIm1EXrcZFaugAYc5s/getMe"
```

### 2. Test Bildirimi Gönderme
Admin panel üzerinden "Test Bildirimi Gönder" butonuna tıklayın.

### 3. Webhook Durumu Kontrolü
```bash
curl -s "https://api.telegram.org/bot8167476570:AAGHdae2sJrcLIa6wlIm1EXrcZFaugAYc5s/getWebhookInfo"
```

---

## 🌐 Production Deployment

### 1. Domain Ayarlayın
`.env.local` dosyasında:
```env
NEXT_PUBLIC_DOMAIN=https://yourdomain.com
```

### 2. Production Webhook Ayarlayın
```bash
curl -X POST "https://api.telegram.org/bot8167476570:AAGHdae2sJrcLIa6wlIm1EXrcZFaugAYc5s/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url":"https://yourdomain.com/api/telegram/webhook"}'
```

---

## 🔍 Troubleshooting

### Bot Mesaj Göndermez ise:
1. **Chat ID doğru mu?** → `getUpdates` ile kontrol edin
2. **Environment variables doğru mu?** → Admin panel'de kontrol edin
3. **Webhook aktif mi?** → `getWebhookInfo` ile kontrol edin

### "Bot blocked by user" Hatası:
- Kullanıcı bot'u engellemiş, bot'a tekrar `/start` göndermesi gerekiyor

### "Chat not found" Hatası:
- Chat ID yanlış veya kullanıcı bot'a hiç mesaj göndermemiş

---

## 📊 API Endpoints

### Bildirim Gönderme
```http
POST /api/telegram/send
Content-Type: application/json

{
  "type": "new_order",
  "data": {
    "orderId": "12345",
    "restaurantId": "rest123",
    "customerName": "Ahmet Yılmaz",
    "totalAmount": 85.50,
    "items": [...]
  }
}
```

### Webhook Test
```http
GET /api/telegram/webhook
```

### Bot Setup
```http
POST /api/telegram/setup
Content-Type: application/json

{
  "webhookUrl": "https://yourdomain.com/api/telegram/webhook"
}
```

---

## 🎯 Özellikler

✅ **Otomatik Bildirimler**
- Yeni sipariş bildirimi (Admin + Restoran)
- Sipariş durum güncelleme bildirimi

✅ **Interactive Buttons**  
- Sipariş durumunu Telegram'dan güncelleme
- Real-time durum senkronizasyonu

✅ **Multi-User Support**
- Admin bildirimleri
- Restoran sahibi bildirimleri
- Ayrı chat ID yönetimi

✅ **Error Handling**
- Hata durumunda sistem çalışmaya devam eder
- Detaylı log sistemi

✅ **Production Ready**
- Webhook desteği
- SSL/HTTPS uyumlu
- Rate limiting

---

**🚀 Telegram entegrasyonu hazır! Bot'a mesaj gönderip Chat ID'nizi aldıktan sonra tam otomatik çalışacak!**