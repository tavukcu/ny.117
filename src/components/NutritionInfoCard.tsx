'use client';

import { useState } from 'react';
import type { NutritionInfo, CalorieCalculation } from '@/types';
import { 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  Flame, 
  Droplets, 
  Zap,
  ChevronDown,
  ChevronUp,
  Star,
  Shield,
  Clock
} from 'lucide-react';

interface NutritionInfoCardProps {
  nutritionInfo: NutritionInfo;
  showDetails?: boolean;
  isCompact?: boolean;
  className?: string;
}

export default function NutritionInfoCard({ 
  nutritionInfo, 
  showDetails = false,
  isCompact = false,
  className = ''
}: NutritionInfoCardProps) {
  const [isExpanded, setIsExpanded] = useState(showDetails);

  const getCalorieColor = (category: string) => {
    switch (category) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'very_high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getNutritionScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getDailyValueColor = (percentage: number) => {
    if (percentage <= 20) return 'text-green-600';
    if (percentage <= 40) return 'text-yellow-600';
    if (percentage <= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatValue = (value: number, unit: string) => {
    return `${value.toFixed(1)} ${unit}`;
  };

  const formatPercentage = (percentage: number) => {
    return `%${percentage}`;
  };

  if (isCompact) {
    return (
      <div className={`bg-white rounded-lg border p-3 ${className}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-500" />
            <span className="font-medium text-gray-900">
              {nutritionInfo.calories} kcal
            </span>
          </div>
          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
            getCalorieColor(nutritionInfo.calorieCategory)
          }`}>
            {nutritionInfo.calorieCategory === 'low' && 'Düşük'}
            {nutritionInfo.calorieCategory === 'medium' && 'Orta'}
            {nutritionInfo.calorieCategory === 'high' && 'Yüksek'}
            {nutritionInfo.calorieCategory === 'very_high' && 'Çok Yüksek'}
          </div>
        </div>
        
        <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
          <span>Protein: {formatValue(nutritionInfo.protein, 'g')}</span>
          <span>Karbonhidrat: {formatValue(nutritionInfo.carbohydrates, 'g')}</span>
          <span>Yağ: {formatValue(nutritionInfo.fat, 'g')}</span>
        </div>

        {nutritionInfo.isVerified && (
          <div className="mt-2 flex items-center gap-1 text-xs text-green-600">
            <Shield className="h-3 w-3" />
            <span>Doğrulanmış</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      {/* Başlık */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-orange-500" />
            <h3 className="font-semibold text-gray-900">Beslenme Bilgileri</h3>
            {nutritionInfo.isVerified && (
              <CheckCircle className="h-4 w-4 text-green-500" title="Doğrulanmış" />
            )}
          </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>

        {/* Porsiyon Bilgisi */}
        <div className="mt-2 text-sm text-gray-600">
          <span>Porsiyon: {nutritionInfo.servingSize}</span>
          {nutritionInfo.servingsPerContainer && (
            <span className="ml-2">• Paket: {nutritionInfo.servingsPerContainer} porsiyon</span>
          )}
        </div>
      </div>

      {/* Ana Besin Değerleri */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Kalori */}
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {nutritionInfo.calories}
            </div>
            <div className="text-xs text-gray-500">kcal</div>
            <div className={`mt-1 px-2 py-1 rounded-full text-xs font-medium ${
              getCalorieColor(nutritionInfo.calorieCategory)
            }`}>
              {nutritionInfo.calorieCategory === 'low' && 'Düşük Kalorili'}
              {nutritionInfo.calorieCategory === 'medium' && 'Orta Kalorili'}
              {nutritionInfo.calorieCategory === 'high' && 'Yüksek Kalorili'}
              {nutritionInfo.calorieCategory === 'very_high' && 'Çok Yüksek'}
            </div>
          </div>

          {/* Protein */}
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">
              {formatValue(nutritionInfo.protein, 'g')}
            </div>
            <div className="text-xs text-gray-500">Protein</div>
            {nutritionInfo.dailyValues && (
              <div className={`text-xs ${getDailyValueColor(nutritionInfo.dailyValues.protein)}`}>
                {formatPercentage(nutritionInfo.dailyValues.protein)}
              </div>
            )}
          </div>

          {/* Karbonhidrat */}
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">
              {formatValue(nutritionInfo.carbohydrates, 'g')}
            </div>
            <div className="text-xs text-gray-500">Karbonhidrat</div>
            {nutritionInfo.dailyValues && (
              <div className={`text-xs ${getDailyValueColor(nutritionInfo.dailyValues.carbohydrates)}`}>
                {formatPercentage(nutritionInfo.dailyValues.carbohydrates)}
              </div>
            )}
          </div>

          {/* Yağ */}
          <div className="text-center">
            <div className="text-xl font-bold text-yellow-600">
              {formatValue(nutritionInfo.fat, 'g')}
            </div>
            <div className="text-xs text-gray-500">Yağ</div>
            {nutritionInfo.dailyValues && (
              <div className={`text-xs ${getDailyValueColor(nutritionInfo.dailyValues.fat)}`}>
                {formatPercentage(nutritionInfo.dailyValues.fat)}
              </div>
            )}
          </div>
        </div>

        {/* Beslenme Skoru */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-yellow-500" />
              <span className="font-medium text-gray-900">Beslenme Skoru</span>
            </div>
            <div className={`text-lg font-bold ${getNutritionScoreColor(nutritionInfo.nutritionScore)}`}>
              {nutritionInfo.nutritionScore}/100
            </div>
          </div>
        </div>

        {/* Beslenme Etiketleri */}
        {nutritionInfo.nutritionLabels.length > 0 && (
          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Beslenme Özellikleri</h4>
            <div className="flex flex-wrap gap-2">
              {nutritionInfo.nutritionLabels.map((label, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Detaylı Bilgiler */}
        {isExpanded && (
          <div className="mt-4 space-y-4">
            {/* Detaylı Besin Değerleri */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">Detaylı Besin Değerleri</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Doymuş Yağ</span>
                    <span className="font-medium">{formatValue(nutritionInfo.saturatedFat, 'g')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Trans Yağ</span>
                    <span className="font-medium">{formatValue(nutritionInfo.transFat, 'g')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Lif</span>
                    <span className="font-medium">{formatValue(nutritionInfo.fiber, 'g')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Şeker</span>
                    <span className="font-medium">{formatValue(nutritionInfo.sugar, 'g')}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Sodyum</span>
                    <span className="font-medium">{formatValue(nutritionInfo.sodium, 'mg')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Kolesterol</span>
                    <span className="font-medium">{formatValue(nutritionInfo.cholesterol, 'mg')}</span>
                  </div>
                  {nutritionInfo.vitaminC && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Vitamin C</span>
                      <span className="font-medium">{formatValue(nutritionInfo.vitaminC, 'mg')}</span>
                    </div>
                  )}
                  {nutritionInfo.calcium && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Kalsiyum</span>
                      <span className="font-medium">{formatValue(nutritionInfo.calcium, 'mg')}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Günlük Değer Yüzdeleri */}
            {nutritionInfo.dailyValues && (
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-3">Günlük Değer Yüzdeleri</h4>
                <div className="space-y-2">
                  {Object.entries(nutritionInfo.dailyValues).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 capitalize">
                        {key === 'calories' && 'Kalori'}
                        {key === 'protein' && 'Protein'}
                        {key === 'carbohydrates' && 'Karbonhidrat'}
                        {key === 'fat' && 'Yağ'}
                        {key === 'saturatedFat' && 'Doymuş Yağ'}
                        {key === 'fiber' && 'Lif'}
                        {key === 'sugar' && 'Şeker'}
                        {key === 'sodium' && 'Sodyum'}
                        {key === 'cholesterol' && 'Kolesterol'}
                      </span>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              value <= 20 ? 'bg-green-500' :
                              value <= 40 ? 'bg-yellow-500' :
                              value <= 60 ? 'bg-orange-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(value, 100)}%` }}
                          />
                        </div>
                        <span className={`text-sm font-medium ${getDailyValueColor(value)}`}>
                          {formatPercentage(value)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Doğrulama Bilgileri */}
            <div className="pt-4 border-t">
              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Son güncelleme: {nutritionInfo.lastUpdated.toLocaleDateString('tr-TR')}</span>
                </div>
                {nutritionInfo.isVerified && (
                  <div className="flex items-center gap-1 text-green-600">
                    <Shield className="h-4 w-4" />
                    <span>Doğrulanmış</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 