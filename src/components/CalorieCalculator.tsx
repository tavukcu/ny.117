'use client';

import { useState } from 'react';
import type { CalorieCalculation } from '@/types';
import { CalorieService } from '@/services/calorieService';
import { 
  Calculator, 
  Flame, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Info,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface CalorieCalculatorProps {
  calculation?: CalorieCalculation | null;
  showRecommendations?: boolean;
  className?: string;
  onCalorieChange?: (calories: number) => void;
  initialCalories?: number;
}

export default function CalorieCalculator({ 
  calculation, 
  showRecommendations = true,
  className = '',
  onCalorieChange,
  initialCalories = 0
}: CalorieCalculatorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [manualCalories, setManualCalories] = useState(initialCalories);

  // Eğer calculation yoksa, manuel kalori değerini kullan
  const effectiveCalculation = calculation || {
    totalCalories: manualCalories,
    totalProtein: 0,
    totalCarbs: 0,
    totalFat: 0,
    totalFiber: 0,
    totalSugar: 0,
    totalSodium: 0,
    totalCholesterol: 0,
    dailyValuePercentages: {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0,
      cholesterol: 0
    }
  };

  const report = CalorieService.generateCalorieReport(effectiveCalculation);
  const { totalCalories, dailyValuePercentages } = effectiveCalculation;

  const handleCalorieChange = (value: number) => {
    setManualCalories(value);
    if (onCalorieChange) {
      onCalorieChange(value);
    }
  };

  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    if (score >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  const getDailyValueColor = (percentage: number) => {
    if (percentage <= 20) return 'text-green-600';
    if (percentage <= 40) return 'text-yellow-600';
    if (percentage <= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getDailyValueIcon = (percentage: number) => {
    if (percentage <= 20) return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (percentage <= 40) return <Info className="h-4 w-4 text-yellow-500" />;
    if (percentage <= 60) return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    return <AlertTriangle className="h-4 w-4 text-red-500" />;
  };

  return (
    <div className={`bg-white rounded-lg border shadow-sm ${className}`}>
      {/* Başlık */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-blue-500" />
            <h3 className="font-semibold text-gray-900">Kalori Hesaplayıcı</h3>
        </div>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700"
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Manuel Kalori Girişi */}
      {!calculation && (
        <div className="p-4 border-b">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Kalori Değeri (kcal)
          </label>
          <input
            type="number"
            value={manualCalories}
            onChange={(e) => handleCalorieChange(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            placeholder="Kalori değerini girin"
          />
        </div>
      )}

      {/* Özet Bilgiler */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Toplam Kalori */}
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {totalCalories}
            </div>
            <div className="text-xs text-gray-500">Toplam kcal</div>
            <div className={`mt-1 px-2 py-1 rounded-full text-xs font-medium ${
              getDailyValueColor(dailyValuePercentages.calories)
            }`}>
              {dailyValuePercentages.calories}% günlük
            </div>
          </div>

          {/* Protein */}
          <div className="text-center">
            <div className="text-xl font-bold text-blue-600">
              {effectiveCalculation.totalProtein.toFixed(1)}g
            </div>
            <div className="text-xs text-gray-500">Protein</div>
            <div className={`text-xs ${getDailyValueColor(dailyValuePercentages.protein)}`}>
              {dailyValuePercentages.protein}% günlük
            </div>
          </div>

          {/* Karbonhidrat */}
          <div className="text-center">
            <div className="text-xl font-bold text-green-600">
              {effectiveCalculation.totalCarbs.toFixed(1)}g
            </div>
            <div className="text-xs text-gray-500">Karbonhidrat</div>
            <div className={`text-xs ${getDailyValueColor(dailyValuePercentages.carbs)}`}>
              {dailyValuePercentages.carbs}% günlük
            </div>
          </div>

          {/* Yağ */}
          <div className="text-center">
            <div className="text-xl font-bold text-red-600">
              {effectiveCalculation.totalFat.toFixed(1)}g
            </div>
            <div className="text-xs text-gray-500">Yağ</div>
            <div className={`text-xs ${getDailyValueColor(dailyValuePercentages.fat)}`}>
              {dailyValuePercentages.fat}% günlük
            </div>
          </div>
        </div>

        {/* Sağlık Skoru */}
        <div className="mt-4 p-3 rounded-lg border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium text-gray-700">Sağlık Skoru</span>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getHealthScoreColor(report.healthScore)}`}>
              {report.healthScore}/100
            </div>
          </div>
        </div>
      </div>

      {/* Detaylı Bilgiler */}
      {isExpanded && (
        <div className="p-4 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Lif */}
            <div className="text-center">
              <div className="text-lg font-semibold text-purple-600">
                {effectiveCalculation.totalFiber.toFixed(1)}g
              </div>
              <div className="text-xs text-gray-500">Lif</div>
              <div className={`text-xs ${getDailyValueColor(dailyValuePercentages.fiber)}`}>
                {dailyValuePercentages.fiber}% günlük
              </div>
            </div>

            {/* Şeker */}
            <div className="text-center">
              <div className="text-lg font-semibold text-pink-600">
                {effectiveCalculation.totalSugar.toFixed(1)}g
              </div>
              <div className="text-xs text-gray-500">Şeker</div>
              <div className={`text-xs ${getDailyValueColor(dailyValuePercentages.sugar)}`}>
                {dailyValuePercentages.sugar}% günlük
              </div>
            </div>

            {/* Sodyum */}
            <div className="text-center">
              <div className="text-lg font-semibold text-indigo-600">
                {effectiveCalculation.totalSodium.toFixed(0)}mg
              </div>
              <div className="text-xs text-gray-500">Sodyum</div>
              <div className={`text-xs ${getDailyValueColor(dailyValuePercentages.sodium)}`}>
                {dailyValuePercentages.sodium}% günlük
              </div>
            </div>

            {/* Kolesterol */}
            <div className="text-center">
              <div className="text-lg font-semibold text-amber-600">
                {effectiveCalculation.totalCholesterol.toFixed(0)}mg
              </div>
              <div className="text-xs text-gray-500">Kolesterol</div>
              <div className={`text-xs ${getDailyValueColor(dailyValuePercentages.cholesterol)}`}>
                {dailyValuePercentages.cholesterol}% günlük
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Öneriler */}
      {showRecommendations && report.recommendations.length > 0 && (
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center gap-2 mb-3">
            <Info className="h-4 w-4 text-blue-500" />
            <h4 className="font-medium text-gray-900">Öneriler</h4>
          </div>
          <ul className="space-y-2">
            {report.recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                {recommendation}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
} 