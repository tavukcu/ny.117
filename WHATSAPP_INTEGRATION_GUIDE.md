# 📱 WhatsApp Business API Entegrasyonu Rehberi

NeYisek.com platformuna WhatsApp Business API entegrasyonu başarıyla eklendi. Bu rehber, entegrasyonun nasıl çalıştığını ve nasıl kullanılacağını açıklar.

## 🚀 Özellikler

### ✅ Desteklenen Mesaj Türleri

1. **🆕 Yeni Sipariş Bildirimi**
   - Restoran sahiplerine yeni sipariş geldiğinde otomatik bildirim
   - Sipariş detayları, müşteri bilgileri ve teslimat adresi
   - Etkileşimli butonlar (Onayla, Reddet, Ara)

2. **📊 Sipariş Durum Güncelleme**
   - Sipariş durumu değiştiğinde restoran bilgilendirmesi
   - Tahmini teslimat süresi
   - Durum emojileri ile görsel feedback

3. **❌ Sipariş İptal Bildirimi**
   - Sipariş iptal edildiğinde restoran bilgilendirmesi
   - İptal sebebi açıklaması

4. **🚨 Acil Durum Bildirimi**
   - Acil durumlar için anında bildirim
   - Öncelikli mesaj gönderimi

5. **✉️ Özel Mesaj**
   - Manuel mesaj gönderimi
   - Özelleştirilebilir içerik

## 🔧 Kurulum

### 1. Environment Değişkenleri

`.env.local` dosyanıza aşağıdaki değişkenleri ekleyin:

```env
# WhatsApp Business API
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_PHONE_NUMBER_ID=your_whatsapp_phone_number_id
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_VERIFY_TOKEN=your_whatsapp_verify_token
```

### 2. WhatsApp Business API Kurulumu

1. **Meta Developer Console'a gidin**
   - https://developers.facebook.com/
   - WhatsApp Business API uygulaması oluşturun

2. **Telefon Numarası ID'sini alın**
   - WhatsApp Business hesabınızı bağlayın
   - Phone Number ID'yi kopyalayın

3. **Access Token oluşturun**
   - System User oluşturun
   - WhatsApp Business API izinlerini verin
   - Access Token'ı kopyalayın

4. **Webhook URL'ini ayarlayın**
   - Webhook URL: `https://yourdomain.com/api/whatsapp/webhook`
   - Verify Token: Kendi belirlediğiniz token

## 📡 API Endpoints

### 1. Mesaj Gönderme
```
POST /api/whatsapp/send
```

**Örnek Kullanım:**
```javascript
const response = await fetch('/api/whatsapp/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'new_order',
    data: {
      orderId: 'ORDER123',
      restaurantId: 'REST123',
      customerName: 'Ahmet Yılmaz',
      customerPhone: '+905551234567',
      totalAmount: 85.50,
      items: [
        { name: 'Pizza Margherita', quantity: 2, price: 35.00 },
        { name: 'Cola', quantity: 1, price: 15.50 }
      ],
      deliveryAddress: 'Test Mahallesi, Test Sokak No:1, İzmir',
      estimatedTime: 30,
      specialInstructions: 'Kapıya bırakabilirsiniz'
    }
  })
});
```

### 2. Webhook (Gelen Mesajlar)
```
GET/POST /api/whatsapp/webhook
```

## 🎯 Mesaj Formatları

### Yeni Sipariş Mesajı
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

📝 Özel Talimatlar:
Kapıya bırakabilirsiniz

🚀 Siparişi hazırlamaya başlayabilirsiniz!

[✅ Onayla] [❌ Reddet] [📞 Ara]
```

### Durum Güncelleme Mesajı
```
✅ SİPARİŞ DURUMU GÜNCELLENDİ

🆔 Sipariş No: #12345678
👤 Müşteri: Ahmet Yılmaz
📊 Durum: Onaylandı
⏱️ Tahmini Süre: 30 dakika

