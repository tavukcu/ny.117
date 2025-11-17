# Neyisek.com - Firebase ve Google Cloud Kurulum Özeti

## ✅ Tamamlanan İşlemler

### 1. Firebase Projesi
- **Proje Adı**: neyisek-6b8bc
- **Sahip**: kaniyedincer@gmail.com
- **Firebase Console**: https://console.firebase.google.com/project/neyisek-6b8bc

### 2. Firebase Yapılandırması
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyAsTexiSuSnyhK17G49Qqz_6O7pMV9f42M",
  authDomain: "neyisek-6b8bc.firebaseapp.com",
  projectId: "neyisek-6b8bc",
  storageBucket: "neyisek-6b8bc.firebasestorage.app",
  messagingSenderId: "187489868178",
  appId: "1:187489868178:web:3f2ee1ca2cabfbbfbf094b",
  measurementId: "G-N5Q8RB9N9V"
};
```

### 3. Google Maps API
- **API Key**: AIzaSyAYMnjI4xCKVxmXZId0VgkgqgROJHslJ5A
- **Durum**: Aktif ve çalışıyor

### 4. Admin Erişimi
- **Admin Email**: kaniyedincer@gmail.com
- **Admin Kontrolü**: `src/utils/adminUtils.ts` dosyasında tanımlı
- **Firestore Rules**: Admin yetkileri tanımlandı

### 5. Güvenlik Kuralları
- Firestore Rules güncellendi
- Storage Rules tanımlandı
- Admin yetkileri kaniyedincer@gmail.com için ayarlandı

## 📋 Yapılması Gerekenler

### 1. Google Cloud Console'da
- [ ] Faturalandırma hesabı ekleyin (ücretsiz krediler için)
- [ ] API kullanım kotalarını kontrol edin
- [ ] Domain doğrulaması yapın (production için)

### 2. Firebase Console'da
- [ ] Email/Password Authentication'ı etkinleştirin
- [ ] Google Sign-in'i etkinleştirin
- [ ] Cloud Messaging için Web Push sertifikaları oluşturun
- [ ] Analytics'i yapılandırın

### 3. Projede
- [ ] `.env.local` dosyası oluşturun (örnek SETUP_INSTRUCTIONS.md'de)
- [ ] Email servisi için Resend.com API key alın
- [ ] Gemini AI API key alın (AI özellikleri için)

## 🚀 Test Etme

1. Projeyi çalıştırın:
```bash
npm run dev
```

2. Admin paneline erişim:
- https://localhost:3000 adresine gidin
- kaniyedincer@gmail.com ile giriş yapın
- Admin menüsünü görebilmelisiniz

3. Harita özelliklerini test edin:
- http://localhost:3000/location
- Harita tam özellikli çalışmalı

## 🔒 Güvenlik Notları

1. API anahtarlarınızı asla public repository'ye yüklemeyin
2. Production'da domain kısıtlamaları ekleyin
3. Firestore Rules'ı production'da daha sıkı hale getirin
4. Regular backup alın

## 📞 Destek

Herhangi bir sorun için: kaniyedincer@gmail.com

---

**Son Güncelleme**: ${new Date().toLocaleDateString('tr-TR')} 