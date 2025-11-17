'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { 
  TrendingUp, 
  Users, 
  ShoppingCart, 
  Clock, 
  Star, 
  DollarSign,
  Calendar,
  BarChart3,
  Settings,
  Menu,
  Package,
  MessageSquare,
  Bell,
  ArrowUpRight,
  ArrowDownRight,
  ChefHat,
  UtensilsCrossed,
  Receipt,
  MapPin,
  Phone,
  Mail,
  Globe,
  Edit3,
  Plus,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  Barcode,
  Scan,
  Warehouse
} from 'lucide-react';
import { collection, query, where, getDocs, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import Link from 'next/link';
import Image from 'next/image';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  averageRating: number;
  activeProducts: number;
  pendingOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
  // Stok bilgileri
  totalInventoryItems: number;
  lowStockItems: number;
  outOfStockItems: number;
  inventoryValue: number;
}

interface RecentOrder {
  id: string;
  customerName: string;
  total: number;
  status: string;
  items: any[];
  createdAt: any;
  orderNumber: string;
}

interface TopProduct {
  id: string;
  name: string;
  sales: number;
  revenue: number;
  image: string;
}

export default function RestaurantDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalRevenue: 0,
    averageRating: 0,
    activeProducts: 0,
    pendingOrders: 0,
    completedOrders: 0,
    cancelledOrders: 0,
    todayRevenue: 0,
    weekRevenue: 0,
    monthRevenue: 0,
    // Stok bilgileri
    totalInventoryItems: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    inventoryValue: 0
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'restaurant')) {
      router.push('/login');
      return;
    }

    if (user?.restaurantId) {
      loadDashboardData();
    }
  }, [user, authLoading, router]);

  const loadDashboardData = async () => {
    if (!user?.restaurantId) return;

    try {
      setLoading(true);
      
      // Siparişleri dinle
      const ordersRef = collection(db, 'orders');
      const ordersQuery = query(
        ordersRef,
        where('restaurantId', '==', user.restaurantId),
        orderBy('createdAt', 'desc'),
        limit(10)
      );

      const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
        const orders: RecentOrder[] = [];
        let totalRevenue = 0;
        let pendingCount = 0;
        let completedCount = 0;
        let cancelledCount = 0;

        snapshot.forEach((doc) => {
          const orderData = doc.data();
          const order: RecentOrder = {
            id: doc.id,
            customerName: orderData.user?.displayName || 'Misafir',
            total: orderData.total || 0,
            status: orderData.status || 'pending',
            items: orderData.items || [],
            createdAt: orderData.createdAt,
            orderNumber: orderData.orderNumber || `#${doc.id.slice(-8)}`
          };

          orders.push(order);
          totalRevenue += order.total;

          switch (order.status) {
            case 'pending':
              pendingCount++;
              break;
            case 'completed':
              completedCount++;
              break;
            case 'cancelled':
              cancelledCount++;
              break;
          }
        });

        setRecentOrders(orders);
        setStats(prev => ({
          ...prev,
          totalOrders: orders.length,
          totalRevenue,
          pendingOrders: pendingCount,
          completedOrders: completedCount,
          cancelledOrders: cancelledCount
        }));
      });

      // Ürünleri yükle
      const productsRef = collection(db, 'restaurants', user.restaurantId, 'products');
      const productsSnapshot = await getDocs(productsRef);
      const activeProducts = productsSnapshot.docs.filter(doc => doc.data().isActive).length;
      
      setStats(prev => ({
        ...prev,
        activeProducts
      }));

      // Top ürünleri hesapla (basit simülasyon)
      const mockTopProducts: TopProduct[] = [
        {
          id: '1',
          name: 'Pizza Margherita',
          sales: 45,
          revenue: 1350,
          image: '/images/margherita.jpg'
        },
        {
          id: '2',
          name: 'Burger Classic',
          sales: 38,
          revenue: 1140,
          image: '/images/classic-burger.jpg'
        },
        {
          id: '3',
          name: 'Adana Kebap',
          sales: 32,
          revenue: 1280,
          image: '/images/adana-kebap.jpg'
        }
      ];
      
      setTopProducts(mockTopProducts);

    } catch (error) {
      console.error('Dashboard verileri yüklenirken hata:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'preparing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ready':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'delivering':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Bekliyor';
      case 'preparing':
        return 'Hazırlanıyor';
      case 'ready':
        return 'Hazır';
      case 'delivering':
        return 'Teslim Ediliyor';
      case 'completed':
        return 'Tamamlandı';
      case 'cancelled':
        return 'İptal Edildi';
      default:
        return status;
    }
  };

  if (authLoading || loading) {
    return (
      <main>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Dashboard yükleniyor...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!user || user.role !== 'restaurant') {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50 page-content">
      <Header />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-700 text-white page-content">
        <div className="container-responsive py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Hoş Geldiniz, {user.displayName || 'Restoran Sahibi'}!
              </h1>
              <p className="text-blue-100">
                Bugün {new Date().toLocaleDateString('tr-TR', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                <Bell className="h-6 w-6" />
              </button>
              <button className="p-3 bg-white/10 rounded-lg hover:bg-white/20 transition-colors">
                <Settings className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <div className="container-responsive py-8">
        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Toplam Sipariş */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Sipariş</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalOrders}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+12%</span>
                </div>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingCart className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Toplam Gelir */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Gelir</p>
                <p className="text-2xl font-bold text-gray-900">₺{stats.totalRevenue.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+8%</span>
                </div>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* Ortalama Puan */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Ortalama Puan</p>
                <p className="text-2xl font-bold text-gray-900">{stats.averageRating.toFixed(1)}</p>
                <div className="flex items-center mt-2">
                  <Star className="h-4 w-4 text-yellow-500 mr-1" />
                  <span className="text-sm text-gray-600">5 üzerinden</span>
                </div>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Star className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Aktif Ürünler */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Aktif Ürünler</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeProducts}</p>
                <div className="flex items-center mt-2">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">Menüde</span>
                </div>
              </div>
              <div className="p-3 bg-purple-100 rounded-lg">
                <UtensilsCrossed className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* Stok Durumu */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stok Durumu</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalInventoryItems}</p>
                <div className="flex items-center mt-2">
                  {stats.lowStockItems > 0 ? (
                    <>
                      <AlertCircle className="h-4 w-4 text-orange-500 mr-1" />
                      <span className="text-sm text-orange-600">{stats.lowStockItems} düşük</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-sm text-green-600">Normal</span>
                    </>
                  )}
                </div>
              </div>
              <div className="p-3 bg-orange-100 rounded-lg">
                <Warehouse className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Son Siparişler */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Son Siparişler</h2>
                  <Link 
                    href="/restaurant/orders" 
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                  >
                    Tümünü Gör
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
              
              <div className="p-6">
                {recentOrders.length > 0 ? (
                  <div className="space-y-4">
                    {recentOrders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-blue-100 rounded-lg">
                            <Receipt className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{order.customerName}</p>
                            <p className="text-sm text-gray-600">{order.orderNumber}</p>
                            <p className="text-xs text-gray-500">
                              {order.createdAt?.toDate?.()?.toLocaleString('tr-TR') || 'Yeni'}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-gray-900">₺{order.total}</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Henüz sipariş yok</p>
                    <p className="text-sm text-gray-500">İlk siparişinizi bekliyoruz!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Hızlı Erişim */}
          <div className="space-y-6">
            {/* Hızlı Erişim Menüsü */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı Erişim</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <Link 
                  href="/restaurant/menu"
                  className="p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors text-center"
                >
                  <Menu className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-blue-900">Menü Yönetimi</p>
                </Link>
                
                <Link 
                  href="/restaurant/orders"
                  className="p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors text-center"
                >
                  <ShoppingCart className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-900">Siparişler</p>
                </Link>
                
                <Link 
                  href="/restaurant/inventory"
                  className="p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors text-center"
                >
                  <Warehouse className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-orange-900">Stok Yönetimi</p>
                </Link>
                
                <Link 
                  href="/restaurant/inventory/scan"
                  className="p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors text-center"
                >
                  <Scan className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-purple-900">Barkod Tara</p>
                </Link>
                
                <Link 
                  href="/restaurant/analytics"
                  className="p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors text-center"
                >
                  <BarChart3 className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-indigo-900">Analitik</p>
                </Link>
                
                <Link 
                  href="/restaurant/settings"
                  className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-center"
                >
                  <Settings className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900">Ayarlar</p>
                </Link>
              </div>
            </div>

            {/* Sipariş Durumu Özeti */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sipariş Durumu</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Bekleyen</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats.pendingOrders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">Tamamlanan</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats.completedOrders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-sm text-gray-600">İptal Edilen</span>
                  </div>
                  <span className="font-semibold text-gray-900">{stats.cancelledOrders}</span>
                </div>
              </div>
            </div>

            {/* En Çok Satan Ürünler */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">En Çok Satan</h3>
              <div className="space-y-3">
                {topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-gray-100">
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.sales} satış</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-gray-900">₺{product.revenue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Alt Bilgi Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {/* Restoran Bilgileri */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Restoran Bilgileri</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Konum bilgisi</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">İletişim numarası</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">E-posta adresi</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">Web sitesi</span>
              </div>
            </div>
          </div>

          {/* Performans Özeti */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Performans Özeti</h3>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Bu Hafta</span>
                  <span className="text-sm font-medium text-gray-900">₺{stats.weekRevenue.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-600">Bu Ay</span>
                  <span className="text-sm font-medium text-gray-900">₺{stats.monthRevenue.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Hızlı Aksiyonlar */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Hızlı Aksiyonlar</h3>
            <div className="space-y-3">
              <Link 
                href="/restaurant/menu/add"
                className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <Plus className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">Yeni Ürün Ekle</span>
              </Link>
              <Link 
                href="/restaurant/inventory/scan"
                className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors"
              >
                <Scan className="h-5 w-5 text-orange-600" />
                <span className="text-sm font-medium text-orange-900">Barkod Tara</span>
              </Link>
              <Link 
                href="/restaurant/inventory/add"
                className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Barcode className="h-5 w-5 text-purple-600" />
                <span className="text-sm font-medium text-purple-900">Stok Ekle</span>
              </Link>
              <Link 
                href="/restaurant/settings"
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Edit3 className="h-5 w-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">Bilgileri Düzenle</span>
              </Link>
              <Link 
                href="/restaurant/analytics"
                className="flex items-center gap-3 p-3 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                <BarChart3 className="h-5 w-5 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-900">Raporları Görüntüle</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 