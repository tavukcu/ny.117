'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { BarChart3, TrendingUp, DollarSign, ShoppingCart, Calendar, Filter, Download } from 'lucide-react';
import { getEnhancedSalesAnalytics, getCategoryAnalytics, getTopProducts } from '@/services/adminDataService';
import SalesChart from '@/components/charts/SalesChart';
import CategoryChart from '@/components/charts/CategoryChart';

export default function SalesAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [salesData, setSalesData] = useState({
    totalSales: 0,
    totalOrders: 0,
    averageOrderValue: 0,
    growthRate: 0,
    topProducts: [] as Array<{ name: string; sales: number; orders: number }>,
    dailySales: [] as Array<{ date: string; sales: number; orders: number }>
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSalesData = async () => {
      try {
        setLoading(true);
        const [analytics, categoryData, topProducts] = await Promise.all([
          getEnhancedSalesAnalytics(timeRange as '7d' | '30d' | '90d' | '1y'),
          getCategoryAnalytics(timeRange as '7d' | '30d' | '90d' | '1y'),
          getTopProducts(timeRange as '7d' | '30d' | '90d' | '1y', 5)
        ]);
        
        setSalesData({
          totalSales: analytics.totalSales,
          totalOrders: analytics.totalOrders,
          averageOrderValue: analytics.averageOrderValue,
          growthRate: 12.5, // Bu değer ayrıca hesaplanabilir
          topProducts: topProducts.map(product => ({
            name: product.name,
            sales: product.sales,
            orders: product.orders
          })),
          dailySales: analytics.dailySales
        });

        // Kategori verilerini state'e kaydet
        setCategoryData(categoryData);
      } catch (error) {
        console.error('Error fetching sales data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSalesData();
  }, [timeRange]);

  // Kategori verilerini state olarak tut
  const [categoryData, setCategoryData] = useState([
    { category: 'Pizza', count: 45, percentage: 35, revenue: 45000 },
    { category: 'Burger', count: 38, percentage: 28, revenue: 38000 },
    { category: 'Sushi', count: 25, percentage: 18, revenue: 25000 },
    { category: 'Pasta', count: 20, percentage: 15, revenue: 20000 },
    { category: 'Kebap', count: 12, percentage: 4, revenue: 12000 }
  ]);

  return (
    <AdminLayout
      title="Satış Raporları"
      subtitle="Satış performansını analiz edin"
      actions={
        <div className="flex gap-2">
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
          <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <Download className="h-4 w-4" />
            Rapor İndir
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Özet Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Satış</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₺{salesData.totalSales.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 dark:text-green-400">+{salesData.growthRate}%</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">geçen döneme göre</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Sipariş</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{salesData.totalOrders.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 dark:text-green-400">+8.2%</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">geçen döneme göre</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Ortalama Sipariş</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">₺{salesData.averageOrderValue}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 dark:text-green-400">+5.3%</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">geçen döneme göre</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Dönüşüm Oranı</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">3.8%</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 dark:text-green-400">+0.5%</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">geçen döneme göre</span>
            </div>
          </div>
        </div>

        {/* Chart'lar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SalesChart 
            data={salesData.dailySales} 
            timeRange={timeRange}
            loading={loading}
          />
          <CategoryChart 
            data={categoryData}
            loading={loading}
          />
        </div>

        {/* En Çok Satan Ürünler */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">En Çok Satan Ürünler</h3>
          <div className="space-y-4">
            {salesData.topProducts.map((product, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{product.orders} sipariş</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900 dark:text-white">₺{product.sales.toLocaleString()}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Toplam Satış</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 