'use client';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Settings, Save, RefreshCw, Database, Server, Wifi, HardDrive, Shield, Activity, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

export default function SystemSettingsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [systemSettings, setSystemSettings] = useState({
    serverUrl: 'https://api.neyisek.com',
    databaseUrl: 'firebase://neyisek-db',
    cacheEnabled: true,
    cacheTimeout: 300,
    maxConnections: 100,
    enableSSL: true,
    enableCompression: true,
    enableLogging: true,
    logLevel: 'info',
    autoRestart: true,
    backupInterval: 24,
    maxBackupSize: 1000
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Sistem ayarları kaydedildi');
    } catch (error) {
      toast.error('Ayarlar kaydedilirken hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSystemSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <AdminLayout
      title="Sistem Ayarları"
      subtitle="Sunucu ve veritabanı ayarlarını yönetin"
      actions={
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {isLoading ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      }
    >
      <div className="space-y-6">
        {/* Sunucu Ayarları */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Server className="h-5 w-5" />
              Sunucu Ayarları
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sunucu URL
                </label>
                <input
                  type="url"
                  value={systemSettings.serverUrl}
                  onChange={(e) => updateSetting('serverUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Veritabanı URL
                </label>
                <input
                  type="text"
                  value={systemSettings.databaseUrl}
                  onChange={(e) => updateSetting('databaseUrl', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maksimum Bağlantı Sayısı
                </label>
                <input
                  type="number"
                  value={systemSettings.maxConnections}
                  onChange={(e) => updateSetting('maxConnections', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Log Seviyesi
                </label>
                <select
                  value={systemSettings.logLevel}
                  onChange={(e) => updateSetting('logLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="debug">Debug</option>
                  <option value="info">Info</option>
                  <option value="warn">Warning</option>
                  <option value="error">Error</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Performans Ayarları */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Performans Ayarları
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Önbellek Etkin</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sistem önbelleğini etkinleştir</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemSettings.cacheEnabled}
                  onChange={(e) => updateSetting('cacheEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">SSL Etkin</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Güvenli bağlantı protokolünü kullan</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemSettings.enableSSL}
                  onChange={(e) => updateSetting('enableSSL', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Sıkıştırma Etkin</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Veri sıkıştırmayı etkinleştir</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemSettings.enableCompression}
                  onChange={(e) => updateSetting('enableCompression', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Önbellek Zaman Aşımı (saniye)
                </label>
                <input
                  type="number"
                  value={systemSettings.cacheTimeout}
                  onChange={(e) => updateSetting('cacheTimeout', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Yedekleme Ayarları */}
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Database className="h-5 w-5" />
              Yedekleme Ayarları
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900 dark:text-white">Otomatik Yeniden Başlatma</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">Hata durumunda otomatik yeniden başlat</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemSettings.autoRestart}
                  onChange={(e) => updateSetting('autoRestart', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Yedekleme Aralığı (saat)
                </label>
                <input
                  type="number"
                  value={systemSettings.backupInterval}
                  onChange={(e) => updateSetting('backupInterval', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Maksimum Yedek Boyutu (MB)
                </label>
                <input
                  type="number"
                  value={systemSettings.maxBackupSize}
                  onChange={(e) => updateSetting('maxBackupSize', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 