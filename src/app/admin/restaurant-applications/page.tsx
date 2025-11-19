'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import {
  RestaurantApplicationService,
  SimpleRestaurantApplication,
} from '@/services/restaurantApplicationService';
import {
  CheckCircle,
  Loader2,
  Phone,
  Info,
  Eye,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

const statusLabels: Record<SimpleRestaurantApplication['status'], string> = {
  pending: 'Beklemede',
  approved: 'Onaylandı',
  rejected: 'Reddedildi',
};

const statusClasses: Record<SimpleRestaurantApplication['status'], string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-700',
};

const formatDate = (date: Date) =>
  date.toLocaleString('tr-TR', { dateStyle: 'short', timeStyle: 'short' });

export default function RestaurantApplicationsPage() {
  const [applications, setApplications] = useState<SimpleRestaurantApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [filter, setFilter] = useState<StatusFilter>('pending');
  const [detail, setDetail] = useState<SimpleRestaurantApplication | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);

  const loadApplications = async () => {
    try {
      setLoading(true);
      const data = await RestaurantApplicationService.getApplications();
      setApplications(data);
    } catch (error) {
      console.error('Başvurular alınamadı:', error);
      toast.error('Başvurular yüklenemedi');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadApplications();
  }, []);

  const handleApprove = async (application: SimpleRestaurantApplication) => {
    try {
      setActionId(application.id);
      await RestaurantApplicationService.approveApplication(application.id);
      setInfoMessage(`${application.restaurantName} onaylandı ve restoran kaydı oluşturuldu.`);
      await loadApplications();
    } catch (error) {
      console.error('Başvuru onaylanamadı:', error);
      toast.error('Onay işlemi başarısız');
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (application: SimpleRestaurantApplication) => {
    try {
      setActionId(application.id);
      await RestaurantApplicationService.rejectApplication(application.id);
      setInfoMessage(`${application.restaurantName} başvurusu reddedildi.`);
      await loadApplications();
    } catch (error) {
      console.error('Başvuru reddedilemedi:', error);
      toast.error('Red işlemi başarısız');
    } finally {
      setActionId(null);
    }
  };

  const filteredApplications =
    filter === 'all'
      ? applications
      : applications.filter((app) => app.status === filter);

  return (
    <AdminLayout title="Restoran Başvuruları" subtitle="Yeni gelen başvuruları inceleyin">
      <div className="space-y-6">
        {infoMessage && (
          <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800 flex items-center gap-2">
            ✅ {infoMessage}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
          <div>
            <p className="text-sm text-gray-500">Toplam Başvuru</p>
            <p className="text-3xl font-bold text-gray-900">{applications.length}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'pending', 'approved', 'rejected'] as StatusFilter[]).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition ${
                  filter === status
                    ? 'bg-emerald-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status === 'all' ? 'Tümü' : statusLabels[status]}
              </button>
            ))}
            <button
              onClick={loadApplications}
              className="px-4 py-2 text-sm font-semibold rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Yenile
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-500">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Başvurular yükleniyor...
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-gray-200">
            <p className="text-lg font-semibold text-gray-700">Bu kategoriye ait başvuru yok</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white border border-gray-100 rounded-2xl shadow-sm">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Başvuru Tarihi</th>
                  <th className="px-4 py-3">Restoran</th>
                  <th className="px-4 py-3">Yetkili</th>
                  <th className="px-4 py-3">Telefon</th>
                  <th className="px-4 py-3">İl / İlçe</th>
                  <th className="px-4 py-3">Durum</th>
                  <th className="px-4 py-3 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                {filteredApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50/70">
                    <td className="px-4 py-3">{formatDate(application.createdAt)}</td>
                    <td className="px-4 py-3 font-semibold">{application.restaurantName}</td>
                    <td className="px-4 py-3">{application.contactName}</td>
                    <td className="px-4 py-3">
                      <a href={`tel:${application.phone}`} className="text-emerald-600 hover:underline flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {application.phone}
                      </a>
                    </td>
                    <td className="px-4 py-3">
                      {application.city} / {application.district}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusClasses[application.status]}`}>
                        {statusLabels[application.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setDetail(application)}
                          className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100"
                        >
                          <Eye className="h-3 w-3" />
                          Detay
                        </button>
                        <button
                          onClick={() => handleApprove(application)}
                          disabled={application.status !== 'pending' || actionId === application.id}
                          className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
                        >
                          {actionId === application.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <CheckCircle className="h-3 w-3" />
                          )}
                          Onayla
                        </button>
                        <button
                          onClick={() => handleReject(application)}
                          disabled={application.status !== 'pending' || actionId === application.id}
                          className="inline-flex items-center gap-1 rounded-full bg-red-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-600 disabled:opacity-50"
                        >
                          {actionId === application.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <XCircle className="h-3 w-3" />
                          )}
                          Reddet
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detail && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setDetail(null)}
            >
              ✕
            </button>
            <div className="flex items-center gap-2 text-emerald-600">
              <Info className="h-5 w-5" />
              <h3 className="text-lg font-semibold text-gray-900">Başvuru Detayı</h3>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p><strong>Restoran:</strong> {detail.restaurantName}</p>
              <p><strong>Yetkili:</strong> {detail.contactName}</p>
              <p><strong>Telefon:</strong> {detail.phone}</p>
              <p><strong>Adres:</strong> {detail.fullAddress}</p>
              <p><strong>İl / İlçe:</strong> {detail.city} / {detail.district}</p>
              <p><strong>Mutfak türü:</strong> {detail.cuisineType}</p>
              {detail.note && <p><strong>Not:</strong> {detail.note}</p>}
              <p><strong>Başvuru Tarihi:</strong> {formatDate(detail.createdAt)}</p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDetail(null)}
                className="px-4 py-2 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
              >
                Kapat
              </button>
              {detail.status === 'pending' && (
                <button
                  onClick={() => {
                    setDetail(null);
                    void handleApprove(detail);
                  }}
                  className="px-4 py-2 rounded-full bg-emerald-500 text-white text-sm font-semibold hover:bg-emerald-600"
                >
                  Onayla
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

