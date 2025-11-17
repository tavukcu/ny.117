'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function TestAddressesPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const testAddressCollection = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/test-addresses');
      const result = await response.json();
      
      if (result.success) {
        setTestResult(result);
        toast.success('Adres koleksiyonu test başarılı!');
      } else {
        toast.error('Test başarısız: ' + result.error);
      }
    } catch (error) {
      console.error('Test hatası:', error);
      toast.error('Test sırasında hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const createTestAddress = async () => {
    if (!user) {
      toast.error('Kullanıcı girişi gerekli');
      return;
    }

    setLoading(true);
    try {
      const testAddressData = {
        title: 'Test Adresi',
        fullName: user.displayName || 'Test Kullanıcı',
        phone: user.phoneNumber || '0555 123 45 67',
        address: 'Test Sokak No: 1 Daire: 1',
        district: 'Test İlçe',
        city: 'Test İl',
        postalCode: '34000',
        instructions: 'Bu bir test adresidir',
        isDefault: false
      };

      const response = await fetch('/api/test-addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.uid,
          addressData: testAddressData
        })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Test adresi oluşturuldu!');
        setTestResult(result);
      } else {
        toast.error('Test adresi oluşturulamadı: ' + result.error);
      }
    } catch (error) {
      console.error('Test adresi oluşturma hatası:', error);
      toast.error('Test adresi oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🏠 Adres Koleksiyonu Test Sayfası
          </h1>

          <div className="space-y-6">
            {/* Kullanıcı Bilgileri */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-900 mb-4">
                👤 Kullanıcı Bilgileri
              </h2>
              {user ? (
                <div className="space-y-2">
                  <p><strong>ID:</strong> {user.uid}</p>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Ad:</strong> {user.displayName || 'Belirtilmemiş'}</p>
                  <p><strong>Telefon:</strong> {user.phoneNumber || 'Belirtilmemiş'}</p>
                </div>
              ) : (
                <p className="text-red-600">Kullanıcı girişi yapılmamış</p>
              )}
            </div>

            {/* Test Butonları */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-green-900 mb-4">
                  📝 Örnek Adresler Oluştur
                </h3>
                <p className="text-green-700 mb-4">
                  Firestore'da örnek adres verileri oluşturur
                </p>
                <button
                  onClick={testAddressCollection}
                  disabled={loading}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                >
                  {loading ? 'Oluşturuluyor...' : 'Örnek Adresler Oluştur'}
                </button>
              </div>

              <div className="bg-purple-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-purple-900 mb-4">
                  ➕ Test Adresi Ekle
                </h3>
                <p className="text-purple-700 mb-4">
                  Mevcut kullanıcı için test adresi oluşturur
                </p>
                <button
                  onClick={createTestAddress}
                  disabled={loading || !user}
                  className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50"
                >
                  {loading ? 'Oluşturuluyor...' : 'Test Adresi Ekle'}
                </button>
              </div>
            </div>

            {/* Test Sonuçları */}
            {testResult && (
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  📊 Test Sonuçları
                </h3>
                <pre className="bg-white p-4 rounded-lg overflow-auto text-sm">
                  {JSON.stringify(testResult, null, 2)}
                </pre>
              </div>
            )}

            {/* Bilgi */}
            <div className="bg-yellow-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-4">
                ℹ️ Bilgi
              </h3>
              <ul className="text-yellow-800 space-y-2">
                <li>• Adres koleksiyonu Firestore'da otomatik oluşturulur</li>
                <li>• Firestore kuralları güncellenmiştir</li>
                <li>• Gerekli indexler mevcuttur</li>
                <li>• API endpoint'leri hazırdır</li>
                <li>• Profil sayfasında adres defteri kullanılabilir</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 