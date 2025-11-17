'use client';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { ChefHat, Star, TrendingUp, DollarSign, Users, Calendar } from 'lucide-react';

export default function RestaurantAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  
  const restaurantData = {
    totalRestaurants: 450,
    activeRestaurants: 420,
    newRestaurants: 25,
    averageRating: 4.2,
    topRestaurants: [
      { name: 'Pizza Palace', rating: 4.8, orders: 1250, revenue: 45000 },
      { name: 'Burger House', rating: 4.6, orders: 1100, revenue: 38000 },
      { name: 'Sushi Master', rating: 4.7, orders: 950, revenue: 52000 },
      { name: 'Pasta Corner', rating: 4.5, orders: 800, revenue: 28000 },
      { name: 'Kebab King', rating: 4.4, orders: 1200, revenue: 35000 }
    ]
  };

  return (
    <AdminLayout
      title="Restoran Performansı"
      subtitle="Restoran performansını ve değerlendirmelerini analiz edin"
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Restoran</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{restaurantData.totalRestaurants}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <ChefHat className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 dark:text-green-400">+5.8%</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">geçen döneme göre</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Aktif Restoran</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{restaurantData.activeRestaurants}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500 dark:text-gray-400">%{((restaurantData.activeRestaurants / restaurantData.totalRestaurants) * 100).toFixed(1)} aktiflik oranı</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ortalama Puan</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{restaurantData.averageRating}</p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500 dark:text-gray-400">Tüm restoranların ortalama puanı</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Yeni Restoran</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{restaurantData.newRestaurants}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500 dark:text-gray-400">Bu ay eklenen</span>
            </div>
          </div>
        </div>

        {/* En İyi Restoranlar */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">En İyi Performans Gösteren Restoranlar</h3>
          <div className="space-y-4">
            {restaurantData.topRestaurants.map((restaurant, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{restaurant.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">{restaurant.rating}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">₺{restaurant.revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{restaurant.orders} sipariş</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Restoran Kategorileri */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Kategori Bazında Dağılım</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Pizza</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">25%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Burger</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">20%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Sushi</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">15%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Kebap</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '18%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">18%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Diğer</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '22%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">22%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Puan Dağılımı</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">5 Yıldız</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">35%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">4 Yıldız</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">45%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">3 Yıldız</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">15%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">2 Yıldız</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '3%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">3%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">1 Yıldız</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '2%' }}></div>
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