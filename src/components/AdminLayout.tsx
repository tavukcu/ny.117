'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { isAdminEmail } from '@/utils/adminUtils';
import toast from 'react-hot-toast';
import {
  Menu,
  X,
  Home,
  Users,
  ChefHat,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  Bell,
  Search,
  User,
  LogOut,
  Sun,
  Moon,
  Maximize2,
  Minimize2,
  Grid,
  List,
  Filter,
  Download,
  RefreshCw,
  Plus,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  TrendingUp,
  TrendingDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  Clock,
  Star,
  DollarSign,
  Target,
  Activity,
  Zap,
  Shield,
  Database,
  Server,
  Wifi,
  HardDrive,
  MessageSquare,
  FileText,
  PieChart,
  LineChart,
  BarChart,
  Award,
  Briefcase,
  MapPin,
  Phone,
  Mail,
  CreditCard,
  Receipt,
  Truck,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  MousePointer,
  MousePointerClick,
  ShoppingBag,
  Heart,
  ThumbsUp,
  ThumbsDown,
  MessageCircle,
  Send,
  Navigation,
  Compass,
  Layers,
  Palette,
  Type,
  Video,
  Music,
  File,
  Folder,
  Archive,
  Lock,
  Unlock,
  Key,
  EyeOff,
  Camera,
  Mic,
  Headphones,
  Speaker,
  Volume2,
  VolumeX,
  Signal,
  Battery,
  BatteryCharging,
  Power,
  PowerOff,
  Cloud,
  CloudRain,
  CloudSnow,
  Wind,
  Thermometer,
  Droplets,
  Umbrella,
  Snowflake,
  CloudLightning,
  Tornado,
  Flame,
  Sparkles,
  Gift,
  PartyPopper,
  Trophy,
  Medal,
  Crown,
  Gem,
  Diamond,

} from 'lucide-react';
import Link from 'next/link';

interface AdminLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  showBreadcrumb?: boolean;
  actions?: React.ReactNode;
}

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/admin',
    icon: Home,
    badge: null
  },
  {
    title: 'Kullanıcılar',
    href: '/admin/users',
    icon: Users,
    badge: null,
    subItems: [
      { title: 'Tüm Kullanıcılar', href: '/admin/users' },
      { title: 'Aktif Kullanıcılar', href: '/admin/users?status=active' },
      { title: 'Yeni Kayıtlar', href: '/admin/users?status=new' },
      { title: 'Engellenenler', href: '/admin/users?status=banned' }
    ]
  },
  {
    title: 'Restoranlar',
    href: '/admin/restaurants',
    icon: ChefHat,
    badge: null,
    subItems: [
      { title: 'Tüm Restoranlar', href: '/admin/restaurants' },
      { title: 'Aktif Restoranlar', href: '/admin/restaurants?status=active' },
      { title: 'Bekleyen Başvurular', href: '/admin/restaurants?status=pending' },
      { title: 'Onaylananlar', href: '/admin/restaurants?status=approved' },
      { title: 'Reddedilenler', href: '/admin/restaurants?status=rejected' }
    ]
  },
  {
    title: 'Ürünler',
    href: '/admin/products',
    icon: Package,
    badge: null,
    subItems: [
      { title: 'Tüm Ürünler', href: '/admin/products' },
      { title: 'Aktif Ürünler', href: '/admin/products?status=active' },
      { title: 'Kategoriler', href: '/admin/categories' },
      { title: 'Stok Durumu', href: '/admin/products?view=stock' },
      { title: 'Popüler Ürünler', href: '/admin/products?view=popular' }
    ]
  },
  {
    title: 'Siparişler',
    href: '/admin/orders',
    icon: ShoppingCart,
    badge: null,
    subItems: [
      { title: 'Tüm Siparişler', href: '/admin/orders' },
      { title: 'Bekleyen Siparişler', href: '/admin/orders?status=pending' },
      { title: 'Hazırlanan Siparişler', href: '/admin/orders?status=preparing' },
      { title: 'Yolda Olan Siparişler', href: '/admin/orders?status=delivering' },
      { title: 'Tamamlanan Siparişler', href: '/admin/orders?status=completed' },
      { title: 'İptal Edilen Siparişler', href: '/admin/orders?status=cancelled' }
    ]
  },
  {
    title: 'Analitik',
    href: '/admin/analytics',
    icon: BarChart3,
    badge: null,
    subItems: [
      { title: 'Genel Bakış', href: '/admin/analytics' },
      { title: 'Satış Raporları', href: '/admin/analytics/sales' },
      { title: 'Kullanıcı Analizi', href: '/admin/analytics/users' },
      { title: 'Restoran Performansı', href: '/admin/analytics/restaurants' },
      { title: 'Ürün Analizi', href: '/admin/analytics/products' },
      { title: 'Finansal Raporlar', href: '/admin/analytics/financial' },
      { title: 'E-posta Raporları', href: '/admin/analytics/email-reports' }
    ]
  },
  {
    title: 'Reklamlar',
    href: '/admin/advertisements',
    icon: Target,
    badge: null,
    subItems: [
      { title: 'Tüm Reklamlar', href: '/admin/advertisements' },
      { title: 'Aktif Reklamlar', href: '/admin/advertisements?status=active' },
      { title: 'Bekleyen Reklamlar', href: '/admin/advertisements?status=pending' },
      { title: 'Reklam İstatistikleri', href: '/admin/advertisements/stats' }
    ]
  },
  {
    title: 'Şikayetler',
    href: '/admin/complaints',
    icon: AlertCircle,
    badge: null,
    subItems: [
      { title: 'Tüm Şikayetler', href: '/admin/complaints' },
      { title: 'Yeni Şikayetler', href: '/admin/complaints?status=new' },
      { title: 'İşlemde Olanlar', href: '/admin/complaints?status=processing' },
      { title: 'Çözülen Şikayetler', href: '/admin/complaints?status=resolved' }
    ]
  },
  {
    title: 'Ayarlar',
    href: '/admin/settings',
    icon: Settings,
    badge: null,
    subItems: [
      { title: 'Genel Ayarlar', href: '/admin/settings' },
      { title: 'Sistem Ayarları', href: '/admin/settings/system' },
      { title: 'E-posta Ayarları', href: '/admin/settings/email' },
      { title: 'Ödeme Ayarları', href: '/admin/settings/payment' },
      { title: 'Güvenlik Ayarları', href: '/admin/settings/security' }
    ]
  }
];

