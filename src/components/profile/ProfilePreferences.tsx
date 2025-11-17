'use client';

import { useState } from 'react';
import type { UserPreferences, DietaryPreferences } from '@/types';
import { 
  Bell, 
  Globe, 
  Eye, 
  Palette, 
  Accessibility,
  Apple,
  Wheat,
  Heart,
  Target,
  Settings,
  Save,
  X
} from 'lucide-react';

interface ProfilePreferencesProps {
  preferences: UserPreferences;
  dietaryPreferences: DietaryPreferences;
  onUpdatePreferences: (preferences: UserPreferences) => void;
  onUpdateDietaryPreferences: (dietaryPreferences: DietaryPreferences) => void;
}

export default function ProfilePreferences({
  preferences,
  dietaryPreferences,
  onUpdatePreferences,
  onUpdateDietaryPreferences
}: ProfilePreferencesProps) {
  const [localPreferences, setLocalPreferences] = useState(preferences);
  const [localDietaryPreferences, setLocalDietaryPreferences] = useState(dietaryPreferences);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('notifications');

  const handleSave = () => {
    onUpdatePreferences(localPreferences);
    onUpdateDietaryPreferences(localDietaryPreferences);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setLocalPreferences(preferences);
    setLocalDietaryPreferences(dietaryPreferences);
    setIsEditing(false);
  };

  const tabs = [
    { id: 'notifications', label: 'Bildirimler', icon: Bell },
    { id: 'dietary', label: 'Beslenme', icon: Apple },
    { id: 'privacy', label: 'Gizlilik', icon: Eye },
    { id: 'appearance', label: 'Görünüm', icon: Palette },
    { id: 'accessibility', label: 'Erişilebilirlik', icon: Accessibility }
  ];

  const dietTypes = [
    { value: 'none', label: 'Diyet Yok', icon: Apple },
    { value: 'vegetarian', label: 'Vejetaryen', icon: Heart },
    { value: 'vegan', label: 'Vegan', icon: Apple },
    { value: 'keto', label: 'Keto', icon: Target },
    { value: 'paleo', label: 'Paleo', icon: Apple },
    { value: 'mediterranean', label: 'Akdeniz', icon: Heart },
    { value: 'low_carb', label: 'Düşük Karbonhidrat', icon: Target },
    { value: 'gluten_free', label: 'Gluten İçermez', icon: Wheat },
    { value: 'dairy_free', label: 'Süt İçermez', icon: Apple },
    { value: 'custom', label: 'Özel', icon: Settings }
  ];

  const allergies = [
    'gluten', 'dairy', 'nuts', 'shellfish', 'eggs', 'soy', 'fish', 'wheat'
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'notifications':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bildirim Kanalları</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-blue-500" />
                    <div>
                      <p className="font-medium text-gray-900">E-posta Bildirimleri</p>
                      <p className="text-sm text-gray-600">Sipariş güncellemeleri ve promosyonlar</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localPreferences.notifications.email}
                      onChange={(e) => setLocalPreferences({
                        ...localPreferences,
                        notifications: {
                          ...localPreferences.notifications,
                          email: e.target.checked
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-green-500" />
                    <div>
                      <p className="font-medium text-gray-900">Push Bildirimleri</p>
                      <p className="text-sm text-gray-600">Anlık bildirimler ve uyarılar</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localPreferences.notifications.push}
                      onChange={(e) => setLocalPreferences({
                        ...localPreferences,
                        notifications: {
                          ...localPreferences.notifications,
                          push: e.target.checked
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="font-medium text-gray-900">SMS Bildirimleri</p>
                      <p className="text-sm text-gray-600">Önemli güncellemeler için SMS</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localPreferences.notifications.sms}
                      onChange={(e) => setLocalPreferences({
                        ...localPreferences,
                        notifications: {
                          ...localPreferences.notifications,
                          sms: e.target.checked
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Bildirim Türleri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(localPreferences.notifications).slice(3).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-900 capitalize">
                      {key === 'orderUpdates' && 'Sipariş Güncellemeleri'}
                      {key === 'promotions' && 'Promosyonlar'}
                      {key === 'newRestaurants' && 'Yeni Restoranlar'}
                      {key === 'reviews' && 'Değerlendirmeler'}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setLocalPreferences({
                          ...localPreferences,
                          notifications: {
                            ...localPreferences.notifications,
                            [key]: e.target.checked
                          }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      case 'dietary':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Diyet Türü</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {dietTypes.map((diet) => {
                  const Icon = diet.icon;
                  return (
                    <label key={diet.value} className="relative">
                      <input
                        type="radio"
                        name="dietType"
                        value={diet.value}
                        checked={localDietaryPreferences.dietType === diet.value}
                        onChange={(e) => setLocalDietaryPreferences({
                          ...localDietaryPreferences,
                          dietType: e.target.value as any
                        })}
                        className="sr-only"
                      />
                      <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        localDietaryPreferences.dietType === diet.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <div className="flex items-center gap-3">
                          <Icon className="h-5 w-5 text-gray-600" />
                          <span className="font-medium text-gray-900">{diet.label}</span>
                        </div>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Alerjiler</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {allergies.map((allergy) => (
                  <label key={allergy} className="relative">
                    <input
                      type="checkbox"
                      checked={localDietaryPreferences.allergies.includes(allergy)}
                      onChange={(e) => {
                        const newAllergies = e.target.checked
                          ? [...localDietaryPreferences.allergies, allergy]
                          : localDietaryPreferences.allergies.filter(a => a !== allergy);
                        setLocalDietaryPreferences({
                          ...localDietaryPreferences,
                          allergies: newAllergies
                        });
                      }}
                      className="sr-only"
                    />
                    <div className={`p-3 border-2 rounded-lg cursor-pointer transition-all text-center ${
                      localDietaryPreferences.allergies.includes(allergy)
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <span className="text-sm font-medium capitalize">
                        {allergy === 'dairy' && 'Süt'}
                        {allergy === 'nuts' && 'Kuruyemiş'}
                        {allergy === 'shellfish' && 'Kabuklu Deniz Ürünü'}
                        {allergy === 'eggs' && 'Yumurta'}
                        {allergy === 'soy' && 'Soya'}
                        {allergy === 'fish' && 'Balık'}
                        {allergy === 'wheat' && 'Buğday'}
                        {allergy === 'gluten' && 'Gluten'}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Kalori Hedefleri</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Günlük Kalori Hedefi (kcal)
                  </label>
                  <input
                    type="number"
                    value={localDietaryPreferences.calorieGoal?.daily || ''}
                    onChange={(e) => setLocalDietaryPreferences({
                      ...localDietaryPreferences,
                      calorieGoal: {
                        ...localDietaryPreferences.calorieGoal,
                        daily: parseInt(e.target.value) || 0
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="2000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Öğün Başına Kalori (kcal)
                  </label>
                  <input
                    type="number"
                    value={localDietaryPreferences.calorieGoal?.meal || ''}
                    onChange={(e) => setLocalDietaryPreferences({
                      ...localDietaryPreferences,
                      calorieGoal: {
                        ...localDietaryPreferences.calorieGoal,
                        meal: parseInt(e.target.value) || 0
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="600"
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Porsiyon Tercihi</h3>
              <div className="grid grid-cols-3 gap-3">
                {['small', 'medium', 'large'].map((size) => (
                  <label key={size} className="relative">
                    <input
                      type="radio"
                      name="portionSize"
                      value={size}
                      checked={localDietaryPreferences.portionSize === size}
                      onChange={(e) => setLocalDietaryPreferences({
                        ...localDietaryPreferences,
                        portionSize: e.target.value as any
                      })}
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all text-center ${
                      localDietaryPreferences.portionSize === size
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <span className="font-medium capitalize">
                        {size === 'small' && 'Küçük'}
                        {size === 'medium' && 'Orta'}
                        {size === 'large' && 'Büyük'}
                      </span>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Özel Talimatlar
              </label>
              <textarea
                value={localDietaryPreferences.specialInstructions || ''}
                onChange={(e) => setLocalDietaryPreferences({
                  ...localDietaryPreferences,
                  specialInstructions: e.target.value
                })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Özel beslenme gereksinimlerinizi buraya yazın..."
              />
            </div>
          </div>
        );

      case 'privacy':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Gizlilik Ayarları</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profil Görünürlüğü
                  </label>
                  <select
                    value={localPreferences.privacy.profileVisibility}
                    onChange={(e) => setLocalPreferences({
                      ...localPreferences,
                      privacy: {
                        ...localPreferences.privacy,
                        profileVisibility: e.target.value as any
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="public">Herkese Açık</option>
                    <option value="friends">Sadece Arkadaşlar</option>
                    <option value="private">Gizli</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sipariş Geçmişi Görünürlüğü
                  </label>
                  <select
                    value={localPreferences.privacy.orderHistoryVisibility}
                    onChange={(e) => setLocalPreferences({
                      ...localPreferences,
                      privacy: {
                        ...localPreferences.privacy,
                        orderHistoryVisibility: e.target.value as any
                      }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="public">Herkese Açık</option>
                    <option value="friends">Sadece Arkadaşlar</option>
                    <option value="private">Gizli</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Veri Paylaşımı</p>
                    <p className="text-sm text-gray-600">Gelişmiş özellikler için veri paylaşımına izin ver</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localPreferences.privacy.allowDataSharing}
                      onChange={(e) => setLocalPreferences({
                        ...localPreferences,
                        privacy: {
                          ...localPreferences.privacy,
                          allowDataSharing: e.target.checked
                        }
                      })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Görünüm Ayarları</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tema
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['light', 'dark', 'auto'].map((theme) => (
                      <label key={theme} className="relative">
                        <input
                          type="radio"
                          name="theme"
                          value={theme}
                          checked={localPreferences.theme === theme}
                          onChange={(e) => setLocalPreferences({
                            ...localPreferences,
                            theme: e.target.value as any
                          })}
                          className="sr-only"
                        />
                        <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all text-center ${
                          localPreferences.theme === theme
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <span className="font-medium capitalize">
                            {theme === 'light' && 'Açık'}
                            {theme === 'dark' && 'Koyu'}
                            {theme === 'auto' && 'Otomatik'}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yazı Boyutu
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['small', 'medium', 'large'].map((size) => (
                      <label key={size} className="relative">
                        <input
                          type="radio"
                          name="fontSize"
                          value={size}
                          checked={localPreferences.fontSize === size}
                          onChange={(e) => setLocalPreferences({
                            ...localPreferences,
                            fontSize: e.target.value as any
                          })}
                          className="sr-only"
                        />
                        <div className={`p-4 border-2 rounded-lg cursor-pointer transition-all text-center ${
                          localPreferences.fontSize === size
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}>
                          <span className="font-medium capitalize">
                            {size === 'small' && 'Küçük'}
                            {size === 'medium' && 'Orta'}
                            {size === 'large' && 'Büyük'}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 'accessibility':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Erişilebilirlik</h3>
              <div className="space-y-4">
                {Object.entries(localPreferences.accessibility).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 capitalize">
                        {key === 'highContrast' && 'Yüksek Kontrast'}
                        {key === 'screenReader' && 'Ekran Okuyucu'}
                        {key === 'reducedMotion' && 'Azaltılmış Hareket'}
                        {key === 'largeText' && 'Büyük Yazı'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {key === 'highContrast' && 'Daha iyi görünürlük için yüksek kontrast modu'}
                        {key === 'screenReader' && 'Ekran okuyucu uyumluluğu'}
                        {key === 'reducedMotion' && 'Hareket hassasiyeti için azaltılmış animasyonlar'}
                        {key === 'largeText' && 'Daha büyük yazı boyutları'}
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={value}
                        onChange={(e) => setLocalPreferences({
                          ...localPreferences,
                          accessibility: {
                            ...localPreferences.accessibility,
                            [key]: e.target.checked
                          }
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Başlık ve Aksiyonlar */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Tercihler</h2>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Kaydet
              </button>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
              >
                <X className="h-4 w-4" />
                İptal
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              Düzenle
            </button>
          )}
        </div>
      </div>

      {/* Tab Navigasyonu */}
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

      {/* Tab İçeriği */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        {renderTabContent()}
      </div>
    </div>
  );
} 