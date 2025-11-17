import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  doc,
  getDoc,
  Timestamp,
  QuerySnapshot,
  DocumentData,
  Query
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Tip tanımlamaları
export interface User {
  id: string;
  email: string;
  displayName?: string;
  phoneNumber?: string;
  createdAt: Timestamp;
  lastLoginAt: Timestamp;
  isActive: boolean;
  role: 'user' | 'admin' | 'restaurant';
  profileImage?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  cuisine: string;
  rating: number;
  reviewCount: number;
  isActive: boolean;
  isApproved: boolean;
  createdAt: Timestamp;
  ownerId: string;
  imageUrl?: string;
  deliveryFee: number;
  minimumOrder: number;
  deliveryTime: string;
  
  // Bildirim ayarları
  notifications?: {
    telegram?: {
      chatId?: string; // Telegram Chat ID
      isEnabled: boolean; // Telegram bildirimi aktif mi
      setupToken?: string; // Setup için geçici token
      setupAt?: Timestamp; // Kurulum tarihi
    };
    whatsapp?: {
      phoneNumber?: string; // WhatsApp telefon numarası
      isEnabled: boolean; // WhatsApp bildirimi aktif mi
    };
    email?: {
      isEnabled: boolean; // E-posta bildirimi aktif mi
    };
  };
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  restaurantId: string;
  isActive: boolean;
  isAvailable: boolean;
  imageUrl?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  rating: number;
  reviewCount: number;
  preparationTime: number;
}

export interface Order {
  id: string;
  userId: string;
  restaurantId: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'delivering' | 'completed' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'online';
  paymentStatus: 'pending' | 'paid' | 'failed';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  deliveryAddress: string;
  deliveryFee: number;
  estimatedDeliveryTime?: Timestamp;
}

export interface Advertisement {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  targetUrl: string;
  isActive: boolean;
  startDate: Timestamp;
  endDate: Timestamp;
  impressions: number;
  clicks: number;
  budget: number;
  spent: number;
  createdAt: Timestamp;
}

export interface Complaint {
  id: string;
  userId: string;
  orderId?: string;
  restaurantId?: string;
  subject: string;
  description: string;
  status: 'new' | 'processing' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: Timestamp;
  updatedAt: Timestamp;
  assignedTo?: string;
}

export interface CategoryAnalytics {
  category: string;
  count: number;
  percentage: number;
  revenue: number;
  orders: number;
  averageOrderValue: number;
}

export interface UserActivityData {
  date: string;
  newUsers: number;
  activeUsers: number;
  totalUsers: number;
}

export interface TopProduct {
  name: string;
  sales: number;
  orders: number;
  revenue: number;
  category: string;
}

// Kullanıcı verilerini çekme
export const getUsers = async (filters?: {
  status?: 'active' | 'inactive' | 'all';
  role?: 'user' | 'admin' | 'restaurant';
  limit?: number;
}): Promise<User[]> => {
  try {
    let q: Query<DocumentData> = collection(db, 'users');

    if (filters?.status && filters.status !== 'all') {
      q = query(q, where('isActive', '==', filters.status === 'active'));
    }

    if (filters?.role) {
      q = query(q, where('role', '==', filters.role));
    }

    if (filters?.limit) {
      q = query(q, limit(filters.limit));
    }

    q = query(q, orderBy('createdAt', 'desc'));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as User[];
  } catch (error) {
    console.error('Error fetching users:', error);
    throw error;
  }
};

// Restoran verilerini çekme
export const getRestaurants = async (filters?: {
  status?: 'active' | 'inactive' | 'all';
  approval?: 'approved' | 'pending' | 'rejected' | 'all';
  limit?: number;
}): Promise<Restaurant[]> => {
  try {
    let q: Query<DocumentData> = collection(db, 'restaurants');

    if (filters?.status && filters.status !== 'all') {
      q = query(q, where('isActive', '==', filters.status === 'active'));
    }

    if (filters?.approval && filters.approval !== 'all') {
      q = query(q, where('isApproved', '==', filters.approval === 'approved'));
    }

    if (filters?.limit) {
      q = query(q, limit(filters.limit));
    }

    q = query(q, orderBy('createdAt', 'desc'));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Restaurant[];
  } catch (error) {
    console.error('Error fetching restaurants:', error);
    throw error;
  }
};

