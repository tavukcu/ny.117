'use client';

import { useState } from 'react';
import type { User } from '@/types';
import { 
  Edit, 
  Camera, 
  MapPin, 
  Calendar, 
  Star, 
  Award,
  Crown,
  TrendingUp,
  Heart
} from 'lucide-react';

interface ProfileHeaderProps {
  user: User;
}

export default function ProfileHeader({ user }: ProfileHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);

  const getLoyaltyTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'text-purple-600 bg-purple-100';
      case 'gold': return 'text-yellow-600 bg-yellow-100';
      case 'silver': return 'text-gray-600 bg-gray-100';
      case 'bronze': return 'text-orange-600 bg-orange-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getLoyaltyTierIcon = (tier: string) => {
    switch (tier) {
      case 'platinum': return <Crown className="h-4 w-4" />;
      case 'gold': return <Award className="h-4 w-4" />;
      case 'silver': return <Star className="h-4 w-4" />;
      case 'bronze': return <TrendingUp className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      {/* Kapak Fotoğrafı */}
      <div className="relative h-48 bg-gradient-to-r from-blue-500 to-purple-600">
        {user.profile.coverImage && (
          <img 
            src={user.profile.coverImage} 
            alt="Kapak fotoğrafı"
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-20"></div>
        
        {/* Profil Fotoğrafı */}
        <div className="absolute -bottom-16 left-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full border-4 border-white overflow-hidden bg-gray-200">
              {user.profile.profileImage ? (
                <img 
                  src={user.profile.profileImage} 
                  alt="Profil fotoğrafı"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-300">
                  <span className="text-4xl font-bold text-gray-600">
                    {user.profile.firstName?.[0]}{user.profile.lastName?.[0]}
                  </span>
                </div>
              )}
            </div>
            <button className="absolute bottom-0 right-0 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors">
              <Camera className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Profil Bilgileri */}
      <div className="pt-20 pb-6 px-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            {/* İsim ve Durum */}
            <div className="flex items-center gap-4 mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {user.profile.firstName} {user.profile.lastName}
                </h1>
                <p className="text-gray-600">@{user.displayName}</p>
              </div>
              
              {/* Hesap Durumu */}
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                user.accountStatus === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                {user.accountStatus === 'active' ? 'Aktif' : 'Beklemede'}
              </div>
            </div>

            {/* Bio */}
            {user.profile.bio && (
              <p className="text-gray-700 mb-4">{user.profile.bio}</p>
            )}

            {/* Konum ve Katılım Tarihi */}
            <div className="flex items-center gap-6 text-sm text-gray-600 mb-4">
              {user.profile.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{user.profile.location.city}, {user.profile.location.district}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  Katılım: {new Date(user.stats.activity.joinDate).toLocaleDateString('tr-TR')}
                </span>
              </div>
            </div>

            {/* Sadakat Programı */}
            <div className="flex items-center gap-4">
              <div className={`px-3 py-2 rounded-lg flex items-center gap-2 ${getLoyaltyTierColor(user.stats.loyalty.tier)}`}>
                {getLoyaltyTierIcon(user.stats.loyalty.tier)}
                <span className="font-medium capitalize">{user.stats.loyalty.tier}</span>
              </div>
              <div className="text-sm text-gray-600">
                <span className="font-medium">{user.stats.loyalty.points}</span> puan
                {user.stats.loyalty.nextTierPoints > 0 && (
                  <span className="ml-2">
                    • Sonraki seviye için {user.stats.loyalty.nextTierPoints} puan gerekli
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Aksiyon Butonları */}
          <div className="mt-4 md:mt-0 flex gap-3">
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Profili Düzenle
            </button>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{user.stats.orders.total}</div>
            <div className="text-sm text-gray-600">Toplam Sipariş</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              ₺{user.stats.orders.totalSpent.toLocaleString()}
            </div>
            <div className="text-sm text-gray-600">Toplam Harcama</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">{user.stats.reviews.total}</div>
            <div className="text-sm text-gray-600">Değerlendirme</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{user.stats.favorites.restaurants.length}</div>
            <div className="text-sm text-gray-600">Favori Restoran</div>
          </div>
        </div>

        {/* İlerleme Çubuğu */}
        {user.stats.loyalty.nextTierPoints > 0 && (
          <div className="mt-6">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Sonraki seviyeye ilerleme</span>
              <span>
                {user.stats.loyalty.points} / {user.stats.loyalty.points + user.stats.loyalty.nextTierPoints}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(user.stats.loyalty.points / (user.stats.loyalty.points + user.stats.loyalty.nextTierPoints)) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 