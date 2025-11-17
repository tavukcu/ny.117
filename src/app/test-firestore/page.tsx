'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import toast from 'react-hot-toast';

export default function TestFirestorePage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const testFirestoreConnection = async () => {
    if (!user) {
      toast.error('Kullanıcı girişi gerekli');
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 Firestore bağlantısı test ediliyor...');
      
      // Basit bir test dokümanı oluştur
      const testData = {
        userId: user.uid,
        testField: 'Bu bir test dokümanıdır',
        timestamp: serverTimestamp(),
        createdAt: new Date()
      };

      console.log('📝 Test verisi:', testData);
      
      const docRef = await addDoc(collection(db, 'test'), testData);
      
      console.log('✅ Test dokümanı oluşturuldu:', docRef.id);
      
      setTestResult({
        success: true,
        docId: docRef.id,
        message: 'Firestore bağlantısı başarılı!'
      });
      
      toast.success('Firestore bağlantısı başarılı!');
      
    } catch (error) {
      console.error('❌ Firestore test hatası:', error);
      
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
        details: error
      });
      
      toast.error('Firestore bağlantısı başarısız!');
    } finally {
      setLoading(false);
    }
  };

  const testOrdersCollection = async () => {
    if (!user) {
      toast.error('Kullanıcı girişi gerekli');
      return;
    }

    setLoading(true);
    try {
      console.log('🔄 Orders koleksiyonu test ediliyor...');
      
      // Test siparişi oluştur
      const testOrder = {
        userId: user.uid,
        user: {
          uid: user.uid,
          displayName: user.displayName || 'Test Kullanıcı',
          email: user.email || 'test@example.com',
          phoneNumber: user.phoneNumber || '0555 123 45 67',
          role: 'customer',
          isActive: true,
          createdAt: new Date()
        },
        restaurantId: 'test-restaurant',
        items: [
          {
            productId: 'test-product',
            product: {
              id: 'test-product',
              name: 'Test Ürün',
              price: 100
            },
            quantity: 1,
            price: 100
          }
        ],
        subtotal: 100,
        deliveryFee: 0,
        total: 100,
        status: 'pending',
        deliveryAddress: {
          street: 'Test Sokak',
          city: 'Test Şehir',
          district: 'Test İlçe',
          zipCode: '00000',
          country: 'Türkiye',
          coordinates: { lat: 0, lng: 0 },
          fullName: user.displayName || 'Test Kullanıcı',
          phone: user.phoneNumber || '0555 123 45 67'
        },
        paymentMethod: 'cash_on_delivery',
        specialInstructions: 'Test siparişi',
        estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      console.log('📝 Test sipariş verisi:', testOrder);
      
      const orderRef = await addDoc(collection(db, 'orders'), testOrder);
      
      console.log('✅ Test siparişi oluşturuldu:', orderRef.id);
      
      setTestResult({
        success: true,
        orderId: orderRef.id,
        message: 'Orders koleksiyonu testi başarılı!'
      });
      
      toast.success('Orders koleksiyonu testi başarılı!');
      
    } catch (error) {
      console.error('❌ Orders test hatası:', error);
      
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
        details: error
      });
      
      toast.error('Orders koleksiyonu testi başarısız!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-xl shadow-sm p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            🔥 Firestore Test Sayfası
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
                  🔥 Firestore Bağlantısı Test
                </h3>
                <p className="text-green-700 mb-4">
                  Temel Firestore bağlantısını test eder
                </p>
                <button
                  onClick={testFirestoreConnection}
                  disabled={loading || !user}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors duration-200 disabled:opacity-50"
                >
                  {loading ? 'Test Ediliyor...' : 'Bağlantı Testi'}
                </button>
              </div>

              <div className="bg-purple-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-purple-900 mb-4">
                  🛒 Orders Koleksiyonu Test
                </h3>
                <p className="text-purple-700 mb-4">
                  Orders koleksiyonuna yazma iznini test eder
                </p>
                <button
                  onClick={testOrdersCollection}
                  disabled={loading || !user}
                  className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg hover:bg-purple-700 transition-colors duration-200 disabled:opacity-50"
                >
                  {loading ? 'Test Ediliyor...' : 'Orders Testi'}
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
                <li>• Firestore kuralları geçici olarak açık</li>
                <li>• Orders koleksiyonu için tüm izinler verildi</li>
                <li>• Test dokümanları oluşturulacak</li>
                <li>• Console'da detaylı log'lar göreceksiniz</li>
                <li>• Hata durumunda detaylı bilgi verilecek</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 