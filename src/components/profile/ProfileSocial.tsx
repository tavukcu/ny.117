'use client';

import { useState } from 'react';
import { Users, UserPlus, MessageCircle, Heart } from 'lucide-react';

interface SocialStats {
  followers: number;
  following: number;
  reviews: number;
  favorites: number;
}

export default function ProfileSocial() {
  const [socialStats, setSocialStats] = useState<SocialStats>({
    followers: 42,
    following: 18,
    reviews: 15,
    favorites: 8
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Sosyal</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-4 text-center">
          <Users className="h-8 w-8 text-blue-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{socialStats.followers}</p>
          <p className="text-sm text-gray-500">Takipçi</p>
        </div>

        <div className="card p-4 text-center">
          <UserPlus className="h-8 w-8 text-green-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{socialStats.following}</p>
          <p className="text-sm text-gray-500">Takip Edilen</p>
        </div>

        <div className="card p-4 text-center">
          <MessageCircle className="h-8 w-8 text-purple-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{socialStats.reviews}</p>
          <p className="text-sm text-gray-500">Yorum</p>
        </div>

        <div className="card p-4 text-center">
          <Heart className="h-8 w-8 text-red-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{socialStats.favorites}</p>
          <p className="text-sm text-gray-500">Favori</p>
        </div>
      </div>

      <div className="card p-4">
        <h4 className="font-medium text-gray-900 mb-3">Son Aktiviteler</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="text-sm text-gray-600">Pizza Palace restoranını favorilere eklediniz</p>
            <span className="text-xs text-gray-400 ml-auto">2 saat önce</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <p className="text-sm text-gray-600">Burger House için yorum yaptınız</p>
            <span className="text-xs text-gray-400 ml-auto">1 gün önce</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
            <p className="text-sm text-gray-600">Yeni bir takipçiniz oldu</p>
            <span className="text-xs text-gray-400 ml-auto">3 gün önce</span>
          </div>
        </div>
      </div>
    </div>
  );
} 