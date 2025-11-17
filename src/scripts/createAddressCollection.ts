import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Adres koleksiyonu için örnek veri oluşturma scripti
export async function createAddressCollection() {
  console.log('🏠 Adres koleksiyonu oluşturuluyor...');

  try {
    // Örnek adres verileri
    const sampleAddresses = [
      {
        title: 'Ev Adresi',
        fullName: 'Ahmet Yılmaz',
        phone: '0555 123 45 67',
        address: 'Atatürk Caddesi No: 123 Daire: 5',
        district: 'Merkez',
        city: 'İstanbul',
        postalCode: '34000',
        instructions: 'Kapıcıya teslim edilebilir',
        isDefault: true,
        userId: 'sample-user-id', // Bu kullanıcı ID'si gerçek bir kullanıcı ID'si ile değiştirilmeli
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        title: 'İş Adresi',
        fullName: 'Ahmet Yılmaz',
        phone: '0555 123 45 67',
        address: 'İnönü Sokak No: 45 Kat: 3',
        district: 'Kadıköy',
        city: 'İstanbul',
        postalCode: '34700',
        instructions: 'Resepsiyona teslim edilebilir',
        isDefault: false,
        userId: 'sample-user-id',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      },
      {
        title: 'Anne Evi',
        fullName: 'Fatma Yılmaz',
        phone: '0532 987 65 43',
        address: 'Gül Sokak No: 12 Daire: 2',
        district: 'Beşiktaş',
        city: 'İstanbul',
        postalCode: '34300',
        instructions: '3. katta, asansör yok',
        isDefault: false,
        userId: 'sample-user-id',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }
    ];

    // Adresleri Firestore'a ekle
    const addressPromises = sampleAddresses.map(async (address) => {
      try {
        const docRef = await addDoc(collection(db, 'addresses'), address);
        console.log(`✅ Adres eklendi: ${address.title} (ID: ${docRef.id})`);
        return docRef;
      } catch (error) {
        console.error(`❌ Adres eklenirken hata: ${address.title}`, error);
        throw error;
      }
    });

    await Promise.all(addressPromises);
    console.log('🎉 Tüm adresler başarıyla eklendi!');

  } catch (error) {
    console.error('❌ Adres koleksiyonu oluşturulurken hata:', error);
    throw error;
  }
}

// Belirli bir kullanıcı için adres oluşturma
export async function createAddressForUser(userId: string, addressData: any) {
  try {
    const address = {
      ...addressData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'addresses'), address);
    console.log(`✅ Kullanıcı adresi eklendi: ${addressData.title} (ID: ${docRef.id})`);
    return docRef;
  } catch (error) {
    console.error('❌ Kullanıcı adresi eklenirken hata:', error);
    throw error;
  }
}

// Adres koleksiyonu yapısını kontrol etme
export async function checkAddressCollection() {
  try {
    const { getDocs } = await import('firebase/firestore');
    const querySnapshot = await getDocs(collection(db, 'addresses'));
    
    console.log(`📊 Adres koleksiyonu durumu:`);
    console.log(`   - Toplam adres sayısı: ${querySnapshot.size}`);
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`   - ${data.title} (${data.fullName}) - ${data.city}`);
    });

    return querySnapshot.size;
  } catch (error) {
    console.error('❌ Adres koleksiyonu kontrol edilirken hata:', error);
    throw error;
  }
} 