'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { X, UserPlus, Star, Gift } from 'lucide-react';
import Link from 'next/link';

export default function GuestWelcomeBanner() {
  const { guestUser, clearGuestSession } = useAuth();
  const [isVisible, setIsVisible] = useState(true);

  // Sadece misafir kullanıcılar için göster
  if (!guestUser || !isVisible) {
    return null;
  }

  const handleDismiss = () => {
    setIsVisible(false);
  };

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <div className="font-semibold text-sm sm:text-base">
                Merhaba {guestUser.name}! 👋
              </div>
              <div className="text-xs sm:text-sm text-blue-100">
                Hesap oluşturarak özel fırsatları kaçırma
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Link
              href="/register"
              className="hidden sm:flex items-center gap-2 bg-white text-blue-600 px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors duration-200"
            >
              <Star className="h-4 w-4" />
              Hesap Oluştur
            </Link>
            
            <Link
              href="/register"
              className="sm:hidden flex items-center gap-1 bg-white text-blue-600 px-3 py-1.5 rounded-lg font-medium text-xs hover:bg-blue-50 transition-colors duration-200"
            >
              <UserPlus className="h-3 w-3" />
              Kayıt Ol
            </Link>
            
            <button
              onClick={handleDismiss}
              className="p-1.5 rounded-lg hover:bg-white/20 transition-colors duration-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 