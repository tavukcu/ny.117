# Neyisek.com - Firebase ve Google Cloud Kurulum Rehberi

## 📧 Hesap: kaniyedincer@gmail.com

Bu rehber, Neyisek.com projesi için gerekli Firebase ve Google Cloud ayarlarını yapmanıza yardımcı olacaktır.

## 1. Google Cloud Console Kurulumu

### Adım 1: Proje Oluşturma
1. https://console.cloud.google.com adresine gidin
2. kaniyedincer@gmail.com ile giriş yapın
3. Üst menüden proje seçiciyi tıklayın
4. "Yeni Proje" butonuna tıklayın
5. Proje adı: `neyisek` veya `neyisek-com`
6. Oluştur'a tıklayın

### Adım 2: API'leri Etkinleştirme
1. Sol menüden "APIs & Services" → "Library"
2. Şu API'leri arayıp etkinleştirin:
   - ✅ Maps JavaScript API
   - ✅ Geocoding API
   - ✅ Places API
   - ✅ Directions API
   - ✅ Distance Matrix API

### Adım 3: API Anahtarı Oluşturma
1. "APIs & Services" → "Credentials"
2. "+ CREATE CREDENTIALS" → "API key"
3. Oluşturulan anahtarı kopyalayın
4. Anahtara tıklayıp güvenlik ayarları yapın:
   - Application restrictions: HTTP referrers
   - İzin verilen adresler:
     ```
     http://localhost:3000/*
     http://localhost:3001/*
     https://neyisek.com/*
     https://www.neyisek.com/*
     ```
   - API restrictions: Yukarıdaki API'leri seçin
   - SAVE

## 2. Firebase Console Kurulumu

### Adım 1: Firebase Projesi Oluşturma
1. https://console.firebase.google.com adresine gidin
2. kaniyedincer@gmail.com ile giriş yapın
3. "Create a project" veya "Proje ekle"
4. Proje adı: `neyisek`
5. Google Analytics'i etkinleştirin
6. Projeyi oluşturun

### Adım 2: Web Uygulaması Ekleme
1. Proje ana sayfasında "</>" (Web) ikonuna tıklayın
2. Uygulama adı: "NeYisek Web"
3. "Firebase Hosting" seçeneğini işaretleyin
4. "Register app"

### Adım 3: Firebase Servisleri
1. **Authentication**:
   - Sol menü → "Authentication" → "Get started"
   - "Sign-in method" sekmesi
   - Email/Password: Etkinleştir
   - Google: Etkinleştir

2. **Firestore Database**:
   - Sol menü → "Firestore Database" → "Create database"
   - "Start in production mode"
   - Konum: "eur3 (europe-west)"

3. **Storage**:
   - Sol menü → "Storage" → "Get started"
   - Varsayılan ayarlarla devam

4. **Cloud Messaging** (Bildirimler için):
   - Sol menü → "Cloud Messaging"
   - Web Push sertifikaları oluşturun

## 3. Environment Variables (.env.local)

Proje kök dizininde `.env.local` dosyası oluşturun:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Google Maps API Key
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Gemini AI API Key (Opsiyonel)
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_api_key

# Admin Email
NEXT_PUBLIC_ADMIN_EMAIL=kaniyedincer@gmail.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Email Service (Resend.com)
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=bilgi@neyisek.com
```

## 4. Firebase Security Rules

### Firestore Rules (firestore.rules):
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Herkes okuyabilir
    match /{document=**} {
      allow read: if true;
    }
    
    // Sadece authenticated kullanıcılar yazabilir
    match /{document=**} {
      allow write: if request.auth != null;
    }
    
    // Admin yetkileri
    match /admin/{document=**} {
      allow read, write: if request.auth != null && 
        request.auth.token.email == 'kaniyedincer@gmail.com';
    }
  }
}
```

### Storage Rules (storage.rules):
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## 5. Önemli Notlar

1. **Güvenlik**: API anahtarlarınızı asla public repository'ye yüklemeyin
2. **Billing**: Google Cloud'da faturalandırma hesabı açmanız gerekebilir
3. **Quotas**: Ücretsiz kullanım kotalarını takip edin
4. **Domain Doğrulama**: Firebase Hosting kullanacaksanız domain doğrulaması yapın

## 6. Test Etme

1. Projeyi çalıştırın: `npm run dev`
2. http://localhost:3000/location adresine gidin
3. Haritanın düzgün yüklendiğini kontrol edin
4. Firebase Console'dan verilerin geldiğini doğrulayın

## 7. Production Deployment

1. Vercel veya Firebase Hosting kullanabilirsiniz
2. Environment variable'ları production ortamına ekleyin
3. Domain ayarlarını yapın
4. SSL sertifikası otomatik gelecektir

---

**Destek için**: kaniyedincer@gmail.com 