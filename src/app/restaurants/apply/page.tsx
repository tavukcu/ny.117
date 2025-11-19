'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { RestaurantApplicationService } from '@/services/restaurantApplicationService';
import { TelegramService } from '@/services/telegramService';
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
  const router = useRouter();
  const [form, setForm] = useState({
    restaurantName: '',
    contactName: '',
    phone: '',
    fullAddress: '',
    cuisineType: CUISINES[0],
    note: '',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
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
    if (!form.phone.trim()) {
      toast.error('Telefon bilgisi zorunludur');
      return false;
    }
    if (!form.fullAddress.trim()) {
      toast.error('Adres bilgisi zorunludur');
      return false;
    }
    if (!form.cuisineType) {
      toast.error('Mutfağınızı seçin');
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      const applicationId = await RestaurantApplicationService.createApplication({
        restaurantName: form.restaurantName.trim(),
        contactName: form.contactName.trim(),
        phone: form.phone.trim(),
        fullAddress: form.fullAddress.trim(),
        cuisineType: form.cuisineType,
        note: form.note.trim(),
      });

      await TelegramService.sendRestaurantApplicationNotification({
        restaurantName: form.restaurantName.trim(),
        contactName: form.contactName.trim(),
        phone: form.phone.trim(),
        fullAddress: form.fullAddress.trim(),
        cuisineType: form.cuisineType,
        note: form.note.trim(),
        applicationId,
      });

      toast.success('Başvurunuz işleme alındı. Sonucu size en kısa zamanda bildirilecektir.');
      setForm({
        restaurantName: '',
        contactName: '',
        phone: '',
        fullAddress: '',
        cuisineType: CUISINES[0],
        note: '',
      });
      setTimeout(() => router.push('/'), 1500);
    } catch (error) {
      console.error('Başvuru gönderme hatası:', error);
      toast.error('Başvuru gönderilirken bir sorun oluştu. Lütfen tekrar deneyin.');
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
                Neyisek’e Katılın
              </h1>
              <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
                Kısa formu doldurun, ekibimiz en geç 24 saat içinde sizinle iletişime geçsin. Başvuru süreci tamamen ücretsizdir.
              </p>
            </div>

            <div className="bg-white shadow-xl shadow-green-100/50 rounded-3xl border border-gray-100 p-6 md:p-8">
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
                    Telefon *
                  </label>
                  <div className="flex items-center gap-2 rounded-2xl border border-gray-200 px-4 py-3 bg-white focus-within:ring-2 focus-within:ring-green-500">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="flex-1 focus:outline-none"
                      placeholder="+90 5XX XXX XX XX"
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
                      Mutfağınız *
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
                      placeholder="Örn. Menü linki, aktif kampanya..."
                    />
                  </div>
                </div>

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
                      Kayıt Ol
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

