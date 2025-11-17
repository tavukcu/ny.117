import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  orderBy,
  limit,
  Timestamp,
  arrayUnion,
  arrayRemove,
  increment
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { 
  User, 
  UserPreferences, 
  DietaryPreferences, 
  UserStats, 
  UserSocial,
  UserAddress,
  UserPaymentMethod,
  UserOrderHistory,
  Order,
  Review
} from '@/types';

export class UserProfileService {
  
  // Kullanıcı profilini getir
  static async getUserProfile(uid: string): Promise<User | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        
        // Eksik stats alanlarını varsayılan değerlerle doldur
        if (!userData.stats) {
          userData.stats = this.getDefaultStats();
        } else {
          // Eksik alt alanları kontrol et ve doldur
          const defaultStats = this.getDefaultStats();
          userData.stats = {
            ...defaultStats,
            ...userData.stats,
            favorites: {
              ...defaultStats.favorites,
              ...userData.stats.favorites
            },
            activity: {
              ...defaultStats.activity,
              ...userData.stats.activity
            },
            orders: {
              ...defaultStats.orders,
              ...userData.stats.orders
            },
            reviews: {
              ...defaultStats.reviews,
              ...userData.stats.reviews
            },
            loyalty: {
              ...defaultStats.loyalty,
              ...userData.stats.loyalty
            },
            nutrition: {
              ...defaultStats.nutrition,
              ...userData.stats.nutrition
            }
          };
        }
        
