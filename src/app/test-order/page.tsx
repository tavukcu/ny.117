'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import toast from 'react-hot-toast';

export default function TestOrderPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const createTestOrder = async () => {
    if (!user) {
      toast.error('Kullanıcı girişi gerekli');
      return;
    }

    setLoading(true);
    try {
      const testOrderData = {
        restaurantId: 'O72ippNfV1XdanITAIRH', // Test restoran ID'si
        items: [
          {
            product: {
              id: 'ZPMSps0WE6bBRYCYP4W4',
              name: 'Test Ürün',
              price: 100,
              categoryId: 'wPSqG2Prz7U3BCGxRMuY',
              imageUrl: ''
            },
            quantity: 1,
            notes: 'Test siparişi'
          }
        ],
        customerInfo: {
          userId: user.uid,
          name: user.displayName || 'Test Kullanıcı',
          phone: user.phoneNumber || '0555 123 45 67',
          email: user.email || 'test@example.com'
        },
        deliveryAddress: {
          street: 'Test Sokak No: 1',
          city: 'Manisa',
          district: 'Merkez',
          zipCode: '45000',
          country: 'Türkiye',
          coordinates: { lat: 0, lng: 0 },
          fullName: user.displayName || 'Test Kullanıcı',
          phone: user.phoneNumber || '0555 123 45 67',
          isDefault: false,
          instructions: 'Test adresi'
        },
        paymentMethod: 'cash_on_delivery',
        notes: 'Bu bir test siparişidir',
        totalAmount: 100
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testOrderData)
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Test siparişi oluşturuldu!');
        setTestResult(result);
      } else {
        toast.error('Test siparişi oluşturulamadı: ' + result.error);
      }
    } catch (error) {
      console.error('Test siparişi oluşturma hatası:', error);
      toast.error('Test siparişi oluşturulurken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🛒 Sipariş Oluşturma Test Sayfası
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

            {/* Test Butonu */}
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-900 mb-4">
                🛒 Test Siparişi Oluştur
              </h3>
              <p className="text-green-700 mb-4">
                Firestore'da test siparişi oluşturur
              </p>
              <button
                onClick={createTestOrder}
                disabled={loading || !user}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
              >
                {loading ? 'Oluşturuluyor...' : 'Test Siparişi Oluştur'}
              </button>
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
                <li>• Firestore kuralları güncellenmiştir</li>
                <li>• Orders koleksiyonu için gerekli indexler mevcuttur</li>
                <li>• API endpoint'leri hazırdır</li>
                <li>• Kullanıcı girişi gereklidir</li>
                <li>• Test restoran ID'si kullanılmaktadır</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 