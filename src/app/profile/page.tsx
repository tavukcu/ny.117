'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { UserProfileService } from '@/services/userProfileService';
import type { User, UserPreferences, DietaryPreferences } from '@/types';
import Header from '@/components/Header';
import ProfileHeader from '@/components/profile/ProfileHeader';
import ProfileStats from '@/components/profile/ProfileStats';
import ProfilePreferences from '@/components/profile/ProfilePreferences';
import ProfileAddresses from '@/components/profile/ProfileAddresses';
import ProfilePaymentMethods from '@/components/profile/ProfilePaymentMethods';
import ProfileOrderHistory from '@/components/profile/ProfileOrderHistory';
import ProfileSocial from '@/components/profile/ProfileSocial';
import ProfileSecurity from '@/components/profile/ProfileSecurity';
import { 
  UserIcon, 
  Settings, 
  MapPin, 
  CreditCard, 
  History, 
  Users, 
  Shield, 
  Heart,
  Calendar,
  TrendingUp,
  Award,
  Star
} from 'lucide-react';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [userData, setUserData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.uid) {
      loadUserProfile();
    }
  }, [user]);

  const loadUserProfile = async () => {
    try {
      setIsLoading(true);
      const profile = await UserProfileService.getUserProfile(user!.uid);
      setUserData(profile);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePreferences = async (preferences: UserPreferences) => {
    if (!user?.uid) return;
    
    try {
      await UserProfileService.updatePreferences(user.uid, preferences);
      await loadUserProfile();
    } catch (error) {
      console.error('Error updating preferences:', error);
    }
  };

  const updateDietaryPreferences = async (dietaryPreferences: DietaryPreferences) => {
    if (!user?.uid) return;
    
    try {
      await UserProfileService.updateDietaryPreferences(user.uid, dietaryPreferences);
      await loadUserProfile();
    } catch (error) {
      console.error('Error updating dietary preferences:', error);
    }
  };

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-32 bg-gray-200 rounded-lg mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-64 bg-gray-200 rounded-lg"></div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
              <div className="h-64 bg-gray-200 rounded-lg"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !userData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Profil Bulunamadı</h1>
            <p className="text-gray-600">Lütfen giriş yapın.</p>
          </div>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Genel Bakış', icon: UserIcon },
    { id: 'preferences', label: 'Tercihler', icon: Settings },
    { id: 'addresses', label: 'Adresler', icon: MapPin },
    { id: 'payment', label: 'Ödeme Yöntemleri', icon: CreditCard },
    { id: 'orders', label: 'Sipariş Geçmişi', icon: History },
    { id: 'social', label: 'Sosyal', icon: Users },
    { id: 'security', label: 'Güvenlik', icon: Shield }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
  return (
          <div className="space-y-6">
            <ProfileStats user={userData} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Favori Restoranlar
                </h3>
                {userData.stats?.favorites?.restaurants?.length > 0 ? (
                  <div className="space-y-3">
                    {userData.stats.favorites.restaurants.slice(0, 5).map((restaurantId, index) => (
                      <div key={restaurantId} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <div>
                          <p className="font-medium text-gray-900">Restoran {index + 1}</p>
                          <p className="text-sm text-gray-500">Son sipariş: 2 gün önce</p>
                        </div>
                        <Star className="h-4 w-4 text-yellow-500" />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">Henüz favori restoranınız yok.</p>
                )}
              </div>
              
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  Son Aktiviteler
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-gray-900">Son Giriş</p>
                      <p className="text-sm text-gray-500">
                        {userData.lastLoginAt ? 
                          new Date(userData.lastLoginAt).toLocaleDateString('tr-TR') : 
                          'Bilgi yok'
                        }
                      </p>
                    </div>
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-gray-900">Toplam Oturum</p>
                      <p className="text-sm text-gray-500">{userData.stats?.activity?.totalSessions || 0} kez</p>
                    </div>
                    <Award className="h-4 w-4 text-purple-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        
      case 'preferences':
        return (
          <ProfilePreferences 
            preferences={userData.preferences}
            dietaryPreferences={userData.dietaryPreferences}
            onUpdatePreferences={updatePreferences}
            onUpdateDietaryPreferences={updateDietaryPreferences}
          />
        );
        
      case 'addresses':
        return (
          <ProfileAddresses 
            addresses={userData.addresses}
            onUpdate={loadUserProfile}
          />
        );
        
      case 'payment':
        return (
          <ProfilePaymentMethods 
            paymentMethods={userData.paymentMethods}
            onUpdate={loadUserProfile}
          />
        );
        
      case 'orders':
        return (
          <ProfileOrderHistory 
            userId={user.uid}
          />
        );
        
      case 'social':
        return (
          <ProfileSocial 
            social={userData.social}
            onUpdate={loadUserProfile}
          />
        );
        
      case 'security':
        return (
          <ProfileSecurity 
            security={userData.security}
            onUpdate={loadUserProfile}
          />
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 page-content">
        {/* Profil Başlığı */}
        <ProfileHeader user={userData} />
        
        {/* Tab Navigasyonu */}
        <div className="mt-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab İçeriği */}
        <div className="mt-8">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
} 