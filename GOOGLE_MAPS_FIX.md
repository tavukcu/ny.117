# Google Maps API Hatası - Acil Düzeltme

## 🚨 Şu An Yaşanan Sorun
- "API key kontrol edin" hatası
- Reverse geocoding çalışmıyor
- Harita demo modunda çalışıyor

## ⚡ Hızlı Çözüm Adımları

### 1. Google Cloud Console'a Git
https://console.cloud.google.com/

### 2. API Key'inizi Bulun
- APIs & Services → Credentials
- API Key: `AIzaSyAYMnjI4xCKVxmXZId0VgkgqgROJHslJ5A`

### 3. API Key Kısıtlamalarını Düzelt

#### Application Restrictions:
- "HTTP referrers (web sites)" seçin
- Şu adresleri ekleyin:
```
localhost:3000/*
http://localhost:3000/*
https://localhost:3000/*
127.0.0.1:3000/*
http://127.0.0.1:3000/*
*
```

#### API Restrictions:
- "Restrict key" seçin
- Şu API'leri işaretleyin:
  - ✅ Maps JavaScript API
  - ✅ Geocoding API
  - ✅ Places API
  - ✅ Directions API
  - ✅ Distance Matrix API

### 4. API'leri Etkinleştir
Bu API'lerin hepsinin etkin olduğundan emin olun:
- Maps JavaScript API
- Geocoding API
- Places API
- Directions API

### 5. Billing Kontrolü
- Billing → Overview
- Aktif bir ödeme yöntemi olduğundan emin olun
- Günlük kullanım limitlerini kontrol edin

## 🔧 Geçici Çözüm (Test İçin)

API key kısıtlamalarını geçici olarak kaldırın:

1. **Application restrictions**: "None"
2. **API restrictions**: "Don't restrict key"
3. 5-10 dakika bekleyin
4. Tarayıcı cache'ini temizleyin
5. Sayfayı yenileyin

⚠️ **Dikkat**: Bu ayarları sadece test için kullanın, sonra tekrar kısıtlamaları ekleyin!

## 📞 Acil Destek

Eğer sorun devam ederse:
1. Google Cloud Support'a ticket açın
2. API key'i yeniden oluşturun
3. Faturalandırma hesabınızı kontrol edin

## ✅ Test Checklist

- [ ] API key kısıtlamaları güncellendi
- [ ] Tüm gerekli API'ler etkinleştirildi
- [ ] Billing aktif
- [ ] 5 dakika beklendi
- [ ] Cache temizlendi
- [ ] Sayfa yenilendi

---

**Önemli**: Bu işlemler 5-10 dakika içinde etkili olur. Sabırlı olun! 