'use client';

import { useState, useEffect } from 'react';
import { Bar } from 'react-chartjs-2';
import { defaultChartOptions, chartTheme, createGradient, animationConfig } from '@/lib/chartConfig';
import { Users, Activity, TrendingUp } from 'lucide-react';

interface UserActivityData {
  date: string;
  newUsers: number;
  activeUsers: number;
  totalUsers: number;
}

interface UserActivityChartProps {
  data: UserActivityData[];
  loading?: boolean;
}

export default function UserActivityChart({ data, loading = false }: UserActivityChartProps) {
  const [chartData, setChartData] = useState<any>(null);
  const [growthRate, setGrowthRate] = useState(0);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Büyüme oranını hesapla
    if (data.length >= 2) {
      const currentPeriod = data.slice(-7).reduce((sum, item) => sum + item.newUsers, 0);
      const previousPeriod = data.slice(-14, -7).reduce((sum, item) => sum + item.newUsers, 0);
      const growth = previousPeriod > 0 ? ((currentPeriod - previousPeriod) / previousPeriod) * 100 : 0;
      setGrowthRate(growth);
    }

    // Chart verilerini hazırla
    const labels = data.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('tr-TR', { 
        month: 'short', 
        day: 'numeric' 
      });
    });

    const newUsersData = data.map(item => item.newUsers);
    const activeUsersData = data.map(item => item.activeUsers);

    setChartData({
      labels,
      datasets: [
        {
          label: 'Yeni Kullanıcılar',
          data: newUsersData,
          backgroundColor: (context: any) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return chartTheme.colors.primary;
            return createGradient(ctx, [
              chartTheme.colors.primary,
              chartTheme.colors.primary + 'CC',
              chartTheme.colors.primary + '99'
            ]);
          },
          borderColor: chartTheme.colors.primary,
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
          categoryPercentage: 0.6,
          barPercentage: 0.8
        },
        {
          label: 'Aktif Kullanıcılar',
          data: activeUsersData,
          backgroundColor: (context: any) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return chartTheme.colors.secondary;
            return createGradient(ctx, [
              chartTheme.colors.secondary,
              chartTheme.colors.secondary + 'CC',
              chartTheme.colors.secondary + '99'
            ]);
          },
          borderColor: chartTheme.colors.secondary,
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false,
          categoryPercentage: 0.6,
          barPercentage: 0.8
        }
      ]
    });
  }, [data]);

  const chartOptions = {
    ...defaultChartOptions,
    plugins: {
      ...defaultChartOptions.plugins,
      title: {
        display: true,
        text: 'Kullanıcı Aktivite Trendi',
        font: {
          size: 16,
          weight: 'bold' as const
        },
        padding: 20
      },
      tooltip: {
        ...defaultChartOptions.plugins.tooltip,
        callbacks: {
          label: (context: any) => {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value} kişi`;
          }
        }
      }
    },
    scales: {
      x: {
        ...defaultChartOptions.scales.x,
        title: {
          display: true,
          text: 'Tarih',
          font: {
            weight: 'bold' as const
          }
        }
      },
      y: {
        ...defaultChartOptions.scales.y,
        title: {
          display: true,
          text: 'Kullanıcı Sayısı',
          font: {
            weight: 'bold' as const
          }
        },
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    },
    animation: animationConfig
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Veri bulunamadı</p>
        </div>
      </div>
    );
  }

  const totalNewUsers = data.reduce((sum, item) => sum + item.newUsers, 0);
  const totalActiveUsers = data.reduce((sum, item) => sum + item.activeUsers, 0);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Kullanıcı Aktivitesi
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Yeni ve aktif kullanıcı trendleri
          </p>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-500" />
          <span className={`text-sm font-medium ${
            growthRate > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}%
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Yeni Kullanıcılar</span>
          </div>
          <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{totalNewUsers}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <Activity className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-600 dark:text-green-400">Aktif Kullanıcılar</span>
          </div>
          <p className="text-2xl font-bold text-green-900 dark:text-green-100">{totalActiveUsers}</p>
        </div>
      </div>
      
      <div className="h-80">
        <Bar data={chartData} options={chartOptions} />
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Yeni Kullanıcılar</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Aktif Kullanıcılar</span>
        </div>
      </div>
    </div>
  );
} 