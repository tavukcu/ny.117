'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import Header from '@/components/Header';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  Image as ImageIcon,
  Package,
  DollarSign,
  Barcode,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { toast } from 'react-hot-toast';
import Link from 'next/link';
import Image from 'next/image';

interface BarcodeProduct {
  id: string;
  barcode: string;
  name: string;
  brand: string;
  category: string;
  weight: number;
  unit: string;
  price: number;
  costPrice: number;
  image?: string;
  description?: string;
  nutritionalInfo?: {
    calories?: number;
    protein?: number;
    fat?: number;
    carbs?: number;
  };
  allergens?: string[];
  expiryDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface InventoryItem {
  id: string;
  productId: string;
  barcode: string;
  restaurantId: string;
  quantity: number;
  minStockLevel: number;
  maxStockLevel: number;
  currentStock: number;
  reservedStock: number;
  availableStock: number;
  lastRestocked: Date;
  expiryDate?: Date;
  location?: string;
  supplier?: string;
  costPrice: number;
  sellingPrice: number;
  isActive: boolean;
  barcodeProduct: BarcodeProduct;
  createdAt: Date;
  updatedAt: Date;
}

export default function EditBarcodeProductPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  
  const [inventoryItem, setInventoryItem] = useState<InventoryItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    price: 0,
    image: '',
    description: ''
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');

  const inventoryId = params?.id as string;

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'restaurant')) {
      router.push('/login');
      return;
    }

    if (inventoryId) {
      loadInventoryItem();
    }
  }, [authLoading, user, inventoryId]);

  const loadInventoryItem = async () => {
    try {
      setLoading(true);
      
      const docRef = doc(db, 'inventory', inventoryId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data() as InventoryItem;
        setInventoryItem(data);
        
        setFormData({
          price: data.sellingPrice || data.barcodeProduct?.price || 0,
          image: data.barcodeProduct?.image || '',
          description: data.barcodeProduct?.description || ''
        });
        
        if (data.barcodeProduct?.image) {
          setImagePreview(data.barcodeProduct.image);
        }
      } else {
        toast.error('Ürün bulunamadı');
        router.push('/restaurant/inventory');
      }
    } catch (error) {
      console.error('Ürün yükleme hatası:', error);
      toast.error('Ürün yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır');
        return;
      }
      
      setSelectedFile(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const timestamp = Date.now();
    const fileName = `barcode-products/${inventoryId}/${timestamp}_${file.name}`;
    const storageRef = ref(storage, fileName);
    
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    
    return downloadURL;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inventoryItem) return;
    
    try {
      setSaving(true);
      
      let imageUrl = formData.image;
      
      // Yeni resim yüklendiyse
      if (selectedFile) {
        setUploading(true);
        imageUrl = await uploadImage(selectedFile);
        setUploading(false);
      }
      
      // Inventory item'ı güncelle
      const docRef = doc(db, 'inventory', inventoryId);
      await updateDoc(docRef, {
        sellingPrice: formData.price,
        'barcodeProduct.price': formData.price,
        'barcodeProduct.image': imageUrl,
        'barcodeProduct.description': formData.description,
        updatedAt: new Date()
      });
      
      toast.success('Ürün başarıyla güncellendi!');
      router.push('/restaurant/inventory');
      
    } catch (error) {
      console.error('Güncelleme hatası:', error);
      toast.error('Ürün güncellenirken hata oluştu');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="container-responsive py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        </div>
      </main>
    );
  }

  if (!inventoryItem) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="container-responsive py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Ürün Bulunamadı</h2>
            <p className="text-gray-600 mb-4">Aradığınız ürün mevcut değil veya silinmiş olabilir.</p>
            <Link 
              href="/restaurant/inventory"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Stok Listesine Dön
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container-responsive py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link 
              href="/restaurant/inventory"
              className="p-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Barkodlu Ürün Düzenle</h1>
              <p className="text-gray-600">Ürün bilgilerini güncelleyin</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Ürün Bilgileri */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Ürün Bilgileri</h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Package className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">{inventoryItem.barcodeProduct.name}</p>
                  <p className="text-sm text-gray-600">{inventoryItem.barcodeProduct.brand}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Barcode className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Barkod</p>
                  <p className="text-sm text-gray-600">{inventoryItem.barcode}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Package className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Ağırlık</p>
                  <p className="text-sm text-gray-600">{inventoryItem.barcodeProduct.weight} {inventoryItem.barcodeProduct.unit}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Package className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">Stok</p>
                  <p className="text-sm text-gray-600">{inventoryItem.currentStock} adet</p>
                </div>
              </div>
            </div>
          </div>

          {/* Düzenleme Formu */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Düzenleme</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Fiyat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Satış Fiyatı (₺)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.00"
                    required
                  />
                </div>
              </div>

              {/* Açıklama */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ürün Açıklaması
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ürün açıklaması..."
                />
              </div>

              {/* Resim Yükleme */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ürün Görseli
                </label>
                
                {/* Mevcut Resim */}
                {imagePreview && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">Mevcut Görsel:</p>
                    <div className="relative w-32 h-32 rounded-lg overflow-hidden border border-gray-200">
                      <Image
                        src={imagePreview}
                        alt={inventoryItem.barcodeProduct.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                )}
                
                {/* Yeni Resim Yükleme */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      {selectedFile ? selectedFile.name : 'Resim seçmek için tıklayın'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PNG, JPG, JPEG (max 5MB)</p>
                  </label>
                </div>
              </div>

              {/* Kaydet Butonu */}
              <button
                type="submit"
                disabled={saving || uploading}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {saving || uploading ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Save className="h-5 w-5" />
                )}
                {saving ? 'Kaydediliyor...' : uploading ? 'Resim Yükleniyor...' : 'Değişiklikleri Kaydet'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
} 