Müşteri bilgilendirildi.
```

## 🔄 Otomatik Entegrasyon

### Sipariş Oluşturma
```typescript
// OrderService.createOrder() metodunda otomatik olarak çalışır
const orderId = await OrderService.createOrder(orderData);
// WhatsApp bildirimi otomatik olarak gönderilir
```

### Sipariş Durumu Güncelleme
```typescript
// OrderService.updateOrderStatus() metodunda otomatik olarak çalışır
await OrderService.updateOrderStatus(orderId, OrderStatus.CONFIRMED);
// WhatsApp durum güncelleme bildirimi otomatik olarak gönderilir
```

## 🧪 Test Etme

### Test Sayfası
`/test-whatsapp` sayfasını kullanarak entegrasyonu test edebilirsiniz:

1. **Hızlı Test Mesajları**
   - Yeni sipariş testi
   - Acil durum testi

2. **Özel Mesaj Gönderimi**
   - Telefon numarası ve mesaj girişi
   - Manuel mesaj gönderimi

3. **Sipariş Durum Güncelleme**
   - Sipariş ID ve durum seçimi
   - Durum güncelleme testi

4. **Sipariş İptal**
   - İptal bildirimi testi

## 📱 Gelen Mesaj İşleme

### Buton Yanıtları
- **✅ Onayla**: Sipariş onaylandı
- **❌ Reddet**: Sipariş reddedildi
- **📞 Ara**: Müşteri ile iletişim

### Metin Mesajları
- Basit komut işleme
- Otomatik yanıt sistemi

## 🔒 Güvenlik

### Webhook Doğrulama
- Meta tarafından gönderilen doğrulama token'ı kontrol edilir
- Güvenli webhook URL'i kullanılır

### Telefon Numarası Formatı
- Türkiye telefon numaraları otomatik formatlanır
- Uluslararası format desteği

## 📊 Monitoring ve Logging

### Console Logları
```javascript
console.log('📱 WhatsApp bildirimi gönderildi:', orderId);
console.error('WhatsApp bildirimi gönderme hatası:', error);
```

### Hata Yönetimi
- API hataları yakalanır ve loglanır
- Sipariş işlemleri WhatsApp hatalarından etkilenmez
- Fallback mekanizmaları

## 🚀 Performans Optimizasyonu

### Asenkron İşleme
- WhatsApp bildirimleri asenkron olarak gönderilir
- Sipariş işlemleri bekletilmez

### Batch İşleme
- Çoklu mesaj gönderimi için batch desteği
- Rate limiting uyumluluğu

## 🔧 Özelleştirme

### Mesaj Şablonları
`src/services/whatsappService.ts` dosyasında mesaj şablonlarını özelleştirebilirsiniz:

```typescript
private static createNewOrderMessage(data: WhatsAppNotificationData): WhatsAppMessage {
  // Mesaj içeriğini özelleştirin
  const body = `🆕 *YENİ SİPARİŞ ALINDI!*
  
  // ... özelleştirilmiş içerik
  `;
  
  return {
    to: '',
    type: 'interactive',
    interactive: {
      // ... özelleştirilmiş butonlar
    }
  };
}
```

### Emoji ve Format
- Durum emojileri özelleştirilebilir
- Mesaj formatı değiştirilebilir
- Buton metinleri güncellenebilir

## 📞 Destek

### Sorun Giderme
1. **Mesaj gönderilmiyor**
   - Environment değişkenlerini kontrol edin
   - API token'ının geçerli olduğundan emin olun
   - Telefon numarası formatını kontrol edin

2. **Webhook çalışmıyor**
   - Webhook URL'inin doğru olduğundan emin olun
   - Verify token'ı kontrol edin
   - SSL sertifikasının geçerli olduğundan emin olun

3. **Test mesajları gönderilmiyor**
   - `/test-whatsapp` sayfasını kullanın
   - Console loglarını kontrol edin
   - Network sekmesinde API çağrılarını inceleyin

### İletişim
- Teknik sorunlar için: [destek@neyisek.com]
- API dokümantasyonu: [Meta Developer Docs]
- WhatsApp Business API: [WhatsApp Business API]

## 🎉 Sonuç

WhatsApp Business API entegrasyonu ile NeYisek.com platformu artık:

✅ **Otomatik sipariş bildirimleri** gönderebilir  
✅ **Gerçek zamanlı durum güncellemeleri** yapabilir  
✅ **Etkileşimli mesajlar** ile müşteri deneyimini artırabilir  
✅ **Acil durum bildirimleri** gönderebilir  
✅ **Özelleştirilebilir mesaj şablonları** kullanabilir  

Bu entegrasyon sayesinde restoran sahipleri siparişlerini anında takip edebilir ve müşterilerle daha etkili iletişim kurabilirler. 🚀 