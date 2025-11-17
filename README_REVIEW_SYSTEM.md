# ⭐ Neyisek.com Gelişmiş Değerlendirme Sistemi

Neyisek.com platformu için geliştirilmiş, kapsamlı ve modern değerlendirme sistemi. Bu sistem, kullanıcıların restoranlar, ürünler ve hizmetler hakkında detaylı değerlendirmeler yapmasını sağlar.

## 🚀 Özellikler

### 📝 Değerlendirme Oluşturma
- **Çoklu Kategori Puanlama**: 12 farklı kategori için ayrı puanlama
- **Medya Desteği**: Fotoğraf ve video yükleme
- **Detaylı İçerik**: Başlık, açıklama, artı/eksi listesi, etiketler
- **Anonim Seçeneği**: İsteğe bağlı anonim değerlendirme
- **Sipariş Doğrulama**: Gerçek sipariş bazlı doğrulama

### 🎯 Kategori Sistemi
- **Yemek Kalitesi** (food_quality)
- **Hizmet Hızı** (service_speed)
- **Temizlik** (cleanliness)
- **Fiyat/Performans** (value_for_money)
- **Atmosfer** (atmosphere)
- **Teslimat Süresi** (delivery_time)
- **Paketleme** (packaging)
- **Müşteri Hizmeti** (customer_service)
- **Porsiyon Büyüklüğü** (portion_size)
- **Tazelik** (freshness)
- **Lezzet** (taste)
- **Sunum** (presentation)

### 🔍 Filtreleme ve Sıralama
- Puan bazlı filtreleme (1-5 yıldız)
- Durum filtreleme (onaylanmış, beklemede, reddedilmiş)
- Medya içerikli değerlendirmeler
- Doğrulanmış değerlendirmeler
- Tarih, puan ve faydalılık bazlı sıralama

### 📊 Analitik ve İstatistikler
- Genel değerlendirme istatistikleri
- Puan dağılımı grafikleri
- Kategori bazlı performans analizi
- Trend göstergeleri (iyileşen, azalan, stabil)
- Etkileşim metrikleri
- Müşteri demografik analizi

### 🤝 Etkileşim Sistemi
- Beğeni/Dislike sistemi
- Faydalı bulma özelliği
- Raporlama sistemi
- Yanıt ve yorum sistemi
- Restoran sahibi yanıtları

### 🛡️ Moderasyon ve Güvenlik
- Otomatik içerik moderasyonu
- Spam koruması
- Profanity filtreleme
- Kullanıcı yetki kontrolü
- Güvenli dosya yükleme

## 🏗️ Teknik Mimari

### 📁 Dosya Yapısı
```
src/
├── components/
│   ├── ReviewCard.tsx          # Değerlendirme kartı bileşeni
│   ├── ReviewForm.tsx          # Değerlendirme formu
│   ├── ReviewList.tsx          # Değerlendirme listesi
│   └── ReviewSummary.tsx       # İstatistik özeti
├── hooks/
│   └── useReviews.ts           # Değerlendirme hook'u
├── services/
│   └── reviewService.ts        # Değerlendirme servisi
├── types/
│   └── index.ts               # TypeScript tipleri
└── app/
    └── test-reviews/
        └── page.tsx            # Test sayfası
```

### 🔧 Kullanılan Teknolojiler
- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Firebase Firestore
- **State Management**: React Hooks
- **UI Components**: Lucide React Icons
- **Real-time**: Firebase Realtime Database

## 🚀 Kurulum ve Kullanım

### 1. Bileşenleri İçe Aktarma
```typescript
import ReviewCard from '@/components/ReviewCard';
import ReviewForm from '@/components/ReviewForm';
import ReviewList from '@/components/ReviewList';
import ReviewSummary from '@/components/ReviewSummary';
import { useReviews } from '@/hooks/useReviews';
```

### 2. Temel Kullanım
```typescript
// Değerlendirme listesi
<ReviewList
  restaurantId="restaurant-123"
  showCreateButton={true}
  maxReviews={10}
  showFilters={true}
  showStats={true}
/>

// Değerlendirme formu
<ReviewForm
  restaurantId="restaurant-123"
  type="restaurant"
  onSuccess={(reviewId) => console.log('Review created:', reviewId)}
  onCancel={() => console.log('Cancelled')}
/>

// İstatistik özeti
<ReviewSummary
  restaurantId="restaurant-123"
  showCategoryBreakdown={true}
  showTrends={true}
/>
```

