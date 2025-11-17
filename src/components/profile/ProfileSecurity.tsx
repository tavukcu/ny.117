'use client';

import { useState } from 'react';
import { Lock, Shield, Eye, EyeOff, Key } from 'lucide-react';

export default function ProfileSecurity() {
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handlePasswordChange = (field: keyof typeof passwords, value: string) => {
    setPasswords(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsChangingPassword(true);

    try {
      // Şifre değiştirme API çağrısı burada yapılacak
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Başarılı
      setPasswords({ current: '', new: '', confirm: '' });
      alert('Şifreniz başarıyla değiştirildi!');
    } catch (error) {
      alert('Şifre değiştirme sırasında bir hata oluştu.');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Güvenlik</h3>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Şifre Değiştirme */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Lock className="h-5 w-5 text-gray-500" />
            <h4 className="font-medium text-gray-900">Şifre Değiştir</h4>
          </div>

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mevcut Şifre
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  value={passwords.current}
                  onChange={(e) => handlePasswordChange('current', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yeni Şifre
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwords.new}
                  onChange={(e) => handlePasswordChange('new', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Yeni Şifre (Tekrar)
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwords.confirm}
                  onChange={(e) => handlePasswordChange('confirm', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="btn-primary w-full disabled:opacity-50"
            >
              {isChangingPassword ? 'Değiştiriliyor...' : 'Şifreyi Değiştir'}
            </button>
          </form>
        </div>

        {/* Güvenlik Ayarları */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Shield className="h-5 w-5 text-gray-500" />
            <h4 className="font-medium text-gray-900">Güvenlik Ayarları</h4>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">İki Faktörlü Doğrulama</p>
                <p className="text-sm text-gray-500">Hesabınızı daha güvenli hale getirin</p>
              </div>
              <button className="btn-outline text-sm">
                Etkinleştir
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Oturum Geçmişi</p>
                <p className="text-sm text-gray-500">Aktif oturumları görüntüleyin</p>
              </div>
              <button className="btn-outline text-sm">
                Görüntüle
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">E-posta Bildirimleri</p>
                <p className="text-sm text-gray-500">Güvenlik uyarıları için</p>
              </div>
              <button className="btn-outline text-sm">
                Yönet
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 