// Ürün verilerini çekme
export const getProducts = async (filters?: {
  status?: 'active' | 'inactive' | 'all';
  category?: string;
  restaurantId?: string;
  limit?: number;
}): Promise<Product[]> => {
  try {
    let q: Query<DocumentData> = collection(db, 'products');

    if (filters?.status && filters.status !== 'all') {
      q = query(q, where('isActive', '==', filters.status === 'active'));
    }

    if (filters?.category) {
      q = query(q, where('category', '==', filters.category));
    }

    if (filters?.restaurantId) {
      q = query(q, where('restaurantId', '==', filters.restaurantId));
    }

    if (filters?.limit) {
      q = query(q, limit(filters.limit));
    }

    q = query(q, orderBy('createdAt', 'desc'));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Product[];
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Sipariş verilerini çekme
export const getOrders = async (filters?: {
  status?: Order['status'];
  limit?: number;
  startDate?: Date;
  endDate?: Date;
}): Promise<Order[]> => {
  try {
    let q: Query<DocumentData> = collection(db, 'orders');

    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }

    if (filters?.startDate) {
      q = query(q, where('createdAt', '>=', Timestamp.fromDate(filters.startDate)));
    }

    if (filters?.endDate) {
      q = query(q, where('createdAt', '<=', Timestamp.fromDate(filters.endDate)));
    }

    if (filters?.limit) {
      q = query(q, limit(filters.limit));
    }

    q = query(q, orderBy('createdAt', 'desc'));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Reklam verilerini çekme
export const getAdvertisements = async (filters?: {
  status?: 'active' | 'inactive' | 'all';
  limit?: number;
}): Promise<Advertisement[]> => {
  try {
    let q: Query<DocumentData> = collection(db, 'advertisements');

    if (filters?.status && filters.status !== 'all') {
      q = query(q, where('isActive', '==', filters.status === 'active'));
    }

    if (filters?.limit) {
      q = query(q, limit(filters.limit));
    }

    q = query(q, orderBy('createdAt', 'desc'));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Advertisement[];
  } catch (error) {
    console.error('Error fetching advertisements:', error);
    throw error;
  }
};

// Şikayet verilerini çekme
export const getComplaints = async (filters?: {
  status?: Complaint['status'];
  priority?: Complaint['priority'];
  limit?: number;
}): Promise<Complaint[]> => {
  try {
    let q: Query<DocumentData> = collection(db, 'complaints');

    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }

    if (filters?.priority) {
      q = query(q, where('priority', '==', filters.priority));
    }

    if (filters?.limit) {
      q = query(q, limit(filters.limit));
    }

    q = query(q, orderBy('createdAt', 'desc'));

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Complaint[];
  } catch (error) {
    console.error('Error fetching complaints:', error);
    throw error;
  }
};

// İstatistik verilerini çekme
export const getDashboardStats = async () => {
  try {
    const [
      usersSnapshot,
      restaurantsSnapshot,
      productsSnapshot,
      ordersSnapshot,
      adsSnapshot,
      complaintsSnapshot
    ] = await Promise.all([
      getDocs(collection(db, 'users')),
      getDocs(collection(db, 'restaurants')),
      getDocs(collection(db, 'products')),
      getDocs(collection(db, 'orders')),
      getDocs(collection(db, 'advertisements')),
      getDocs(collection(db, 'complaints'))
    ]);

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Son 30 günde oluşturulan kayıtları filtrele
    const recentUsers = usersSnapshot.docs.filter(doc => {
      const data = doc.data();
      return data.createdAt?.toDate() >= thirtyDaysAgo;
    });

    const recentOrders = ordersSnapshot.docs.filter(doc => {
      const data = doc.data();
      return data.createdAt?.toDate() >= thirtyDaysAgo;
    });

    // Toplam gelir hesapla
    const totalRevenue = ordersSnapshot.docs.reduce((sum, doc) => {
      const data = doc.data();
      return sum + (data.totalAmount || 0);
    }, 0);

    // Aktif kullanıcı sayısı (son 30 günde giriş yapan)
    const activeUsers = usersSnapshot.docs.filter(doc => {
      const data = doc.data();
      return data.lastLoginAt?.toDate() >= thirtyDaysAgo;
    });

    return {
      totalUsers: usersSnapshot.size,
      totalRestaurants: restaurantsSnapshot.size,
      totalProducts: productsSnapshot.size,
      totalOrders: ordersSnapshot.size,
      totalRevenue,
      totalAdvertisements: adsSnapshot.size,
      totalComplaints: complaintsSnapshot.size,
      newUsers: recentUsers.length,
      newOrders: recentOrders.length,
      activeUsers: activeUsers.length,
      activeRestaurants: restaurantsSnapshot.docs.filter(doc => doc.data().isActive).length,
      activeProducts: productsSnapshot.docs.filter(doc => doc.data().isActive).length
    };
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    throw error;
  }
};

// Satış analizi verilerini çekme
export const getSalesAnalytics = async (timeRange: '7d' | '30d' | '90d' | '1y' = '30d') => {
  try {
    const now = new Date();
    let startDate: Date;

    switch (timeRange) {
      case '7d':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    }

    const q = query(
      collection(db, 'orders'),
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Order[];

    // Günlük satış verilerini grupla
    const dailySales = orders.reduce((acc, order) => {
      const date = order.createdAt.toDate().toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { sales: 0, orders: 0 };
      }
      acc[date].sales += order.totalAmount;
      acc[date].orders += 1;
      return acc;
    }, {} as Record<string, { sales: number; orders: number }>);

    // Toplam istatistikler
    const totalSales = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const totalOrders = orders.length;
    const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

    return {
      totalSales,
      totalOrders,
      averageOrderValue,
      dailySales: Object.entries(dailySales).map(([date, data]) => ({
        date,
        sales: data.sales,
        orders: data.orders
      })).sort((a, b) => a.date.localeCompare(b.date))
    };
  } catch (error) {
    console.error('Error fetching sales analytics:', error);
    throw error;
  }
};

export const getCategoryAnalytics = async (timeRange: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<CategoryAnalytics[]> => {
  try {
    const startDate = new Date();
    switch (timeRange) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const ordersQuery = query(
      collection(db, 'orders'),
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      where('status', 'in', ['completed', 'delivered'])
    );

    const ordersSnapshot = await getDocs(ordersQuery);
    const orders = ordersSnapshot.docs.map(doc => doc.data());

    // Kategori bazında analiz
    const categoryStats: { [key: string]: { revenue: number; orders: number; count: number } } = {};
    let totalRevenue = 0;
    let totalOrders = 0;

    for (const order of orders) {
      if (order.items && Array.isArray(order.items)) {
        for (const item of order.items) {
          const category = item.category || 'Diğer';
          const itemTotal = (item.price || 0) * (item.quantity || 1);

          if (!categoryStats[category]) {
            categoryStats[category] = { revenue: 0, orders: 0, count: 0 };
          }

          categoryStats[category].revenue += itemTotal;
          categoryStats[category].count += item.quantity || 1;
          totalRevenue += itemTotal;
        }
        totalOrders++;
      }
    }

    // Her kategori için sipariş sayısını hesapla
    for (const category in categoryStats) {
      categoryStats[category].orders = Math.ceil(categoryStats[category].revenue / 50); // Ortalama sipariş değeri
    }

    const result: CategoryAnalytics[] = Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      count: stats.count,
      percentage: totalRevenue > 0 ? (stats.revenue / totalRevenue) * 100 : 0,
      revenue: stats.revenue,
      orders: stats.orders,
      averageOrderValue: stats.orders > 0 ? stats.revenue / stats.orders : 0
    }));

    return result.sort((a, b) => b.revenue - a.revenue);
  } catch (error) {
    console.error('Error fetching category analytics:', error);
    return [];
  }
};

