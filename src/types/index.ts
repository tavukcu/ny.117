// Kullanıcı rolleri
export type UserRole = 'customer' | 'restaurant' | 'admin' | 'guest';

// Kullanıcı tercihleri
export interface UserPreferences {
  // Bildirim tercihleri
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    orderUpdates: boolean;
    promotions: boolean;
    newRestaurants: boolean;
    reviews: boolean;
  };
  
  // Dil ve bölge tercihleri
  language: 'tr' | 'en';
  currency: 'TRY' | 'USD' | 'EUR';
  timezone: string;
  
  // Gizlilik ayarları
  privacy: {
    profileVisibility: 'public' | 'friends' | 'private';
    orderHistoryVisibility: 'public' | 'friends' | 'private';
    reviewsVisibility: 'public' | 'friends' | 'private';
    allowDataSharing: boolean;
    allowAnalytics: boolean;
  };
  
  // Tema tercihleri
  theme: 'light' | 'dark' | 'auto';
  fontSize: 'small' | 'medium' | 'large';
  
  // Erişilebilirlik
  accessibility: {
    highContrast: boolean;
    screenReader: boolean;
    reducedMotion: boolean;
    largeText: boolean;
  };
}

// Beslenme tercihleri ve kısıtlamaları
export interface DietaryPreferences {
  // Diyet türleri
  dietType: 'none' | 'vegetarian' | 'vegan' | 'keto' | 'paleo' | 'mediterranean' | 'low_carb' | 'gluten_free' | 'dairy_free' | 'custom';
  
  // Alerjiler
  allergies: string[]; // ['gluten', 'dairy', 'nuts', 'shellfish', 'eggs', 'soy']
  
  // Hoşlanmadığı malzemeler
  dislikes: string[];
  
  // Kalori hedefi
  calorieGoal?: {
    daily: number;
    meal: number;
  };
  
  // Makro besin hedefleri
  macroGoals?: {
    protein: number; // g
    carbohydrates: number; // g
    fat: number; // g
    fiber: number; // g
  };
  
  // Porsiyon tercihleri
  portionSize: 'small' | 'medium' | 'large';
  
  // Özel talimatlar
  specialInstructions?: string;
  
  // Beslenme skoru hedefi
  nutritionScoreGoal?: number;
}

// Kullanıcı istatistikleri
export interface UserStats {
  // Sipariş istatistikleri
  orders: {
    total: number;
    completed: number;
    cancelled: number;
    totalSpent: number;
    averageOrderValue: number;
    lastOrderDate?: Date;
  };
  
  // Favori restoranlar
  favorites: {
    restaurants: string[];
    products: string[];
    categories: string[];
  };
  
  // Değerlendirmeler
  reviews: {
    total: number;
    averageRating: number;
    helpfulCount: number;
  };
  
  // Sadakat programı
  loyalty: {
    points: number;
    tier: 'bronze' | 'silver' | 'gold' | 'platinum';
    nextTierPoints: number;
    totalEarned: number;
    totalRedeemed: number;
  };
  
  // Aktivite
  activity: {
    joinDate: Date;
    lastActive: Date;
    totalSessions: number;
    averageSessionDuration: number; // dakika
    favoriteOrderTime: string; // "18:00-20:00"
    favoriteOrderDay: string; // "Friday"
  };
  
  // Beslenme istatistikleri
  nutrition: {
    totalCaloriesConsumed: number;
    averageCaloriesPerOrder: number;
    favoriteCuisine: string;
    mostOrderedCategory: string;
    nutritionScoreAverage: number;
    dietaryCompliance: number; // % uyumluluk
  };
}

// Kullanıcı sosyal özellikleri
export interface UserSocial {
  // Takip sistemi
  following: string[]; // Takip edilen kullanıcılar
  followers: string[]; // Takipçiler
  
  // Arkadaşlar
  friends: string[];
  friendRequests: {
    sent: string[];
    received: string[];
  };
  
  // Sosyal aktiviteler
  socialActivity: {
    sharedOrders: number;
    sharedReviews: number;
    recommendations: number;
    groupOrders: number;
  };
  
  // Sosyal medya bağlantıları
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
  };
}

// Kullanıcı adresleri
export interface UserAddress extends Address {
  id: string;
  name: string; // "Ev", "İş", "Anne Evi"
  isDefault: boolean;
  isActive: boolean;
  instructions?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Kullanıcı ödeme yöntemleri
export interface UserPaymentMethod {
  id: string;
  type: 'card' | 'bank_transfer' | 'digital_wallet';
  name: string; // "Ana Kredi Kartım", "İş Bankası"
  isDefault: boolean;
  isActive: boolean;
  
  // Kart bilgileri (şifrelenmiş)
  cardInfo?: {
    last4: string;
    brand: 'visa' | 'mastercard' | 'amex' | 'discover';
    expiryMonth: number;
    expiryYear: number;
  };
  
