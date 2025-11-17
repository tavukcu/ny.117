'use client';

import { useState, useEffect, useCallback } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import { collection, addDoc, updateDoc, deleteDoc, doc, query, where, getDocs, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User } from '@/types';
import { 
  PlusIcon, 
  PencilIcon, 
  TrashIcon, 
  StarIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
  XMarkIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export interface Address {
  id?: string;
  title: string;
  fullName: string;
  phone: string;
  address: string;
  district: string;
  city: string;
  postalCode?: string;
  instructions?: string;
  isDefault: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AddressBookProps {
  user: User | null;
  onAddressSelect?: (address: Address) => void;
  selectedAddressId?: string;
  showSelection?: boolean;
}

export default function AddressBook({ 
  user, 
  onAddressSelect, 
  selectedAddressId,
  showSelection = false 
}: AddressBookProps) {
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    fullName: '',
    phone: '',
    address: '',
    district: '',
    city: '',
    postalCode: '',
    instructions: '',
    isDefault: false
  });

  // Form validasyonu için computed property
  const isFormValid = () => {
    return formData.title.trim() !== '' && 
           formData.fullName.trim() !== '' && 
           formData.phone.trim() !== '' && 
           formData.address.trim() !== '' && 
           formData.district.trim() !== '' && 
           formData.city.trim() !== '';
  };

  // Adresleri yükle fonksiyonu
  const loadAddresses = async () => {
    if (!user) {
      console.log('❌ Kullanıcı bulunamadı, adresler yüklenemiyor');
      setLoading(false);
      return;
    }

    try {
      console.log('🔄 Adresler yükleniyor...', { userId: user.uid });
      setLoading(true);
      
      // Adresleri yükle - basit sorgu ile
      const q = query(
        collection(db, 'addresses'),
        where('userId', '==', user.uid)
      );

      console.log('🔍 Sorgu oluşturuldu:', { userId: user.uid });

      const querySnapshot = await getDocs(q);
      console.log('📊 Sorgu sonucu:', { size: querySnapshot.size, empty: querySnapshot.empty });
      
      const addressList: Address[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        console.log('📄 Adres verisi:', { id: doc.id, data });
        
        // Timestamp kontrolü
        let createdAt = new Date();
        let updatedAt = new Date();
        
        if (data.createdAt) {
          if (typeof data.createdAt.toDate === 'function') {
            createdAt = data.createdAt.toDate();
          } else if (data.createdAt instanceof Date) {
            createdAt = data.createdAt;
          } else if (data.createdAt.seconds) {
            createdAt = new Date(data.createdAt.seconds * 1000);
          }
        }
        
        if (data.updatedAt) {
          if (typeof data.updatedAt.toDate === 'function') {
            updatedAt = data.updatedAt.toDate();
          } else if (data.updatedAt instanceof Date) {
            updatedAt = data.updatedAt;
          } else if (data.updatedAt.seconds) {
            updatedAt = new Date(data.updatedAt.seconds * 1000);
          }
        }
        
        const address: Address = {
          id: doc.id,
          title: data.title || '',
          fullName: data.fullName || '',
          phone: data.phone || '',
          address: data.address || '',
          district: data.district || '',
          city: data.city || '',
          postalCode: data.postalCode || '',
          instructions: data.instructions || '',
          isDefault: data.isDefault || false,
          userId: data.userId || user.uid,
          createdAt: createdAt,
          updatedAt: updatedAt
        };
        addressList.push(address);
      });

      // Varsayılan adrese göre sırala
      addressList.sort((a, b) => {
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      console.log('📦 Adresler yüklendi:', addressList.length, 'adet');
      console.log('📋 Adres listesi:', addressList.map(a => ({ id: a.id, title: a.title, isDefault: a.isDefault })));
      
      // State'i güncelle
      setAddresses([...addressList]);
      console.log('✅ State güncellendi');
      
    } catch (error) {
      console.error('❌ Adresler yüklenirken hata:', error);
      
      // Hata detaylarını göster
      if (error instanceof Error) {
        console.error('Hata mesajı:', error.message);
        console.error('Hata stack:', error.stack);
      }
      
      toast.error('Adresler yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.');
    } finally {
      setLoading(false);
    }
  };

  // Adresleri yükle
  useEffect(() => {
    console.log('🔄 useEffect tetiklendi', { user: user?.uid, loading });
    if (user) {
      loadAddresses();
    } else {
      setAddresses([]);
      setLoading(false);
    }
  }, [user?.uid]); // Sadece user.uid değiştiğinde çalışsın

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Kullanıcı bilgisi bulunamadı');
      return;
    }

    // Form validasyonu
    if (!formData.title.trim()) {
      toast.error('Adres başlığı gereklidir');
      return;
    }
    if (!formData.fullName.trim()) {
      toast.error('Ad soyad gereklidir');
      return;
    }
    if (!formData.phone.trim()) {
      toast.error('Telefon numarası gereklidir');
      return;
    }
    if (!formData.address.trim()) {
      toast.error('Adres gereklidir');
      return;
    }
    if (!formData.district.trim()) {
      toast.error('İlçe gereklidir');
      return;
    }
    if (!formData.city.trim()) {
      toast.error('İl gereklidir');
      return;
    }

    try {
      console.log('🚀 Adres kaydetme başlatılıyor...', { user: user.uid, formData });

      const addressData = {
        title: formData.title.trim(),
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        address: formData.address.trim(),
        district: formData.district.trim(),
        city: formData.city.trim(),
        postalCode: formData.postalCode.trim(),
        instructions: formData.instructions.trim(),
        isDefault: formData.isDefault,
        userId: user.uid,
        updatedAt: serverTimestamp()
      };

      console.log('📝 Kaydedilecek adres verisi:', addressData);

      if (editingAddress) {
        // Güncelle
        console.log('📝 Adres güncelleniyor:', editingAddress.id);
        const addressRef = doc(db, 'addresses', editingAddress.id!);
        await updateDoc(addressRef, addressData);
        toast.success('Adres başarıyla güncellendi!');
      } else {
        // Yeni ekle
        console.log('➕ Yeni adres ekleniyor...');
        const newAddressData = {
          ...addressData,
          createdAt: serverTimestamp()
        };
        
        console.log('📝 Yeni adres verisi:', newAddressData);
        const docRef = await addDoc(collection(db, 'addresses'), newAddressData);
        console.log('✅ Yeni adres eklendi, ID:', docRef.id);
        toast.success('Yeni adres başarıyla eklendi!');
      }

      // Varsayılan adres ayarlandıysa, diğerlerini güncelle
      if (formData.isDefault) {
        console.log('⭐ Varsayılan adres ayarlanıyor...');
        await updateOtherAddressesDefault(user.uid);
      }

      resetForm();
      console.log('🔄 Adresler yeniden yükleniyor...');
      
      // Yeni adresi state'e manuel olarak ekle
      if (!editingAddress) {
        const newAddress: Address = {
          id: 'temp-' + Date.now(), // Geçici ID
          title: formData.title.trim(),
          fullName: formData.fullName.trim(),
          phone: formData.phone.trim(),
          address: formData.address.trim(),
          district: formData.district.trim(),
          city: formData.city.trim(),
          postalCode: formData.postalCode.trim(),
          instructions: formData.instructions.trim(),
          isDefault: formData.isDefault,
          userId: user.uid,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        setAddresses(prev => [newAddress, ...prev]);
        console.log('✅ Yeni adres state\'e eklendi');
      }
      
      // Sonra gerçek verileri yükle
      setTimeout(() => {
        loadAddresses();
      }, 2000);
      
      console.log('🎉 Adres kaydetme işlemi tamamlandı!');
    } catch (error) {
      console.error('❌ Adres kaydetme hatası:', error);
      toast.error('Adres kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
    }
  };

  const updateOtherAddressesDefault = async (userId: string) => {
    try {
      console.log('🔄 Diğer adreslerin varsayılan durumu güncelleniyor...');
      
      const q = query(
        collection(db, 'addresses'),
        where('userId', '==', userId),
        where('isDefault', '==', true)
      );

      const querySnapshot = await getDocs(q);
      console.log(`📊 ${querySnapshot.size} adet varsayılan adres bulundu`);
      
      const updatePromises = querySnapshot.docs.map(doc => 
        updateDoc(doc.ref, { 
          isDefault: false,
          updatedAt: serverTimestamp()
        })
      );

      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
        console.log('✅ Varsayılan adresler güncellendi');
      }
    } catch (error) {
      console.error('❌ Varsayılan adres güncelleme hatası:', error);
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddress(address);
    setFormData({
      title: address.title,
      fullName: address.fullName,
      phone: address.phone,
      address: address.address,
      district: address.district,
      city: address.city,
      postalCode: address.postalCode || '',
      instructions: address.instructions || '',
      isDefault: address.isDefault
    });
    setShowForm(true);
  };

  const handleDelete = async (addressId: string) => {
    const confirmDelete = window.confirm('Bu adresi silmek istediğinizden emin misiniz?');
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, 'addresses', addressId));
      toast.success('Adres başarıyla silindi');
      setTimeout(() => {
        loadAddresses();
      }, 500);
    } catch (error) {
      console.error('Adres silme hatası:', error);
      toast.error('Adres silinirken bir hata oluştu');
    }
  };

  const handleSetDefault = async (addressId: string) => {
    if (!user) return;

    try {
      // Önce tüm adresleri varsayılan olmayan yap
      await updateOtherAddressesDefault(user.uid);
      
      // Seçilen adresi varsayılan yap
      const addressRef = doc(db, 'addresses', addressId);
      await updateDoc(addressRef, { 
        isDefault: true,
        updatedAt: new Date()
      });

      toast.success('Varsayılan adres güncellendi');
      setTimeout(() => {
        loadAddresses();
      }, 500);
    } catch (error) {
      console.error('Varsayılan adres ayarlama hatası:', error);
      toast.error('Varsayılan adres ayarlanırken bir hata oluştu');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      fullName: '',
      phone: '',
      address: '',
      district: '',
      city: '',
      postalCode: '',
      instructions: '',
      isDefault: false
    });
    setEditingAddress(null);
    setShowForm(false);
    
    // Form kapatıldığında kullanıcıya bilgi ver
    if (editingAddress) {
      toast.success('Adres düzenleme iptal edildi');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Debug bilgisi - sadece development'ta göster */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-green-50 p-4 rounded-lg">
          <h4 className="font-semibold text-green-900 mb-2">📊 Adres Durumu:</h4>
          <ul className="text-sm text-green-800 space-y-1">
            <li>• Toplam adres: {addresses.length}</li>
            <li>• Kullanıcı: {user?.uid || 'Bulunamadı'}</li>
            <li>• Loading: {loading ? 'Evet' : 'Hayır'}</li>
            <li>• Form açık: {showForm ? 'Evet' : 'Hayır'}</li>
          </ul>
        </div>
      )}
      
      {/* Adres Listesi */}
      <div className="grid gap-4">
        {addresses.map((address) => (
          <div
            key={address.id}
            className={`p-6 border-2 rounded-xl transition-all duration-200 hover:shadow-md ${
              selectedAddressId === address.id
                ? 'border-green-500 bg-green-50'
                : address.isDefault
                ? 'border-yellow-400 bg-yellow-50'
                : 'border-gray-200 hover:border-gray-300'
            } ${showSelection ? 'cursor-pointer' : ''}`}
            onClick={() => showSelection && onAddressSelect?.(address)}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex items-center space-x-2">
                    <MapPinIcon className="w-5 h-5 text-green-600" />
                    <h4 className="font-semibold text-gray-900 text-lg">{address.title}</h4>
                  </div>
                  
                  {address.isDefault && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <StarIcon className="w-3 h-3 mr-1" />
                      Varsayılan
                    </span>
                  )}
                  
                  {selectedAddressId === address.id && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      <CheckIcon className="w-3 h-3 mr-1" />
                      Seçili
                    </span>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-gray-700">
                    <UserIcon className="w-4 h-4 text-gray-500" />
                    <span className="font-medium">{address.fullName}</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-gray-600">
                    <PhoneIcon className="w-4 h-4 text-gray-500" />
                    <span>{address.phone}</span>
                  </div>
                  
                  <div className="text-gray-700 leading-relaxed">
                    {address.address}
                  </div>
                  
                  <div className="text-gray-600">
                    {address.district}, {address.city}
                    {address.postalCode && ` - ${address.postalCode}`}
                  </div>
                  
                  {address.instructions && (
                    <div className="text-sm text-gray-500 italic bg-gray-50 p-2 rounded-lg">
                      📝 {address.instructions}
                    </div>
                  )}
                </div>
              </div>

              {!showSelection && (
                <div className="flex flex-col space-y-2 ml-4">
                  {!address.isDefault && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetDefault(address.id!);
                      }}
                      className="inline-flex items-center px-3 py-1.5 text-xs bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors duration-200"
                    >
                      <StarIcon className="w-3 h-3 mr-1" />
                      Varsayılan Yap
                    </button>
                  )}
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(address);
                    }}
                    className="inline-flex items-center px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors duration-200"
                  >
                    <PencilIcon className="w-3 h-3 mr-1" />
                    Düzenle
                  </button>
                  
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(address.id!);
                    }}
                    className="inline-flex items-center px-3 py-1.5 text-xs bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors duration-200"
                  >
                    <TrashIcon className="w-3 h-3 mr-1" />
                    Sil
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}

        {addresses.length === 0 && (
          <div className="text-center py-12">
            <div className="w-20 h-20 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <MapPinIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Henüz adres eklenmemiş</h3>
            <p className="text-gray-500 mb-6">Teslimat adreslerinizi ekleyerek hızlı sipariş verebilirsiniz.</p>
            
            {/* Debug bilgisi - sadece development'ta göster */}
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-blue-50 p-4 rounded-lg mb-6 text-left">
                <h4 className="font-semibold text-blue-900 mb-2">🔍 Debug Bilgileri:</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Kullanıcı ID: {user?.uid || 'Bulunamadı'}</li>
                  <li>• Adres sayısı: {addresses.length}</li>
                  <li>• Loading durumu: {loading ? 'Yükleniyor' : 'Tamamlandı'}</li>
                  <li>• Form açık: {showForm ? 'Evet' : 'Hayır'}</li>
                </ul>
              </div>
            )}
            
            <button
              onClick={() => setShowForm(true)}
              className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
            >
              <PlusIcon className="w-4 h-4 mr-2" />
              İlk Adresinizi Ekleyin
            </button>
          </div>
        )}
      </div>

      {/* Yeni Adres Ekleme Butonu */}
      {addresses.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-sm"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Yeni Adres Ekle
          </button>
        </div>
      )}

      {/* Adres Formu Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingAddress ? 'Adresi Düzenle' : 'Yeni Adres Ekle'}
                </h3>
                <button
                  onClick={() => {
                    if (editingAddress || formData.title || formData.fullName || formData.phone || formData.address) {
                      const confirmClose = window.confirm('Değişiklikleriniz kaydedilmeyecek. Devam etmek istiyor musunuz?');
                      if (confirmClose) {
                        resetForm();
                      }
                    } else {
                      resetForm();
                    }
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Debug bilgisi - sadece development'ta göster */}
                {process.env.NODE_ENV === 'development' && (
                  <div className="bg-yellow-50 p-3 rounded-lg text-xs">
                    <p><strong>Debug:</strong> Form geçerli: {isFormValid() ? '✅' : '❌'}</p>
                    <p>Başlık: "{formData.title}" | Ad Soyad: "{formData.fullName}" | Telefon: "{formData.phone}"</p>
                    <p>Adres: "{formData.address}" | İlçe: "{formData.district}" | İl: "{formData.city}"</p>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adres Başlığı *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => {
                      console.log('Başlık değişti:', e.target.value);
                      setFormData({ ...formData, title: e.target.value });
                    }}
                    placeholder="Ev, İş, Anne Evi, vb."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ad Soyad *
                    </label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => {
                        console.log('Ad Soyad değişti:', e.target.value);
                        setFormData({ ...formData, fullName: e.target.value });
                      }}
                      placeholder="Ad Soyad"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Telefon *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => {
                        console.log('Telefon değişti:', e.target.value);
                        setFormData({ ...formData, phone: e.target.value });
                      }}
                      placeholder="0555 123 45 67"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adres *
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) => {
                      console.log('Adres değişti:', e.target.value);
                      setFormData({ ...formData, address: e.target.value });
                    }}
                    placeholder="Sokak, cadde, bina no, daire no"
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      İlçe *
                    </label>
                    <input
                      type="text"
                      value={formData.district}
                      onChange={(e) => {
                        console.log('İlçe değişti:', e.target.value);
                        setFormData({ ...formData, district: e.target.value });
                      }}
                      placeholder="İlçe"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      İl *
                    </label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => {
                        console.log('İl değişti:', e.target.value);
                        setFormData({ ...formData, city: e.target.value });
                      }}
                      placeholder="İl"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Posta Kodu
                  </label>
                  <input
                    type="text"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    placeholder="34000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teslimat Notları
                  </label>
                  <textarea
                    value={formData.instructions}
                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                    placeholder="Kapıcıya teslim edilebilir, 3. kat, vb."
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-colors duration-200"
                  />
                </div>

                <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isDefault" className="ml-3 block text-sm text-gray-700">
                    Bu adresi varsayılan adres olarak ayarla
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      if (editingAddress || formData.title || formData.fullName || formData.phone || formData.address) {
                        const confirmClose = window.confirm('Değişiklikleriniz kaydedilmeyecek. Devam etmek istiyor musunuz?');
                        if (confirmClose) {
                          resetForm();
                        }
                      } else {
                        resetForm();
                      }
                    }}
                    className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    İptal
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 px-4 py-3 rounded-lg transition-colors duration-200 ${
                      isFormValid() 
                        ? 'bg-green-500 text-white hover:bg-green-600' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!isFormValid()}
                    title={`Form durumu: ${formData.title ? '✓' : '✗'} Başlık, ${formData.fullName ? '✓' : '✗'} Ad Soyad, ${formData.phone ? '✓' : '✗'} Telefon, ${formData.address ? '✓' : '✗'} Adres, ${formData.district ? '✓' : '✗'} İlçe, ${formData.city ? '✓' : '✗'} İl`}
                  >
                    {editingAddress ? 'Güncelle' : 'Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 