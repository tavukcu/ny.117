'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { Loader2, Send, Phone, MapPin, ClipboardSignature, Home } from 'lucide-react';
import toast from 'react-hot-toast';

const CUISINES = [
  'Dünya Mutfağı',
  'Türk Mutfağı',
  'Fast Food',
  'Kahvaltı & Brunch',
  'Tatlı & Kahve',
  'Vejetaryen / Vegan',
  'Deniz Ürünleri',
];

export default function RestaurantApplyPage() {
  const [form, setForm] = useState({
    restaurantName: '',
    contactName: '',
    phone: '',
    fullAddress: '',
    city: '',
    district: '',
    cuisineType: CUISINES[0],
    note: '',
    consent: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isValidPhone = (value: string) => {
    const digits = value.replace(/\s+/g, '');
    return /^(?:\+90|0)?5\d{9}$/.test(digits);
  };

  const validate = () => {
    if (!form.restaurantName.trim()) {
      toast.error('Restoran adı zorunludur');
      return false;
    }
    if (!form.contactName.trim()) {
      toast.error('Yetkili kişi adı zorunludur');
      return false;
    }
    if (!isValidPhone(form.phone)) {
      toast.error('Lütfen geçerli bir telefon numarası yazın.');
      return false;
    }
    if (!form.fullAddress.trim()) {
      toast.error('Adres bilgisi zorunludur');
      return false;
    }
    if (!form.city.trim()) {
      toast.error('İl alanı zorunludur');
      return false;
    }
    if (!form.district.trim()) {
      toast.error('İlçe alanı zorunludur');
      return false;
    }
    if (!form.cuisineType) {
      toast.error('Mutfağınızı seçin');
      return false;
    }
    if (!form.consent) {
      toast.error('Kişisel veri izni olmadan başvuru yapamazsınız');
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    setSuccessMessage(null);
    setSubmitting(true);
    try {
      const response = await fetch('/api/restaurant-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          restaurantName: form.restaurantName.trim(),
          contactName: form.contactName.trim(),
          phone: form.phone.trim(),
          fullAddress: form.fullAddress.trim(),
          city: form.city.trim(),
          district: form.district.trim(),
          cuisineType: form.cuisineType,
          note: form.note.trim(),
          consent: form.consent,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Başvuru gönderilemedi');
      }

      setSuccessMessage('Başvurunuz bize ulaştı. En kısa sürede sizi WhatsApp veya telefon ile arayacağız.');
      setForm({
        restaurantName: '',
        contactName: '',
        phone: '',
        fullAddress: '',
        city: '',
        district: '',
        cuisineType: CUISINES[0],
        note: '',
        consent: false,
      });
    } catch (error) {
      console.error('Başvuru gönderme hatası:', error);
      toast.error('❌ Başvuru kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-green-50/40 to-white">
      <Header />

      <section className="pt-24 pb-12">
        <div className="container-responsive">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10 space-y-3">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-100 text-green-800 text-sm font-semibold">
                <ClipboardSignature className="h-4 w-4" />
                Restoran Başvuru Formu
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                Restoranınızı Neyisek’e Ekleyin
              </h1>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                3 dakikada başvurun, ekibimiz sizi arayıp tüm süreci anlatsın.
              </p>
              <p className="text-sm text-gray-500 flex items-center gap-2 justify-center">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                {successMessage ? 'Başvurunuz alındı, sıradasınız.' : 'Günde 10+ restoran Neyisek’e katılıyor.'}
              </p>
            </div>

            <div className="bg-white shadow-xl shadow-green-100/50 rounded-3xl border border-gray-100 p-6 md:p-8 space-y-4">
              {successMessage && (
                <div className="rounded-2xl bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-800 flex items-center gap-2">
                  ✅ {successMessage}
                </div>
              )}
              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                    Restoran Adı *
                  </label>
                  <input
                    type="text"
                    value={form.restaurantName}
                    onChange={(e) => handleChange('restaurantName', e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                    placeholder="Örn. Neyisek Burger"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                    Yetkili Kişi Adı *
                  </label>
                  <input
                    type="text"
                    value={form.contactName}
                    onChange={(e) => handleChange('contactName', e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                    placeholder="Ad Soyad"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                    Telefon (WhatsApp olan numara) *
                  </label>
                  <div className="flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 bg-white focus-within:ring-2 focus-within:ring-green-500">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="flex-1 focus:outline-none"
                      placeholder="Örnek: 5xx xxx xx xx"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                    Tam Adres *
                  </label>
                  <div className="flex items-start gap-2 rounded-2xl border border-gray-200 px-4 py-3 bg-white focus-within:ring-2 focus-within:ring-green-500">
                    <MapPin className="h-4 w-4 text-gray-400 mt-1" />
                    <textarea
                      value={form.fullAddress}
                      onChange={(e) => handleChange('fullAddress', e.target.value)}
                      className="flex-1 focus:outline-none resize-none"
                      rows={3}
                      placeholder="Mahalle, cadde, bina numarası..."
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                      İl *
                    </label>
                    <input
                      type="text"
                      value={form.city}
                      onChange={(e) => handleChange('city', e.target.value)}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Örnek: Manisa"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                      İlçe *
                    </label>
                    <input
                      type="text"
                      value={form.district}
                      onChange={(e) => handleChange('district', e.target.value)}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Örnek: Ahmetli"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                      Ne tür ürünler satıyorsunuz? *
                    </label>
                    <select
                      value={form.cuisineType}
                      onChange={(e) => handleChange('cuisineType', e.target.value)}
                      className="w-full rounded-2xl border border-gray-200 px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      {CUISINES.map((cuisine) => (
                        <option key={cuisine} value={cuisine}>
                          {cuisine}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                      Not
                    </label>
                    <input
                      type="text"
                      value={form.note}
                      onChange={(e) => handleChange('note', e.target.value)}
                    className="w-full rounded-2xl border border-gray-200 px-4 py-3 bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Örnek: Sadece Ahmetli merkezine paket servis yapıyoruz."
                    />
                  </div>
                </div>

                <label className="flex items-start gap-3 text-sm text-gray-600">
                    <input
                    type="checkbox"
                    checked={form.consent}
                    onChange={(e) => handleChange('consent', e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
                  />
                  <span className="leading-relaxed">
                    Kişisel verilerimin Neyisek tarafından başvuru sürecinde kullanılmasına izin veriyorum.
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={submitting}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-[#00C853] hover:bg-[#00b44a] text-white font-semibold py-3.5 shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5" />
                      Başvuruyu Gönder
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="mt-10 flex items-center justify-center gap-3 text-sm text-gray-500">
              <Home className="h-4 w-4" />
              Neyisek | Restoran iş ortaklığı bilgi hattı: destek@neyisek.com
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