export const getUserActivityAnalytics = async (timeRange: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<UserActivityData[]> => {
  try {
    const startDate = new Date();
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365;
    startDate.setDate(startDate.getDate() - days);

    const usersQuery = query(
      collection(db, 'users'),
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      orderBy('createdAt', 'asc')
    );

    const usersSnapshot = await getDocs(usersQuery);
    const users = usersSnapshot.docs.map(doc => doc.data());

    // Günlük veri oluştur
    const dailyData: { [key: string]: { newUsers: number; activeUsers: number; totalUsers: number } } = {};

    // Son 7 gün için örnek veri (gerçek uygulamada bu veriler ayrı collection'lardan gelecek)
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      dailyData[dateStr] = {
        newUsers: Math.floor(Math.random() * 30) + 5,
        activeUsers: Math.floor(Math.random() * 100) + 30,
        totalUsers: 15000 + Math.floor(Math.random() * 1000)
      };
    }

    const result: UserActivityData[] = Object.entries(dailyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        newUsers: data.newUsers,
        activeUsers: data.activeUsers,
        totalUsers: data.totalUsers
      }));

    return result;
  } catch (error) {
    console.error('Error fetching user activity analytics:', error);
    return [];
  }
};

export const getTopProducts = async (timeRange: '7d' | '30d' | '90d' | '1y' = '30d', limit: number = 10): Promise<TopProduct[]> => {
  try {
    const startDate = new Date();
    switch (timeRange) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const ordersQuery = query(
      collection(db, 'orders'),
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      where('status', 'in', ['completed', 'delivered'])
    );

    const ordersSnapshot = await getDocs(ordersQuery);
    const orders = ordersSnapshot.docs.map(doc => doc.data());

    // Ürün bazında analiz
    const productStats: { [key: string]: { sales: number; orders: number; revenue: number; category: string } } = {};

    for (const order of orders) {
      if (order.items && Array.isArray(order.items)) {
        for (const item of order.items) {
          const productId = item.productId || item.name;
          const itemTotal = (item.price || 0) * (item.quantity || 1);

          if (!productStats[productId]) {
            productStats[productId] = {
              sales: 0,
              orders: 0,
              revenue: 0,
              category: item.category || 'Diğer'
            };
          }

          productStats[productId].sales += item.quantity || 1;
          productStats[productId].revenue += itemTotal;
        }
      }
    }

    // Her ürün için sipariş sayısını hesapla
    for (const productId in productStats) {
      productStats[productId].orders = Math.ceil(productStats[productId].revenue / 50);
    }

    const result: TopProduct[] = Object.entries(productStats).map(([name, stats]) => ({
      name,
      sales: stats.sales,
      orders: stats.orders,
      revenue: stats.revenue,
      category: stats.category
    }));

    return result
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  } catch (error) {
    console.error('Error fetching top products:', error);
    return [];
  }
};

export const getEnhancedSalesAnalytics = async (timeRange: '7d' | '30d' | '90d' | '1y' = '30d') => {
  try {
    const [salesAnalytics, categoryAnalytics, topProducts, userActivity] = await Promise.all([
      getSalesAnalytics(timeRange),
      getCategoryAnalytics(timeRange),
      getTopProducts(timeRange, 5),
      getUserActivityAnalytics(timeRange)
    ]);

    return {
      ...salesAnalytics,
      categoryAnalytics,
      topProducts,
      userActivity
    };
  } catch (error) {
    console.error('Error fetching enhanced sales analytics:', error);
    return {
      totalSales: 0,
      totalOrders: 0,
      averageOrderValue: 0,
      dailySales: [],
      categoryAnalytics: [],
      topProducts: [],
      userActivity: []
    };
  }
}; 