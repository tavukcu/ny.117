'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { Users, UserPlus, UserCheck, UserX, TrendingUp, Calendar, Filter } from 'lucide-react';
import { getUsers, getUserActivityAnalytics } from '@/services/adminDataService';
import UserActivityChart from '@/components/charts/UserActivityChart';

export default function UserAnalyticsPage() {
  const [timeRange, setTimeRange] = useState('30d');
  const [userData, setUserData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    inactiveUsers: 0,
    userGrowth: 0,
    retentionRate: 0,
    topCities: [] as Array<{ city: string; users: number; percentage: number }>,
    ageGroups: [] as Array<{ group: string; users: number; percentage: number }>
  });
  const [loading, setLoading] = useState(true);
  const [userActivityData, setUserActivityData] = useState([] as Array<{ date: string; newUsers: number; activeUsers: number; totalUsers: number }>);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const [users, activityData] = await Promise.all([
          getUsers({ limit: 1000 }), // Tüm kullanıcıları çek
          getUserActivityAnalytics(timeRange as '7d' | '30d' | '90d' | '1y')
        ]);
        
        const totalUsers = users.length;
        const activeUsers = users.filter(user => user.isActive).length;
        const newUsers = users.filter(user => {
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          return user.createdAt.toDate() >= thirtyDaysAgo;
        }).length;
        
        setUserData({
          totalUsers,
          activeUsers,
          newUsers,
          inactiveUsers: totalUsers - activeUsers,
          userGrowth: 8.5, // Bu değer ayrıca hesaplanabilir
          retentionRate: 78.5, // Bu değer ayrıca hesaplanabilir
          topCities: [
            { city: 'İstanbul', users: 5200, percentage: 33.7 },
            { city: 'Ankara', users: 2100, percentage: 13.6 },
            { city: 'İzmir', users: 1800, percentage: 11.7 },
            { city: 'Bursa', users: 1200, percentage: 7.8 },
            { city: 'Antalya', users: 900, percentage: 5.8 }
          ],
          ageGroups: [
            { group: '18-24', users: 3855, percentage: 25 },
            { group: '25-34', users: 4626, percentage: 30 },
            { group: '35-44', users: 3084, percentage: 20 },
            { group: '45-54', users: 2313, percentage: 15 },
            { group: '55+', users: 1542, percentage: 10 }
          ]
        });

        setUserActivityData(activityData);
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [timeRange]);

  return (
    <AdminLayout
      title="Kullanıcı Analizi"
      subtitle="Kullanıcı davranışlarını ve demografik verileri analiz edin"
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Toplam Kullanıcı</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{userData.totalUsers.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 dark:text-green-400">+{userData.userGrowth}%</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">geçen döneme göre</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Aktif Kullanıcı</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{userData.activeUsers.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <UserCheck className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-500 dark:text-gray-400">Son 30 günde aktif</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Yeni Kullanıcı</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{userData.newUsers.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <UserPlus className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 dark:text-green-400">+12.3%</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">geçen döneme göre</span>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Sadakat Oranı</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{userData.retentionRate}%</p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                <UserCheck className="h-6 w-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 dark:text-green-400">+2.1%</span>
              <span className="text-gray-500 dark:text-gray-400 ml-1">geçen döneme göre</span>
            </div>
          </div>
        </div>

        {/* Kullanıcı Aktivite Chart'ı */}
        <UserActivityChart 
          data={userActivityData}
          loading={loading}
        />

        {/* Demografik Veriler */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Şehir Dağılımı</h3>
            <div className="space-y-4">
              {userData.topCities.map((city, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{city.city}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full" 
                        style={{ width: `${city.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{city.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-6">Yaş Grupları</h3>
            <div className="space-y-4">
              {userData.ageGroups.map((group, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">{group.group}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${group.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{group.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 