### 3. Hook Kullanımı
```typescript
const { 
  reviews, 
  stats, 
  createReview, 
  getReviews,
  isLoading,
  error 
} = useReviews();

// Değerlendirme oluşturma
const handleCreateReview = async () => {
  try {
    const reviewId = await createReview({
      restaurantId: 'restaurant-123',
      type: 'restaurant',
      content: {
        overallRating: 5,
        categoryRatings: {
          food_quality: 5,
          service_speed: 4,
          // ... diğer kategoriler
        },
        title: 'Harika bir deneyim',
        description: 'Çok lezzetli yemekler...',
        pros: ['Lezzetli', 'Hızlı servis'],
        cons: ['Biraz pahalı'],
        tags: ['lezzetli', 'hızlı']
      },
      media: [],
      isAnonymous: false
    });
    console.log('Review created:', reviewId);
  } catch (error) {
    console.error('Error creating review:', error);
  }
};
```

## 📊 Veri Modelleri

### Review Interface
```typescript
interface Review {
  id: string;
  userId: string;
  restaurantId: string;
  orderId?: string;
  productId?: string;
  type: ReviewType;
  content: ReviewContent;
  media?: ReviewMedia[];
  status: ReviewStatus;
  priority: ReviewPriority;
  isVerified: boolean;
  isAnonymous: boolean;
  helpfulCount: number;
  reportCount: number;
  interactions: ReviewInteraction[];
  responses: ReviewResponse[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### ReviewContent Interface
```typescript
interface ReviewContent {
  title?: string;
  description?: string;
  overallRating: number;
  categoryRatings?: Record<ReviewCategory, number>;
  tags?: string[];
  pros?: string[];
  cons?: string[];
  recommendations?: string[];
  media?: ReviewMedia[];
}
```

## 🎨 UI Bileşenleri

### ReviewCard
- Değerlendirme detaylarını gösterir
- Etkileşim butonları (beğeni, raporlama)
- Medya galerisi
- Yanıt sistemi
- Durum göstergeleri

### ReviewForm
- Çoklu kategori puanlama
- Medya yükleme
- Artı/eksi listesi
- Etiket sistemi
- Anonim seçeneği

### ReviewList
- Filtrelenmiş değerlendirme listesi
- Sıralama seçenekleri
- İstatistik kartları
- Sayfalama

### ReviewSummary
- Genel istatistikler
- Puan dağılımı
- Kategori analizi
- Trend göstergeleri

## 🔒 Güvenlik Özellikleri

### Kullanıcı Yetki Kontrolü
- Sadece giriş yapmış kullanıcılar değerlendirme yapabilir
- Kendi değerlendirmelerini düzenleyebilir/silebilir
- Admin yetkisi gerektiren işlemler

### İçerik Moderasyonu
- Otomatik spam tespiti
- Profanity filtreleme
- Uygunsuz içerik kontrolü
- Manuel moderasyon desteği

### Veri Doğrulama
- Sipariş doğrulama
- Dosya boyutu ve format kontrolü
- Rate limiting
- Input sanitization

## 📈 Performans Optimizasyonları

### Lazy Loading
- Değerlendirmeler sayfalı olarak yüklenir
- Medya dosyaları lazy loading ile yüklenir
- Infinite scroll desteği

### Önbellek Stratejisi
- Firestore önbellek kullanımı
- React Query entegrasyonu
- CDN kullanımı

### Görsel Optimizasyonu
- Otomatik görsel sıkıştırma
- Thumbnail oluşturma
- Responsive görsel boyutları

## 🧪 Test ve Geliştirme

### Test Sayfası
`/test-reviews` sayfasında tüm bileşenler test edilebilir:
- Değerlendirme listesi
- İstatistik özeti
- Değerlendirme formu

### Geliştirme Araçları
- TypeScript tip kontrolü
- ESLint kod kalitesi
- Prettier kod formatı
- React DevTools

## 🔄 Gelecek Geliştirmeler

### Planlanan Özellikler
- [ ] AI destekli içerik analizi
- [ ] Sentiment analizi
- [ ] Otomatik öneri sistemi
- [ ] Çoklu dil desteği
- [ ] Push notification entegrasyonu
- [ ] Sosyal medya paylaşımı
- [ ] Gamification sistemi
- [ ] Değerlendirme kampanyaları

### Teknik İyileştirmeler
- [ ] GraphQL entegrasyonu
- [ ] Microservice mimarisi
- [ ] Redis önbellek
- [ ] Elasticsearch arama
- [ ] WebSocket real-time güncellemeler

## 📞 Destek ve İletişim

Bu değerlendirme sistemi Neyisek.com platformu için geliştirilmiştir. Sorularınız için:

- **Email**: support@neyisek.com
- **Dokümantasyon**: [docs.neyisek.com](https://docs.neyisek.com)
- **GitHub**: [github.com/neyisek/review-system](https://github.com/neyisek/review-system)

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.

---

**⭐ Neyisek.com Değerlendirme Sistemi** - Modern, güvenli ve kullanıcı dostu değerlendirme deneyimi. 