'use client';

import { useState } from 'react';
import { Search, Phone, Package, Clock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface GuestOrderTrackingProps {
  onOrderFound?: (order: any) => void;
}

export default function GuestOrderTracking({ onOrderFound }: GuestOrderTrackingProps) {
  const [isSearching, setIsSearching] = useState(false);
  const [formData, setFormData] = useState({
    orderId: '',
    phoneNumber: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.orderId.trim()) {
      toast.error('Lütfen sipariş numaranızı girin');
      return;
    }
    
    if (!formData.phoneNumber.trim()) {
      toast.error('Lütfen telefon numaranızı girin');
      return;
    }

    setIsSearching(true);
    
    try {
      const response = await fetch(`/api/orders/track?orderId=${formData.orderId}&phone=${encodeURIComponent(formData.phoneNumber)}`);
      const result = await response.json();
      
      if (result.success && result.order) {
        toast.success('Siparişiniz bulundu!');
        onOrderFound?.(result.order);
      } else {
        toast.error(result.error || 'Sipariş bulunamadı. Lütfen bilgilerinizi kontrol edin.');
      }
    } catch (error) {
      console.error('Order tracking error:', error);
      toast.error('Sipariş arama sırasında bir hata oluştu');
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-orange-100 p-2 rounded-lg">
          <Package className="h-5 w-5 text-orange-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Siparişimi Takip Et
          </h3>
          <p className="text-sm text-gray-600">
            Sipariş numarası ve telefon numaranızla takip yapın
          </p>
        </div>
      </div>

      <form onSubmit={handleSearch} className="space-y-4">
        {/* Sipariş ID */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sipariş Numarası *
          </label>
          <div className="relative">
            <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="orderId"
              value={formData.orderId}
              onChange={handleInputChange}
              placeholder="Örn: ORDER123456"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Sipariş onay e-postanızda veya SMS'inizde bulabilirsiniz
          </p>
        </div>

        {/* Telefon Numarası */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefon Numarası *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="0555 123 45 67"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Siparişte kullandığınız telefon numarasını girin
          </p>
        </div>

        {/* Arama Butonu */}
        <button
          type="submit"
          disabled={isSearching}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSearching ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
          ) : (
            <>
              <Search className="h-5 w-5" />
              Siparişi Bul
            </>
          )}
        </button>
      </form>

      {/* Bilgilendirme */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <div className="flex items-start gap-3">
          <CheckCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Sipariş takibi için:</p>
            <ul className="space-y-1 text-xs">
              <li>• Sipariş numaranızı e-posta onayınızdan alın</li>
              <li>• Siparişte kullandığınız telefon numarasını girin</li>
              <li>• Gerçek zamanlı sipariş durumunu görün</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
} 