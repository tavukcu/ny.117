'use client';

import { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import { defaultChartOptions, chartTheme, createGradient, animationConfig } from '@/lib/chartConfig';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';

interface SalesChartProps {
  data: Array<{
    date: string;
    sales: number;
    orders: number;
  }>;
  timeRange: string;
  loading?: boolean;
}

export default function SalesChart({ data, timeRange, loading = false }: SalesChartProps) {
  const [chartData, setChartData] = useState<any>(null);
  const [growthRate, setGrowthRate] = useState(0);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Büyüme oranını hesapla
    if (data.length >= 2) {
      const currentPeriod = data.slice(-7).reduce((sum, item) => sum + item.sales, 0);
      const previousPeriod = data.slice(-14, -7).reduce((sum, item) => sum + item.sales, 0);
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

    const salesData = data.map(item => item.sales);
    const ordersData = data.map(item => item.orders);

    setChartData({
      labels,
      datasets: [
        {
          label: 'Satış (₺)',
          data: salesData,
          borderColor: chartTheme.colors.primary,
          backgroundColor: (context: any) => {
            const chart = context.chart;
            const { ctx, chartArea } = chart;
            if (!chartArea) return;
            return createGradient(ctx, [
              `${chartTheme.colors.primary}20`,
              `${chartTheme.colors.primary}10`,
              `${chartTheme.colors.primary}05`
            ]);
          },
          fill: true,
          tension: 0.4,
          pointBackgroundColor: chartTheme.colors.primary,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: chartTheme.colors.primary,
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 3
        },
        {
          label: 'Sipariş Sayısı',
          data: ordersData,
          borderColor: chartTheme.colors.secondary,
          backgroundColor: chartTheme.colors.secondary + '20',
          fill: false,
          tension: 0.4,
          pointBackgroundColor: chartTheme.colors.secondary,
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 5,
          yAxisID: 'y1'
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
          text: `${timeRange === '7d' ? 'Son 7 Gün' : timeRange === '30d' ? 'Son 30 Gün' : timeRange === '90d' ? 'Son 90 Gün' : 'Son 1 Yıl'} Satış Trendi`,
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
            if (context.datasetIndex === 0) {
              return `Satış: ₺${context.parsed.y.toLocaleString('tr-TR')}`;
            } else {
              return `Sipariş: ${context.parsed.y} adet`;
            }
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
            weight: 'bold'
          }
        }
      },
      y: {
        ...defaultChartOptions.scales.y,
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Satış (₺)',
          font: {
            weight: 'bold'
          }
        },
        ticks: {
          callback: (value: any) => `₺${value.toLocaleString('tr-TR')}`
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Sipariş Sayısı',
          font: {
            weight: 'bold'
          }
        },
        grid: {
          drawOnChartArea: false,
        },
      }
    },
    interaction: {
      mode: 'index' as const,
      intersect: false,
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
          <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Veri bulunamadı</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Satış Trendi
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Zaman içindeki satış ve sipariş performansı
          </p>
        </div>
        <div className="flex items-center gap-2">
          {growthRate > 0 ? (
            <TrendingUp className="h-5 w-5 text-green-500" />
          ) : (
            <TrendingDown className="h-5 w-5 text-red-500" />
          )}
          <span className={`text-sm font-medium ${
            growthRate > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
          }`}>
            {growthRate > 0 ? '+' : ''}{growthRate.toFixed(1)}%
          </span>
        </div>
      </div>
      
      <div className="h-80">
        <Line data={chartData} options={chartOptions} />
      </div>
      
      <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Satış (₺)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-gray-600 dark:text-gray-400">Sipariş Sayısı</span>
        </div>
      </div>
    </div>
  );
} 