export default function AdminLayout({ 
  children, 
  title, 
  subtitle, 
  showBreadcrumb = true,
  actions 
}: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  // Yetkilendirme kontrolü - geçici olarak devre dışı
  // useEffect(() => {
  //   if (!authLoading && (!user || !isAdminEmail(user.email))) {
  //     router.push('/');
  //     toast.error('Bu sayfaya erişim yetkiniz yok!');
  //   }
  // }, [user, authLoading, router]);

  // Dark mode toggle
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  // Navigation item toggle
  const toggleExpanded = (title: string) => {
    setExpandedItems(prev => 
      prev.includes(title) 
        ? prev.filter(item => item !== title)
        : [...prev, title]
    );
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
      toast.success('Başarıyla çıkış yapıldı');
    } catch (error) {
      toast.error('Çıkış yapılırken hata oluştu');
    }
  };

  // Loading durumu - geçici olarak devre dışı
  // if (authLoading) {
  //   return (
  //     <div className="min-h-screen bg-gray-50 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
  //         <p className="text-gray-600">Admin paneli yükleniyor...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // Yetkisiz erişim - geçici olarak devre dışı
  // if (!user || !isAdminEmail(user.email)) {
  //   return null;
  // }

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
                            <Image src="/logo.png" alt="NeYisek Logo" width={32} height={32} className="h-8 w-8" />
            <span className="text-xl font-bold text-gray-900 dark:text-white">Admin</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;
            const isExpanded = expandedItems.includes(item.title);
            const hasSubItems = item.subItems && item.subItems.length > 0;

            return (
              <div key={item.title} className="relative">
                {hasSubItems ? (
                  // Alt menüsü olan öğeler için - sadece tıklama ile açılır/kapanır
                  <div
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      toggleExpanded(item.title);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {item.badge && (
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                          {item.badge}
                        </span>
                      )}
                      <ChevronDown className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>
                  </div>
                ) : (
                  // Alt menüsü olmayan öğeler için
                  <Link
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </div>
                    {item.badge && (
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                          {item.badge}
                        </span>
                      </div>
                    )}
                  </Link>
                )}

                {/* Sub items */}
                {hasSubItems && isExpanded && (
                  <div className="ml-8 mt-2 space-y-1">
                    {item.subItems.map((subItem) => {
                      const isSubActive = pathname === subItem.href;
                      return (
                        <Link
                          key={subItem.title}
                          href={subItem.href}
                          className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                            isSubActive
                              ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300'
                              : 'text-gray-600 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800'
                          }`}
                        >
                          {subItem.title}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User info */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 text-blue-600 dark:text-blue-300" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.displayName || user?.email || 'Admin'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                Admin
              </p>
            </div>
            <button
              onClick={handleSignOut}
              className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <LogOut className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            {/* Left side */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <Menu className="h-5 w-5" />
              </button>

              {showBreadcrumb && (
                <nav className="hidden sm:flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                  <Link href="/admin" className="hover:text-gray-700 dark:hover:text-gray-300">
                    Admin
                  </Link>
                  <span>/</span>
                  <span className="text-gray-900 dark:text-white">{title}</span>
                </nav>
              )}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ara..."
                  className="pl-10 pr-4 py-2 w-64 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>

              {/* Dark mode toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>

              {/* Fullscreen toggle */}
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                {fullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 sm:p-6 page-content">
          {/* Page header */}
          {(title || subtitle || actions) && (
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  {title && (
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                      {subtitle}
                    </p>
                  )}
                </div>
                {actions && (
                  <div className="flex items-center gap-2">
                    {actions}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Page content */}
          {children}
        </main>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

// ChevronDown icon component
function ChevronDown({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
} 