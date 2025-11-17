import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
} from 'chart.js';

// Chart.js bileşenlerini kaydet
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  RadialLinearScale
);

// Türkçe dil desteği
ChartJS.defaults.locale = 'tr';

// Varsayılan tema ayarları
export const chartTheme = {
  colors: {
    primary: '#3B82F6',
    secondary: '#10B981',
    accent: '#F59E0B',
    danger: '#EF4444',
    warning: '#F97316',
    info: '#06B6D4',
    success: '#22C55E',
    purple: '#8B5CF6',
    pink: '#EC4899',
    gray: '#6B7280'
  },
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: 12
};

// Varsayılan chart ayarları
export const defaultChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top' as const,
      labels: {
        font: {
          family: chartTheme.fontFamily,
          size: chartTheme.fontSize
        },
        usePointStyle: true,
        padding: 20
      }
    },
    tooltip: {
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      titleColor: '#ffffff',
      bodyColor: '#ffffff',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderWidth: 1,
      cornerRadius: 8,
      displayColors: true,
      titleFont: {
        family: chartTheme.fontFamily,
        size: 14,
        weight: 'bold' as const
      },
      bodyFont: {
        family: chartTheme.fontFamily,
        size: chartTheme.fontSize
      },
      padding: 12
    }
  },
  scales: {
    x: {
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
        drawBorder: false
      },
      ticks: {
        font: {
          family: chartTheme.fontFamily,
          size: chartTheme.fontSize
        }
      }
    },
    y: {
      grid: {
        color: 'rgba(0, 0, 0, 0.1)',
        drawBorder: false
      },
      ticks: {
        font: {
          family: chartTheme.fontFamily,
          size: chartTheme.fontSize
        }
      }
    }
  }
};

// Dark mode için chart ayarları
export const darkChartOptions = {
  ...defaultChartOptions,
  plugins: {
    ...defaultChartOptions.plugins,
    legend: {
      ...defaultChartOptions.plugins.legend,
      labels: {
        ...defaultChartOptions.plugins.legend.labels,
        color: '#E5E7EB'
      }
    }
  },
  scales: {
    x: {
      ...defaultChartOptions.scales.x,
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
        drawBorder: false
      },
      ticks: {
        ...defaultChartOptions.scales.x.ticks,
        color: '#E5E7EB'
      }
    },
    y: {
      ...defaultChartOptions.scales.y,
      grid: {
        color: 'rgba(255, 255, 255, 0.1)',
        drawBorder: false
      },
      ticks: {
        ...defaultChartOptions.scales.y.ticks,
        color: '#E5E7EB'
      }
    }
  }
};

// Gradient oluşturma fonksiyonu
export const createGradient = (ctx: CanvasRenderingContext2D, colors: string[]) => {
  const gradient = ctx.createLinearGradient(0, 0, 0, 400);
  colors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color);
  });
  return gradient;
};

// Animasyon ayarları
export const animationConfig = {
  duration: 1000,
  easing: 'easeInOutQuart' as const,
  delay: (context: any) => context.dataIndex * 100
}; 