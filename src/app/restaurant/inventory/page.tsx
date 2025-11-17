'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { 
  Package, 
  Plus, 
  Search, 
  Barcode, 
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Eye,
  Edit,
  Trash2,
  Download,
  Upload,
  Filter,
  RefreshCw,
  Loader2,
  CheckCircle,
  XCircle,
  Info
} from 'lucide-react';
import { BarcodeService } from '@/services/barcodeService';
import { InventoryItem, BarcodeProduct, StockAlert } from '@/types';
import Link from 'next/link';
import Image from 'next/image';

export default function InventoryPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'low' | 'out' | 'normal'>('all');
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'restaurant')) {
      router.push('/login');
      return;
    }

    if (user?.restaurantId) {
      loadInventory();
      checkAlerts();
    }
  }, [user, authLoading, router]);

  const loadInventory = async () => {
    if (!user?.restaurantId) return;

    try {
      setLoading(true);
      const inventoryData = await BarcodeService.getInventory(user.restaurantId);
      setInventory(inventoryData);
    } catch (error) {
      console.error('Stok yükleme hatası:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkAlerts = async () => {
    if (!user?.restaurantId) return;

    try {
      const alertsData = await BarcodeService.checkLowStock(user.restaurantId);
      setAlerts(alertsData);
    } catch (error) {
      console.error('Uyarı kontrolü hatası:', error);
    }
  };

  const handleBarcodeScan = async () => {
    setScanning(true);
    
    // Simüle edilmiş barkod tarama
    setTimeout(async () => {
      try {
        const mockBarcode = '2800176008583'; // Banvit baget örneği
        const result = await BarcodeService.scanBarcode(mockBarcode, user?.restaurantId || '');
        
        if (result.found) {
          // Ürünü stoka ekle
          await BarcodeService.updateInventory(
            user?.restaurantId || '',
            mockBarcode,
            10, // 10 adet ekle
            user?.uid || '',
            'RESTOCK'
          );
          
          // Listeyi yenile
          await loadInventory();
        }
      } catch (error) {
        console.error('Barkod tarama hatası:', error);
      } finally {
        setScanning(false);
      }
    }, 2000);
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.barcode.includes(searchTerm) || 
                         item.productId.includes(searchTerm);
    
    const matchesFilter = filterStatus === 'all' ||
                         (filterStatus === 'low' && item.currentStock <= item.minStockLevel && item.currentStock > 0) ||
                         (filterStatus === 'out' && item.currentStock === 0) ||
                         (filterStatus === 'normal' && item.currentStock > item.minStockLevel);
    
    return matchesSearch && matchesFilter;
  });

  const getStockStatus = (item: InventoryItem) => {
    if (item.currentStock === 0) return 'out';
    if (item.currentStock <= item.minStockLevel) return 'low';
    return 'normal';
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'out': return 'text-red-600 bg-red-50 border-red-200';
      case 'low': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'normal': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStockStatusIcon = (status: string) => {
    switch (status) {
      case 'out': return <XCircle className="h-4 w-4" />;
      case 'low': return <AlertTriangle className="h-4 w-4" />;
      case 'normal': return <CheckCircle className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  if (authLoading || loading) {
    return (
      <main>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Stok bilgileri yükleniyor...</p>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Stok Yönetimi</h1>
              <p className="text-gray-600 mt-2">
                Barkod ile ürün ekleme ve stok takibi
              </p>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={handleBarcodeScan}
                disabled={scanning}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {scanning ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Taranıyor...
                  </>
                ) : (
                  <>
                    <Barcode className="h-5 w-5" />
                    Barkod Tara
                  </>
                )}
              </button>
              <Link
                href="/restaurant/inventory/add"
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Manuel Ekle
              </Link>
            </div>
          </div>
        </div>

        {/* Uyarılar */}
        {alerts.length > 0 && (
          <div className="mb-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <h3 className="font-semibold text-red-900">Stok Uyarıları</h3>
              </div>
              <div className="space-y-2">
                {alerts.slice(0, 3).map((alert) => (
                  <p key={alert.id} className="text-sm text-red-700">
                    {alert.message}
                  </p>
                ))}
                {alerts.length > 3 && (
                  <p className="text-sm text-red-600">
                    +{alerts.length - 3} daha uyarı var
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Filtreler */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Arama */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Barkod veya ürün ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Durum Filtresi */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tümü</option>
                <option value="normal">Normal Stok</option>
                <option value="low">Düşük Stok</option>
                <option value="out">Stok Tükendi</option>
              </select>
            </div>

            {/* Yenile */}
            <button
              onClick={loadInventory}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center gap-2 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Yenile
            </button>
          </div>
        </div>

        {/* Stok Listesi */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Stok Listesi ({filteredInventory.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ürün
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Barkod
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stok Durumu
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mevcut Stok
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rezerve
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Satış Fiyatı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Son Güncelleme
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInventory.length > 0 ? (
                  filteredInventory.map((item) => {
                    const status = getStockStatus(item);
                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <div className="h-10 w-10 rounded-lg bg-gray-200 flex items-center justify-center">
                                <Package className="h-5 w-5 text-gray-400" />
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {item.barcodeProduct?.name || 'Bilinmeyen Ürün'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {item.barcodeProduct?.brand || ''} • {item.barcodeProduct?.weight}{item.barcodeProduct?.unit}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 font-mono">
                            {item.barcode}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStockStatusColor(status)}`}>
                            {getStockStatusIcon(status)}
                            <span className="ml-1">
                              {status === 'out' ? 'Tükendi' : 
                               status === 'low' ? 'Düşük' : 'Normal'}
                            </span>
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {item.currentStock}
                          </div>
                          <div className="text-xs text-gray-500">
                            Min: {item.minStockLevel}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {item.reservedStock}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            ₺{item.sellingPrice.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500">
                            Maliyet: ₺{item.costPrice.toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {item.lastRestocked.toDate().toLocaleDateString('tr-TR')}
                          </div>
                          <div className="text-xs text-gray-500">
                            {item.lastRestocked.toDate().toLocaleTimeString('tr-TR')}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center gap-2">
                            <button className="text-blue-600 hover:text-blue-900">
                              <Eye className="h-4 w-4" />
                            </button>
                            <button className="text-green-600 hover:text-green-900">
                              <Plus className="h-4 w-4" />
                            </button>
                            <Link 
                              href={`/restaurant/inventory/edit/${item.id}`}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <Edit className="h-4 w-4" />
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">Henüz stok kaydı yok</p>
                      <p className="text-sm text-gray-500 mt-2">
                        Barkod tarayarak veya manuel olarak ürün ekleyin
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Ürün</p>
                <p className="text-2xl font-bold text-gray-900">{inventory.length}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-lg">
                <Package className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Düşük Stok</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {inventory.filter(item => getStockStatus(item) === 'low').length}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-lg">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Stok Tükendi</p>
                <p className="text-2xl font-bold text-red-600">
                  {inventory.filter(item => getStockStatus(item) === 'out').length}
                </p>
              </div>
              <div className="p-3 bg-red-100 rounded-lg">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Toplam Değer</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₺{inventory.reduce((sum, item) => sum + (item.currentStock * item.sellingPrice), 0).toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 