        return userData;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }

  // Varsayılan kullanıcı istatistikleri
  private static getDefaultStats(): UserStats {
    return {
      orders: {
        total: 0,
        completed: 0,
        cancelled: 0,
        totalSpent: 0,
        averageOrderValue: 0
      },
      favorites: {
        restaurants: [],
        products: [],
        categories: []
      },
      reviews: {
        total: 0,
        averageRating: 0,
        helpfulCount: 0
      },
      loyalty: {
        points: 0,
        tier: 'bronze',
        nextTierPoints: 100,
        totalEarned: 0,
        totalRedeemed: 0
      },
      activity: {
        joinDate: new Date(),
        lastActive: new Date(),
        totalSessions: 0,
        averageSessionDuration: 0,
        favoriteOrderTime: "18:00-20:00",
        favoriteOrderDay: "Friday"
      },
      nutrition: {
        totalCaloriesConsumed: 0,
        averageCaloriesPerOrder: 0,
        favoriteCuisine: "",
        mostOrderedCategory: "",
        nutritionScoreAverage: 0,
        dietaryCompliance: 0
      }
    };
  }

  // Kullanıcı profilini güncelle
  static async updateUserProfile(uid: string, updates: Partial<User>): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Temel profil bilgilerini güncelle
  static async updateBasicProfile(uid: string, profile: User['profile']): Promise<void> {
    await this.updateUserProfile(uid, { profile });
  }

  // Kullanıcı tercihlerini güncelle
  static async updatePreferences(uid: string, preferences: UserPreferences): Promise<void> {
    await this.updateUserProfile(uid, { preferences });
  }

  // Beslenme tercihlerini güncelle
  static async updateDietaryPreferences(uid: string, dietaryPreferences: DietaryPreferences): Promise<void> {
    await this.updateUserProfile(uid, { dietaryPreferences });
  }

  // Adres ekle
  static async addAddress(uid: string, address: Omit<UserAddress, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const addressId = `addr_${Date.now()}`;
      const newAddress: UserAddress = {
        ...address,
        id: addressId,
        createdAt: Timestamp.now() as any,
        updatedAt: Timestamp.now() as any
      };

      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        addresses: arrayUnion(newAddress),
        updatedAt: Timestamp.now()
      });

      return addressId;
    } catch (error) {
      console.error('Error adding address:', error);
      throw error;
    }
  }

  // Adres güncelle
  static async updateAddress(uid: string, addressId: string, updates: Partial<UserAddress>): Promise<void> {
    try {
      const user = await this.getUserProfile(uid);
      if (!user) throw new Error('User not found');

      const updatedAddresses = user.addresses.map(addr => 
        addr.id === addressId 
          ? { ...addr, ...updates, updatedAt: Timestamp.now() as any }
          : addr
      );

      await this.updateUserProfile(uid, { addresses: updatedAddresses });
    } catch (error) {
      console.error('Error updating address:', error);
      throw error;
    }
  }

  // Adres sil
  static async removeAddress(uid: string, addressId: string): Promise<void> {
    try {
      const user = await this.getUserProfile(uid);
      if (!user) throw new Error('User not found');

      const updatedAddresses = user.addresses.filter(addr => addr.id !== addressId);
      await this.updateUserProfile(uid, { addresses: updatedAddresses });
    } catch (error) {
      console.error('Error removing address:', error);
      throw error;
    }
  }

  // Ödeme yöntemi ekle
  static async addPaymentMethod(uid: string, paymentMethod: Omit<UserPaymentMethod, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const paymentId = `pay_${Date.now()}`;
      const newPaymentMethod: UserPaymentMethod = {
        ...paymentMethod,
        id: paymentId,
        createdAt: Timestamp.now() as any,
        updatedAt: Timestamp.now() as any
      };

      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        paymentMethods: arrayUnion(newPaymentMethod),
        updatedAt: Timestamp.now()
      });

      return paymentId;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }

  // Ödeme yöntemi güncelle
  static async updatePaymentMethod(uid: string, paymentId: string, updates: Partial<UserPaymentMethod>): Promise<void> {
    try {
      const user = await this.getUserProfile(uid);
      if (!user) throw new Error('User not found');

      const updatedPaymentMethods = user.paymentMethods.map(pay => 
        pay.id === paymentId 
          ? { ...pay, ...updates, updatedAt: Timestamp.now() as any }
          : pay
      );

      await this.updateUserProfile(uid, { paymentMethods: updatedPaymentMethods });
    } catch (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
  }

  // Ödeme yöntemi sil
  static async removePaymentMethod(uid: string, paymentId: string): Promise<void> {
    try {
      const user = await this.getUserProfile(uid);
      if (!user) throw new Error('User not found');

      const updatedPaymentMethods = user.paymentMethods.filter(pay => pay.id !== paymentId);
      await this.updateUserProfile(uid, { paymentMethods: updatedPaymentMethods });
    } catch (error) {
      console.error('Error removing payment method:', error);
      throw error;
    }
  }

  // Kullanıcı istatistiklerini güncelle
  static async updateUserStats(uid: string, updates: Partial<UserStats>): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      const updateData: any = { updatedAt: Timestamp.now() };
      
      // Nested object güncellemeleri için
      Object.entries(updates).forEach(([key, value]) => {
        if (typeof value === 'object' && value !== null) {
          Object.entries(value).forEach(([subKey, subValue]) => {
            updateData[`stats.${key}.${subKey}`] = subValue;
          });
        } else {
          updateData[`stats.${key}`] = value;
        }
      });

      await updateDoc(userRef, updateData);
    } catch (error) {
      console.error('Error updating user stats:', error);
      throw error;
    }
  }

  // Sipariş sonrası istatistikleri güncelle
  static async updateStatsAfterOrder(uid: string, order: Order): Promise<void> {
    try {
      const user = await this.getUserProfile(uid);
      if (!user) throw new Error('User not found');

      const stats = user.stats;
      const newStats: Partial<UserStats> = {
        orders: {
          ...stats.orders,
          total: stats.orders.total + 1,
          totalSpent: stats.orders.totalSpent + order.total,
          averageOrderValue: (stats.orders.totalSpent + order.total) / (stats.orders.total + 1),
          lastOrderDate: Timestamp.now() as any
        }
      };

      // Favori restoranları güncelle
      const restaurantId = order.restaurantId;
      if (!stats.favorites.restaurants.includes(restaurantId)) {
        newStats.favorites = {
          ...stats.favorites,
          restaurants: [...stats.favorites.restaurants, restaurantId]
        };
      }

      await this.updateUserStats(uid, newStats);
    } catch (error) {
      console.error('Error updating stats after order:', error);
      throw error;
    }
  }

  // Kullanıcının sipariş geçmişini getir
  static async getUserOrderHistory(uid: string, limitCount: number = 10): Promise<UserOrderHistory> {
    try {
      const ordersQuery = query(
        collection(db, 'orders'),
        where('userId', '==', uid),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const ordersSnapshot = await getDocs(ordersQuery);
      const orders = ordersSnapshot.docs.map(doc => doc.data() as Order);

      // Son siparişler
      const recent = orders.slice(0, 5).map(order => ({
        orderId: order.id,
        restaurantName: order.restaurant.name,
        total: order.total,
        status: order.status,
        orderDate: order.createdAt,
        items: order.items.map(item => ({
          name: item.product.name,
          quantity: item.quantity
        }))
      }));

      // Favori restoranlar
      const restaurantCounts = orders.reduce((acc, order) => {
        acc[order.restaurantId] = (acc[order.restaurantId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const favorites = Object.entries(restaurantCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .map(([restaurantId, count]) => {
          const order = orders.find(o => o.restaurantId === restaurantId);
          return {
            restaurantId,
            restaurantName: order?.restaurant.name || '',
            orderCount: count,
            lastOrderDate: order?.createdAt || Timestamp.now() as any,
            averageRating: 4.5 // Bu değer review sisteminden alınabilir
          };
        });

      // İstatistikler
      const statistics = {
        totalOrders: orders.length,
        totalSpent: orders.reduce((sum, order) => sum + order.total, 0),
        averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.total, 0) / orders.length : 0,
        mostOrderedDay: this.getMostOrderedDay(orders),
        mostOrderedTime: this.getMostOrderedTime(orders),
        favoriteCuisine: this.getFavoriteCuisine(orders)
      };

      return { recent, favorites, statistics };
    } catch (error) {
      console.error('Error fetching user order history:', error);
      throw error;
    }
  }

  // Sosyal özellikler
  static async followUser(followerId: string, followingId: string): Promise<void> {
    try {
      const followerRef = doc(db, 'users', followerId);
      const followingRef = doc(db, 'users', followingId);

      await updateDoc(followerRef, {
        'social.following': arrayUnion(followingId),
        updatedAt: Timestamp.now()
      });

      await updateDoc(followingRef, {
        'social.followers': arrayUnion(followerId),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  }

  static async unfollowUser(followerId: string, followingId: string): Promise<void> {
    try {
      const followerRef = doc(db, 'users', followerId);
      const followingRef = doc(db, 'users', followingId);

      await updateDoc(followerRef, {
        'social.following': arrayRemove(followingId),
        updatedAt: Timestamp.now()
      });

      await updateDoc(followingRef, {
        'social.followers': arrayRemove(followerId),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  }

  // Arkadaşlık isteği gönder
  static async sendFriendRequest(senderId: string, receiverId: string): Promise<void> {
    try {
      const senderRef = doc(db, 'users', senderId);
      const receiverRef = doc(db, 'users', receiverId);

      await updateDoc(senderRef, {
        'social.friendRequests.sent': arrayUnion(receiverId),
        updatedAt: Timestamp.now()
      });

      await updateDoc(receiverRef, {
        'social.friendRequests.received': arrayUnion(senderId),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error sending friend request:', error);
      throw error;
    }
  }

  // Arkadaşlık isteğini kabul et
  static async acceptFriendRequest(userId: string, friendId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const friendRef = doc(db, 'users', friendId);

      await updateDoc(userRef, {
        'social.friends': arrayUnion(friendId),
        'social.friendRequests.received': arrayRemove(friendId),
        updatedAt: Timestamp.now()
      });

      await updateDoc(friendRef, {
        'social.friends': arrayUnion(userId),
        'social.friendRequests.sent': arrayRemove(userId),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error accepting friend request:', error);
      throw error;
    }
  }

  // Arkadaşlık isteğini reddet
  static async rejectFriendRequest(userId: string, friendId: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', userId);
      const friendRef = doc(db, 'users', friendId);

      await updateDoc(userRef, {
        'social.friendRequests.received': arrayRemove(friendId),
        updatedAt: Timestamp.now()
      });

      await updateDoc(friendRef, {
        'social.friendRequests.sent': arrayRemove(userId),
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error rejecting friend request:', error);
      throw error;
    }
  }

  // Kullanıcı arama
  static async searchUsers(searchQuery: string, limitCount: number = 10): Promise<User[]> {
    try {
      // Firestore'da tam metin araması olmadığı için
      // displayName ve email'de arama yapıyoruz
      const usersQuery = query(
        collection(db, 'users'),
        where('displayName', '>=', searchQuery),
        where('displayName', '<=', searchQuery + '\uf8ff'),
        limit(limitCount)
      );

      const snapshot = await getDocs(usersQuery);
      return snapshot.docs.map(doc => doc.data() as User);
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  // Kullanıcı hesabını sil
  static async deleteUserAccount(uid: string): Promise<void> {
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, {
        accountStatus: 'deleted',
        isActive: false,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error deleting user account:', error);
      throw error;
    }
  }

  // Güvenlik ayarlarını güncelle
  static async updateSecuritySettings(uid: string, security: User['security']): Promise<void> {
    await this.updateUserProfile(uid, { security });
  }

  // Yardımcı fonksiyonlar
  private static getMostOrderedDay(orders: Order[]): string {
    const dayCounts = orders.reduce((acc, order) => {
      const day = new Date(order.createdAt).toLocaleDateString('tr-TR', { weekday: 'long' });
      acc[day] = (acc[day] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(dayCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Pazartesi';
  }

  private static getMostOrderedTime(orders: Order[]): string {
    const timeCounts = orders.reduce((acc, order) => {
      const hour = new Date(order.createdAt).getHours();
      const timeSlot = hour < 12 ? 'Sabah' : hour < 18 ? 'Öğle' : 'Akşam';
      acc[timeSlot] = (acc[timeSlot] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(timeCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Akşam';
  }

  private static getFavoriteCuisine(orders: Order[]): string {
    const cuisineCounts = orders.reduce((acc, order) => {
      const cuisine = order.restaurant.categoryIds[0] || 'Genel';
      acc[cuisine] = (acc[cuisine] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(cuisineCounts)
      .sort(([,a], [,b]) => b - a)[0]?.[0] || 'Genel';
  }
} 