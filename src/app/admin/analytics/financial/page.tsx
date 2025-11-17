'use client';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { DollarSign, TrendingUp, TrendingDown, BarChart3, Calendar } from 'lucide-react';

export default function FinancialAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  
  const financialData = {
    totalRevenue: 1250000,
    totalExpenses: 850000,
    netProfit: 400000,
    profitMargin: 32,
    revenueGrowth: 15.5,
    expenseGrowth: 8.2,
    monthlyRevenue: [
      { month: 'Oca', revenue: 95000, expenses: 65000 },
      { month: 'Şub', revenue: 105000, expenses: 70000 },
      { month: 'Mar', revenue: 115000, expenses: 75000 },
      { month: 'Nis', revenue: 125000, expenses: 80000 },
      { month: 'May', revenue: 135000, expenses: 85000 },
      { month: 'Haz', revenue: 145000, expenses: 90000 }
    ]
  };

  return (
    <AdminLayout
      title="Finansal Raporlar"
      subtitle="Gelir, gider ve kâr analizlerini görüntüleyin"
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Gelir</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₺{financialData.totalRevenue.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 dark:text-green-400">+{financialData.revenueGrowth}%</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">geçen döneme göre</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Gider</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₺{financialData.totalExpenses.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-full">
                <TrendingDown className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-red-500 mr-1" />
              <span className="text-red-600 dark:text-red-400">+{financialData.expenseGrowth}%</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">geçen döneme göre</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Kâr</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₺{financialData.netProfit.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <BarChart3 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500 dark:text-gray-400">%{financialData.profitMargin} kâr marjı</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Kâr Marjı</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">%{financialData.profitMargin}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500 dark:text-gray-400">Ortalama kâr marjı</span>
            </div>
          </div>
        </div>

        {/* Aylık Gelir Grafiği */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Aylık Gelir ve Gider Trendi</h3>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">Son 6 ay</span>
            </div>
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {financialData.monthlyRevenue.map((month, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col gap-1">
                  <div className="w-full bg-green-100 dark:bg-green-900 rounded-t-lg relative group">
                    <div 
                      className="bg-green-500 dark:bg-green-400 rounded-t-lg transition-all duration-300 group-hover:bg-green-600"
                      style={{ height: `${(month.revenue / 145000) * 100}%` }}
                    ></div>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      ₺{month.revenue.toLocaleString()}
                    </div>
                  </div>
                  <div className="w-full bg-red-100 dark:bg-red-900 rounded-b-lg relative group">
                    <div 
                      className="bg-red-500 dark:bg-red-400 rounded-b-lg transition-all duration-300 group-hover:bg-red-600"
                      style={{ height: `${(month.expenses / 145000) * 100}%` }}
                    ></div>
                    <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                      ₺{month.expenses.toLocaleString()}
                    </div>
                  </div>
                </div>
                <span className="text-xs text-gray-500 mt-2">{month.month}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center gap-4 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Gelir</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Gider</span>
            </div>
          </div>
        </div>

        {/* Finansal Metrikler */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Gelir Dağılımı</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Sipariş Gelirleri</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">75%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Komisyon Gelirleri</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">20%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Reklam Gelirleri</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: '5%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">5%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Gider Dağılımı</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Personel Maaşları</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '40%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">40%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Teknoloji Maliyetleri</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-orange-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">25%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Pazarlama</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '20%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">20%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Diğer</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-gray-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">15%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 