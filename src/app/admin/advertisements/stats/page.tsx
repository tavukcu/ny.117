'use client';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Target, TrendingUp, Eye, MousePointerClick, DollarSign, Calendar } from 'lucide-react';

export default function AdvertisementStatsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  
  const adStats = {
    totalAds: 45,
    activeAds: 38,
    totalImpressions: 125000,
    totalClicks: 8500,
    clickThroughRate: 6.8,
    totalSpent: 25000,
    averageCPC: 2.94,
    topAds: [
      { name: 'Pizza Kampanyası', impressions: 25000, clicks: 1800, ctr: 7.2, spent: 5000 },
      { name: 'Burger Fırsatı', impressions: 20000, clicks: 1400, ctr: 7.0, spent: 4200 },
      { name: 'Sushi Özel', impressions: 18000, clicks: 1200, ctr: 6.7, spent: 3600 },
      { name: 'Pasta Lezzeti', impressions: 15000, clicks: 1000, ctr: 6.7, spent: 3000 },
      { name: 'Kebap Keyfi', impressions: 12000, clicks: 800, ctr: 6.7, spent: 2400 }
    ]
  };

  return (
    <AdminLayout
      title="Reklam İstatistikleri"
      subtitle="Reklam performansını ve metriklerini analiz edin"
      actions={
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        >
          <option value="7d">Son 7 Gün</option>
          <option value="30d">Son 30 Gün</option>
          <option value="90d">Son 90 Gün</option>
          <option value="1y">Son 1 Yıl</option>
        </select>
      }
    >
      <div className="space-y-6">
        {/* Özet Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Reklam</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{adStats.totalAds}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500 dark:text-gray-400">{adStats.activeAds} aktif reklam</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Görüntülenme</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{adStats.totalImpressions.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <Eye className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 dark:text-green-400">+12.5%</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">geçen döneme göre</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Tıklama</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{adStats.totalClicks.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <MousePointerClick className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500 dark:text-gray-400">%{adStats.clickThroughRate} CTR</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Harcama</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₺{adStats.totalSpent.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                <DollarSign className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500 dark:text-gray-400">₺{adStats.averageCPC} ortalama CPC</span>
            </div>
          </div>
        </div>

        {/* En İyi Performans Gösteren Reklamlar */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">En İyi Performans Gösteren Reklamlar</h3>
          <div className="space-y-4">
            {adStats.topAds.map((ad, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{ad.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">%{ad.ctr} CTR</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">₺{ad.spent.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{ad.clicks.toLocaleString()} tıklama</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Performans Metrikleri */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Reklam Kategorileri</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Yemek</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">45%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">İçecek</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">25%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Tatlı</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">20%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Diğer</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '10%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">10%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">CTR Dağılımı</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">%5+ CTR</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">60%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">%3-5 CTR</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '30%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">30%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">%1-3 CTR</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '8%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">8%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">%1- CTR</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '2%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">2%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 