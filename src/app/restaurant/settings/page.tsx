'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useAuth } from '@/hooks/useAuth';
import { 
  ArrowLeft, 
  Save,
  MapPin,
  Phone,
  Clock,
  Image as ImageIcon,
  Globe,
  Mail,
  Star,
  Upload,
  Camera,
  Bell,
  MessageSquare,
  Settings,
  Copy,
  Check,
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function RestaurantSettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [isSaving, setIsSaving] = useState(false);
  
  // Telegram state
  const [telegramSetup, setTelegramSetup] = useState({
    isEnabled: false,
    isConfigured: false,
    setupToken: '',
    setupAt: null
  });
  const [telegramLoading, setTelegramLoading] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);

  // Yetkilendirme kontrolü
  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'restaurant')) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  // Telegram ayarlarını yükle
  useEffect(() => {
    if (user?.restaurantId) {
      loadTelegramSettings();
    }
  }, [user?.restaurantId]);

  const loadTelegramSettings = async () => {
    try {
      const response = await fetch(`/api/restaurants/${user.restaurantId}/telegram`);
      const data = await response.json();
      
      if (data.success) {
        setTelegramSetup(data.telegram);
      }
    } catch (error) {
      console.error('Telegram ayarları yüklenemedi:', error);
    }
  };

  const generateSetupToken = async () => {
    setTelegramLoading(true);
    try {
      const response = await fetch(`/api/restaurants/${user.restaurantId}/telegram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate_setup_token' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTelegramSetup(prev => ({ ...prev, setupToken: data.setupToken }));
        toast.success('Setup token oluşturuldu');
      } else {
        toast.error(data.error || 'Token oluşturulamadı');
      }
    } catch (error) {
      toast.error('Bir hata oluştu');
    } finally {
      setTelegramLoading(false);
    }
  };

  const copySetupToken = () => {
    if (telegramSetup.setupToken) {
      navigator.clipboard.writeText(telegramSetup.setupToken);
      setCopiedToken(true);
      toast.success('Token kopyalandı');
      setTimeout(() => setCopiedToken(false), 2000);
    }
  };

  const testTelegramConnection = async () => {
    setTelegramLoading(true);
    try {
      const response = await fetch(`/api/restaurants/${user.restaurantId}/telegram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'test' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('Test mesajı gönderildi!');
      } else {
        toast.error(data.error || 'Test başarısız');
      }
    } catch (error) {
      toast.error('Test mesajı gönderilemedi');
    } finally {
      setTelegramLoading(false);
    }
  };

  const disableTelegram = async () => {
    setTelegramLoading(true);
    try {
      const response = await fetch(`/api/restaurants/${user.restaurantId}/telegram`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disable' })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTelegramSetup(prev => ({ ...prev, isEnabled: false }));
        toast.success('Telegram bildirimleri devre dışı bırakıldı');
      } else {
        toast.error(data.error || 'İşlem başarısız');
      }
    } catch (error) {
      toast.error('Bir hata oluştu');
    } finally {
      setTelegramLoading(false);
    }
  };

  if (authLoading) {
    return (
      <main className="min-h-screen bg-gray-50 page-content">
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Restoran ayarları yükleniyor...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!user || user.role !== 'restaurant') {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 page-content">
      <Header />
      
      <div className="container-responsive py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/restaurant" 
              className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ayarlar</h1>
              <p className="text-gray-600 mt-2">
                Restoran bilgilerinizi ve ayarlarınızı yönetin
              </p>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              <button
                onClick={() => setActiveTab('general')}
                className={`${
                  activeTab === 'general'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <Settings className="h-4 w-4" />
                Genel Ayarlar
              </button>
              <button
                onClick={() => setActiveTab('notifications')}
                className={`${
                  activeTab === 'notifications'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2`}
              >
                <Bell className="h-4 w-4" />
                Bildirimler
                {telegramSetup.isConfigured && (
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                )}
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'general' && (
          <div className="card p-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Genel Ayarlar
              </h2>
              <p className="text-gray-600 mb-8">
                Bu bölüm geliştirme aşamasındadır.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link 
                  href="/restaurant" 
                  className="btn-primary flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Ana Panele Dön
                </Link>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-6">
            {/* Telegram Bildirimler */}
            <div className="card p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MessageSquare className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Telegram Bildirimleri</h3>
                  <p className="text-gray-600">Yeni siparişler için Telegram bildirimlerini ayarlayın</p>
                </div>
                {telegramSetup.isConfigured && (
                  <div className="ml-auto flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
                    <Check className="h-4 w-4" />
                    Aktif
                  </div>
                )}
              </div>

              {!telegramSetup.isConfigured ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-900 mb-2">Kurulum Adımları:</h4>
                        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                          <li>Aşağıdaki butona tıklayarak setup token oluşturun</li>
                          <li>Telegram'da <strong>@neyiseksiparisbot</strong> botunu bulun</li>
                          <li>Bota <strong>/start</strong> komutunu gönderin</li>
                          <li>Setup token'ınızı bot'a gönderin</li>
                          <li>Bot onay mesajı gönderecek</li>
                        </ol>
                      </div>
                    </div>
                  </div>

                  {!telegramSetup.setupToken ? (
                    <button
                      onClick={generateSetupToken}
                      disabled={telegramLoading}
                      className="btn-primary flex items-center gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      {telegramLoading ? 'Oluşturuluyor...' : 'Setup Token Oluştur'}
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Setup Token (Bu kodu Telegram bot'a gönderin)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={telegramSetup.setupToken}
                            readOnly
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-900 text-sm font-mono"
                          />
                          <button
                            onClick={copySetupToken}
                            className="p-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                          >
                            {copiedToken ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <a
                          href="https://t.me/neyiseksiparisbot"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          Telegram Bot'u Aç
                        </a>
                        <button
                          onClick={generateSetupToken}
                          disabled={telegramLoading}
                          className="btn-outline"
                        >
                          Yeni Token Oluştur
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-600" />
                      <div>
                        <h4 className="font-medium text-green-900">Telegram Bildirimleri Aktif</h4>
                        <p className="text-sm text-green-800">
                          Yeni siparişler Telegram'a otomatik olarak bildirilecek
                        </p>
                        {telegramSetup.setupAt && (
                          <p className="text-xs text-green-700 mt-1">
                            Kurulum: {new Date(telegramSetup.setupAt).toLocaleDateString('tr-TR')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={testTelegramConnection}
                      disabled={telegramLoading}
                      className="btn-secondary flex items-center gap-2"
                    >
                      <MessageSquare className="h-4 w-4" />
                      {telegramLoading ? 'Gönderiliyor...' : 'Test Mesajı Gönder'}
                    </button>
                    <button
                      onClick={disableTelegram}
                      disabled={telegramLoading}
                      className="btn-outline text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Devre Dışı Bırak
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Diğer Bildirim Türleri (Gelecek) */}
            <div className="card p-6 opacity-60">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Mail className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-700">E-posta Bildirimleri</h3>
                  <p className="text-gray-500">Yakında...</p>
                </div>
              </div>
            </div>

            <div className="card p-6 opacity-60">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-gray-100 rounded-lg">
                  <Phone className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-700">SMS Bildirimleri</h3>
                  <p className="text-gray-500">Yakında...</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}