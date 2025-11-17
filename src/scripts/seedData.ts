import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, writeBatch, Timestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAsTexiSuSnyhK17G49Qqz_6O7pMV9f42M",
  authDomain: "neyisek-6b8bc.firebaseapp.com",
  projectId: "neyisek-6b8bc",
  storageBucket: "neyisek-6b8bc.firebasestorage.app",
  messagingSenderId: "187489868178",
  appId: "1:187489868178:web:3f2ee1ca2cabfbbfbf094b",
  measurementId: "G-N5Q8RB9N9V"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const testCategories = [
  {
    id: 'pizza',
    name: 'Pizza',
    description: 'Lezzetli pizzalar',
    imageUrl: '/images/pizza.jpg',
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: 'burger',
    name: 'Burger',
    description: 'Taze burgerler',
    imageUrl: '/images/burger.jpg',
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: 'sushi',
    name: 'Sushi',
    description: 'Taze sushi çeşitleri',
    imageUrl: '/images/sushi.jpg',
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: 'pasta',
    name: 'Pasta',
    description: 'İtalyan pastaları',
    imageUrl: '/images/pasta.jpg',
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: 'kebap',
    name: 'Kebap',
    description: 'Geleneksel kebap çeşitleri',
    imageUrl: '/images/kebap.jpg',
    isActive: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
];

const testRestaurants = [
  {
    id: 'pizza-palace',
    name: 'Pizza Palace',
    description: 'En lezzetli pizzalar burada',
    address: 'Kadıköy, İstanbul',
    phone: '+90 216 123 45 67',
    email: 'info@pizzapalace.com',
    cuisine: 'İtalyan',
    rating: 4.5,
    reviewCount: 125,
    isActive: true,
    isApproved: true,
    createdAt: Timestamp.now(),
    ownerId: 'owner1',
    imageUrl: '/images/restaurant1.jpg',
    deliveryFee: 15,
    minimumOrder: 50,
    deliveryTime: '30-45 dk'
  },
  {
    id: 'burger-house',
    name: 'Burger House',
    description: 'Taze ve lezzetli burgerler',
    address: 'Beşiktaş, İstanbul',
    phone: '+90 212 987 65 43',
    email: 'info@burgerhouse.com',
    cuisine: 'Amerikan',
    rating: 4.2,
    reviewCount: 89,
    isActive: true,
    isApproved: true,
    createdAt: Timestamp.now(),
    ownerId: 'owner2',
    imageUrl: '/images/restaurant2.jpg',
    deliveryFee: 12,
    minimumOrder: 40,
    deliveryTime: '25-35 dk'
  },
  {
    id: 'sushi-master',
    name: 'Sushi Master',
    description: 'Taze sushi ve Japon mutfağı',
    address: 'Nişantaşı, İstanbul',
    phone: '+90 212 555 12 34',
    email: 'info@sushimaster.com',
    cuisine: 'Japon',
    rating: 4.8,
    reviewCount: 156,
    isActive: true,
    isApproved: true,
    createdAt: Timestamp.now(),
    ownerId: 'owner3',
    imageUrl: '/images/restaurant3.jpg',
    deliveryFee: 20,
    minimumOrder: 80,
    deliveryTime: '40-55 dk'
  },
  {
    id: 'pasta-roma',
    name: 'Pasta Roma',
    description: 'Otantik İtalyan pastaları',
    address: 'Galata, İstanbul',
    phone: '+90 212 444 33 22',
    email: 'info@pastaroma.com',
    cuisine: 'İtalyan',
    rating: 4.3,
    reviewCount: 67,
    isActive: true,
    isApproved: true,
    createdAt: Timestamp.now(),
    ownerId: 'owner4',
    imageUrl: '/images/restaurant4.jpg',
    deliveryFee: 18,
    minimumOrder: 60,
    deliveryTime: '35-45 dk'
  },
  {
    id: 'kebap-usta',
    name: 'Kebap Usta',
    description: 'Geleneksel Türk kebap çeşitleri',
    address: 'Fatih, İstanbul',
    phone: '+90 212 777 88 99',
    email: 'info@kebapusta.com',
    cuisine: 'Türk',
    rating: 4.6,
    reviewCount: 203,
    isActive: true,
    isApproved: true,
    createdAt: Timestamp.now(),
    ownerId: 'owner5',
    imageUrl: '/images/restaurant5.jpg',
    deliveryFee: 10,
    minimumOrder: 35,
    deliveryTime: '20-30 dk'
  }
];

// Test ürünleri (geliştirilmiş beslenme bilgileri ile)
const testProducts = [
  {
    id: 'margherita-pizza',
    restaurantId: 'pizza-palace',
    name: 'Margherita Pizza',
    description: 'Domates sosu, mozzarella peyniri, fesleğen',
    price: 45,
    categoryId: 'pizza',
    imageUrl: '/images/margherita.jpg',
    images: [],
    variants: [],
    ingredients: ['domates sosu', 'mozzarella', 'fesleğen', 'hamur'],
    allergens: ['süt', 'gluten'],
    isVegetarian: true,
    isVegan: false,
    isGlutenFree: false,
    preparationTime: 20,
    nutritionInfo: {
      calories: 285,
      protein: 12.5,
      carbohydrates: 35.2,
      fat: 11.8,
      saturatedFat: 4.2,
      transFat: 0,
      fiber: 2.1,
      sugar: 3.8,
      sodium: 680,
      cholesterol: 25,
      vitaminA: 450,
      vitaminC: 8,
      vitaminD: 0.5,
      calcium: 180,
      iron: 2.1,
      servingSize: '1 adet (300g)',
      servingsPerContainer: 1,
      dailyValues: {
        calories: 14,
        protein: 25,
        carbohydrates: 13,
        fat: 18,
        saturatedFat: 21,
        fiber: 8,
        sugar: 8,
        sodium: 30,
        cholesterol: 8
      },
      nutritionLabels: ['Düşük Kalorili', 'Protein İçerir', 'Lif İçerir'],
      calorieCategory: 'medium',
      nutritionScore: 78,
      lastUpdated: Timestamp.now(),
      isVerified: true,
      verifiedBy: 'Türkiye Sağlık Bakanlığı',
      verificationDate: Timestamp.now()
    },
    calories: 285, // Geriye dönük uyumluluk
    isActive: true,
    stock: 50,
    minStock: 10,
    maxStock: 100,
    tags: ['pizza', 'vejetaryen', 'klasik'],
    rating: 4.6,
    reviewCount: 89,
    isPopular: true,
    isFeatured: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: 'pepperoni-pizza',
    name: 'Pizza Pepperoni',
    description: 'Domates sosu, mozzarella peyniri, pepperoni',
    price: 55,
    category: 'pizza',
    restaurantId: 'pizza-palace',
    isActive: true,
    isAvailable: true,
    imageUrl: '/images/pepperoni.jpg',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    rating: 4.5,
    reviewCount: 67,
    preparationTime: 18
  },
  {
    id: 'classic-burger',
    restaurantId: 'burger-house',
    name: 'Classic Burger',
    description: 'Dana eti, marul, domates, soğan',
    price: 35,
    categoryId: 'burger',
    imageUrl: '/images/classic-burger.jpg',
    images: [],
    variants: [],
    ingredients: ['dana eti', 'marul', 'domates', 'soğan', 'ekmek'],
    allergens: ['gluten'],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    preparationTime: 12,
    nutritionInfo: {
      calories: 450,
      protein: 28.5,
      carbohydrates: 42.3,
      fat: 18.7,
      saturatedFat: 6.8,
      transFat: 0.2,
      fiber: 3.2,
      sugar: 5.4,
      sodium: 820,
      cholesterol: 85,
      vitaminA: 320,
      vitaminC: 12,
      vitaminB12: 2.1,
      calcium: 45,
      iron: 4.2,
      zinc: 3.8,
      servingSize: '1 adet (250g)',
      servingsPerContainer: 1,
      dailyValues: {
        calories: 23,
        protein: 57,
        carbohydrates: 15,
        fat: 29,
        saturatedFat: 34,
        fiber: 11,
        sugar: 11,
        sodium: 36,
        cholesterol: 28
      },
      nutritionLabels: ['Yüksek Protein', 'Protein İçerir'],
      calorieCategory: 'high',
      nutritionScore: 65,
      lastUpdated: Timestamp.now(),
      isVerified: true,
      verifiedBy: 'Türkiye Sağlık Bakanlığı',
      verificationDate: Timestamp.now()
    },
    calories: 450,
    isActive: true,
    stock: 30,
    minStock: 5,
    maxStock: 50,
    tags: ['burger', 'et', 'klasik'],
    rating: 4.3,
    reviewCount: 45,
    isPopular: true,
    isFeatured: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: 'cheese-burger',
    restaurantId: 'burger-house',
    name: 'Cheese Burger',
    description: 'Dana eti, cheddar peyniri, marul, domates, soğan',
    price: 40,
    categoryId: 'burger',
    imageUrl: '/images/cheese-burger.jpg',
    images: [],
    variants: [],
    ingredients: ['dana eti', 'cheddar', 'marul', 'domates', 'soğan', 'ekmek'],
    allergens: ['gluten', 'süt'],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    preparationTime: 15,
    nutritionInfo: {
      calories: 520,
      protein: 32.1,
      carbohydrates: 43.8,
      fat: 24.5,
      saturatedFat: 9.2,
      transFat: 0.3,
      fiber: 3.1,
      sugar: 5.8,
      sodium: 950,
      cholesterol: 95,
      vitaminA: 380,
      vitaminC: 11,
      vitaminB12: 2.3,
      calcium: 120,
      iron: 4.5,
      zinc: 4.1,
      servingSize: '1 adet (280g)',
      servingsPerContainer: 1,
      dailyValues: {
        calories: 26,
        protein: 64,
        carbohydrates: 16,
        fat: 38,
        saturatedFat: 46,
        fiber: 11,
        sugar: 12,
        sodium: 41,
        cholesterol: 32
      },
      nutritionLabels: ['Yüksek Protein', 'Protein İçerir', 'Yüksek Yağ'],
      calorieCategory: 'high',
      nutritionScore: 58,
      lastUpdated: Timestamp.now(),
      isVerified: true,
      verifiedBy: 'Türkiye Sağlık Bakanlığı',
      verificationDate: Timestamp.now()
    },
    calories: 520,
    isActive: true,
    stock: 25,
    minStock: 5,
    maxStock: 40,
    tags: ['burger', 'et', 'peynir'],
    rating: 4.4,
    reviewCount: 38,
    isPopular: true,
    isFeatured: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: 'california-roll',
    restaurantId: 'sushi-master',
    name: 'California Roll',
    description: 'Yengeç, avokado, salatalık, nori, pirinç',
    price: 65,
    categoryId: 'sushi',
    imageUrl: '/images/california-roll.jpg',
    images: [],
    variants: [],
    ingredients: ['yengeç', 'avokado', 'salatalık', 'nori', 'pirinç'],
    allergens: ['balık', 'soya'],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    preparationTime: 20,
    nutritionInfo: {
      calories: 320,
      protein: 18.5,
      carbohydrates: 48.2,
      fat: 8.9,
      saturatedFat: 1.2,
      transFat: 0,
      fiber: 4.8,
      sugar: 2.1,
      sodium: 420,
      cholesterol: 35,
      vitaminA: 280,
      vitaminC: 15,
      vitaminB12: 1.8,
      calcium: 45,
      iron: 2.8,
      magnesium: 85,
      servingSize: '8 adet (200g)',
      servingsPerContainer: 1,
      dailyValues: {
        calories: 16,
        protein: 37,
        carbohydrates: 18,
        fat: 14,
        saturatedFat: 6,
        fiber: 17,
        sugar: 4,
        sodium: 18,
        cholesterol: 12
      },
      nutritionLabels: ['Düşük Kalorili', 'Yüksek Protein', 'Lif İçerir', 'Gluten İçermez'],
      calorieCategory: 'medium',
      nutritionScore: 82,
      lastUpdated: Timestamp.now(),
      isVerified: true,
      verifiedBy: 'Türkiye Sağlık Bakanlığı',
      verificationDate: Timestamp.now()
    },
    calories: 320,
    isActive: true,
    stock: 40,
    minStock: 8,
    maxStock: 60,
    tags: ['sushi', 'deniz ürünü', 'sağlıklı'],
    rating: 4.8,
    reviewCount: 92,
    isPopular: true,
    isFeatured: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: 'salmon-nigiri',
    restaurantId: 'sushi-master',
    name: 'Somon Nigiri',
    description: 'Taze somon, pirinç, wasabi',
    price: 45,
    categoryId: 'sushi',
    imageUrl: '/images/salmon-nigiri.jpg',
    images: [],
    variants: [],
    ingredients: ['somon', 'pirinç', 'wasabi'],
    allergens: ['balık'],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: true,
    preparationTime: 10,
    nutritionInfo: {
      calories: 180,
      protein: 22.5,
      carbohydrates: 28.4,
      fat: 2.1,
      saturatedFat: 0.4,
      transFat: 0,
      fiber: 0.8,
      sugar: 0.2,
      sodium: 180,
      cholesterol: 45,
      vitaminA: 120,
      vitaminC: 2,
      vitaminD: 8.5,
      vitaminB12: 3.2,
      calcium: 15,
      iron: 1.2,
      omega3: 2.8,
      servingSize: '2 adet (80g)',
      servingsPerContainer: 1,
      dailyValues: {
        calories: 9,
        protein: 45,
        carbohydrates: 10,
        fat: 3,
        saturatedFat: 2,
        fiber: 3,
        sugar: 0,
        sodium: 8,
        cholesterol: 15
      },
      nutritionLabels: ['Düşük Kalorili', 'Yüksek Protein', 'Omega-3', 'Gluten İçermez'],
      calorieCategory: 'low',
      nutritionScore: 88,
      lastUpdated: Timestamp.now(),
      isVerified: true,
      verifiedBy: 'Türkiye Sağlık Bakanlığı',
      verificationDate: Timestamp.now()
    },
    calories: 180,
    isActive: true,
    stock: 60,
    minStock: 12,
    maxStock: 80,
    tags: ['sushi', 'somon', 'sağlıklı'],
    rating: 4.9,
    reviewCount: 78,
    isPopular: true,
    isFeatured: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: 'carbonara-pasta',
    restaurantId: 'pasta-roma',
    name: 'Pasta Carbonara',
    description: 'Spaghetti, yumurta, pecorino peyniri, pancetta',
    price: 50,
    categoryId: 'pasta',
    imageUrl: '/images/carbonara.jpg',
    images: [],
    variants: [],
    ingredients: ['spaghetti', 'yumurta', 'pecorino', 'pancetta', 'karabiber'],
    allergens: ['gluten', 'süt', 'yumurta'],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    preparationTime: 25,
    nutritionInfo: {
      calories: 680,
      protein: 24.8,
      carbohydrates: 78.5,
      fat: 32.1,
      saturatedFat: 12.4,
      transFat: 0.1,
      fiber: 3.5,
      sugar: 2.8,
      sodium: 1250,
      cholesterol: 185,
      vitaminA: 420,
      vitaminC: 0,
      vitaminB12: 1.2,
      calcium: 180,
      iron: 3.8,
      servingSize: '1 porsiyon (350g)',
      servingsPerContainer: 1,
      dailyValues: {
        calories: 34,
        protein: 50,
        carbohydrates: 29,
        fat: 49,
        saturatedFat: 62,
        fiber: 13,
        sugar: 6,
        sodium: 54,
        cholesterol: 62
      },
      nutritionLabels: ['Yüksek Kalorili', 'Protein İçerir', 'Yüksek Yağ'],
      calorieCategory: 'very_high',
      nutritionScore: 45,
      lastUpdated: Timestamp.now(),
      isVerified: true,
      verifiedBy: 'Türkiye Sağlık Bakanlığı',
      verificationDate: Timestamp.now()
    },
    calories: 680,
    isActive: true,
    stock: 35,
    minStock: 7,
    maxStock: 50,
    tags: ['pasta', 'italyan', 'klasik'],
    rating: 4.6,
    reviewCount: 56,
    isPopular: true,
    isFeatured: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: 'bolognese-pasta',
    restaurantId: 'pasta-roma',
    name: 'Pasta Bolognese',
    description: 'Spaghetti, dana eti, domates sosu, parmesan',
    price: 45,
    categoryId: 'pasta',
    imageUrl: '/images/bolognese.jpg',
    images: [],
    variants: [],
    ingredients: ['spaghetti', 'dana eti', 'domates sosu', 'parmesan', 'soğan'],
    allergens: ['gluten', 'süt'],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    preparationTime: 22,
    nutritionInfo: {
      calories: 580,
      protein: 28.5,
      carbohydrates: 72.3,
      fat: 18.7,
      saturatedFat: 6.8,
      transFat: 0.2,
      fiber: 4.2,
      sugar: 8.5,
      sodium: 980,
      cholesterol: 65,
      vitaminA: 680,
      vitaminC: 25,
      vitaminB12: 2.1,
      calcium: 120,
      iron: 4.8,
      servingSize: '1 porsiyon (320g)',
      servingsPerContainer: 1,
      dailyValues: {
        calories: 29,
        protein: 57,
        carbohydrates: 26,
        fat: 29,
        saturatedFat: 34,
        fiber: 15,
        sugar: 17,
        sodium: 43,
        cholesterol: 22
      },
      nutritionLabels: ['Yüksek Kalorili', 'Yüksek Protein', 'Protein İçerir'],
      calorieCategory: 'high',
      nutritionScore: 62,
      lastUpdated: Timestamp.now(),
      isVerified: true,
      verifiedBy: 'Türkiye Sağlık Bakanlığı',
      verificationDate: Timestamp.now()
    },
    calories: 580,
    isActive: true,
    stock: 30,
    minStock: 6,
    maxStock: 45,
    tags: ['pasta', 'italyan', 'et'],
    rating: 4.4,
    reviewCount: 43,
    isPopular: true,
    isFeatured: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: 'adana-kebap',
    restaurantId: 'kebap-usta',
    name: 'Adana Kebap',
    description: 'Çifte kıyma, soğan, maydanoz, baharatlar',
    price: 40,
    categoryId: 'kebap',
    imageUrl: '/images/adana-kebap.jpg',
    images: [],
    variants: [],
    ingredients: ['çifte kıyma', 'soğan', 'maydanoz', 'baharatlar', 'ekmek'],
    allergens: ['gluten'],
    isVegetarian: false,
    isVegan: false,
    isGlutenFree: false,
    preparationTime: 18,
    nutritionInfo: {
      calories: 520,
      protein: 35.2,
      carbohydrates: 38.7,
      fat: 28.4,
      saturatedFat: 10.8,
      transFat: 0.4,
      fiber: 2.8,
      sugar: 3.2,
      sodium: 1150,
      cholesterol: 95,
      vitaminA: 280,
      vitaminC: 8,
      vitaminB12: 2.8,
      calcium: 45,
      iron: 5.2,
      zinc: 4.8,
      servingSize: '1 adet (280g)',
      servingsPerContainer: 1,
      dailyValues: {
        calories: 26,
        protein: 70,
        carbohydrates: 14,
        fat: 44,
        saturatedFat: 54,
        fiber: 10,
        sugar: 6,
        sodium: 50,
        cholesterol: 32
      },
      nutritionLabels: ['Yüksek Kalorili', 'Yüksek Protein', 'Protein İçerir'],
      calorieCategory: 'high',
      nutritionScore: 58,
      lastUpdated: Timestamp.now(),
      isVerified: true,
      verifiedBy: 'Türkiye Sağlık Bakanlığı',
      verificationDate: Timestamp.now()
    },
    calories: 520,
    isActive: true,
    stock: 40,
    minStock: 8,
    maxStock: 60,
    tags: ['kebap', 'et', 'türk'],
    rating: 4.7,
    reviewCount: 67,
    isPopular: true,
    isFeatured: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
];

// Test kullanıcıları (gelişmiş profil bilgileri ile)
const testUsers = [
  {
    uid: 'user-1',
    email: 'ahmet.yilmaz@example.com',
    displayName: 'ahmet_yilmaz',
    phoneNumber: '+905551234567',
    
    // Temel profil bilgileri
    profile: {
      firstName: 'Ahmet',
      lastName: 'Yılmaz',
      birthDate: Timestamp.fromDate(new Date('1990-05-15')),
      gender: 'male',
      profileImage: '/images/avatars/ahmet.jpg',
      coverImage: '/images/covers/ahmet-cover.jpg',
      bio: 'Yemek tutkunu ve gezgin. Yeni lezzetler keşfetmeyi seviyorum!',
      location: {
        city: 'İstanbul',
        district: 'Kadıköy',
        coordinates: {
          lat: 40.9909,
          lng: 29.0303
        }
      }
    },
    
    // Adresler
    addresses: [
      {
        id: 'addr-1',
        name: 'Ev',
        street: 'Atatürk Caddesi No:123',
        city: 'İstanbul',
        district: 'Kadıköy',
        zipCode: '34710',
        country: 'Türkiye',
        coordinates: {
          lat: 40.9909,
          lng: 29.0303
        },
        isDefault: true,
        isActive: true,
        instructions: 'Kapıcıya bırakabilirsiniz',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      {
        id: 'addr-2',
        name: 'İş',
        street: 'Levent Mahallesi No:456',
        city: 'İstanbul',
        district: 'Beşiktaş',
        zipCode: '34330',
        country: 'Türkiye',
        coordinates: {
          lat: 41.0782,
          lng: 29.0174
        },
        isDefault: false,
        isActive: true,
        instructions: 'Resepsiyona bırakabilirsiniz',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
    ],
    
    // Ödeme yöntemleri
    paymentMethods: [
      {
        id: 'pay-1',
        type: 'card',
        name: 'Ana Kredi Kartım',
        isDefault: true,
        isActive: true,
        cardInfo: {
          last4: '1234',
          brand: 'visa',
          expiryMonth: 12,
          expiryYear: 2025
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      },
      {
        id: 'pay-2',
        type: 'card',
        name: 'İş Bankası',
        isDefault: false,
        isActive: true,
        cardInfo: {
          last4: '5678',
          brand: 'mastercard',
          expiryMonth: 8,
          expiryYear: 2026
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
    ],
    
    // Tercihler
    preferences: {
      notifications: {
        email: true,
        push: true,
        sms: false,
        orderUpdates: true,
        promotions: true,
        newRestaurants: true,
        reviews: true
      },
      language: 'tr',
      currency: 'TRY',
      timezone: 'Europe/Istanbul',
      privacy: {
        profileVisibility: 'public',
        orderHistoryVisibility: 'friends',
        reviewsVisibility: 'public',
        allowDataSharing: true,
        allowAnalytics: true
      },
      theme: 'light',
      fontSize: 'medium',
      accessibility: {
        highContrast: false,
        screenReader: false,
        reducedMotion: false,
        largeText: false
      }
    },
    
    // Beslenme tercihleri
    dietaryPreferences: {
      dietType: 'none',
      allergies: ['nuts'],
      dislikes: ['zeytin', 'ançuez'],
      calorieGoal: {
        daily: 2200,
        meal: 700
      },
      macroGoals: {
        protein: 80,
        carbohydrates: 250,
        fat: 70,
        fiber: 25
      },
      portionSize: 'medium',
      specialInstructions: 'Acılı yemekleri seviyorum',
      nutritionScoreGoal: 75
    },
    
    // İstatistikler
    stats: {
      orders: {
        total: 45,
        completed: 42,
        cancelled: 3,
        totalSpent: 2850.50,
        averageOrderValue: 63.34,
        lastOrderDate: Timestamp.fromDate(new Date('2024-01-15'))
      },
      favorites: {
        restaurants: ['pizza-palace', 'burger-house', 'sushi-master'],
        products: ['margherita-pizza', 'classic-burger', 'california-roll'],
        categories: ['pizza', 'burger', 'sushi']
      },
      reviews: {
        total: 12,
        averageRating: 4.3,
        helpfulCount: 8
      },
      loyalty: {
        points: 1250,
        tier: 'gold',
        nextTierPoints: 500,
        totalEarned: 1500,
        totalRedeemed: 250
      },
      activity: {
        joinDate: Timestamp.fromDate(new Date('2023-03-15')),
        lastActive: Timestamp.now(),
        totalSessions: 89,
        averageSessionDuration: 12,
        favoriteOrderTime: '19:00-21:00',
        favoriteOrderDay: 'Cuma'
      },
      nutrition: {
        totalCaloriesConsumed: 98500,
        averageCaloriesPerOrder: 650,
        favoriteCuisine: 'İtalyan',
        mostOrderedCategory: 'pizza',
        nutritionScoreAverage: 72.5,
        dietaryCompliance: 85
      }
    },
    
    // Sosyal özellikler
    social: {
      following: ['user-2', 'user-3'],
      followers: ['user-4', 'user-5'],
      friends: ['user-2'],
      friendRequests: {
        sent: ['user-6'],
        received: ['user-7']
      },
      socialActivity: {
        sharedOrders: 5,
        sharedReviews: 8,
        recommendations: 12,
        groupOrders: 3
      },
      socialMedia: {
        instagram: '@ahmet_yilmaz',
        twitter: '@ahmet_yilmaz'
      }
    },
    
    // Sipariş geçmişi
    orderHistory: {
      recent: [],
      favorites: [],
      statistics: {
        totalOrders: 45,
        totalSpent: 2850.50,
        averageOrderValue: 63.34,
        mostOrderedDay: 'Cuma',
        mostOrderedTime: '19:00-21:00',
        favoriteCuisine: 'İtalyan'
      }
    },
    
    // Sistem bilgileri
    role: 'customer',
    isActive: true,
    accountStatus: 'active',
    emailVerified: true,
    phoneVerified: true,
    security: {
      twoFactorEnabled: false,
      lastPasswordChange: Timestamp.fromDate(new Date('2023-12-01')),
      failedLoginAttempts: 0,
      lastFailedLogin: null,
      accountLockedUntil: null
    },
    lastLoginAt: Timestamp.now(),
    createdAt: Timestamp.fromDate(new Date('2023-03-15')),
    updatedAt: Timestamp.now()
  },
  {
    uid: 'user-2',
    email: 'ayse.demir@example.com',
    displayName: 'ayse_demir',
    phoneNumber: '+905559876543',
    
    // Temel profil bilgileri
    profile: {
      firstName: 'Ayşe',
      lastName: 'Demir',
      birthDate: Timestamp.fromDate(new Date('1995-08-22')),
      gender: 'female',
      profileImage: '/images/avatars/ayse.jpg',
      coverImage: '/images/covers/ayse-cover.jpg',
      bio: 'Sağlıklı yaşam ve fitness tutkunu. Vejetaryen beslenmeyi tercih ediyorum.',
      location: {
        city: 'İstanbul',
        district: 'Beşiktaş',
        coordinates: {
          lat: 41.0782,
          lng: 29.0174
        }
      }
    },
    
    // Adresler
    addresses: [
      {
        id: 'addr-3',
        name: 'Ev',
        street: 'Sinanpaşa Mahallesi No:789',
        city: 'İstanbul',
        district: 'Beşiktaş',
        zipCode: '34353',
        country: 'Türkiye',
        coordinates: {
          lat: 41.0782,
          lng: 29.0174
        },
        isDefault: true,
        isActive: true,
        instructions: 'Güvenlik görevlisine bırakabilirsiniz',
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
    ],
    
    // Ödeme yöntemleri
    paymentMethods: [
      {
        id: 'pay-3',
        type: 'card',
        name: 'Kredi Kartım',
        isDefault: true,
        isActive: true,
        cardInfo: {
          last4: '9876',
          brand: 'mastercard',
          expiryMonth: 6,
          expiryYear: 2027
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      }
    ],
    
    // Tercihler
    preferences: {
      notifications: {
        email: true,
        push: true,
        sms: true,
        orderUpdates: true,
        promotions: false,
        newRestaurants: true,
        reviews: true
      },
      language: 'tr',
      currency: 'TRY',
      timezone: 'Europe/Istanbul',
      privacy: {
        profileVisibility: 'friends',
        orderHistoryVisibility: 'private',
        reviewsVisibility: 'friends',
        allowDataSharing: false,
        allowAnalytics: true
      },
      theme: 'auto',
      fontSize: 'medium',
      accessibility: {
        highContrast: false,
        screenReader: false,
        reducedMotion: true,
        largeText: false
      }
    },
    
    // Beslenme tercihleri
    dietaryPreferences: {
      dietType: 'vegetarian',
      allergies: ['dairy', 'eggs'],
      dislikes: ['et', 'balık'],
      calorieGoal: {
        daily: 1800,
        meal: 500
      },
      macroGoals: {
        protein: 60,
        carbohydrates: 200,
        fat: 50,
        fiber: 30
      },
      portionSize: 'small',
      specialInstructions: 'Sadece vejetaryen yemekler',
      nutritionScoreGoal: 85
    },
    
    // İstatistikler
    stats: {
      orders: {
        total: 28,
        completed: 27,
        cancelled: 1,
        totalSpent: 1650.75,
        averageOrderValue: 58.95,
        lastOrderDate: Timestamp.fromDate(new Date('2024-01-10'))
      },
      favorites: {
        restaurants: ['sushi-master', 'pasta-roma'],
        products: ['california-roll', 'salmon-nigiri'],
        categories: ['sushi', 'pasta']
      },
      reviews: {
        total: 18,
        averageRating: 4.7,
        helpfulCount: 15
      },
      loyalty: {
        points: 850,
        tier: 'silver',
        nextTierPoints: 150,
        totalEarned: 1000,
        totalRedeemed: 150
      },
      activity: {
        joinDate: Timestamp.fromDate(new Date('2023-06-10')),
        lastActive: Timestamp.now(),
        totalSessions: 67,
        averageSessionDuration: 8,
        favoriteOrderTime: '18:00-20:00',
        favoriteOrderDay: 'Çarşamba'
      },
      nutrition: {
        totalCaloriesConsumed: 52000,
        averageCaloriesPerOrder: 450,
        favoriteCuisine: 'Japon',
        mostOrderedCategory: 'sushi',
        nutritionScoreAverage: 88.2,
        dietaryCompliance: 95
      }
    },
    
    // Sosyal özellikler
    social: {
      following: ['user-1', 'user-4'],
      followers: ['user-1', 'user-3'],
      friends: ['user-1'],
      friendRequests: {
        sent: [],
        received: ['user-8']
      },
      socialActivity: {
        sharedOrders: 3,
        sharedReviews: 12,
        recommendations: 8,
        groupOrders: 2
      },
      socialMedia: {
        instagram: '@ayse_demir_fitness'
      }
    },
    
    // Sipariş geçmişi
    orderHistory: {
      recent: [],
      favorites: [],
      statistics: {
        totalOrders: 28,
        totalSpent: 1650.75,
        averageOrderValue: 58.95,
        mostOrderedDay: 'Çarşamba',
        mostOrderedTime: '18:00-20:00',
        favoriteCuisine: 'Japon'
      }
    },
    
    // Sistem bilgileri
    role: 'customer',
    isActive: true,
    accountStatus: 'active',
    emailVerified: true,
    phoneVerified: true,
    security: {
      twoFactorEnabled: true,
      lastPasswordChange: Timestamp.fromDate(new Date('2023-11-15')),
      failedLoginAttempts: 0,
      lastFailedLogin: null,
      accountLockedUntil: null
    },
    lastLoginAt: Timestamp.now(),
    createdAt: Timestamp.fromDate(new Date('2023-06-10')),
    updatedAt: Timestamp.now()
  }
];

// Test bildirim tercihleri
const testNotificationPreferences = [
  {
    userId: 'user-1',
    enabled: true,
    channels: {
      push: true,
      email: true,
      sms: false,
      inApp: true
    },
    types: {
      order_status_update: true,
      order_confirmed: true,
      order_ready: true,
      order_delivered: true,
      order_cancelled: true,
      promotion: true,
      new_restaurant: true,
      price_drop: true,
      review_response: true,
      friend_request: true,
      follow: true,
      loyalty_points: true,
      system_update: true,
      security_alert: true,
      custom: true
    },
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
      timezone: 'Europe/Istanbul'
    },
    frequency: {
      maxPerDay: 50,
      maxPerHour: 5
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    userId: 'user-2',
    enabled: true,
    channels: {
      push: true,
      email: true,
      sms: true,
      inApp: true
    },
    types: {
      order_status_update: true,
      order_confirmed: true,
      order_ready: true,
      order_delivered: true,
      order_cancelled: true,
      promotion: false,
      new_restaurant: true,
      price_drop: true,
      review_response: true,
      friend_request: true,
      follow: true,
      loyalty_points: true,
      system_update: true,
      security_alert: true,
      custom: true
    },
    quietHours: {
      enabled: true,
      startTime: '23:00',
      endTime: '07:00',
      timezone: 'Europe/Istanbul'
    },
    frequency: {
      maxPerDay: 30,
      maxPerHour: 3
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
];

// Test FCM tokenları
const testFCMTokens = [
  {
    userId: 'user-1',
    token: 'fcm_token_user_1_web_123456789',
    deviceInfo: {
      platform: 'web',
      browser: 'Chrome',
      version: '120.0.0.0',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
    },
    isActive: true,
    lastUsed: Timestamp.now(),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    userId: 'user-2',
    token: 'fcm_token_user_2_web_987654321',
    deviceInfo: {
      platform: 'web',
      browser: 'Firefox',
      version: '121.0.0.0',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7; rv:121.0) Gecko/20100101 Firefox/121.0'
    },
    isActive: true,
    lastUsed: Timestamp.now(),
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
];

// Test bildirimleri
const testNotifications = [
  {
    id: 'notif-1',
    userId: 'user-1',
    type: 'order_confirmed',
    priority: 'normal',
    channel: 'push',
    content: {
      title: 'Siparişiniz Onaylandı!',
      body: 'Pizza Palace restoranından siparişiniz hazırlanmaya başlandı.',
      icon: '/icon-192x192.png',
      data: {
        orderId: 'order-123',
        restaurantId: 'pizza-palace',
        type: 'order_confirmed'
      }
    },
    status: 'read',
    sentAt: Timestamp.fromDate(new Date('2024-01-15T10:30:00')),
    deliveredAt: Timestamp.fromDate(new Date('2024-01-15T10:30:05')),
    readAt: Timestamp.fromDate(new Date('2024-01-15T10:35:00')),
    retryCount: 0,
    maxRetries: 3,
    tags: ['order', 'pizza-palace'],
    metadata: {
      orderId: 'order-123',
      restaurantId: 'pizza-palace'
    },
    createdAt: Timestamp.fromDate(new Date('2024-01-15T10:30:00')),
    updatedAt: Timestamp.fromDate(new Date('2024-01-15T10:35:00'))
  },
  {
    id: 'notif-2',
    userId: 'user-1',
    type: 'promotion',
    priority: 'normal',
    channel: 'push',
    content: {
      title: 'Özel İndirim!',
      body: 'Sushi Master\'da %20 indirim fırsatını kaçırmayın.',
      icon: '/icon-192x192.png',
      imageUrl: '/images/promotions/sushi-discount.jpg',
      data: {
        type: 'promotion',
        promotionId: 'promo-456',
        restaurantId: 'sushi-master'
      }
    },
    status: 'delivered',
    sentAt: Timestamp.fromDate(new Date('2024-01-14T15:00:00')),
    deliveredAt: Timestamp.fromDate(new Date('2024-01-14T15:00:03')),
    retryCount: 0,
    maxRetries: 3,
    tags: ['promotion', 'sushi-master'],
    metadata: {
      promotionId: 'promo-456',
      restaurantId: 'sushi-master'
    },
    createdAt: Timestamp.fromDate(new Date('2024-01-14T15:00:00')),
    updatedAt: Timestamp.fromDate(new Date('2024-01-14T15:00:03'))
  },
  {
    id: 'notif-3',
    userId: 'user-2',
    type: 'friend_request',
    priority: 'normal',
    channel: 'push',
    content: {
      title: 'Yeni Arkadaşlık İsteği',
      body: 'Mehmet Kaya sizi arkadaş olarak eklemek istiyor.',
      icon: '/icon-192x192.png',
      data: {
        type: 'friend_request',
        requesterId: 'user-3',
        requesterName: 'Mehmet Kaya'
      }
    },
    status: 'pending',
    retryCount: 0,
    maxRetries: 3,
    tags: ['social', 'friend_request'],
    metadata: {
      requesterId: 'user-3',
      requesterName: 'Mehmet Kaya'
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
];

// Test siparişleri (geliştirilmiş takip sistemi ile)
const testOrders = [
  {
    id: 'order1',
    userId: 'user1',
    user: {
      uid: 'user1',
      email: 'ahmet@example.com',
      displayName: 'Ahmet Yılmaz',
      phoneNumber: '+905551234567',
      role: 'customer',
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    },
    restaurantId: 'pizza-palace',
    restaurant: {
      id: 'pizza-palace',
      name: 'Pizza Palace',
      description: 'En lezzetli pizzalar',
      categoryIds: ['pizza'],
      address: {
        street: 'Bağdat Caddesi No:123',
        city: 'İstanbul',
        district: 'Kadıköy',
        zipCode: '34710',
        country: 'Türkiye',
        coordinates: { lat: 40.9909, lng: 29.0304 }
      },
      phone: '+902161234567',
      email: 'info@pizzapalace.com',
      workingHours: {
        monday: { open: '10:00', close: '22:00', isOpen: true },
        tuesday: { open: '10:00', close: '22:00', isOpen: true },
        wednesday: { open: '10:00', close: '22:00', isOpen: true },
        thursday: { open: '10:00', close: '22:00', isOpen: true },
        friday: { open: '10:00', close: '23:00', isOpen: true },
        saturday: { open: '10:00', close: '23:00', isOpen: true },
        sunday: { open: '11:00', close: '21:00', isOpen: true }
      },
      deliveryRadius: 5,
      minimumOrderAmount: 30,
      deliveryFee: 15,
      estimatedDeliveryTime: 45,
      isOpen: true,
      rating: 4.5,
      reviewCount: 128,
      commissionRate: 9,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    },
    items: [
      {
        productId: 'margherita-pizza',
        product: {
          id: 'margherita-pizza',
          restaurantId: 'pizza-palace',
          name: 'Margherita Pizza',
          description: 'Domates sosu, mozzarella peyniri, fesleğen',
          price: 45,
          categoryId: 'pizza',
          imageUrl: '/images/margherita.jpg',
          images: [],
          variants: [],
          ingredients: ['domates sosu', 'mozzarella', 'fesleğen'],
          allergens: ['süt'],
          isVegetarian: true,
          isVegan: false,
          isGlutenFree: false,
          preparationTime: 20,
          calories: 285,
          isActive: true,
          stock: 50,
          minStock: 10,
          maxStock: 100,
          tags: ['pizza', 'vejetaryen', 'klasik'],
          rating: 4.6,
          reviewCount: 89,
          isPopular: true,
          isFeatured: false,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        },
        quantity: 2,
        price: 45,
        categoryId: 'pizza'
      }
    ],
    subtotal: 90,
    deliveryFee: 15,
    total: 105,
    commissionCalculation: {
      subtotal: 90,
      commissionRate: 9,
      commissionAmount: 8.1,
      restaurantEarning: 81.9,
      platformEarning: 8.1
    },
    status: 'delivering',
    paymentMethod: 'CASH_ON_DELIVERY',
    deliveryAddress: {
      street: 'Moda Caddesi No:45',
      city: 'İstanbul',
      district: 'Kadıköy',
      zipCode: '34710',
      country: 'Türkiye',
      coordinates: { lat: 40.9876, lng: 29.0289 },
      fullName: 'Ahmet Yılmaz',
      phone: '+905551234567',
      isDefault: true,
      instructions: 'Kapıya bırakabilirsiniz'
    },
    tracking: {
      orderId: 'order1',
      status: 'delivering',
      deliveryStatus: 'DRIVER_ON_WAY',
      driver: {
        id: 'driver1',
        name: 'Mehmet Kaya',
        phone: '+905559876543',
        photoUrl: '/images/driver1.jpg',
        vehicle: {
          type: 'motorcycle',
          model: 'Honda PCX 150',
          plateNumber: '34 ABC 123'
        },
        currentLocation: {
          lat: 40.9850,
          lng: 29.0270,
          timestamp: Timestamp.now()
        },
        rating: 4.8,
        totalDeliveries: 1247,
        isOnline: true,
        estimatedArrival: Timestamp.fromDate(new Date(Date.now() + 15 * 60000)) // 15 dakika sonra
      },
      timestamps: {
        orderPlaced: Timestamp.fromDate(new Date(Date.now() - 45 * 60000)),
        confirmed: Timestamp.fromDate(new Date(Date.now() - 40 * 60000)),
        preparing: Timestamp.fromDate(new Date(Date.now() - 35 * 60000)),
        ready: Timestamp.fromDate(new Date(Date.now() - 25 * 60000)),
        driverAssigned: Timestamp.fromDate(new Date(Date.now() - 20 * 60000)),
        pickedUp: Timestamp.fromDate(new Date(Date.now() - 15 * 60000)),
        delivering: Timestamp.fromDate(new Date(Date.now() - 10 * 60000))
      },
      estimatedTimes: {
        preparation: 20,
        delivery: 25,
        total: 45
      },
      actualTimes: {
        preparation: 20,
        delivery: 15
      },
      locationHistory: [
        {
          lat: 40.9909,
          lng: 29.0304,
          timestamp: Timestamp.fromDate(new Date(Date.now() - 45 * 60000)),
          status: 'pending',
          description: 'Sipariş alındı'
        },
        {
          lat: 40.9909,
          lng: 29.0304,
          timestamp: Timestamp.fromDate(new Date(Date.now() - 40 * 60000)),
          status: 'confirmed',
          description: 'Sipariş onaylandı'
        },
        {
          lat: 40.9909,
          lng: 29.0304,
          timestamp: Timestamp.fromDate(new Date(Date.now() - 35 * 60000)),
          status: 'preparing',
          description: 'Yemek hazırlanıyor'
        },
        {
          lat: 40.9909,
          lng: 29.0304,
          timestamp: Timestamp.fromDate(new Date(Date.now() - 25 * 60000)),
          status: 'ready',
          description: 'Yemek hazır'
        },
        {
          lat: 40.9909,
          lng: 29.0304,
          timestamp: Timestamp.fromDate(new Date(Date.now() - 20 * 60000)),
          status: 'assigned',
          description: 'Teslimatçı atandı'
        },
        {
          lat: 40.9909,
          lng: 29.0304,
          timestamp: Timestamp.fromDate(new Date(Date.now() - 15 * 60000)),
          status: 'picked_up',
          description: 'Teslimatçı yemeği aldı'
        },
        {
          lat: 40.9850,
          lng: 29.0270,
          timestamp: Timestamp.fromDate(new Date(Date.now() - 10 * 60000)),
          status: 'delivering',
          description: 'Yolda'
        }
      ],
      statusUpdates: [
        {
          status: 'pending',
          timestamp: Timestamp.fromDate(new Date(Date.now() - 45 * 60000)),
          description: 'Siparişiniz alındı ve onay bekliyor',
          updatedBy: 'system'
        },
        {
          status: 'confirmed',
          timestamp: Timestamp.fromDate(new Date(Date.now() - 40 * 60000)),
          description: 'Siparişiniz onaylandı',
          updatedBy: 'restaurant'
        },
        {
          status: 'preparing',
          timestamp: Timestamp.fromDate(new Date(Date.now() - 35 * 60000)),
          description: 'Yemeğiniz hazırlanıyor',
          updatedBy: 'restaurant'
        },
        {
          status: 'ready',
          timestamp: Timestamp.fromDate(new Date(Date.now() - 25 * 60000)),
          description: 'Yemeğiniz hazır, teslimatçı bekleniyor',
          updatedBy: 'restaurant'
        },
        {
          status: 'assigned',
          timestamp: Timestamp.fromDate(new Date(Date.now() - 20 * 60000)),
          description: 'Mehmet Kaya teslimatçınız atandı',
          updatedBy: 'system',
          metadata: { driverId: 'driver1' }
        },
        {
          status: 'picked_up',
          timestamp: Timestamp.fromDate(new Date(Date.now() - 15 * 60000)),
          description: 'Teslimatçınız yemeğinizi aldı',
          updatedBy: 'driver'
        },
        {
          status: 'delivering',
          timestamp: Timestamp.fromDate(new Date(Date.now() - 10 * 60000)),
          description: 'Yemeğiniz yolda',
          updatedBy: 'driver'
        }
      ],
      notifications: [
        {
          type: 'sms',
          sent: true,
          timestamp: Timestamp.fromDate(new Date(Date.now() - 45 * 60000)),
          content: 'Siparişiniz alındı'
        },
        {
          type: 'email',
          sent: true,
          timestamp: Timestamp.fromDate(new Date(Date.now() - 45 * 60000)),
          content: 'Sipariş onayı e-postası'
        },
        {
          type: 'push',
          sent: true,
          timestamp: Timestamp.fromDate(new Date(Date.now() - 20 * 60000)),
          content: 'Teslimatçınız atandı'
        }
      ],
      customerInteractions: [
        {
          type: 'call_driver',
          timestamp: Timestamp.fromDate(new Date(Date.now() - 5 * 60000)),
          status: 'approved',
          notes: 'Müşteri teslimatçıyı aradı'
        }
      ]
    },
    estimatedDeliveryTime: Timestamp.fromDate(new Date(Date.now() + 15 * 60000)),
    preparationStartTime: Timestamp.fromDate(new Date(Date.now() - 35 * 60000)),
    preparationEndTime: Timestamp.fromDate(new Date(Date.now() - 25 * 60000)),
    specialInstructions: 'Ekstra peynir ekleyin',
    deliveryInstructions: 'Kapıya bırakabilirsiniz',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  },
  {
    id: 'order2',
    userId: 'user2',
    user: {
      uid: 'user2',
      email: 'ayse@example.com',
      displayName: 'Ayşe Demir',
      phoneNumber: '+905552345678',
      role: 'customer',
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    },
    restaurantId: 'burger-house',
    restaurant: {
      id: 'burger-house',
      name: 'Burger House',
      description: 'En lezzetli burgerler',
      categoryIds: ['burger'],
      address: {
        street: 'İstiklal Caddesi No:456',
        city: 'İstanbul',
        district: 'Beyoğlu',
        zipCode: '34435',
        country: 'Türkiye',
        coordinates: { lat: 41.0370, lng: 28.9850 }
      },
      phone: '+902121234567',
      email: 'info@burgerhouse.com',
      workingHours: {
        monday: { open: '11:00', close: '23:00', isOpen: true },
        tuesday: { open: '11:00', close: '23:00', isOpen: true },
        wednesday: { open: '11:00', close: '23:00', isOpen: true },
        thursday: { open: '11:00', close: '23:00', isOpen: true },
        friday: { open: '11:00', close: '00:00', isOpen: true },
        saturday: { open: '11:00', close: '00:00', isOpen: true },
        sunday: { open: '12:00', close: '22:00', isOpen: true }
      },
      deliveryRadius: 4,
      minimumOrderAmount: 25,
      deliveryFee: 12,
      estimatedDeliveryTime: 35,
      isOpen: true,
      rating: 4.3,
      reviewCount: 89,
      commissionRate: 9,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    },
    items: [
      {
        productId: 'classic-burger',
        product: {
          id: 'classic-burger',
          restaurantId: 'burger-house',
          name: 'Classic Burger',
          description: 'Dana eti, marul, domates, soğan',
          price: 35,
          categoryId: 'burger',
          imageUrl: '/images/classic-burger.jpg',
          images: [],
          variants: [],
          ingredients: ['dana eti', 'marul', 'domates', 'soğan'],
          allergens: ['gluten'],
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false,
          preparationTime: 12,
          calories: 450,
          isActive: true,
          stock: 30,
          minStock: 5,
          maxStock: 50,
          tags: ['burger', 'et', 'klasik'],
          rating: 4.3,
          reviewCount: 45,
          isPopular: true,
          isFeatured: false,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        },
        quantity: 1,
        price: 35,
        categoryId: 'burger'
      },
      {
        productId: 'cheese-burger',
        product: {
          id: 'cheese-burger',
          restaurantId: 'burger-house',
          name: 'Cheese Burger',
          description: 'Dana eti, cheddar peyniri, marul, domates, soğan',
          price: 40,
          categoryId: 'burger',
          imageUrl: '/images/cheese-burger.jpg',
          images: [],
          variants: [],
          ingredients: ['dana eti', 'cheddar', 'marul', 'domates', 'soğan'],
          allergens: ['gluten', 'süt'],
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false,
          preparationTime: 15,
          calories: 520,
          isActive: true,
          stock: 25,
          minStock: 5,
          maxStock: 40,
          tags: ['burger', 'et', 'peynir'],
          rating: 4.4,
          reviewCount: 38,
          isPopular: true,
          isFeatured: false,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        },
        quantity: 1,
        price: 40,
        categoryId: 'burger'
      }
    ],
    subtotal: 75,
    deliveryFee: 12,
    total: 87,
    commissionCalculation: {
      subtotal: 75,
      commissionRate: 9,
      commissionAmount: 6.75,
      restaurantEarning: 68.25,
      platformEarning: 6.75
    },
    status: 'ready',
    paymentMethod: 'CARD_ON_DELIVERY',
    deliveryAddress: {
      street: 'Beşiktaş Caddesi No:78',
      city: 'İstanbul',
      district: 'Beşiktaş',
      zipCode: '34353',
      country: 'Türkiye',
      coordinates: { lat: 41.0422, lng: 29.0083 },
      fullName: 'Ayşe Demir',
      phone: '+905552345678',
      isDefault: true,
      instructions: 'Asansörle çıkabilirsiniz'
    },
    tracking: {
      orderId: 'order2',
      status: 'ready',
      deliveryStatus: 'ASSIGNING_DRIVER',
      timestamps: {
        orderPlaced: Timestamp.fromDate(new Date(Date.now() - 30 * 60000)),
        confirmed: Timestamp.fromDate(new Date(Date.now() - 25 * 60000)),
        preparing: Timestamp.fromDate(new Date(Date.now() - 20 * 60000)),
        ready: Timestamp.fromDate(new Date(Date.now() - 5 * 60000))
      },
      estimatedTimes: {
        preparation: 15,
        delivery: 20,
        total: 35
      },
      actualTimes: {
        preparation: 15
      },
      locationHistory: [
        {
          lat: 41.0370,
          lng: 28.9850,
          timestamp: Timestamp.fromDate(new Date(Date.now() - 30 * 60000)),
          status: 'pending',
          description: 'Sipariş alındı'
        },
        {
          lat: 41.0370,
          lng: 28.9850,
          timestamp: Timestamp.fromDate(new Date(Date.now() - 25 * 60000)),
          status: 'confirmed',
          description: 'Sipariş onaylandı'
        },
        {
          lat: 41.0370,
          lng: 28.9850,
          timestamp: Timestamp.fromDate(new Date(Date.now() - 20 * 60000)),
          status: 'preparing',
          description: 'Yemek hazırlanıyor'
        },
        {
          lat: 41.0370,
          lng: 28.9850,
          timestamp: Timestamp.fromDate(new Date(Date.now() - 5 * 60000)),
          status: 'ready',
          description: 'Yemek hazır'
        }
      ],
      statusUpdates: [
        {
          status: 'pending',
          timestamp: Timestamp.fromDate(new Date(Date.now() - 30 * 60000)),
          description: 'Siparişiniz alındı ve onay bekliyor',
          updatedBy: 'system'
        },
        {
          status: 'confirmed',
          timestamp: Timestamp.fromDate(new Date(Date.now() - 25 * 60000)),
          description: 'Siparişiniz onaylandı',
          updatedBy: 'restaurant'
        },
        {
          status: 'preparing',
          timestamp: Timestamp.fromDate(new Date(Date.now() - 20 * 60000)),
          description: 'Yemeğiniz hazırlanıyor',
          updatedBy: 'restaurant'
        },
        {
          status: 'ready',
          timestamp: Timestamp.fromDate(new Date(Date.now() - 5 * 60000)),
          description: 'Yemeğiniz hazır, teslimatçı bekleniyor',
          updatedBy: 'restaurant'
        }
      ],
      notifications: [
        {
          type: 'sms',
          sent: true,
          timestamp: Timestamp.fromDate(new Date(Date.now() - 30 * 60000)),
          content: 'Siparişiniz alındı'
        },
        {
          type: 'email',
          sent: true,
          timestamp: Timestamp.fromDate(new Date(Date.now() - 30 * 60000)),
          content: 'Sipariş onayı e-postası'
        }
      ],
      customerInteractions: []
    },
    estimatedDeliveryTime: Timestamp.fromDate(new Date(Date.now() + 20 * 60000)),
    preparationStartTime: Timestamp.fromDate(new Date(Date.now() - 20 * 60000)),
    preparationEndTime: Timestamp.fromDate(new Date(Date.now() - 5 * 60000)),
    specialInstructions: 'Patates kızartması ekstra kıtır olsun',
    deliveryInstructions: 'Asansörle çıkabilirsiniz',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
];

const testAdvertisements = [
  {
    id: 'ad1',
    title: 'Pizza Kampanyası',
    description: 'Tüm pizzalarda %20 indirim',
    imageUrl: '/images/pizza-ad.jpg',
    targetUrl: '/restaurant/pizza-palace',
    isActive: true,
    startDate: Timestamp.now(),
    endDate: Timestamp.now(),
    impressions: 25000,
    clicks: 1800,
    budget: 5000,
    spent: 5000,
    createdAt: Timestamp.now()
  },
  {
    id: 'ad2',
    title: 'Burger Fırsatı',
    description: 'İkinci burger yarı fiyatına',
    imageUrl: '/images/burger-ad.jpg',
    targetUrl: '/restaurant/burger-house',
    isActive: true,
    startDate: Timestamp.now(),
    endDate: Timestamp.now(),
    impressions: 20000,
    clicks: 1400,
    budget: 4200,
    spent: 4200,
    createdAt: Timestamp.now()
  },
  {
    id: 'ad3',
    title: 'Sushi Özel',
    description: 'Sushi setlerinde %15 indirim',
    imageUrl: '/images/sushi-ad.jpg',
    targetUrl: '/restaurant/sushi-master',
    isActive: true,
    startDate: Timestamp.now(),
    endDate: Timestamp.now(),
    impressions: 18000,
    clicks: 1200,
    budget: 3600,
    spent: 3600,
    createdAt: Timestamp.now()
  }
];

const testComplaints = [
  {
    id: 'complaint1',
    userId: 'user1',
    orderId: 'order1',
    restaurantId: 'pizza-palace',
    subject: 'Teslimat gecikmesi',
    description: 'Siparişim 1 saat gecikti',
    status: 'resolved',
    priority: 'medium',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    assignedTo: 'admin1'
  },
  {
    id: 'complaint2',
    userId: 'user2',
    orderId: 'order2',
    restaurantId: 'burger-house',
    subject: 'Yanlış ürün',
    description: 'Yanlış burger geldi',
    status: 'processing',
    priority: 'high',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    assignedTo: 'admin1'
  },
  {
    id: 'complaint3',
    userId: 'user3',
    orderId: 'order3',
    restaurantId: 'sushi-master',
    subject: 'Kalite sorunu',
    description: 'Sushi taze değildi',
    status: 'new',
    priority: 'high',
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  }
];

export async function seedDatabase() {
  console.log('🌱 Test verileri ekleniyor...');
  
  const batch = writeBatch(db);
  
  try {
    // Kategoriler ekle
    console.log('📂 Kategoriler ekleniyor...');
    testCategories.forEach(category => {
      const docRef = doc(db, 'categories', category.id);
      batch.set(docRef, category);
    });
    
    // Restoranlar ekle
    console.log('🏪 Restoranlar ekleniyor...');
    testRestaurants.forEach(restaurant => {
      const docRef = doc(db, 'restaurants', restaurant.id);
      batch.set(docRef, restaurant);
    });
    
    // Ürünler ekle
    console.log('🍕 Ürünler ekleniyor...');
    testProducts.forEach(product => {
      const docRef = doc(db, 'products', product.id);
      batch.set(docRef, product);
    });
    
    // Kullanıcılar ekle
    console.log('👥 Kullanıcılar ekleniyor...');
    testUsers.forEach(user => {
      const docRef = doc(db, 'users', user.uid); // uid'ye göre ekle
      batch.set(docRef, user);
    });
    
    // Siparişler ekle
    console.log('🛒 Siparişler ekleniyor...');
    testOrders.forEach(order => {
      const docRef = doc(db, 'orders', order.id);
      batch.set(docRef, order);
    });
    
    // Reklamlar ekle
    console.log('📢 Reklamlar ekleniyor...');
    testAdvertisements.forEach(ad => {
      const docRef = doc(db, 'advertisements', ad.id);
      batch.set(docRef, ad);
    });
    
    // Şikayetler ekle
    console.log('⚠️ Şikayetler ekleniyor...');
    testComplaints.forEach(complaint => {
      const docRef = doc(db, 'complaints', complaint.id);
      batch.set(docRef, complaint);
    });
    
    // Batch'i commit et
    await batch.commit();
    
    console.log('✅ Test verileri başarıyla eklendi!');
    console.log('📊 Eklenen veriler:');
    console.log(`   - ${testCategories.length} kategori`);
    console.log(`   - ${testRestaurants.length} restoran`);
    console.log(`   - ${testProducts.length} ürün`);
    console.log(`   - ${testUsers.length} kullanıcı`);
    console.log(`   - ${testOrders.length} sipariş`);
    console.log(`   - ${testAdvertisements.length} reklam`);
    console.log(`   - ${testComplaints.length} şikayet`);
    console.log('🎉 Seed işlemi tamamlandı!');
    
    return {
      categories: testCategories.length,
      restaurants: testRestaurants.length,
      products: testProducts.length,
      users: testUsers.length,
      orders: testOrders.length,
      advertisements: testAdvertisements.length,
      complaints: testComplaints.length
    };
    
  } catch (error) {
    console.error('❌ Seed işlemi sırasında hata:', error);
    throw error;
  }
}

// Development için otomatik çalıştır
if (process.env.NODE_ENV === 'development') {
  seedDatabase();
} 