  // Banka bilgileri
  bankInfo?: {
    bankName: string;
    accountType: 'checking' | 'savings';
    last4: string;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// Kullanıcı sipariş geçmişi özeti
export interface UserOrderHistory {
  recent: Array<{
    orderId: string;
    restaurantName: string;
    total: number;
    status: OrderStatus;
    orderDate: Date;
    items: Array<{
      name: string;
      quantity: number;
    }>;
  }>;
  
  favorites: Array<{
    restaurantId: string;
    restaurantName: string;
    orderCount: number;
    lastOrderDate: Date;
    averageRating: number;
  }>;
  
  statistics: {
    totalOrders: number;
    totalSpent: number;
    averageOrderValue: number;
    mostOrderedDay: string;
    mostOrderedTime: string;
    favoriteCuisine: string;
  };
}

// Gelişmiş kullanıcı tipi
export interface User {
  uid: string;
  email: string;
  displayName: string;
  phoneNumber: string;
  
  // Temel profil bilgileri
  profile: {
    firstName: string;
    lastName: string;
    birthDate?: Date;
    gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
    profileImage?: string;
    coverImage?: string;
    bio?: string;
    location?: {
      city: string;
      district: string;
      coordinates?: {
        lat: number;
        lng: number;
      };
    };
  };
  
  // Adresler
  addresses: UserAddress[];
  
  // Ödeme yöntemleri
  paymentMethods: UserPaymentMethod[];
  
  // Tercihler
  preferences: UserPreferences;
  
  // Beslenme tercihleri
  dietaryPreferences: DietaryPreferences;
  
  // İstatistikler
  stats: UserStats;
  
  // Sosyal özellikler
  social: UserSocial;
  
  // Sipariş geçmişi
  orderHistory: UserOrderHistory;
  
  // Sistem bilgileri
  role: UserRole;
  isAdmin?: boolean;
  isActive: boolean;
  restaurantId?: string;
  
  // Hesap durumu
  accountStatus: 'active' | 'suspended' | 'pending_verification' | 'deleted';
  emailVerified: boolean;
  phoneVerified: boolean;
  
  // Güvenlik
  security: {
    twoFactorEnabled: boolean;
    lastPasswordChange?: Date;
    failedLoginAttempts: number;
    lastFailedLogin?: Date;
    accountLockedUntil?: Date;
  };
  
  // Zaman damgaları
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

// Adres tipi tanımı
export interface Address {
  street: string;
  city: string;
  district: string;
  zipCode: string;
  country: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Yemek kategorisi tipi tanımı
export interface Category {
  id: string;
  name: string;
  description: string;
  icon?: string; // 3D emoji icon
  imageUrl: string;
  color?: string; // Kategori kart rengi (hex color veya tailwind class)
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

// Ürün varyantı tipi tanımı
export interface ProductVariant {
  id: string;
  name: string; // Küçük, Orta, Büyük
  price: number;
  stock: number;
  isActive: boolean;
}

// Ürün resim galerisi tipi
export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
  sortOrder: number;
}

// Beslenme bilgileri tipi (zorunlu kalori bildirimi için)
export interface NutritionInfo {
  // Temel besin değerleri (100g başına)
  calories: number;              // Kalori (kcal)
  protein: number;               // Protein (g)
  carbohydrates: number;         // Karbonhidrat (g)
  fat: number;                   // Yağ (g)
  saturatedFat: number;          // Doymuş yağ (g)
  transFat: number;              // Trans yağ (g)
  fiber: number;                 // Lif (g)
  sugar: number;                 // Şeker (g)
  sodium: number;                // Sodyum (mg)
  cholesterol: number;           // Kolesterol (mg)
  
  // Vitaminler ve mineraller
  vitaminA?: number;             // Vitamin A (IU)
  vitaminC?: number;             // Vitamin C (mg)
  vitaminD?: number;             // Vitamin D (IU)
  vitaminE?: number;             // Vitamin E (mg)
  vitaminK?: number;             // Vitamin K (mcg)
  vitaminB1?: number;            // Vitamin B1/Thiamin (mg)
  vitaminB2?: number;            // Vitamin B2/Riboflavin (mg)
  vitaminB3?: number;            // Vitamin B3/Niacin (mg)
  vitaminB6?: number;            // Vitamin B6 (mg)
  vitaminB12?: number;           // Vitamin B12 (mcg)
  folate?: number;               // Folat (mcg)
  calcium?: number;              // Kalsiyum (mg)
  iron?: number;                 // Demir (mg)
  magnesium?: number;            // Magnezyum (mg)
  phosphorus?: number;           // Fosfor (mg)
  potassium?: number;            // Potasyum (mg)
  zinc?: number;                 // Çinko (mg)
  
  // Porsiyon bilgileri
  servingSize: string;           // Porsiyon boyutu (örn: "1 adet", "200g")
  servingsPerContainer?: number; // Paket başına porsiyon sayısı
  
  // Günlük değer yüzdeleri (%)
  dailyValues?: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    saturatedFat: number;
    fiber: number;
    sugar: number;
    sodium: number;
    cholesterol: number;
  };
  
  // Beslenme etiketleri
  nutritionLabels: string[];     // ["Düşük kalorili", "Yüksek protein", "Gluten içermez"]
  
  // Kalori kategorisi
  calorieCategory: 'low' | 'medium' | 'high' | 'very_high';
  
  // Beslenme skoru (0-100)
  nutritionScore: number;
  
  // Son güncelleme tarihi
  lastUpdated: Date;
  
  // Doğrulama bilgileri
  isVerified: boolean;           // Beslenme bilgileri doğrulandı mı?
  verifiedBy?: string;           // Doğrulayan kişi/kurum
  verificationDate?: Date;       // Doğrulama tarihi
}

// Kalori hesaplama sonucu
export interface CalorieCalculation {
  totalCalories: number;
  totalProtein: number;
  totalCarbohydrates: number;
  totalFat: number;
  totalFiber: number;
  totalSugar: number;
  totalSodium: number;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
  }>;
  dailyValuePercentages: {
    calories: number;
    protein: number;
    carbohydrates: number;
    fat: number;
    fiber: number;
    sugar: number;
    sodium: number;
  };
}

// Ürün tipi tanımı (güncellenmiş)
export interface Product {
  id: string;
  restaurantId: string; // Ürünün ait olduğu restoran ID'si
  name: string;
  description: string;
  price: number; // Base price
  originalPrice?: number; // İndirim öncesi fiyat (opsiyonel)
  categoryId: string;
  imageUrl: string; // Primary image
  images: ProductImage[]; // Image gallery
  variants: ProductVariant[]; // Size/price variants
  ingredients: string[];
  allergens: string[];
  isVegetarian: boolean;
  isVegan: boolean;
  isGlutenFree: boolean;
  preparationTime: number; // dakika cinsinden
  
  // Beslenme bilgileri (zorunlu kalori bildirimi)
  nutritionInfo: NutritionInfo;
  
  // Geriye dönük uyumluluk için (eski calories alanı)
  calories: number; // Deprecated - nutritionInfo.calories kullanın
  
  isActive: boolean;
  stock: number; // Base stock
  minStock: number; // Minimum stock alert
  maxStock: number; // Maximum stock limit
  tags: string[]; // Search tags
  rating: number; // Average rating
  reviewCount: number; // Number of reviews
  isPopular: boolean; // Popular product flag
  isFeatured: boolean; // Featured product flag
  
  // Barkod sistemi için yeni alanlar
  barcode?: string; // Barkod numarası
  isBarcodeProduct?: boolean; // Barkodlu ürün mü?
  
  createdAt: Date;
  updatedAt: Date;
}

// Sepet ürünü tipi tanımı
export interface CartItem {
  productId: string;
  product: Product;
  variantId?: string; // Selected variant
  variant?: ProductVariant;
  quantity: number;
  specialInstructions?: string;
  categoryId: string; // Kategori ID'si
  price: number; // Ürün fiyatı (variant fiyatı veya base fiyat)
}

// Sipariş durumu enum'u (geliştirilmiş)
export enum OrderStatus {
  PENDING = 'pending',           // Sipariş alındı, onay bekliyor
  CONFIRMED = 'confirmed',       // Restoran tarafından onaylandı
  PREPARING = 'preparing',       // Yemek hazırlanıyor
  READY = 'ready',              // Yemek hazır, teslimatçı bekleniyor
  ASSIGNED = 'assigned',        // Teslimatçı atandı
  PICKED_UP = 'picked_up',      // Teslimatçı yemeği aldı
  DELIVERING = 'delivering',    // Yolda
  ARRIVED = 'arrived',          // Teslimatçı adrese vardı
  DELIVERED = 'delivered',      // Teslim edildi
  CANCELLED = 'cancelled',      // İptal edildi
  REFUNDED = 'refunded'         // İade edildi
}

// Teslimat durumu enum'u
export enum DeliveryStatus {
  NOT_STARTED = 'not_started',
  ASSIGNING_DRIVER = 'assigning_driver',
  DRIVER_ASSIGNED = 'driver_assigned',
  DRIVER_PICKING_UP = 'driver_picking_up',
  DRIVER_ON_WAY = 'driver_on_way',
  DRIVER_ARRIVED = 'driver_arrived',
  DELIVERED = 'delivered',
  FAILED = 'failed'
}

// Teslimatçı bilgileri
export interface DeliveryDriver {
  id: string;
  name: string;
  phone: string;
  photoUrl?: string;
  vehicle: {
    type: 'car' | 'motorcycle' | 'bicycle' | 'scooter';
    model?: string;
    plateNumber?: string;
  };
  currentLocation?: {
    lat: number;
    lng: number;
    timestamp: Date;
  };
  rating: number;
  totalDeliveries: number;
  isOnline: boolean;
  estimatedArrival?: Date;
}

// Sipariş takip bilgileri
export interface OrderTracking {
  orderId: string;
  status: OrderStatus;
  deliveryStatus: DeliveryStatus;
  driver?: DeliveryDriver;
  
  // Zaman damgaları
  timestamps: {
    orderPlaced: Date;
    confirmed?: Date;
    preparing?: Date;
    ready?: Date;
    driverAssigned?: Date;
    pickedUp?: Date;
    delivering?: Date;
    arrived?: Date;
    delivered?: Date;
    cancelled?: Date;
  };
  
  // Tahmini süreler
  estimatedTimes: {
    preparation: number; // dakika
    delivery: number;    // dakika
    total: number;       // dakika
  };
  
  // Gerçek süreler
  actualTimes: {
    preparation?: number;
    delivery?: number;
    total?: number;
  };
  
  // Konum takibi
  locationHistory: Array<{
    lat: number;
    lng: number;
    timestamp: Date;
    status: OrderStatus;
    description?: string;
  }>;
  
  // Durum güncellemeleri
  statusUpdates: Array<{
    status: OrderStatus;
    timestamp: Date;
    description: string;
    updatedBy: 'system' | 'restaurant' | 'driver' | 'customer';
    metadata?: Record<string, any>;
  }>;
  
  // Bildirimler
  notifications: Array<{
    type: 'sms' | 'email' | 'push' | 'in_app';
    sent: boolean;
    timestamp: Date;
    content: string;
  }>;
  
  // Müşteri etkileşimi
  customerInteractions: Array<{
    type: 'call_driver' | 'call_restaurant' | 'cancel_request' | 'modify_request';
    timestamp: Date;
    status: 'pending' | 'approved' | 'rejected';
    notes?: string;
  }>;
}

// Sipariş tipi tanımı (güncellenmiş)
export interface Order {
  id: string;
  userId: string;
  user: User;
  restaurantId: string;
  restaurant: RestaurantInfo;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  commissionCalculation: CommissionCalculation;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  deliveryAddress: OrderDeliveryAddress;
  
  // Takip bilgileri
  tracking: OrderTracking;
  
  // Zaman bilgileri
  estimatedDeliveryTime: Date;
  actualDeliveryTime?: Date;
  preparationStartTime?: Date;
  preparationEndTime?: Date;
  
  // Özel talimatlar
  specialInstructions?: string;
  deliveryInstructions?: string;
  
  // Mali işlem
  transactionId?: string;
  
  // Değerlendirme
  review?: OrderReview;
  
  // Sistem bilgileri
  createdAt: Date;
  updatedAt: Date;
}

// Ödeme yöntemi enum'u (güncellendi - sadece kapıda ödeme)
export enum PaymentMethod {
  CASH_ON_DELIVERY = 'cash_on_delivery',     // Kapıda nakit ödeme
  CARD_ON_DELIVERY = 'card_on_delivery'      // Kapıda kredi kartı ile ödeme
}

// Komisyon hesaplama tipi
export interface CommissionCalculation {
  subtotal: number;           // Alt toplam (komisyon öncesi)
  commissionRate: number;     // Komisyon oranı (%9)
  commissionAmount: number;   // Komisyon tutarı
  restaurantEarning: number;  // Restoranın kazancı
  platformEarning: number;    // Platform kazancı
}

// Mali işlem tipi
export interface Transaction {
  id: string;
  orderId: string;
  restaurantId: string;
  type: 'commission' | 'payment' | 'refund';
  amount: number;
  commissionAmount: number;
  platformAmount: number;
  restaurantAmount: number;
  paymentMethod: PaymentMethod;
  status: 'pending' | 'completed' | 'failed';
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Restoran mali özeti
export interface RestaurantFinancials {
  restaurantId: string;
  period: {
    startDate: Date;
    endDate: Date;
  };
  totalRevenue: number;        // Toplam gelir
  totalCommission: number;     // Toplam komisyon
  netEarning: number;          // Net kazanç
  totalOrders: number;         // Toplam sipariş sayısı
  averageOrderValue: number;   // Ortalama sipariş değeri
  commissionRate: number;      // Komisyon oranı
  paymentMethodBreakdown: {
    cash: { count: number; amount: number; commission: number };
    card: { count: number; amount: number; commission: number };
  };
  dailyBreakdown: {
    date: Date;
    revenue: number;
    commission: number;
    netEarning: number;
    orderCount: number;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

// Sipariş teslimat adresi tipi
export interface OrderDeliveryAddress extends Address {
  fullName?: string;
  phone?: string;
  isDefault?: boolean;
  instructions?: string;
}

// Restoran bilgileri tipi tanımı
export interface RestaurantInfo {
  id: string;
  name: string;
  description: string;
  categoryIds: string[]; // Restoranın sunduğu kategori ID'leri
  address: Address;
  phone: string;
  email: string;
  website?: string;
  coverImageUrl?: string; // Restoran kapak görseli
  workingHours: {
    [key: string]: {
      open: string;
      close: string;
      isOpen: boolean;
    };
  };
  deliveryRadius: number; // km cinsinden
  minimumOrderAmount: number;
  deliveryFee: number;
  estimatedDeliveryTime: number; // dakika cinsinden
  isOpen: boolean;
  rating?: number; // Restoran puanı (0-5)
  reviewCount?: number; // Yorum sayısı
  commissionRate: number; // Komisyon oranı (varsayılan %9)
  
  // Bildirim ayarları
  notifications?: {
    telegram?: {
      chatId?: string; // Telegram Chat ID
      isEnabled: boolean; // Telegram bildirimi aktif mi
      setupToken?: string; // Setup için geçici token
      setupAt?: Date; // Kurulum tarihi
    };
    whatsapp?: {
      phoneNumber?: string; // WhatsApp telefon numarası
      isEnabled: boolean; // WhatsApp bildirimi aktif mi
    };
    email?: {
      isEnabled: boolean; // E-posta bildirimi aktif mi
    };
  };
  
  createdAt: Date;
  updatedAt: Date;
}

// E-posta türleri
export enum EmailType {
  WELCOME = 'welcome',
  ORDER_CONFIRMATION = 'order_confirmation',
  ORDER_STATUS_UPDATE = 'order_status_update',
  RESTAURANT_APPLICATION = 'restaurant_application',
  FINANCIAL_REPORT = 'financial_report',
  PASSWORD_RESET = 'password_reset'
}

// E-posta template'leri için interface'ler
export interface WelcomeEmailData {
  userName: string;
  userEmail: string;
}

export interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  restaurantName: string;
  orderItems: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: string;
  estimatedDelivery?: string;
}

export interface RestaurantApplicationEmailData {
  restaurantName: string;
  ownerName: string;
  ownerEmail: string;
  status: 'approved' | 'rejected' | 'pending';
  adminMessage?: string;
}

export interface FinancialReportEmailData {
  restaurantName: string;
  ownerEmail: string;
  reportPeriod: {
    start: Date;
    end: Date;
  };
  totalRevenue: number;
  totalOrders: number;
  commission: number;
  netEarnings: number;
  pdfBuffer?: Buffer;
}

// Reklam/Kampanya türleri
export interface Advertisement {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  buttonText?: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  position: 'hero' | 'banner' | 'sidebar' | 'popup';
  priority: number; // Yüksek öncelik üstte gösterilir
  targetAudience?: 'all' | 'customers' | 'restaurants';
  backgroundColor?: string;
  textColor?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string; // Admin user ID
  clickCount: number;
  viewCount: number;
}

export interface AdvertisementStats {
  totalViews: number;
  totalClicks: number;
  ctr: number; // Click-through rate
  dailyStats: {
    date: string;
    views: number;
    clicks: number;
  }[];
}

// ===== PUANLAMA VE DEĞERLENDİRME SİSTEMİ =====

// Değerlendirme türleri
export enum ReviewType {
  RESTAURANT = 'restaurant',
  PRODUCT = 'product',
  DELIVERY = 'delivery',
  SERVICE = 'service',
  OVERALL = 'overall'
}

// Değerlendirme kategorileri
export enum ReviewCategory {
  FOOD_QUALITY = 'food_quality',
  SERVICE_SPEED = 'service_speed',
  CLEANLINESS = 'cleanliness',
  VALUE_FOR_MONEY = 'value_for_money',
  ATMOSPHERE = 'atmosphere',
  DELIVERY_TIME = 'delivery_time',
  PACKAGING = 'packaging',
  CUSTOMER_SERVICE = 'customer_service',
  PORTION_SIZE = 'portion_size',
  FRESHNESS = 'freshness',
  TASTE = 'taste',
  PRESENTATION = 'presentation'
}

// Değerlendirme durumu
export enum ReviewStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  FLAGGED = 'flagged',
  HIDDEN = 'hidden'
}

// Değerlendirme önceliği
export enum ReviewPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Değerlendirme içeriği
export interface ReviewContent {
  title?: string;
  description?: string; // text yerine description kullanıyoruz
  overallRating: number; // rating yerine overallRating kullanıyoruz
  categoryRatings?: Record<ReviewCategory, number>; // Kategori bazlı puanlar
  tags?: string[]; // "lezzetli", "hızlı", "temiz" vb.
  pros?: string[]; // Avantajlar
  cons?: string[]; // Dezavantajlar
  recommendations?: string[]; // Öneriler
  media?: ReviewMedia[]; // Medya dosyaları
}

// Değerlendirme medya
export interface ReviewMedia {
  id: string;
  type: 'image' | 'video';
  url: string;
  thumbnail?: string;
  alt?: string;
  caption?: string;
  filename?: string; // Dosya adı
  uploadedAt: Date;
  size: number; // bytes
  dimensions?: {
    width: number;
    height: number;
  };
}

// Değerlendirme etkileşimleri
export interface ReviewInteraction {
  userId: string;
  type: 'like' | 'dislike' | 'helpful' | 'report';
  createdAt: Date;
  reason?: string; // Raporlama nedeni
}

// Değerlendirme yanıtı
export interface ReviewResponse {
  id: string;
  reviewId: string;
  responderId: string; // Restoran sahibi veya admin
  responderType: 'restaurant' | 'admin';
  content: string;
  isPublic: boolean; // Müşteriye görünür mü
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

// Ana değerlendirme tipi
export interface Review {
  id: string;
  userId: string;
  restaurantId: string;
  orderId?: string; // Sipariş bazlı değerlendirme
  productId?: string; // Ürün bazlı değerlendirme
  type: ReviewType;
  content: ReviewContent;
  media?: ReviewMedia[];
  status: ReviewStatus;
  priority: ReviewPriority;
  isVerified: boolean; // Sipariş doğrulaması
  isAnonymous: boolean;
  helpfulCount: number;
  reportCount: number;
  interactions: ReviewInteraction[];
  responses: ReviewResponse[];
  moderationNotes?: string;
  moderatedBy?: string;
  moderatedAt?: Date;
  tags: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Değerlendirme şablonu
export interface ReviewTemplate {
  id: string;
  name: string;
  type: ReviewType;
  categories: ReviewCategory[];
  requiredFields: string[];
  optionalFields: string[];
  maxRating: number;
  minTextLength: number;
  maxTextLength: number;
  allowMedia: boolean;
  maxMediaCount: number;
  allowAnonymous: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Değerlendirme istatistikleri
export interface ReviewStats {
  totalReviews: number;
    averageRating: number;
  ratingDistribution: Record<number, number>; // 1-5 arası dağılım
  categoryAverages: Record<ReviewCategory, number>;
  recentReviews: number; // Son 30 gün
  responseRate: number; // Yanıt oranı
  helpfulRate: number; // Faydalı bulunma oranı
  verifiedReviews: number;
  anonymousReviews: number;
  byStatus: Record<ReviewStatus, number>;
  byType: Record<ReviewType, number>;
  byMonth: Record<string, number>; // Aylık dağılım
  topTags: Array<{ tag: string; count: number }>;
  sentimentAnalysis: {
    positive: number;
    neutral: number;
    negative: number;
  };
}

// Değerlendirme moderasyon
export interface ReviewModeration {
  id: string;
  reviewId: string;
  moderatorId: string;
  action: 'approve' | 'reject' | 'flag' | 'hide';
  reason: string;
  notes?: string;
  autoModerated: boolean;
  createdAt: Date;
}

// Değerlendirme raporu
export interface ReviewReport {
  id: string;
  reviewId: string;
  reporterId: string;
  reason: 'inappropriate' | 'spam' | 'fake' | 'offensive' | 'irrelevant' | 'other';
  description: string;
  evidence?: string[]; // Kanıt linkleri
  status: 'pending' | 'investigating' | 'resolved' | 'dismissed';
  assignedTo?: string;
  resolution?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
}

// Değerlendirme kampanyası
export interface ReviewCampaign {
  id: string;
  name: string;
  description?: string;
  restaurantId: string;
  targetReviews: number;
  currentReviews: number;
  startDate: Date;
  endDate: Date;
  incentives?: {
    type: 'discount' | 'points' | 'free_item' | 'cashback';
    value: number;
    description: string;
  };
  criteria: {
    minOrderValue?: number;
    minRating?: number;
    requirePhoto?: boolean;
    requireText?: boolean;
  };
  status: 'draft' | 'active' | 'paused' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

// Değerlendirme analitikleri
export interface ReviewAnalytics {
  // Genel metrikler
  totalReviews: number;
  averageRating: number;
  ratingTrend: Array<{ date: string; rating: number }>;
  
  // Kategori analizi
  categoryPerformance: Record<ReviewCategory, {
    averageRating: number;
    totalReviews: number;
    trend: 'improving' | 'declining' | 'stable';
  }>;
  
  // Zaman analizi
  reviewsByHour: Record<number, number>;
  reviewsByDay: Record<string, number>;
  reviewsByMonth: Record<string, number>;
  
  // Kullanıcı analizi
  reviewerDemographics: {
    newCustomers: number;
    returningCustomers: number;
    anonymousReviews: number;
    verifiedReviews: number;
  };
  
  // İçerik analizi
  contentAnalysis: {
    averageTextLength: number;
    mediaUsage: number; // % oranı
    tagUsage: Array<{ tag: string; frequency: number }>;
    sentimentTrend: Array<{ date: string; positive: number; negative: number }>;
  };
  
  // Etkileşim analizi
  engagementMetrics: {
    responseRate: number;
    averageResponseTime: number; // saat
    helpfulRate: number;
    reportRate: number;
  };
  
  // Karşılaştırma
  competitorComparison?: {
    competitorId: string;
    competitorName: string;
    theirRating: number;
    theirReviewCount: number;
    difference: number;
  }[];
}

// Değerlendirme ayarları
export interface ReviewSettings {
  // Genel ayarlar
  allowAnonymousReviews: boolean;
  requireOrderVerification: boolean;
  requireMinimumTextLength: boolean;
  minimumTextLength: number;
  maximumTextLength: number;
  
  // Medya ayarları
  allowPhotos: boolean;
  allowVideos: boolean;
  maxMediaCount: number;
  maxFileSize: number; // MB
  allowedFormats: string[];
  
  // Moderasyon ayarları
  autoModeration: boolean;
  requireApproval: boolean;
  profanityFilter: boolean;
  spamDetection: boolean;
  
  // Bildirim ayarları
  notifyOnNewReview: boolean;
  notifyOnReport: boolean;
  notifyOnResponse: boolean;
  
  // Kampanya ayarları
  allowReviewCampaigns: boolean;
  maxCampaignDuration: number; // gün
  maxIncentiveValue: number; // TL
  
  // Görünürlük ayarları
  showReviewerName: boolean;
  showReviewerPhoto: boolean;
  showReviewDate: boolean;
  showVerifiedBadge: boolean;
}

// Şikayet Sistemi Types
export enum ComplaintType {
  ORDER = 'ORDER',
  PRODUCT = 'PRODUCT',
  RESTAURANT = 'RESTAURANT',
  DELIVERY = 'DELIVERY',
  PAYMENT = 'PAYMENT',
  SERVICE = 'SERVICE',
  TECHNICAL = 'TECHNICAL',
  OTHER = 'OTHER'
}

export enum ComplaintStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
  REJECTED = 'REJECTED'
}

export enum ComplaintPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

export interface Complaint {
  id: string;
  userId: string;
  user: User;
  type: ComplaintType;
  title: string;
  description: string;
  orderId?: string;
  productId?: string;
  restaurantId?: string;
  status: ComplaintStatus;
  priority: ComplaintPriority;
  images?: string[];
  adminNotes?: string;
  assignedTo?: string; // Admin user ID
  resolution?: string;
  satisfactionRating?: number; // 1-5 müşteri memnuniyet puanı
  isAnonymous: boolean;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  responseTime?: number; // dakika cinsinden
}

export interface ComplaintResponse {
  id: string;
  complaintId: string;
  adminId: string;
  adminName: string;
  message: string;
  isPublic: boolean; // Müşteriye gösterilsin mi?
  createdAt: Date;
}

export interface ComplaintStats {
  total: number;
  pending: number;
  inProgress: number;
  resolved: number;
  closed: number;
  rejected: number;
  averageResponseTime: number; // dakika
  satisfactionAverage: number;
  byType: Record<ComplaintType, number>;
  byPriority: Record<ComplaintPriority, number>;
}

export interface ComplaintFilters {
  status?: ComplaintStatus[];
  type?: ComplaintType[];
  priority?: ComplaintPriority[];
  dateFrom?: Date;
  dateTo?: Date;
  userId?: string;
  restaurantId?: string;
  assignedTo?: string;
  searchTerm?: string;
}

export interface ComplaintNotification {
  id: string;
  complaintId: string;
  userId: string;
  adminId?: string;
  type: 'NEW_COMPLAINT' | 'STATUS_UPDATE' | 'ADMIN_RESPONSE' | 'RESOLUTION';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: Date;
}

// Misafir kullanıcı tipi tanımı
export interface GuestUser {
  id: string; // guest-{timestamp} formatında
  name: string;
  email: string;
  phone: string;
  address?: Address;
  isGuest: true;
  sessionId: string; // Browser session için
  createdAt: Date;
  expiresAt: Date; // Oturum bitiş tarihi
}

// Unified user type - hem kayıtlı hem misafir kullanıcılar için
export type AnyUser = User | GuestUser;

// Type guards
export function isGuestUser(user: AnyUser): user is GuestUser {
  return 'isGuest' in user && user.isGuest === true;
}

export function isRegisteredUser(user: AnyUser): user is User {
  return !('isGuest' in user);
} 

// Bildirim türleri
export enum NotificationType {
  ORDER_STATUS_UPDATE = 'order_status_update',
  ORDER_CONFIRMED = 'order_confirmed',
  ORDER_READY = 'order_ready',
  ORDER_DELIVERED = 'order_delivered',
  ORDER_CANCELLED = 'order_cancelled',
  PROMOTION = 'promotion',
  NEW_RESTAURANT = 'new_restaurant',
  PRICE_DROP = 'price_drop',
  REVIEW_RESPONSE = 'review_response',
  FRIEND_REQUEST = 'friend_request',
  FOLLOW = 'follow',
  LOYALTY_POINTS = 'loyalty_points',
  SYSTEM_UPDATE = 'system_update',
  SECURITY_ALERT = 'security_alert',
  CUSTOM = 'custom'
}

// Bildirim önceliği
export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

// Bildirim durumu
export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  CANCELLED = 'cancelled'
}

// Bildirim kanalı
export enum NotificationChannel {
  PUSH = 'push',
  EMAIL = 'email',
  SMS = 'sms',
  IN_APP = 'in_app'
}

// Bildirim hedefi
export enum NotificationTarget {
  ALL_USERS = 'all_users',
  SPECIFIC_USER = 'specific_user',
  USER_GROUP = 'user_group',
  RESTAURANT_CUSTOMERS = 'restaurant_customers',
  LOCATION_BASED = 'location_based',
  INTEREST_BASED = 'interest_based'
}

// Bildirim içeriği
export interface NotificationContent {
  title: string;
  body: string;
  imageUrl?: string;
  icon?: string;
  badge?: string;
  sound?: string;
  clickAction?: string;
  data?: Record<string, any>;
}

// Bildirim şablonu
export interface NotificationTemplate {
  id: string;
  name: string;
  type: NotificationType;
  title: string;
  body: string;
  imageUrl?: string;
  icon?: string;
  isActive: boolean;
  variables: string[]; // Dinamik değişkenler
  createdAt: Date;
  updatedAt: Date;
}

// Bildirim gönderimi
export interface NotificationSendRequest {
  target: NotificationTarget;
  targetIds?: string[]; // Kullanıcı ID'leri veya grup ID'leri
  type: NotificationType;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  content: NotificationContent;
  scheduledAt?: Date;
  expiresAt?: Date;
  tags?: string[];
  metadata?: Record<string, any>;
}

// Bildirim kaydı
export interface NotificationRecord {
  id: string;
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  channel: NotificationChannel;
  content: NotificationContent;
  status: NotificationStatus;
  sentAt?: Date;
  deliveredAt?: Date;
  readAt?: Date;
  failedAt?: Date;
  failureReason?: string;
  retryCount: number;
  maxRetries: number;
  tags?: string[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

// Kullanıcı bildirim tercihleri
export interface UserNotificationPreferences {
  userId: string;
  enabled: boolean;
  channels: {
    push: boolean;
    email: boolean;
    sms: boolean;
    inApp: boolean;
  };
  types: {
    [key in NotificationType]: boolean;
  };
  quietHours: {
    enabled: boolean;
    startTime: string; // "22:00"
    endTime: string;   // "08:00"
    timezone: string;
  };
  frequency: {
    maxPerDay: number;
    maxPerHour: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

// FCM Token
export interface FCMToken {
  userId: string;
  token: string;
  deviceInfo: {
    platform: 'web' | 'android' | 'ios';
    browser?: string;
    version?: string;
    userAgent?: string;
  };
  isActive: boolean;
  lastUsed: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Bildirim istatistikleri
export interface NotificationStats {
  totalSent: number;
  totalDelivered: number;
  totalRead: number;
  totalFailed: number;
  deliveryRate: number;
  readRate: number;
  failureRate: number;
  averageDeliveryTime: number; // milisaniye
  byType: Record<NotificationType, {
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  }>;
  byChannel: Record<NotificationChannel, {
    sent: number;
    delivered: number;
    read: number;
    failed: number;
  }>;
  byHour: Record<number, number>; // Saat başına gönderim sayısı
  byDay: Record<string, number>; // Gün başına gönderim sayısı
}

// Bildirim kampanyası
export interface NotificationCampaign {
  id: string;
  name: string;
  description?: string;
  type: NotificationType;
  target: NotificationTarget;
  targetIds?: string[];
  content: NotificationContent;
  priority: NotificationPriority;
  channels: NotificationChannel[];
  scheduledAt?: Date;
  expiresAt?: Date;
  status: 'draft' | 'scheduled' | 'active' | 'paused' | 'completed' | 'cancelled';
  stats: {
    sent: number;
    delivered: number;
    read: number;
    failed: number;
    opened: number;
    clicked: number;
  };
  tags?: string[];
  metadata?: Record<string, any>;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  sentAt?: Date;
}

// Bildirim geçmişi
export interface NotificationHistory {
  userId: string;
  notifications: NotificationRecord[];
  unreadCount: number;
  lastReadAt?: Date;
  preferences: UserNotificationPreferences;
}

// Bildirim ayarları
export interface NotificationSettings {
  // Genel ayarlar
  enabled: boolean;
  sound: boolean;
  vibration: boolean;
  badge: boolean;
  
  // Görsel ayarlar
  showPreview: boolean;
  showSender: boolean;
  showTimestamp: boolean;
  
  // Davranış ayarları
  autoMarkAsRead: boolean;
  keepUnread: boolean;
  groupNotifications: boolean;
  
  // Gelişmiş ayarlar
  allowFromUnknown: boolean;
  blockList: string[];
  allowList: string[];
} 

// Barkod ve Stok Yönetimi Tipleri
export interface BarcodeProduct {
  id: string;
  barcode: string;
  name: string;
  brand: string;
  category: string;
  weight: number; // gram cinsinden
  unit: string; // kg, gr, adet
  price: number;
  costPrice: number;
  image?: string;
  description?: string;
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    fat?: number;
    carbs?: number;
  };
  allergens?: string[];
  expiryDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryItem {
  id: string;
  productId: string;
  barcode: string;
  restaurantId: string;
  quantity: number;
  minStockLevel: number; // Minimum stok seviyesi
  maxStockLevel: number; // Maksimum stok seviyesi
  currentStock: number;
  reservedStock: number; // Siparişler için ayrılan stok
  availableStock: number; // Satışa hazır stok
  lastRestocked: Date;
  expiryDate?: Date;
  location?: string; // Depo konumu
  supplier?: string;
  costPrice: number;
  sellingPrice: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockTransaction {
  id: string;
  inventoryItemId: string;
  productId: string;
  restaurantId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'RESERVED' | 'RELEASED';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: string; // 'SALE', 'RESTOCK', 'WASTE', 'ADJUSTMENT', 'ORDER_RESERVATION'
  orderId?: string; // Eğer siparişle ilgiliyse
  userId: string; // İşlemi yapan kullanıcı
  notes?: string;
  createdAt: Date;
}

export interface BarcodeScanResult {
  barcode: string;
  product?: BarcodeProduct;
  inventoryItem?: InventoryItem;
  found: boolean;
  error?: string;
}

export interface StockAlert {
  id: string;
  restaurantId: string;
  inventoryItemId: string;
  type: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRY_WARNING' | 'OVERSTOCK';
  message: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isRead: boolean;
  createdAt: Date;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxNumber?: string;
  paymentTerms?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface RestockOrder {
  id: string;
  restaurantId: string;
  supplierId: string;
  status: 'DRAFT' | 'ORDERED' | 'RECEIVED' | 'CANCELLED';
  items: RestockOrderItem[];
  totalAmount: number;
  orderDate: Date;
  expectedDeliveryDate?: Date;
  receivedDate?: Date;
  notes?: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface RestockOrderItem {
  id: string;
  productId: string;
  barcode: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  receivedQuantity?: number;
  notes?: string;
}

// Mevcut Order tipini güncelle
export interface Order {
  id: string;
  userId: string;
  user: User;
  restaurantId: string;
  restaurant: RestaurantInfo;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  commissionCalculation: CommissionCalculation;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  deliveryAddress: OrderDeliveryAddress;
  
  // Takip bilgileri
  tracking: OrderTracking;
  
  // Zaman bilgileri
  estimatedDeliveryTime: Date;
  actualDeliveryTime?: Date;
  preparationStartTime?: Date;
  preparationEndTime?: Date;
  
  // Özel talimatlar
  specialInstructions?: string;
  deliveryInstructions?: string;
  
  // Mali işlem
  transactionId?: string;
  
  // Değerlendirme
  review?: OrderReview;
  
  // Sistem bilgileri
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  product: Product;
  quantity: number;
  price: number;
  subtotal: number;
  inventoryItemId?: string; // Stok takibi için
  barcode?: string; // Barkod bilgisi
  specialInstructions?: string;
  createdAt: Date;
  updatedAt: Date;
} 