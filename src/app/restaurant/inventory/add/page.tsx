'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { 
  ArrowLeft, 
  Save,
  Package,
  Barcode,
  DollarSign,
  Scale,
  AlertCircle,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { BarcodeService } from '@/services/barcodeService';
import { toast } from 'sonner';

export default function AddInventoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    barcode: '',
    name: '',
    brand: '',
    category: '',
    weight: '',
    unit: 'gr',
    price: '',
    costPrice: '',
    quantity: '',
    minStockLevel: '10',
    maxStockLevel: '100',
    description: '',
    location: '',
    supplier: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Hata mesajını temizle
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.barcode.trim()) {
      newErrors.barcode = 'Barkod gereklidir';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Ürün adı gereklidir';
    }

    if (!formData.brand.trim()) {
      newErrors.brand = 'Marka gereklidir';
    }

    if (!formData.category.trim()) {
      newErrors.category = 'Kategori gereklidir';
    }

    if (!formData.weight || parseFloat(formData.weight) <= 0) {
      newErrors.weight = 'Geçerli bir ağırlık giriniz';
    }

    if (!formData.price || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Geçerli bir satış fiyatı giriniz';
    }

    if (!formData.costPrice || parseFloat(formData.costPrice) <= 0) {
      newErrors.costPrice = 'Geçerli bir maliyet fiyatı giriniz';
    }

    if (!formData.quantity || parseInt(formData.quantity) < 0) {
      newErrors.quantity = 'Geçerli bir miktar giriniz';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!user?.restaurantId) {
      toast.error('Restoran bilgisi bulunamadı');
      return;
    }

    setIsSubmitting(true);

    try {
      // Önce ürünü ekle
      const productData = {
        barcode: formData.barcode.trim(),
        name: formData.name.trim(),
        brand: formData.brand.trim(),
        category: formData.category.trim(),
        weight: parseFloat(formData.weight),
        unit: formData.unit,
        price: parseFloat(formData.price),
        costPrice: parseFloat(formData.costPrice),
        description: formData.description.trim(),
        isActive: true
      };

      const productId = await BarcodeService.addProduct(productData);

      // Sonra stoka ekle
      await BarcodeService.updateInventory(
        user.restaurantId,
        formData.barcode.trim(),
        parseInt(formData.quantity),
        user.uid,
        'MANUAL_ADD'
      );

      toast.success('Ürün başarıyla eklendi!');
      router.push('/restaurant/inventory');
      
    } catch (error) {
      console.error('Ürün ekleme hatası:', error);
      toast.error('Ürün eklenirken bir hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <main>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Yükleniyor...</p>
          </div>
        </div>
      </main>
    );
  }

  if (!user || user.role !== 'restaurant') {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container-responsive py-8 page-content">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link 
              href="/restaurant/inventory" 
              className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors duration-200"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900">
                Yeni Ürün Ekle
              </h1>
              <p className="text-gray-600 mt-1">
                Manuel olarak yeni ürün ve stok kaydı oluşturun
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Sol Kolon - Temel Bilgiler */}
              <div className="space-y-6">
                {/* Temel Bilgiler */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5 text-blue-600" />
                    Temel Bilgiler
                  </h2>
                  
                  <div className="space-y-4">
                    {/* Barkod */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Barkod *
                      </label>
                      <div className="relative">
                        <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          type="text"
                          name="barcode"
                          value={formData.barcode}
                          onChange={handleInputChange}
                          placeholder="Örn: 2800176008583"
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                            errors.barcode ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                      </div>
                      {errors.barcode && (
                        <p className="mt-1 text-sm text-red-600">{errors.barcode}</p>
                      )}
                    </div>

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
                        placeholder="Örn: Banvit Baget"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                      )}
                    </div>

                    {/* Marka */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Marka *
                      </label>
                      <input
                        type="text"
                        name="brand"
                        value={formData.brand}
                        onChange={handleInputChange}
                        placeholder="Örn: Banvit"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.brand ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.brand && (
                        <p className="mt-1 text-sm text-red-600">{errors.brand}</p>
                      )}
                    </div>

                    {/* Kategori */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Kategori *
                      </label>
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.category ? 'border-red-500' : 'border-gray-300'
                        }`}
                      >
                        <option value="">Kategori seçin</option>
                        <option value="Tavuk Ürünleri">Tavuk Ürünleri</option>
                        <option value="Et Ürünleri">Et Ürünleri</option>
                        <option value="Süt Ürünleri">Süt Ürünleri</option>
                        <option value="İçecek">İçecek</option>
                        <option value="Tatlı">Tatlı</option>
                        <option value="Aperatif">Aperatif</option>
                        <option value="Diğer">Diğer</option>
                      </select>
                      {errors.category && (
                        <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Ağırlık ve Birim */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Scale className="h-5 w-5 text-green-600" />
                    Ağırlık ve Birim
                  </h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ağırlık *
                      </label>
                      <input
                        type="number"
                        name="weight"
                        value={formData.weight}
                        onChange={handleInputChange}
                        placeholder="0.858"
                        step="0.001"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.weight ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.weight && (
                        <p className="mt-1 text-sm text-red-600">{errors.weight}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Birim
                      </label>
                      <select
                        name="unit"
                        value={formData.unit}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="gr">Gram (gr)</option>
                        <option value="kg">Kilogram (kg)</option>
                        <option value="adet">Adet</option>
                        <option value="paket">Paket</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sağ Kolon - Fiyat ve Stok */}
              <div className="space-y-6">
                {/* Fiyat Bilgileri */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-600" />
                    Fiyat Bilgileri
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Satış Fiyatı (₺) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="25.90"
                        step="0.01"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.price ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.price && (
                        <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Maliyet Fiyatı (₺) *
                      </label>
                      <input
                        type="number"
                        name="costPrice"
                        value={formData.costPrice}
                        onChange={handleInputChange}
                        placeholder="18.50"
                        step="0.01"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.costPrice ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.costPrice && (
                        <p className="mt-1 text-sm text-red-600">{errors.costPrice}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stok Bilgileri */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Package className="h-5 w-5 text-purple-600" />
                    Stok Bilgileri
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Başlangıç Miktarı *
                      </label>
                      <input
                        type="number"
                        name="quantity"
                        value={formData.quantity}
                        onChange={handleInputChange}
                        placeholder="50"
                        min="0"
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                          errors.quantity ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {errors.quantity && (
                        <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Minimum Stok
                        </label>
                        <input
                          type="number"
                          name="minStockLevel"
                          value={formData.minStockLevel}
                          onChange={handleInputChange}
                          placeholder="10"
                          min="0"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Maksimum Stok
                        </label>
                        <input
                          type="number"
                          name="maxStockLevel"
                          value={formData.maxStockLevel}
                          onChange={handleInputChange}
                          placeholder="100"
                          min="0"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ek Bilgiler */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5 text-orange-600" />
                    Ek Bilgiler
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Açıklama
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={3}
                        placeholder="Ürün hakkında ek bilgiler..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Depo Konumu
                        </label>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleInputChange}
                          placeholder="A1-B2"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Tedarikçi
                        </label>
                        <input
                          type="text"
                          name="supplier"
                          value={formData.supplier}
                          onChange={handleInputChange}
                          placeholder="Banvit A.Ş."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Butonları */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Ekleniyor...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Ürünü Ekle
                  </>
                )}
              </button>
              
              <Link 
                href="/restaurant/inventory" 
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center justify-center gap-2 transition-colors"
              >
                İptal
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
} 