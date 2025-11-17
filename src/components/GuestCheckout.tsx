'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { User, Mail, Phone, MapPin, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';

interface GuestInfo {
  name: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    district: string;
    zipCode: string;
  };
}

interface GuestCheckoutProps {
  onGuestInfoComplete: (guestInfo: GuestInfo) => void;
  onLoginRedirect: () => void;
}

export default function GuestCheckout({ onGuestInfoComplete, onLoginRedirect }: GuestCheckoutProps) {
  const { createGuestUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<GuestInfo>({
    name: '',
    email: '',
    phone: '',
    address: {
      street: '',
      city: '',
      district: '',
      zipCode: ''
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      toast.error('Lütfen adınızı girin');
      return false;
    }
    
    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast.error('Lütfen geçerli bir e-posta adresi girin');
      return false;
    }
    
    if (!formData.phone.trim() || formData.phone.length < 10) {
      toast.error('Lütfen geçerli bir telefon numarası girin');
      return false;
    }
    
    if (!formData.address.street.trim()) {
      toast.error('Lütfen adres bilgilerini girin');
      return false;
    }
    
    if (!formData.address.city.trim()) {
      toast.error('Lütfen şehir bilgisini girin');
      return false;
    }
    
    if (!formData.address.district.trim()) {
      toast.error('Lütfen ilçe bilgisini girin');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      // Misafir kullanıcı oluştur
      const guestUser = createGuestUser({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        address: {
          street: formData.address.street,
          city: formData.address.city,
          district: formData.address.district,
          zipCode: formData.address.zipCode,
          country: 'Türkiye'
        }
      });
      
      if (guestUser) {
        toast.success('Bilgileriniz kaydedildi!');
        onGuestInfoComplete(formData);
      }
    } catch (error) {
      console.error('Guest user creation error:', error);
      toast.error('Bir hata oluştu, lütfen tekrar deneyin');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 p-2 rounded-lg">
          <User className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Misafir Olarak Sipariş Ver
          </h3>
          <p className="text-sm text-gray-600">
            Hızlı sipariş için bilgilerinizi girin
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* İsim */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Ad Soyad *
          </label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="Adınızı ve soyadınızı girin"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* E-posta */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            E-posta Adresi *
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="ornek@email.com"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Telefon */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Telefon Numarası *
          </label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="0555 123 45 67"
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        {/* Adres Bilgileri */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Teslimat Adresi
          </h4>
          
          <div>
            <input
              type="text"
              name="address.street"
              value={formData.address.street}
              onChange={handleInputChange}
              placeholder="Sokak, mahalle, bina no"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              name="address.district"
              value={formData.address.district}
              onChange={handleInputChange}
              placeholder="İlçe"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
            <input
              type="text"
              name="address.city"
              value={formData.address.city}
              onChange={handleInputChange}
              placeholder="Şehir"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
          </div>
          
          <input
            type="text"
            name="address.zipCode"
            value={formData.address.zipCode}
            onChange={handleInputChange}
            placeholder="Posta kodu (isteğe bağlı)"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
          ) : (
            <>
              <CreditCard className="h-5 w-5" />
              Siparişe Devam Et
            </>
          )}
        </button>
      </form>

      {/* Login Option */}
      <div className="mt-6 pt-6 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-600 mb-3">
          Zaten hesabınız var mı?
        </p>
        <button
          onClick={onLoginRedirect}
          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
        >
          Giriş Yaparak Siparişe Devam Et →
        </button>
      </div>
    </div>
  );
} 