import type { 
  Product, 
  CartItem, 
  Order, 
  NutritionInfo, 
  CalorieCalculation 
} from '@/types';

export class CalorieService {
  
  // Günlük değer standartları (Türkiye Sağlık Bakanlığı)
  private static readonly DAILY_VALUES = {
    calories: 2000,      // kcal
    protein: 50,         // g
    carbohydrates: 275,  // g
    fat: 65,             // g
    saturatedFat: 20,    // g
    fiber: 28,           // g
    sugar: 50,           // g
    sodium: 2300,        // mg
    cholesterol: 300     // mg
  };

  // Kalori kategorileri
  private static readonly CALORIE_CATEGORIES = {
    low: { min: 0, max: 120, label: 'Düşük Kalorili' },
    medium: { min: 121, max: 300, label: 'Orta Kalorili' },
    high: { min: 301, max: 500, label: 'Yüksek Kalorili' },
    very_high: { min: 501, max: 9999, label: 'Çok Yüksek Kalorili' }
  };

  // Beslenme skoru hesaplama
  static calculateNutritionScore(nutritionInfo: NutritionInfo): number {
    let score = 100;
    
    // Kalori puanı (0-25)
    const calorieScore = Math.max(0, 25 - (nutritionInfo.calories / 10));
    score += calorieScore;
    
    // Protein puanı (0-20)
    const proteinScore = Math.min(20, nutritionInfo.protein * 2);
    score += proteinScore;
    
    // Lif puanı (0-15)
    const fiberScore = Math.min(15, nutritionInfo.fiber * 3);
    score += fiberScore;
    
    // Şeker puanı (0-15)
    const sugarPenalty = Math.min(15, nutritionInfo.sugar * 0.3);
    score -= sugarPenalty;
    
    // Doymuş yağ puanı (0-15)
    const saturatedFatPenalty = Math.min(15, nutritionInfo.saturatedFat * 0.75);
    score -= saturatedFatPenalty;
    
    // Sodyum puanı (0-10)
    const sodiumPenalty = Math.min(10, nutritionInfo.sodium / 100);
    score -= sodiumPenalty;
    
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  // Kalori kategorisi belirleme
  static getCalorieCategory(calories: number): 'low' | 'medium' | 'high' | 'very_high' {
    if (calories <= 120) return 'low';
    if (calories <= 300) return 'medium';
    if (calories <= 500) return 'high';
    return 'very_high';
  }

  // Beslenme etiketleri oluşturma
  static generateNutritionLabels(nutritionInfo: NutritionInfo): string[] {
    const labels: string[] = [];
    
    // Kalori etiketleri
    const category = this.getCalorieCategory(nutritionInfo.calories);
    labels.push(this.CALORIE_CATEGORIES[category].label);
    
    // Protein etiketleri
    if (nutritionInfo.protein >= 20) {
      labels.push('Yüksek Protein');
    } else if (nutritionInfo.protein >= 10) {
      labels.push('Protein İçerir');
    }
    
    // Lif etiketleri
    if (nutritionInfo.fiber >= 5) {
      labels.push('Yüksek Lif');
    } else if (nutritionInfo.fiber >= 3) {
      labels.push('Lif İçerir');
    }
    
    // Şeker etiketleri
    if (nutritionInfo.sugar <= 5) {
      labels.push('Düşük Şeker');
    } else if (nutritionInfo.sugar >= 15) {
      labels.push('Yüksek Şeker');
    }
    
    // Yağ etiketleri
    if (nutritionInfo.fat <= 3) {
      labels.push('Düşük Yağ');
    } else if (nutritionInfo.fat >= 20) {
      labels.push('Yüksek Yağ');
    }
    
    // Sodyum etiketleri
    if (nutritionInfo.sodium <= 140) {
      labels.push('Düşük Sodyum');
    } else if (nutritionInfo.sodium >= 500) {
      labels.push('Yüksek Sodyum');
    }
    
    // Özel diyet etiketleri
    if (nutritionInfo.fiber >= 3 && nutritionInfo.fat <= 3) {
      labels.push('Diyet Dostu');
    }
    
    if (nutritionInfo.protein >= 15 && nutritionInfo.carbohydrates <= 10) {
      labels.push('Keto Dostu');
    }
    
    return labels;
  }

  // Günlük değer yüzdelerini hesaplama
  static calculateDailyValues(nutritionInfo: NutritionInfo) {
    return {
      calories: Math.round((nutritionInfo.calories / this.DAILY_VALUES.calories) * 100),
      protein: Math.round((nutritionInfo.protein / this.DAILY_VALUES.protein) * 100),
      carbohydrates: Math.round((nutritionInfo.carbohydrates / this.DAILY_VALUES.carbohydrates) * 100),
      fat: Math.round((nutritionInfo.fat / this.DAILY_VALUES.fat) * 100),
      saturatedFat: Math.round((nutritionInfo.saturatedFat / this.DAILY_VALUES.saturatedFat) * 100),
      fiber: Math.round((nutritionInfo.fiber / this.DAILY_VALUES.fiber) * 100),
      sugar: Math.round((nutritionInfo.sugar / this.DAILY_VALUES.sugar) * 100),
      sodium: Math.round((nutritionInfo.sodium / this.DAILY_VALUES.sodium) * 100),
      cholesterol: Math.round((nutritionInfo.cholesterol / this.DAILY_VALUES.cholesterol) * 100)
    };
  }

  // Sepet kalori hesaplama
  static calculateCartCalories(cartItems: CartItem[]): CalorieCalculation {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbohydrates = 0;
    let totalFat = 0;
    let totalFiber = 0;
    let totalSugar = 0;
    let totalSodium = 0;

    const items = cartItems.map(item => {
      const nutrition = item.product.nutritionInfo;
      const quantity = item.quantity;
      
      const calories = nutrition.calories * quantity;
      const protein = nutrition.protein * quantity;
      const carbohydrates = nutrition.carbohydrates * quantity;
      const fat = nutrition.fat * quantity;
      
      totalCalories += calories;
      totalProtein += protein;
      totalCarbohydrates += carbohydrates;
      totalFat += fat;
      totalFiber += nutrition.fiber * quantity;
      totalSugar += nutrition.sugar * quantity;
      totalSodium += nutrition.sodium * quantity;

      return {
        productId: item.productId,
        productName: item.product.name,
        quantity,
        calories,
        protein,
        carbohydrates,
        fat
      };
    });

    const dailyValuePercentages = {
      calories: Math.round((totalCalories / this.DAILY_VALUES.calories) * 100),
      protein: Math.round((totalProtein / this.DAILY_VALUES.protein) * 100),
      carbohydrates: Math.round((totalCarbohydrates / this.DAILY_VALUES.carbohydrates) * 100),
      fat: Math.round((totalFat / this.DAILY_VALUES.fat) * 100),
      fiber: Math.round((totalFiber / this.DAILY_VALUES.fiber) * 100),
      sugar: Math.round((totalSugar / this.DAILY_VALUES.sugar) * 100),
      sodium: Math.round((totalSodium / this.DAILY_VALUES.sodium) * 100)
    };

    return {
      totalCalories,
      totalProtein,
      totalCarbohydrates,
      totalFat,
      totalFiber,
      totalSugar,
      totalSodium,
      items,
      dailyValuePercentages
    };
  }

  // Sipariş kalori hesaplama
  static calculateOrderCalories(order: Order): CalorieCalculation {
    return this.calculateCartCalories(order.items);
  }

  // Beslenme bilgilerini doğrulama
  static validateNutritionInfo(nutritionInfo: NutritionInfo): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Zorunlu alanlar kontrolü
    if (nutritionInfo.calories < 0) {
      errors.push('Kalori değeri negatif olamaz');
    }
    if (nutritionInfo.calories > 2000) {
      warnings.push('Kalori değeri çok yüksek görünüyor');
    }

    if (nutritionInfo.protein < 0) {
      errors.push('Protein değeri negatif olamaz');
    }
    if (nutritionInfo.protein > 100) {
      warnings.push('Protein değeri çok yüksek görünüyor');
    }

    if (nutritionInfo.carbohydrates < 0) {
      errors.push('Karbonhidrat değeri negatif olamaz');
    }
    if (nutritionInfo.carbohydrates > 200) {
      warnings.push('Karbonhidrat değeri çok yüksek görünüyor');
    }

    if (nutritionInfo.fat < 0) {
      errors.push('Yağ değeri negatif olamaz');
    }
    if (nutritionInfo.fat > 100) {
      warnings.push('Yağ değeri çok yüksek görünüyor');
    }

    if (nutritionInfo.sugar < 0) {
      errors.push('Şeker değeri negatif olamaz');
    }
    if (nutritionInfo.sugar > 100) {
      warnings.push('Şeker değeri çok yüksek görünüyor');
    }

    if (nutritionInfo.sodium < 0) {
      errors.push('Sodyum değeri negatif olamaz');
    }
    if (nutritionInfo.sodium > 5000) {
      warnings.push('Sodyum değeri çok yüksek görünüyor');
    }

    // Mantık kontrolü
    const totalMacros = nutritionInfo.protein + nutritionInfo.carbohydrates + nutritionInfo.fat;
    if (totalMacros > 150) {
      warnings.push('Toplam makro besin değerleri çok yüksek görünüyor');
    }

    if (nutritionInfo.saturatedFat > nutritionInfo.fat) {
      errors.push('Doymuş yağ, toplam yağdan fazla olamaz');
    }

    if (nutritionInfo.transFat > nutritionInfo.fat) {
      errors.push('Trans yağ, toplam yağdan fazla olamaz');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Beslenme bilgilerini otomatik oluşturma (AI destekli)
  static async generateNutritionInfo(
    productName: string,
    ingredients: string[],
    servingSize: string
  ): Promise<Partial<NutritionInfo>> {
    // Bu fonksiyon AI servisi ile entegre edilebilir
    // Şimdilik temel hesaplamalar yapıyoruz
    
    const baseCalories = this.estimateCaloriesFromIngredients(ingredients);
    const baseProtein = this.estimateProteinFromIngredients(ingredients);
    const baseCarbs = this.estimateCarbsFromIngredients(ingredients);
    const baseFat = this.estimateFatFromIngredients(ingredients);

    const nutritionInfo: Partial<NutritionInfo> = {
      calories: baseCalories,
      protein: baseProtein,
      carbohydrates: baseCarbs,
      fat: baseFat,
      saturatedFat: baseFat * 0.3, // Tahmini
      transFat: 0,
      fiber: this.estimateFiberFromIngredients(ingredients),
      sugar: this.estimateSugarFromIngredients(ingredients),
      sodium: this.estimateSodiumFromIngredients(ingredients),
      cholesterol: this.estimateCholesterolFromIngredients(ingredients),
      servingSize,
      nutritionLabels: [],
      calorieCategory: this.getCalorieCategory(baseCalories),
      nutritionScore: 0,
      lastUpdated: new Date(),
      isVerified: false
    };

    // Beslenme skorunu hesapla
    nutritionInfo.nutritionScore = this.calculateNutritionScore(nutritionInfo as NutritionInfo);
    
    // Etiketleri oluştur
    nutritionInfo.nutritionLabels = this.generateNutritionLabels(nutritionInfo as NutritionInfo);
    
    // Günlük değerleri hesapla
    nutritionInfo.dailyValues = this.calculateDailyValues(nutritionInfo as NutritionInfo);

    return nutritionInfo;
  }

  // Malzemelerden kalori tahmini
  private static estimateCaloriesFromIngredients(ingredients: string[]): number {
    const ingredientCalories: Record<string, number> = {
      'tavuk': 165,
      'dana eti': 250,
      'domates': 18,
      'soğan': 40,
      'peynir': 113,
      'ekmek': 265,
      'pirinç': 130,
      'makarna': 131,
      'patates': 77,
      'havuç': 41,
      'marul': 15,
      'salatalık': 16,
      'zeytin': 115,
      'sucuk': 290,
      'pastırma': 250,
      'yumurta': 155,
      'süt': 42,
      'yoğurt': 59,
      'bal': 304,
      'şeker': 387
    };

    let totalCalories = 0;
    ingredients.forEach(ingredient => {
      const lowerIngredient = ingredient.toLowerCase();
      for (const [key, calories] of Object.entries(ingredientCalories)) {
        if (lowerIngredient.includes(key)) {
          totalCalories += calories;
          break;
        }
      }
    });

    return totalCalories || 200; // Varsayılan değer
  }

  // Diğer besin değeri tahmin fonksiyonları
  private static estimateProteinFromIngredients(ingredients: string[]): number {
    // Basit tahmin - gerçek uygulamada AI kullanılabilir
    return Math.random() * 20 + 5;
  }

  private static estimateCarbsFromIngredients(ingredients: string[]): number {
    return Math.random() * 30 + 10;
  }

  private static estimateFatFromIngredients(ingredients: string[]): number {
    return Math.random() * 15 + 5;
  }

  private static estimateFiberFromIngredients(ingredients: string[]): number {
    return Math.random() * 5 + 1;
  }

  private static estimateSugarFromIngredients(ingredients: string[]): number {
    return Math.random() * 10 + 2;
  }

  private static estimateSodiumFromIngredients(ingredients: string[]): number {
    return Math.random() * 500 + 100;
  }

  private static estimateCholesterolFromIngredients(ingredients: string[]): number {
    return Math.random() * 50 + 10;
  }

  // Kalori raporu oluşturma
  static generateCalorieReport(calculation: CalorieCalculation | null): {
    summary: string;
    recommendations: string[];
    healthScore: number;
  } {
    if (!calculation) {
      return {
        summary: 'Kalori bilgisi mevcut değil.',
        recommendations: ['Ürün kalori bilgilerini kontrol edin.'],
        healthScore: 50
      };
    }
    
    const { totalCalories, dailyValuePercentages } = calculation;
    
    let summary = '';
    const recommendations: string[] = [];
    let healthScore = 100;

    // Kalori değerlendirmesi
    if (totalCalories < 300) {
      summary = 'Düşük kalorili bir öğün seçtiniz.';
      recommendations.push('Daha fazla protein ve lif ekleyebilirsiniz.');
    } else if (totalCalories < 600) {
      summary = 'Orta kalorili bir öğün seçtiniz.';
      healthScore = 85;
    } else if (totalCalories < 1000) {
      summary = 'Yüksek kalorili bir öğün seçtiniz.';
      recommendations.push('Porsiyon boyutunu küçültebilirsiniz.');
      healthScore = 70;
    } else {
      summary = 'Çok yüksek kalorili bir öğün seçtiniz.';
      recommendations.push('Daha hafif alternatifler düşünebilirsiniz.');
      healthScore = 50;
    }

    // Günlük değer değerlendirmesi
    if (dailyValuePercentages.calories > 50) {
      recommendations.push('Bu öğün günlük kalori ihtiyacınızın yarısından fazlasını karşılıyor.');
    }

    if (dailyValuePercentages.sodium > 40) {
      recommendations.push('Sodyum içeriği yüksek. Tuzlu gıdaları azaltabilirsiniz.');
      healthScore -= 10;
    }

    if (dailyValuePercentages.fiber < 10) {
      recommendations.push('Lif içeriği düşük. Sebze ve tam tahıl ekleyebilirsiniz.');
      healthScore -= 5;
    }

    if (dailyValuePercentages.protein < 20) {
      recommendations.push('Protein içeriği düşük. Protein açısından zengin gıdalar ekleyebilirsiniz.');
      healthScore -= 5;
    }

    return {
      summary,
      recommendations,
      healthScore: Math.max(0, healthScore)
    };
  }
} 