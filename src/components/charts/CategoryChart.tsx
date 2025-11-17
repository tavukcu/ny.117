'use client';

import { useState, useEffect } from 'react';
import { Doughnut } from 'react-chartjs-2';
import { defaultChartOptions, chartTheme, animationConfig } from '@/lib/chartConfig';
import { PieChart, Users, ShoppingCart } from 'lucide-react';

interface CategoryData {
  category: string;
  count: number;
  percentage: number;
  revenue: number;
}

interface CategoryChartProps {
  data: CategoryData[];
  loading?: boolean;
}

export default function CategoryChart({ data, loading = false }: CategoryChartProps) {
  const [chartData, setChartData] = useState<any>(null);
  const [totalRevenue, setTotalRevenue] = useState(0);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const total = data.reduce((sum, item) => sum + item.revenue, 0);
    setTotalRevenue(total);

    const colors = [
      chartTheme.colors.primary,
      chartTheme.colors.secondary,
      chartTheme.colors.accent,
      chartTheme.colors.danger,
      chartTheme.colors.warning,
      chartTheme.colors.info,
      chartTheme.colors.success,
      chartTheme.colors.purple,
      chartTheme.colors.pink,
      chartTheme.colors.gray
    ];

    setChartData({
      labels: data.map(item => item.category),
      datasets: [
        {
          data: data.map(item => item.revenue),
          backgroundColor: colors.slice(0, data.length),
          borderColor: colors.slice(0, data.length).map(color => color + '80'),
          borderWidth: 2,
          hoverBackgroundColor: colors.slice(0, data.length).map(color => color + 'CC'),
          hoverBorderColor: colors.slice(0, data.length),
          hoverBorderWidth: 3
        }
      ]
    });
  }, [data]);

  const chartOptions = {
    ...defaultChartOptions,
    plugins: {
      ...defaultChartOptions.plugins,
      legend: {
        ...defaultChartOptions.plugins.legend,
        position: 'bottom' as const,
        labels: {
          ...defaultChartOptions.plugins.legend.labels,
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      tooltip: {
        ...defaultChartOptions.plugins.tooltip,
        callbacks: {
          label: (context: any) => {
            const label = context.label || '';
            const value = context.parsed;
            const percentage = ((value / totalRevenue) * 100).toFixed(1);
            return `${label}: ₺${value.toLocaleString('tr-TR')} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '60%',
    animation: animationConfig
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-full w-64 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <PieChart className="h-12 w-12 mx-auto mb-4 opacity-50" />
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
            Kategori Dağılımı
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Satış gelirlerinin kategori bazında dağılımı
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ₺{totalRevenue.toLocaleString('tr-TR')}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">Toplam Gelir</p>
        </div>
      </div>
      
      <div className="h-80 flex items-center justify-center">
        <Doughnut data={chartData} options={chartOptions} />
      </div>
      
      <div className="mt-6 grid grid-cols-1 gap-3">
        {data.map((item, index) => (
          <div key={item.category} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: chartTheme.colors[Object.keys(chartTheme.colors)[index] as keyof typeof chartTheme.colors] }}
              ></div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{item.category}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.count} ürün</p>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900 dark:text-white">
                ₺{item.revenue.toLocaleString('tr-TR')}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{item.percentage.toFixed(1)}%</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 