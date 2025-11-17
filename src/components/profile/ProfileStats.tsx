'use client';

import type { User } from '@/types';
import { 
  TrendingUp, 
  Clock, 
  Calendar, 
  MapPin, 
  Star, 
  Award,
  Target,
  Flame,
  Activity,
  Zap,
  Trophy,
  Heart
} from 'lucide-react';

interface ProfileStatsProps {
  user: User;
}

export default function ProfileStats({ user }: ProfileStatsProps) {
  const stats = user.stats;

  const getAchievementIcon = (achievement: string) => {
    switch (achievement) {
      case 'first_order': return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 'loyal_customer': return <Heart className="h-5 w-5 text-red-500" />;
      case 'reviewer': return <Star className="h-5 w-5 text-yellow-500" />;
      case 'explorer': return <MapPin className="h-5 w-5 text-blue-500" />;
      default: return <Award className="h-5 w-5 text-purple-500" />;
    }
  };

  const getAchievementColor = (achievement: string) => {
    switch (achievement) {
      case 'first_order': return 'bg-yellow-50 border-yellow-200';
      case 'loyal_customer': return 'bg-red-50 border-red-200';
      case 'reviewer': return 'bg-yellow-50 border-yellow-200';
      case 'explorer': return 'bg-blue-50 border-blue-200';
      default: return 'bg-purple-50 border-purple-200';
    }
  };

  const getAchievementTitle = (achievement: string) => {
    switch (achievement) {
      case 'first_order': return 'İlk Sipariş';
      case 'loyal_customer': return 'Sadık Müşteri';
      case 'reviewer': return 'Değerlendirici';
      case 'explorer': return 'Kaşif';
      default: return 'Başarı';
    }
  };

  const getAchievementDescription = (achievement: string) => {
    switch (achievement) {
      case 'first_order': return 'İlk siparişinizi verdiniz!';
      case 'loyal_customer': return '10+ sipariş tamamladınız';
      case 'reviewer': return '5+ değerlendirme yaptınız';
      case 'explorer': return '5+ farklı restoran denediniz';
      default: return 'Yeni bir başarı kazandınız!';
    }
  };

  // Başarıları hesapla
  const achievements = [];
  if (stats.orders.total >= 1) achievements.push('first_order');
  if (stats.orders.total >= 10) achievements.push('loyal_customer');
  if (stats.reviews.total >= 5) achievements.push('reviewer');
  if (stats.favorites.restaurants.length >= 5) achievements.push('explorer');

  return (
    <div className="space-y-6">
      {/* Ana İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Sipariş İstatistikleri */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Siparişler</h3>
            <TrendingUp className="h-5 w-5 text-blue-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Toplam</span>
              <span className="font-semibold">{stats.orders.total}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Tamamlanan</span>
              <span className="font-semibold text-green-600">{stats.orders.completed}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">İptal</span>
              <span className="font-semibold text-red-600">{stats.orders.cancelled}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ortalama</span>
              <span className="font-semibold">₺{stats.orders.averageOrderValue.toFixed(0)}</span>
            </div>
          </div>
        </div>

        {/* Aktivite İstatistikleri */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Aktivite</h3>
            <Activity className="h-5 w-5 text-green-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Toplam Oturum</span>
              <span className="font-semibold">{stats.activity.totalSessions}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ortalama Süre</span>
              <span className="font-semibold">{stats.activity.averageSessionDuration} dk</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Favori Gün</span>
              <span className="font-semibold">{stats.activity.favoriteOrderDay}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Favori Saat</span>
              <span className="font-semibold">{stats.activity.favoriteOrderTime}</span>
            </div>
          </div>
        </div>

        {/* Beslenme İstatistikleri */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Beslenme</h3>
            <Flame className="h-5 w-5 text-orange-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Toplam Kalori</span>
              <span className="font-semibold">{stats.nutrition.totalCaloriesConsumed.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Ortalama/Sipariş</span>
              <span className="font-semibold">{stats.nutrition.averageCaloriesPerOrder.toFixed(0)} kcal</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Favori Mutfak</span>
              <span className="font-semibold">{stats.nutrition.favoriteCuisine}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Beslenme Skoru</span>
              <span className="font-semibold">{stats.nutrition.nutritionScoreAverage.toFixed(1)}/100</span>
            </div>
          </div>
        </div>

        {/* Sadakat İstatistikleri */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Sadakat</h3>
            <Award className="h-5 w-5 text-purple-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Mevcut Puan</span>
              <span className="font-semibold">{stats.loyalty.points}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Seviye</span>
              <span className="font-semibold capitalize">{stats.loyalty.tier}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Kazanılan</span>
              <span className="font-semibold text-green-600">{stats.loyalty.totalEarned}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Kullanılan</span>
              <span className="font-semibold text-blue-600">{stats.loyalty.totalRedeemed}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Başarılar */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Başarılar
        </h3>
        
        {achievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {achievements.map((achievement) => (
              <div 
                key={achievement}
                className={`p-4 rounded-lg border ${getAchievementColor(achievement)}`}
              >
                <div className="flex items-center gap-3">
                  {getAchievementIcon(achievement)}
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {getAchievementTitle(achievement)}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {getAchievementDescription(achievement)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Henüz başarı kazanmadınız.</p>
            <p className="text-sm text-gray-400 mt-2">Sipariş vererek başarılar kazanmaya başlayın!</p>
          </div>
        )}
      </div>

      {/* Hedefler ve İlerleme */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Beslenme Hedefleri */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="h-5 w-5 text-green-500" />
            Beslenme Hedefleri
          </h3>
          
          {user.dietaryPreferences.calorieGoal ? (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Günlük Kalori Hedefi</span>
                  <span>{stats.nutrition.totalCaloriesConsumed} / {user.dietaryPreferences.calorieGoal.daily}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((stats.nutrition.totalCaloriesConsumed / user.dietaryPreferences.calorieGoal.daily) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Diyet Uyumluluğu</span>
                  <span>{stats.nutrition.dietaryCompliance}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${stats.nutrition.dietaryCompliance}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <Target className="h-8 w-8 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-500">Henüz beslenme hedefiniz yok.</p>
              <p className="text-sm text-gray-400">Tercihler sayfasından hedef belirleyin.</p>
            </div>
          )}
        </div>

        {/* Sadakat Hedefleri */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-500" />
            Sadakat Hedefleri
          </h3>
          
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Sonraki Seviye</span>
                <span>{stats.loyalty.points} / {stats.loyalty.points + stats.loyalty.nextTierPoints}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${(stats.loyalty.points / (stats.loyalty.points + stats.loyalty.nextTierPoints)) * 100}%` 
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {stats.loyalty.nextTierPoints} puan daha kazanın
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-lg font-bold text-purple-600">{stats.loyalty.points}</div>
                <div className="text-xs text-gray-600">Mevcut Puan</div>
              </div>
              <div className="p-3 bg-pink-50 rounded-lg">
                <div className="text-lg font-bold text-pink-600">{stats.loyalty.nextTierPoints}</div>
                <div className="text-xs text-gray-600">Gerekli Puan</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 