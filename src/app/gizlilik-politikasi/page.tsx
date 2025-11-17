import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası - Neyisek.com',
};

const sections = [
  {
    title: '1. Toplanan Veriler',
    items: [
      'Ad ve soyad',
      'Telefon numarası',
      'Adres bilgisi',
      'Konum verisi (isteğe bağlı)',
      'Sipariş geçmişi',
      'Ödeme bilgileri (3. taraf sağlayıcılar tarafından işlenir)',
      'Teknik bilgiler (IP, cihaz bilgisi, tarayıcı vb.)',
    ],
  },
  {
    title: '2. Verilerin Kullanım Amaçları',
    items: [
      'Siparişlerin oluşturulması ve teslim edilmesi',
      'Restoran–müşteri süreç yönetimi',
      'WhatsApp üzerinden sipariş bildirimleri',
      'Kullanıcı hesap yönetimi',
      'Güvenlik',
      'Hizmet iyileştirme',
    ],
  },
  {
    title: '3. WhatsApp ve Meta API Kullanımı',
    description:
      'Neyisek, sipariş bilgilendirme süreçlerinde Meta’nın WhatsApp Business API hizmetini kullanabilir. Bu API yalnızca sipariş bilgisi göndermek için kullanılır.',
  },
  {
    title: '4. Üçüncü Taraf Hizmetler',
    items: ['Firebase', 'WhatsApp Cloud API', 'Meta for Developers', 'Google Maps API', 'Vercel'],
  },
  {
    title: '5. Çerez Kullanımı',
    description:
      'Neyisek kullanıcı deneyimi için çerezler kullanır. Tarayıcı ayarlarınız üzerinden dilediğiniz zaman yönetebilirsiniz.',
  },
  {
    title: '6. Veri Saklama Süresi',
    description:
      'Veriler minimum zorunlu süre kadar saklanır ve talep edilmesi halinde güvenli biçimde silinir.',
  },
  {
    title: '7. Kullanıcı Hakları',
    description:
      'Kullanıcılar verilerine erişme, güncelleme ve silme hakkına sahiptir. Tüm taleplerinizi aşağıdaki iletişim adresimize iletebilirsiniz.',
  },
];

export default function GizlilikPolitikasiPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-16 lg:flex-row lg:gap-12 lg:px-8">
        <aside className="lg:w-1/3">
          <div className="sticky top-6 rounded-3xl bg-white/80 p-6 shadow-lg shadow-green-100/50 backdrop-blur">
            <p className="text-sm uppercase tracking-widest text-green-600">Neyisek</p>
            <h1 className="mt-3 text-3xl font-bold text-gray-900">Gizlilik Politikası</h1>
            <p className="mt-4 text-sm text-gray-500">Son güncelleme: 17.11.2025</p>
            <p className="mt-6 text-sm leading-relaxed text-gray-600">
              Neyisek.com olarak kişisel verilerinizi korumaya öncelik veriyoruz. Bu sayfada verilerinizin
              nasıl işlendiği ve haklarınızın neler olduğu yer alır.
            </p>
            <div className="mt-8 rounded-2xl bg-green-50 p-4 text-sm text-green-800">
              Sorularınız için{' '}
              <a href="mailto:destek@neyisek.com" className="font-semibold text-green-700 underline">
                destek@neyisek.com
              </a>{' '}
              adresine ulaşabilirsiniz.
            </div>
          </div>
        </aside>

        <main className="flex-1 space-y-8 rounded-3xl bg-white/90 p-6 shadow-xl shadow-gray-200/60 backdrop-blur">
          <section className="space-y-4 border-b border-gray-100 pb-6">
            <h2 className="text-2xl font-semibold text-gray-900">NEYİSEK – Gizlilik Politikası</h2>
            <p className="text-base leading-relaxed text-gray-600">
              Neyisek.com olarak, kullanıcılarımızın kişisel verilerinin güvenliğine büyük önem veriyoruz. Bu
              gizlilik politikası, web sitemizi ve mobil uygulamalarımızı kullanırken kişisel verilerinizin nasıl
              işlendiğini açıklar.
            </p>
          </section>

          {sections.map((section) => (
            <section
              key={section.title}
              className="rounded-2xl border border-gray-100 bg-white/60 p-6 shadow-sm shadow-gray-100"
            >
              <h3 className="text-xl font-semibold text-gray-900">{section.title}</h3>
              {section.items && (
                <ul className="mt-4 space-y-2 text-gray-600">
                  {section.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-green-500" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
              {section.description && (
                <p className="mt-4 text-gray-600 leading-relaxed">{section.description}</p>
              )}
            </section>
          ))}

          <section className="rounded-2xl border border-gray-100 bg-green-50/80 p-6">
            <h3 className="text-xl font-semibold text-gray-900">İletişim</h3>
            <p className="mt-2 text-gray-700">
              Gizlilik politikamızla ilgili tüm sorularınızı{' '}
              <a href="mailto:destek@neyisek.com" className="font-semibold text-green-700 underline">
                destek@neyisek.com
              </a>{' '}
              adresine iletebilirsiniz.
            </p>
          </section>
        </main>
      </div>
    </div>
  );
}

