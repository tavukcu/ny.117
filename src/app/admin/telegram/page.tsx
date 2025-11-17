'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { TelegramService } from '@/services/telegramService';

export default function TelegramAdminPage() {
  const [botInfo, setBotInfo] = useState<any>(null);
  const [webhookStatus, setWebhookStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [testResult, setTestResult] = useState<string>('');

  // Bot durumunu kontrol et
  const checkBotStatus = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/telegram/setup', {
        method: 'GET'
      });
      const data = await response.json();
      
      if (data.success) {
        setBotInfo(data.botInfo.result);
        setWebhookStatus('Bot aktif ve webhook kurulu');
      } else {
        setWebhookStatus('Bot konfigürasyonu gerekli');
      }
    } catch (error) {
      setWebhookStatus('Bot bağlantısı başarısız');
      console.error('Bot status error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Webhook'u ayarla
  const setupWebhook = async () => {
    setLoading(true);
    try {
      const webhookUrl = `${window.location.origin}/api/telegram/webhook`;
      
      const response = await fetch('/api/telegram/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ webhookUrl })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setBotInfo(data.botInfo.result);
        setWebhookStatus('Webhook başarıyla ayarlandı');
      } else {
        setWebhookStatus(`Webhook hatası: ${data.error}`);
      }
    } catch (error) {
      setWebhookStatus('Webhook setup başarısız');
      console.error('Webhook setup error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Test mesajı gönder
  const sendTestNotification = async () => {
    setLoading(true);
    try {
      const testData = {
        type: 'new_order',
        data: {
          orderId: 'TEST_' + Date.now(),
          restaurantId: 'test_restaurant',
          customerName: 'Test Müşteri',
          customerPhone: '+905551234567',
          totalAmount: 85.50,
          items: [
            { name: 'Test Pizza', quantity: 1, price: 45.00 },
            { name: 'Test İçecek', quantity: 2, price: 20.25 }
          ],
          deliveryAddress: 'Test Mahallesi, Test Sokak No:1, İzmir',
          estimatedTime: 30,
          specialInstructions: 'Test siparişi - gerçek değil'
        }
      };

      const response = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        setTestResult('✅ Test bildirimi başarıyla gönderildi!');
      } else {
        setTestResult(`❌ Test bildirimi başarısız: ${result.error}`);
      }
    } catch (error) {
      setTestResult('❌ Test bildirimi gönderilirken hata oluştu');
      console.error('Test notification error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkBotStatus();
  }, []);

  return (
    <AdminLayout title="Telegram Bot Yönetimi" subtitle="Telegram bildirim sistemi ayarları">
      <div className="space-y-6">
        
        {/* Bot Durumu */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">🤖 Bot Durumu</h2>
          
          {botInfo ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                <span className="font-medium">Bot Aktif</span>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <p><strong>Bot Adı:</strong> {botInfo.first_name}</p>
                <p><strong>Kullanıcı Adı:</strong> @{botInfo.username}</p>
                <p><strong>Bot ID:</strong> {botInfo.id}</p>
              </div>
              
              <p className="text-sm text-gray-600">
                {webhookStatus}
              </p>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span className="text-red-600">Bot Bağlantısı Yok</span>
            </div>
          )}
          
          <div className="mt-4 space-x-3">
            <button
              onClick={checkBotStatus}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? '⏳ Kontrol Ediliyor...' : '🔄 Durumu Kontrol Et'}
            </button>
            
            <button
              onClick={setupWebhook}
              disabled={loading}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? '⏳ Ayarlanıyor...' : '🔗 Webhook Ayarla'}
            </button>
          </div>
        </div>

        {/* Konfigürasyon Bilgileri */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">⚙️ Konfigürasyon</h2>
          
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium mb-2">Environment Variables</h3>
              <div className="space-y-2 text-sm font-mono">
                <p>
                  <span className="text-gray-600">TELEGRAM_BOT_TOKEN:</span>{' '}
                  <span className="text-green-600">✅ Ayarlandı</span>
                </p>
                <p>
                  <span className="text-gray-600">TELEGRAM_ADMIN_CHAT_ID:</span>{' '}
                  <span className="text-orange-600">⚠️ Manuel ayar gerekli</span>
                </p>
                <p>
                  <span className="text-gray-600">TELEGRAM_RESTAURANT_CHAT_ID:</span>{' '}
                  <span className="text-orange-600">⚠️ Manuel ayar gerekli</span>
                </p>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-medium text-blue-800 mb-2">📋 Kurulum Adımları</h3>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Bot token'ı zaten .env.local'e eklendi</li>
                <li>Admin Telegram chat ID'nizi alın (/start → /me)</li>
                <li>Restoran sahibi chat ID'lerini toplayın</li>
                <li>Chat ID'leri .env.local'e ekleyin</li>
                <li>"Webhook Ayarla" butonuna tıklayın</li>
              </ol>
            </div>
          </div>
        </div>

        {/* Test Bildirimi */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">🧪 Test Bildirimi</h2>
          
          <p className="text-gray-600 mb-4">
            Telegram bildirim sistemini test etmek için örnek bir sipariş bildirimi gönderin.
          </p>
          
          <button
            onClick={sendTestNotification}
            disabled={loading || !botInfo}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? '⏳ Test Ediliyor...' : '📨 Test Bildirimi Gönder'}
          </button>
          
          {testResult && (
            <div className={`mt-4 p-3 rounded-lg ${
              testResult.includes('✅') 
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}>
              {testResult}
            </div>
          )}
        </div>

        {/* Kullanım İstatistikleri */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">📊 Kullanım İstatistikleri</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">-</div>
              <div className="text-sm text-blue-600">Gönderilen Bildirim</div>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">-</div>
              <div className="text-sm text-green-600">Başarılı Delivery</div>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">-</div>
              <div className="text-sm text-orange-600">Hata Oranı</div>
            </div>
          </div>
          
          <p className="text-xs text-gray-500 mt-4">
            * İstatistikler henüz implement edilmedi. Geliştirilme aşamasında.
          </p>
        </div>

      </div>
    </AdminLayout>
  );
}