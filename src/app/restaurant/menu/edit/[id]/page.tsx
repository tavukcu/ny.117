'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '@/components/Header';
import CalorieCalculator from '@/components/CalorieCalculator';
import { useAuth } from '@/hooks/useAuth';
import { 
  ArrowLeft, 
  Upload,
  Save,
  Trash2,
  Eye,
  DollarSign,
  Clock,
  Tag,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { ProductService } from '@/services/productService';
import { StorageService } from '@/services/storageService';
import { toast } from 'sonner';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';

const categories = [
  'Pizza',
  'Burger', 
  'Döner',
  'Pide & Lahmacun',
  'Izgara',
  'Salata',
  'Tatlı',
  'İçecek',
  'Aperatif',
  'Ana Yemek'
];

const dietaryTags = [
  'Vejetaryen',
  'Vegan', 
  'Glutensiz',
  'Laktoz İçermez',
  'Et',
  'Tavuk',
  'Balık',
  'Deniz Ürünleri',
  'Acılı',
  'Sağlıklı',
  'Popüler',
  'Yeni',
  'İndirimde'
];

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  preparationTime: number;
  ingredients: string;
  tags: string[];
  isActive: boolean;
  image: string;
  calories: number;
  restaurantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { user, loading } = useAuth();
  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    preparationTime: '',
    ingredients: '',
    tags: [] as string[],
    isActive: true,
    image: null as File | null,
    calories: 0
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  const productId = params.id as string;

  // Yetkilendirme kontrolü
  useEffect(() => {
    if (!loading && (!user || user.role !== 'restaurant')) {
      router.push('/');
    }
  }, [user, loading, router]);

  // Ürün verilerini yükle
  useEffect(() => {
    const loadProductData = async () => {
      if (!user?.restaurantId || !productId) {
        setDataLoading(false);
        return;
      }

      try {
        const productRef = doc(db, 'restaurants', user.restaurantId, 'products', productId);
        const productSnap = await getDoc(productRef);

        if (productSnap.exists()) {
          const productData = productSnap.data() as Product;
          setProduct(productData);
          setFormData({
            name: productData.name,
            description: productData.description,
            price: productData.price.toString(),
            category: productData.category,
            preparationTime: productData.preparationTime.toString(),
            ingredients: productData.ingredients,
            tags: productData.tags,
            isActive: productData.isActive,
            image: null,
            calories: productData.calories
          });
          setImagePreview(productData.image);
        } else {
          toast.error('Ürün bulunamadı');
          router.push('/restaurant/menu');
        }
      } catch (error) {
        console.error('Ürün yükleme hatası:', error);
        toast.error('Ürün yüklenirken hata oluştu');
      } finally {
        setDataLoading(false);
      }
    };

    if (user?.restaurantId) {
      loadProductData();
    }
  }, [user?.restaurantId, productId, router]);

  // Input değişiklikleri
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Hata temizle
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Resim yükleme
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Dosya boyutu kontrolü (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Dosya boyutu 5MB\'dan küçük olmalıdır');
        return;
      }

      // Dosya tipi kontrolü
      if (!file.type.startsWith('image/')) {
        toast.error('Sadece resim dosyaları yüklenebilir');
        return;
      }

      setFormData(prev => ({ ...prev, image: file }));

      // Önizleme oluştur
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Tag ekleme/çıkarma
  const toggleTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  // Kalori hesaplama
  const handleCalorieChange = (calories: number) => {
    setFormData(prev => ({ ...prev, calories }));
  };

  // Form validasyonu
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Ürün adı gerekli';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Ürün açıklaması gerekli';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Geçerli bir fiyat girin';
    }

    if (!formData.category) {
      newErrors.category = 'Kategori seçin';
    }

    if (!formData.preparationTime || parseInt(formData.preparationTime) <= 0) {
      newErrors.preparationTime = 'Geçerli bir hazırlama süresi girin';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Form gönderme
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (!user?.restaurantId || !product) {
      toast.error('Restoran bilgisi bulunamadı');
      return;
    }

    setIsSubmitting(true);

    try {
      let imageUrl = product.image;

      // Yeni görsel yüklendiyse
      if (formData.image) {
        // Eski görseli sil
        if (product.image) {
          try {
            const oldImageRef = ref(storage, product.image);
            await deleteObject(oldImageRef);
          } catch (error) {
            console.log('Eski görsel silinirken hata (normal):', error);
          }
        }

        // Yeni görseli yükle
        const timestamp = Date.now();
        const fileExtension = formData.image.name.split('.').pop() || 'jpg';
        const fileName = `restaurants/${user.restaurantId}/products/${productId}/image-${timestamp}.${fileExtension}`;

        const imageRef = ref(storage, fileName);
        const uploadResult = await uploadBytes(imageRef, formData.image);
        imageUrl = await getDownloadURL(uploadResult.ref);
      }

      // Firestore'da ürünü güncelle
      const productRef = doc(db, 'restaurants', user.restaurantId, 'products', productId);
      await updateDoc(productRef, {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: parseFloat(formData.price),
        category: formData.category,
        preparationTime: parseInt(formData.preparationTime),
        ingredients: formData.ingredients.trim(),
        tags: formData.tags,
        isActive: formData.isActive,
        image: imageUrl,
        calories: formData.calories,
        updatedAt: new Date()
      });

      toast.success('Ürün başarıyla güncellendi!');
      router.push('/restaurant/menu');

    } catch (error) {
      console.error('Ürün güncelleme hatası:', error);
      toast.error('Ürün güncellenirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Ürün silme
  const handleDelete = async () => {
    if (!user?.restaurantId || !product) {
      toast.error('Restoran bilgisi bulunamadı');
      return;
    }

    if (!confirm('Bu ürünü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      return;
    }

    setIsDeleting(true);

    try {
      // Görseli sil
      if (product.image) {
        try {
          const imageRef = ref(storage, product.image);
          await deleteObject(imageRef);
        } catch (error) {
          console.log('Görsel silinirken hata (normal):', error);
        }
      }

      // Firestore'dan ürünü sil
      const productRef = doc(db, 'restaurants', user.restaurantId, 'products', productId);
      await deleteDoc(productRef);

      toast.success('Ürün başarıyla silindi!');
      router.push('/restaurant/menu');

    } catch (error) {
      console.error('Ürün silme hatası:', error);
      toast.error('Ürün silinirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading || dataLoading) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="container-responsive py-8 page-content">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary-600 mx-auto mb-4" />
              <p className="text-gray-600">Ürün yükleniyor...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!user || user.role !== 'restaurant') {
    return null;
  }

  if (!product) {
    return (
      <main className="min-h-screen bg-gray-50">
        <Header />
        <div className="container-responsive py-8 page-content">
          <div className="text-center">
            <p className="text-gray-600">Ürün bulunamadı</p>
            <Link href="/restaurant/menu" className="text-primary-600 hover:text-primary-800">
              Menüye dön
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container-responsive py-8 page-content">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/restaurant/menu" 
              className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                Ürün Düzenle
              </h1>
              <p className="text-gray-600 mt-1">
                {product.name}
              </p>
            </div>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="btn-danger flex items-center gap-2 disabled:opacity-50"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Siliniyor...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Ürünü Sil
                </>
              )}
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Sol Kolon - Ana Bilgiler */}
            <div className="lg:col-span-2 space-y-6">
              {/* Temel Bilgiler */}
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Temel Bilgiler
                </h2>
                
                <div className="space-y-4">
                  {/* Ürün Adı */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ürün Adı *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Örn: Pizza Margherita"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.name && (
                      <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                    )}
                  </div>

                  {/* Açıklama */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ürün Açıklaması *
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows={3}
                      placeholder="Ürününüzü detaylı bir şekilde tanımlayın..."
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.description ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.description && (
                      <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                    )}
                  </div>

                  {/* Malzemeler */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Malzemeler
                    </label>
                    <textarea
                      name="ingredients"
                      value={formData.ingredients}
                      onChange={handleInputChange}
                      rows={2}
                      placeholder="Domates, peynir, fesleğen..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Fiyat ve Süre */}
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Fiyat ve Süre
                </h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {/* Fiyat */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Fiyat (₺) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.price ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      <DollarSign className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                    {errors.price && (
                      <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                    )}
                  </div>

                  {/* Hazırlama Süresi */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hazırlama Süresi (dakika) *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        name="preparationTime"
                        value={formData.preparationTime}
                        onChange={handleInputChange}
                        min="1"
                        placeholder="15"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.preparationTime ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      <Clock className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                    {errors.preparationTime && (
                      <p className="mt-1 text-sm text-red-600">{errors.preparationTime}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Kategori ve Etiketler */}
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Kategori ve Etiketler
                </h2>
                
                <div className="space-y-4">
                  {/* Kategori */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Kategori *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.category ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Kategori seçin</option>
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                    {errors.category && (
                      <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                    )}
                  </div>

                  {/* Etiketler */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Etiketler
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {dietaryTags.map(tag => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleTag(tag)}
                          className={`px-3 py-1 rounded-full text-sm font-medium transition-colors duration-200 ${
                            formData.tags.includes(tag)
                              ? 'bg-primary-100 text-primary-700 border border-primary-300'
                              : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sağ Kolon - Görsel ve Kalori */}
            <div className="space-y-6">
              {/* Ürün Görseli */}
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Ürün Görseli
                </h2>
                
                <div className="space-y-4">
                  {/* Görsel Yükleme */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    {imagePreview ? (
                      <div className="space-y-4">
                        <img
                          src={imagePreview}
                          alt="Ürün önizleme"
                          className="mx-auto rounded-lg max-h-48 object-contain"
                        />
                        <div className="flex gap-2 justify-center">
                          <label htmlFor="image-upload" className="cursor-pointer text-primary-600 hover:text-primary-800 text-sm font-medium">
                            Görseli Değiştir
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setImagePreview(null);
                              setFormData(prev => ({ ...prev, image: null }));
                            }}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Kaldır
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600 mb-2">Ürün görseli yükleyin</p>
                        <label htmlFor="image-upload" className="cursor-pointer text-primary-600 hover:text-primary-800 text-sm font-medium">
                          Görsel Seç
                        </label>
                      </div>
                    )}
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Kalori Hesaplayıcı */}
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Kalori Bilgisi
                </h2>
                <CalorieCalculator onCalorieChange={handleCalorieChange} initialCalories={formData.calories} />
              </div>

              {/* Durum */}
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Ürün Durumu
                </h2>
                
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-900">
                    Ürün aktif (satışta)
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Form Butonları */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Güncelleniyor...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Değişiklikleri Kaydet
                </>
              )}
            </button>
            
            <Link 
              href="/restaurant/menu" 
              className="btn-outline flex items-center justify-center gap-2"
            >
              İptal
            </Link>
          </div>
        </form>
      </div>
    </main>
  );
} 