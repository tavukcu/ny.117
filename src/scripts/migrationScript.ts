import { initializeApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, collection, getDocs, doc, setDoc, writeBatch } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

// Eski Firebase projesi konfigürasyonu (yem30-halil)
const oldFirebaseConfig = {
  apiKey: "AIzaSyAhY94ep5kHijI6sQmYDqaHjxJ8WuLlrMU",
  authDomain: "yem30-halil.firebaseapp.com",
  databaseURL: "https://yem30-halil-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "yem30-halil",
  storageBucket: "yem30-halil.firebasestorage.app",
  messagingSenderId: "483321488725",
  appId: "1:483321488725:web:9876fc0d8f617a0c973bdc",
  measurementId: "G-YW6S5TBRGP"
};

// Yeni Firebase projesi konfigürasyonu (neyisek-6b8bc)
const newFirebaseConfig = {
  apiKey: "AIzaSyAsTexiSuSnyhK17G49Qqz_6O7pMV9f42M",
  authDomain: "neyisek-6b8bc.firebaseapp.com",
  projectId: "neyisek-6b8bc",
  storageBucket: "neyisek-6b8bc.firebasestorage.app",
  messagingSenderId: "187489868178",
  appId: "1:187489868178:web:3f2ee1ca2cabfbbfbf094b",
  measurementId: "G-N5Q8RB9N9V"
};

// Firebase uygulamalarını başlat
const oldApp = initializeApp(oldFirebaseConfig, 'old');
const newApp = initializeApp(newFirebaseConfig, 'new');

const oldDb = getFirestore(oldApp);
const newDb = getFirestore(newApp);
const newAuth = getAuth(newApp);

// Migration edilecek koleksiyonlar
const COLLECTIONS_TO_MIGRATE = [
  'users',
  'restaurants', 
  'categories',
  'products',
  'orders',
  'advertisements',
  'restaurant_applications',
  'userPresence',
  'notifications',
  'reviews',
  'complaints',
  'user_behavior',
  'financial_transactions'
];

interface MigrationResult {
  collectionName: string;
  totalDocuments: number;
  migratedDocuments: number;
  errors: string[];
  duration: number;
}

export class DataMigrationService {
  
  // Admin kimlik doğrulaması
  static async authenticateAdmin(): Promise<void> {
    try {
      console.log('🔐 Admin kimlik doğrulaması yapılıyor...');
      await signInWithEmailAndPassword(newAuth, 'kaniyedincer@gmail.com', 'admin123456');
      console.log('✅ Admin kimlik doğrulaması başarılı');
    } catch (error) {
      console.error('❌ Admin kimlik doğrulaması başarısız:', error);
      throw error;
    }
  }
  
  // Tek koleksiyonu migrate et
  static async migrateCollection(collectionName: string): Promise<MigrationResult> {
    const startTime = Date.now();
    const result: MigrationResult = {
      collectionName,
      totalDocuments: 0,
      migratedDocuments: 0,
      errors: [],
      duration: 0
    };

    try {
      console.log(`🚀 ${collectionName} koleksiyonu migrate ediliyor...`);
      
      // Eski koleksiyondan tüm dokümanları al
      const oldCollectionRef = collection(oldDb, collectionName);
      const snapshot = await getDocs(oldCollectionRef);
      
      result.totalDocuments = snapshot.size;
      console.log(`📊 ${collectionName}: ${result.totalDocuments} doküman bulundu`);

      if (result.totalDocuments === 0) {
        console.log(`⚠️ ${collectionName} koleksiyonu boş`);
        result.duration = Date.now() - startTime;
        return result;
      }

      // Batch işlem için ayarlar
      const BATCH_SIZE = 500; // Firestore batch limiti
      let batch = writeBatch(newDb);
      let batchCount = 0;

      // Her dokümanı işle
      for (const docSnapshot of snapshot.docs) {
        try {
          const docData = docSnapshot.data();
          const newDocRef = doc(newDb, collectionName, docSnapshot.id);

          // Özel alan dönüşümleri
          const processedData = this.processDocumentData(docData, collectionName);
          
          batch.set(newDocRef, processedData);
          batchCount++;

          // Batch limiti doldu mu kontrol et
          if (batchCount >= BATCH_SIZE) {
            await batch.commit();
            console.log(`✅ ${collectionName}: ${batchCount} doküman işlendi`);
            
            batch = writeBatch(newDb);
            batchCount = 0;
          }

          result.migratedDocuments++;
        } catch (error) {
          const errorMsg = `Doküman ${docSnapshot.id} işlenirken hata: ${error instanceof Error ? error.message : String(error)}`;
          result.errors.push(errorMsg);
          console.error(`❌ ${errorMsg}`);
        }
      }

      // Kalan batch'i commit et
      if (batchCount > 0) {
        await batch.commit();
        console.log(`✅ ${collectionName}: Son ${batchCount} doküman işlendi`);
      }

      result.duration = Date.now() - startTime;
      console.log(`🎉 ${collectionName} migration tamamlandı: ${result.migratedDocuments}/${result.totalDocuments} doküman (${result.duration}ms)`);

    } catch (error) {
      const errorMsg = `${collectionName} migration hatası: ${error instanceof Error ? error.message : String(error)}`;
      result.errors.push(errorMsg);
      console.error(`❌ ${errorMsg}`);
      result.duration = Date.now() - startTime;
    }

    return result;
  }

