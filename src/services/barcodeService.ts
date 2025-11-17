import { db } from '@/lib/firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';
import { 
  BarcodeProduct, 
  InventoryItem, 
  StockTransaction, 
  BarcodeScanResult,
  StockAlert,
  Supplier,
  RestockOrder,
  RestockOrderItem
} from '@/types';

export class BarcodeService {
  // Barkod ile ürün arama
  static async scanBarcode(barcode: string, restaurantId: string): Promise<BarcodeScanResult> {
    try {
      console.log('🔍 Barkod taranıyor:', barcode);
      
      // Önce ürünü bul
      const productsRef = collection(db, 'barcodeProducts');
      const productQuery = query(productsRef, where('barcode', '==', barcode));
      const productSnapshot = await getDocs(productQuery);
      
      if (productSnapshot.empty) {
        return {
          barcode,
          found: false,
          error: 'Ürün bulunamadı'
        };
      }
      
      const productDoc = productSnapshot.docs[0];
      const product: BarcodeProduct = {
        id: productDoc.id,
        ...productDoc.data()
      } as BarcodeProduct;
      
      // Stok bilgisini kontrol et
      const inventoryRef = collection(db, 'restaurants', restaurantId, 'inventory');
      const inventoryQuery = query(inventoryRef, where('barcode', '==', barcode));
      const inventorySnapshot = await getDocs(inventoryQuery);
      
      let inventoryItem: InventoryItem | undefined;
      
      if (!inventorySnapshot.empty) {
        const inventoryDoc = inventorySnapshot.docs[0];
        inventoryItem = {
          id: inventoryDoc.id,
          ...inventoryDoc.data()
        } as InventoryItem;
      }
      
      console.log('✅ Barkod tarama sonucu:', { product, inventoryItem });
      
      return {
        barcode,
        product,
        inventoryItem,
        found: true
      };
      
    } catch (error) {
      console.error('❌ Barkod tarama hatası:', error);
      return {
        barcode,
        found: false,
        error: 'Barkod tarama hatası'
      };
    }
  }

