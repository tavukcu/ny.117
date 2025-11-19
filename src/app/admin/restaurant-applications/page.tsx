'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { RestaurantApplicationService, SimpleRestaurantApplication } from '@/services/restaurantApplicationService';
import { CheckCircle, Trash2, Loader2, Phone, MapPin, NotebookPen } from 'lucide-react';
import { TelegramService } from '@/services/telegramService';
import toast from 'react-hot-toast';

export default function RestaurantApplicationsPage() {
  const [applications, setApplications] = useState<SimpleRestaurantApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);

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
      const restaurantId = await RestaurantApplicationService.approveApplication(application.id);

      await TelegramService.sendRestaurantApplicationNotification({
        applicationId: application.id,
        restaurantName: application.restaurantName,
        contactName: application.contactName,
        phone: application.phone,
        fullAddress: application.fullAddress,
        cuisineType: application.cuisineType,
        note: `Başvuru onaylandı. Restaurant ID: ${restaurantId}`,
      });

      toast.success('Başvuru onaylandı ve restoran oluşturuldu');
      await loadApplications();
    } catch (error) {
      console.error('Başvuru onaylanamadı:', error);
      toast.error('Onay işlemi başarısız');
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      setActionId(id);
      await RestaurantApplicationService.deleteApplication(id);
      toast.success('Başvuru silindi');
      await loadApplications();
    } catch (error) {
      console.error('Başvuru silinemedi:', error);
      toast.error('Silme işlemi başarısız');
    } finally {
      setActionId(null);
    }
  };

  const pendingApplications = applications.filter((app) => app.status === 'pending');

  return (
    <AdminLayout title="Restoran Başvuruları" subtitle="Yeni gelen başvuruları inceleyin">
      <div className="space-y-6">
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm p-6 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Bekleyen Başvurular</p>
            <p className="text-3xl font-bold text-gray-900">{pendingApplications.length}</p>
          </div>
          <button
            onClick={loadApplications}
            className="px-4 py-2 text-sm font-semibold rounded-xl bg-gray-900 text-white hover:bg-black transition"
          >
            Yenile
          </button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16 text-gray-500">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Başvurular yükleniyor...
          </div>
        ) : pendingApplications.length === 0 ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-gray-200">
            <p className="text-lg font-semibold text-gray-700">Bekleyen başvuru bulunmuyor</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {pendingApplications.map((application) => (
              <div key={application.id} className="rounded-2xl border border-gray-100 bg-white shadow-sm p-5 md:p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{application.restaurantName}</h3>
                    <p className="text-sm text-gray-500">Başvuru ID: {application.id}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(application)}
                      disabled={actionId === application.id}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 text-white font-semibold hover:bg-green-600 disabled:opacity-50"
                    >
                      {actionId === application.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle className="h-4 w-4" />
                      )}
                      Onayla
                    </button>
                    <button
                      onClick={() => handleDelete(application.id)}
                      disabled={actionId === application.id}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 disabled:opacity-50"
                    >
                      {actionId === application.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                      Sil
                    </button>
                  </div>
                </div>

                <div className="grid gap-3 text-sm text-gray-700">
                  <div className="flex items-center gap-2">
                    <NotebookPen className="h-4 w-4 text-gray-400" />
                    <span>Yetkili: {application.contactName}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span>{application.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span>{application.fullAddress}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">Mutfağı:</span>
                    <span className="font-medium">{application.cuisineType}</span>
                  </div>
                  {application.note && (
                    <div className="text-gray-600">
                      <span className="text-gray-500">Not: </span>
                      {application.note}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