  // Özel veri dönüşümleri
  static processDocumentData(data: any, collectionName: string): any {
    const processedData = { ...data };

    // Timestamp alanlarını kontrol et ve dönüştür
    const timestampFields = ['createdAt', 'updatedAt', 'lastSeen', 'startDate', 'endDate', 'orderDate', 'deliveryTime'];
    
    timestampFields.forEach(field => {
      if (processedData[field] && typeof processedData[field] === 'object') {
        // Firestore Timestamp ise Date'e çevir
        if (processedData[field].toDate && typeof processedData[field].toDate === 'function') {
          processedData[field] = processedData[field].toDate();
        }
      }
    });

    // Koleksiyona özel dönüşümler
    switch (collectionName) {
      case 'users':
        // Kullanıcı verilerinde özel işlemler
        if (processedData.lastLoginAt && typeof processedData.lastLoginAt === 'object') {
          processedData.lastLoginAt = processedData.lastLoginAt.toDate?.() || new Date();
        }
        break;

      case 'orders':
        // Sipariş verilerinde özel işlemler
        if (processedData.items && Array.isArray(processedData.items)) {
          processedData.items = processedData.items.map((item: any) => ({
            ...item,
            price: typeof item.price === 'number' ? item.price : parseFloat(item.price) || 0
          }));
        }
        break;

      case 'products':
        // Ürün verilerinde özel işlemler
        processedData.price = typeof processedData.price === 'number' ? processedData.price : parseFloat(processedData.price) || 0;
        processedData.rating = typeof processedData.rating === 'number' ? processedData.rating : parseFloat(processedData.rating) || 0;
        break;
    }

    return processedData;
  }

  // Tüm koleksiyonları migrate et
  static async migrateAllCollections(): Promise<MigrationResult[]> {
    const results: MigrationResult[] = [];
    const startTime = Date.now();

    console.log('🚀 Firebase veri migration başlıyor...');
    console.log(`📁 ${COLLECTIONS_TO_MIGRATE.length} koleksiyon migrate edilecek`);

    // Admin kimlik doğrulaması yap
    await this.authenticateAdmin();

    for (const collectionName of COLLECTIONS_TO_MIGRATE) {
      const result = await this.migrateCollection(collectionName);
      results.push(result);

      // Kısa bekleme (rate limiting için)
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const totalDuration = Date.now() - startTime;
    const totalDocuments = results.reduce((sum, r) => sum + r.totalDocuments, 0);
    const totalMigrated = results.reduce((sum, r) => sum + r.migratedDocuments, 0);
    const totalErrors = results.reduce((sum, r) => sum + r.errors.length, 0);

    console.log('\n🎉 Migration tamamlandı!');
    console.log(`📊 Toplam sonuçlar:`);
    console.log(`   - Toplam doküman: ${totalDocuments}`);
    console.log(`   - Migrate edilen: ${totalMigrated}`);
    console.log(`   - Hata sayısı: ${totalErrors}`);
    console.log(`   - Süre: ${Math.round(totalDuration / 1000)}s`);

    return results;
  }

  // Belirli koleksiyonları migrate et
  static async migrateSelectedCollections(collections: string[]): Promise<MigrationResult[]> {
    const results: MigrationResult[] = [];

    console.log('🚀 Seçili koleksiyonlar migrate ediliyor...');
    console.log(`📁 Koleksiyonlar: ${collections.join(', ')}`);

    for (const collectionName of collections) {
      if (COLLECTIONS_TO_MIGRATE.includes(collectionName)) {
        const result = await this.migrateCollection(collectionName);
        results.push(result);
      } else {
        console.log(`⚠️ ${collectionName} migrate listesinde değil, atlanıyor`);
      }
    }

    return results;
  }

  // Veri doğrulama
  static async validateMigration(): Promise<{ [key: string]: { old: number, new: number, match: boolean } }> {
    const validationResult: { [key: string]: { old: number, new: number, match: boolean } } = {};

    console.log('🔍 Migration doğrulaması yapılıyor...');

    for (const collectionName of COLLECTIONS_TO_MIGRATE) {
      try {
        const oldSnapshot = await getDocs(collection(oldDb, collectionName));
        const newSnapshot = await getDocs(collection(newDb, collectionName));

        const oldCount = oldSnapshot.size;
        const newCount = newSnapshot.size;
        const match = oldCount === newCount;

        validationResult[collectionName] = { old: oldCount, new: newCount, match };

        const status = match ? '✅' : '❌';
        console.log(`${status} ${collectionName}: ${oldCount} -> ${newCount}`);
      } catch (error) {
        console.error(`❌ ${collectionName} doğrulama hatası:`, error);
        validationResult[collectionName] = { old: 0, new: 0, match: false };
      }
    }

    return validationResult;
  }
}

// CLI kullanımı için
if (require.main === module) {
  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'all':
      DataMigrationService.migrateAllCollections();
      break;
    
    case 'collection':
      const collectionName = args[1];
      if (collectionName) {
        DataMigrationService.migrateCollection(collectionName);
      } else {
        console.error('❌ Koleksiyon adı gerekli');
      }
      break;
    
    case 'validate':
      DataMigrationService.validateMigration();
      break;
    
    default:
      console.log('📖 Kullanım:');
      console.log('  npm run migrate all          # Tüm koleksiyonları migrate et');
      console.log('  npm run migrate collection <name>  # Tek koleksiyon migrate et');
      console.log('  npm run migrate validate     # Migration doğrula');
  }
} 