  // Yeni ürün ekleme
  static async addProduct(product: Omit<BarcodeProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    try {
      const productsRef = collection(db, 'barcodeProducts');
      const newProduct = {
        ...product,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(productsRef, newProduct);
      console.log('✅ Yeni ürün eklendi:', docRef.id);
      
      return docRef.id;
    } catch (error) {
      console.error('❌ Ürün ekleme hatası:', error);
      throw error;
    }
  }

  // Stok ekleme/güncelleme
  static async updateInventory(
    restaurantId: string, 
    barcode: string, 
    quantity: number, 
    userId: string,
    reason: string = 'RESTOCK'
  ): Promise<void> {
    try {
      console.log('📦 Stok güncelleniyor:', { restaurantId, barcode, quantity });
      
      // Stok kaydını bul veya oluştur
      const inventoryRef = collection(db, 'restaurants', restaurantId, 'inventory');
      const inventoryQuery = query(inventoryRef, where('barcode', '==', barcode));
      const inventorySnapshot = await getDocs(inventoryQuery);
      
      let inventoryItem: InventoryItem;
      let isNew = false;
      
      if (inventorySnapshot.empty) {
        // Yeni stok kaydı oluştur
        const product = await this.scanBarcode(barcode, restaurantId);
        if (!product.product) {
          throw new Error('Ürün bulunamadı');
        }
        
        inventoryItem = {
          id: '',
          productId: product.product.id,
          barcode,
          restaurantId,
          quantity: 0,
          minStockLevel: 10,
          maxStockLevel: 100,
          currentStock: 0,
          reservedStock: 0,
          availableStock: 0,
          lastRestocked: new Date(),
          costPrice: product.product.costPrice,
          sellingPrice: product.product.price,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        isNew = true;
      } else {
        const doc = inventorySnapshot.docs[0];
        inventoryItem = {
          id: doc.id,
          ...doc.data()
        } as InventoryItem;
      }
      
      // Stok işlemi
      const previousStock = inventoryItem.currentStock;
      const newStock = previousStock + quantity;
      
      // Stok kaydını güncelle
      const updatedInventory = {
        ...inventoryItem,
        currentStock: newStock,
        availableStock: newStock - inventoryItem.reservedStock,
        lastRestocked: new Date(),
        updatedAt: new Date()
      };
      
      if (isNew) {
        delete updatedInventory.id;
        const docRef = await addDoc(inventoryRef, updatedInventory);
        inventoryItem.id = docRef.id;
      } else {
        await updateDoc(doc(db, 'restaurants', restaurantId, 'inventory', inventoryItem.id), updatedInventory);
      }
      
      // Stok işlem kaydı
      await this.recordStockTransaction({
        inventoryItemId: inventoryItem.id,
        productId: inventoryItem.productId,
        restaurantId,
        type: quantity > 0 ? 'IN' : 'OUT',
        quantity: Math.abs(quantity),
        previousStock,
        newStock,
        reason,
        userId,
        createdAt: new Date()
      });
      
      console.log('✅ Stok güncellendi:', { previousStock, newStock });
      
    } catch (error) {
      console.error('❌ Stok güncelleme hatası:', error);
      throw error;
    }
  }

  // Stok işlem kaydı
  static async recordStockTransaction(transaction: Omit<StockTransaction, 'id'>): Promise<void> {
    try {
      const transactionsRef = collection(db, 'stockTransactions');
      await addDoc(transactionsRef, transaction);
      console.log('📝 Stok işlem kaydı oluşturuldu');
    } catch (error) {
      console.error('❌ Stok işlem kaydı hatası:', error);
      throw error;
    }
  }

  // Stok rezervasyonu (sipariş için)
  static async reserveStock(
    restaurantId: string,
    barcode: string,
    quantity: number,
    orderId: string,
    userId: string
  ): Promise<boolean> {
    try {
      const inventoryRef = collection(db, 'restaurants', restaurantId, 'inventory');
      const inventoryQuery = query(inventoryRef, where('barcode', '==', barcode));
      const inventorySnapshot = await getDocs(inventoryQuery);
      
      if (inventorySnapshot.empty) {
        throw new Error('Stok bulunamadı');
      }
      
      const doc = inventorySnapshot.docs[0];
      const inventoryItem = {
        id: doc.id,
        ...doc.data()
      } as InventoryItem;
      
      if (inventoryItem.availableStock < quantity) {
        throw new Error('Yetersiz stok');
      }
      
      const newReservedStock = inventoryItem.reservedStock + quantity;
      const newAvailableStock = inventoryItem.availableStock - quantity;
      
      await updateDoc(doc(db, 'restaurants', restaurantId, 'inventory', inventoryItem.id), {
        reservedStock: newReservedStock,
        availableStock: newAvailableStock,
        updatedAt: new Date()
      });
      
      // Rezervasyon işlemi kaydı
      await this.recordStockTransaction({
        inventoryItemId: inventoryItem.id,
        productId: inventoryItem.productId,
        restaurantId,
        type: 'RESERVED',
        quantity,
        previousStock: inventoryItem.currentStock,
        newStock: inventoryItem.currentStock,
        reason: 'ORDER_RESERVATION',
        orderId,
        userId,
        createdAt: new Date()
      });
      
      console.log('🔒 Stok rezerve edildi:', { quantity, orderId });
      return true;
      
    } catch (error) {
      console.error('❌ Stok rezervasyon hatası:', error);
      return false;
    }
  }

  // Stok serbest bırakma (sipariş iptali için)
  static async releaseStock(
    restaurantId: string,
    barcode: string,
    quantity: number,
    orderId: string,
    userId: string
  ): Promise<void> {
    try {
      const inventoryRef = collection(db, 'restaurants', restaurantId, 'inventory');
      const inventoryQuery = query(inventoryRef, where('barcode', '==', barcode));
      const inventorySnapshot = await getDocs(inventoryQuery);
      
      if (inventorySnapshot.empty) {
        throw new Error('Stok bulunamadı');
      }
      
      const doc = inventorySnapshot.docs[0];
      const inventoryItem = {
        id: doc.id,
        ...doc.data()
      } as InventoryItem;
      
      const newReservedStock = Math.max(0, inventoryItem.reservedStock - quantity);
      const newAvailableStock = inventoryItem.availableStock + quantity;
      
      await updateDoc(doc(db, 'restaurants', restaurantId, 'inventory', inventoryItem.id), {
        reservedStock: newReservedStock,
        availableStock: newAvailableStock,
        updatedAt: new Date()
      });
      
      // Serbest bırakma işlemi kaydı
      await this.recordStockTransaction({
        inventoryItemId: inventoryItem.id,
        productId: inventoryItem.productId,
        restaurantId,
        type: 'RELEASED',
        quantity,
        previousStock: inventoryItem.currentStock,
        newStock: inventoryItem.currentStock,
        reason: 'ORDER_CANCELLATION',
        orderId,
        userId,
        createdAt: new Date()
      });
      
      console.log('🔓 Stok serbest bırakıldı:', { quantity, orderId });
      
    } catch (error) {
      console.error('❌ Stok serbest bırakma hatası:', error);
      throw error;
    }
  }

  // Stok satışı (sipariş tamamlandığında)
  static async sellStock(
    restaurantId: string,
    barcode: string,
    quantity: number,
    orderId: string,
    userId: string
  ): Promise<void> {
    try {
      const inventoryRef = collection(db, 'restaurants', restaurantId, 'inventory');
      const inventoryQuery = query(inventoryRef, where('barcode', '==', barcode));
      const inventorySnapshot = await getDocs(inventoryQuery);
      
      if (inventorySnapshot.empty) {
        throw new Error('Stok bulunamadı');
      }
      
      const doc = inventorySnapshot.docs[0];
      const inventoryItem = {
        id: doc.id,
        ...doc.data()
      } as InventoryItem;
      
      if (inventoryItem.reservedStock < quantity) {
        throw new Error('Yetersiz rezerve stok');
      }
      
      const newCurrentStock = inventoryItem.currentStock - quantity;
      const newReservedStock = inventoryItem.reservedStock - quantity;
      const newAvailableStock = inventoryItem.availableStock;
      
      await updateDoc(doc(db, 'restaurants', restaurantId, 'inventory', inventoryItem.id), {
        currentStock: newCurrentStock,
        reservedStock: newReservedStock,
        updatedAt: new Date()
      });
      
      // Satış işlemi kaydı
      await this.recordStockTransaction({
        inventoryItemId: inventoryItem.id,
        productId: inventoryItem.productId,
        restaurantId,
        type: 'OUT',
        quantity,
        previousStock: inventoryItem.currentStock,
        newStock: newCurrentStock,
        reason: 'SALE',
        orderId,
        userId,
        createdAt: new Date()
      });
      
      console.log('💰 Stok satışı kaydedildi:', { quantity, orderId });
      
    } catch (error) {
      console.error('❌ Stok satış hatası:', error);
      throw error;
    }
  }

  // Stok listesi
  static async getInventory(restaurantId: string): Promise<InventoryItem[]> {
    try {
      const inventoryRef = collection(db, 'restaurants', restaurantId, 'inventory');
      const inventoryQuery = query(inventoryRef, orderBy('updatedAt', 'desc'));
      const snapshot = await getDocs(inventoryQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InventoryItem[];
    } catch (error) {
      console.error('❌ Stok listesi hatası:', error);
      throw error;
    }
  }

  // Düşük stok uyarıları
  static async checkLowStock(restaurantId: string): Promise<StockAlert[]> {
    try {
      const inventoryRef = collection(db, 'restaurants', restaurantId, 'inventory');
      const lowStockQuery = query(
        inventoryRef, 
        where('currentStock', '<=', 'minStockLevel'),
        where('isActive', '==', true)
      );
      const snapshot = await getDocs(lowStockQuery);
      
      const alerts: StockAlert[] = [];
      
      for (const doc of snapshot.docs) {
        const item = doc.data() as InventoryItem;
        
        if (item.currentStock === 0) {
          alerts.push({
            id: doc.id,
            restaurantId,
            inventoryItemId: doc.id,
            type: 'OUT_OF_STOCK',
            message: `${item.barcode} - Stok tükendi`,
            severity: 'CRITICAL',
            isRead: false,
            createdAt: new Date()
          });
        } else if (item.currentStock <= item.minStockLevel) {
          alerts.push({
            id: doc.id,
            restaurantId,
            inventoryItemId: doc.id,
            type: 'LOW_STOCK',
            message: `${item.barcode} - Düşük stok (${item.currentStock}/${item.minStockLevel})`,
            severity: 'HIGH',
            isRead: false,
            createdAt: new Date()
          });
        }
      }
      
      return alerts;
    } catch (error) {
      console.error('❌ Düşük stok kontrolü hatası:', error);
      throw error;
    }
  }

  // Barkod ile ürün arama (admin için)
  static async searchProducts(searchTerm: string): Promise<BarcodeProduct[]> {
    try {
      const productsRef = collection(db, 'barcodeProducts');
      const searchQuery = query(
        productsRef,
        where('name', '>=', searchTerm),
        where('name', '<=', searchTerm + '\uf8ff'),
        limit(20)
      );
      const snapshot = await getDocs(searchQuery);
      
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as BarcodeProduct[];
    } catch (error) {
      console.error('❌ Ürün arama hatası:', error);
      throw error;
    }
  }
} 