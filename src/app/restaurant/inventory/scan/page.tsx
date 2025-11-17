'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { 
  ArrowLeft, 
  Barcode,
  Camera,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Plus,
  Minus,
  Save,
  Loader2,
  Volume2,
  VolumeX
} from 'lucide-react';
import Link from 'next/link';
import { BarcodeService } from '@/services/barcodeService';
import { BarcodeScanResult, BarcodeProduct, InventoryItem } from '@/types';
import { toast } from 'sonner';

export default function BarcodeScanPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [scanResult, setScanResult] = useState<BarcodeScanResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [manualBarcode, setManualBarcode] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== 'restaurant')) {
      router.push('/login');
      return;
    }
  }, [user, authLoading, router]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (error) {
      console.error('Kamera başlatma hatası:', error);
      toast.error('Kamera erişimi sağlanamadı');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const playBeep = () => {
    if (soundEnabled) {
      // Basit beep sesi
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.1);
    }
  };

  const handleScan = async (barcode: string) => {
    if (!user?.restaurantId) return;

    setScanning(true);
    playBeep();

    try {
      const result = await BarcodeService.scanBarcode(barcode, user.restaurantId);
      setScanResult(result);
      
      if (result.found) {
        toast.success('Ürün bulundu!');
      } else {
        toast.error('Ürün bulunamadı');
      }
    } catch (error) {
      console.error('Barkod tarama hatası:', error);
      toast.error('Barkod tarama hatası');
    } finally {
      setScanning(false);
    }
  };

  const handleManualScan = async () => {
    if (!manualBarcode.trim()) {
      toast.error('Barkod giriniz');
      return;
    }
    await handleScan(manualBarcode.trim());
  };

  const handleAddToInventory = async () => {
    if (!scanResult?.found || !user?.restaurantId) return;

    setIsSubmitting(true);

    try {
      await BarcodeService.updateInventory(
        user.restaurantId,
        scanResult.barcode,
        quantity,
        user.uid,
        'RESTOCK'
      );

      toast.success(`${quantity} adet ürün stoka eklendi!`);
      router.push('/restaurant/inventory');
    } catch (error) {
      console.error('Stok ekleme hatası:', error);
      toast.error('Stok eklenirken hata oluştu');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateProduct = async () => {
    if (!scanResult?.barcode) return;

    // Yeni ürün oluşturma sayfasına yönlendir
    router.push(`/restaurant/inventory/add?barcode=${scanResult.barcode}`);
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
                Barkod Tarama
              </h1>
              <p className="text-gray-600 mt-1">
                Ürünleri barkod ile tarayarak stoka ekleyin
              </p>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-lg border transition-colors ${
                soundEnabled 
                  ? 'bg-green-100 border-green-300 text-green-600' 
                  : 'bg-red-100 border-red-300 text-red-600'
              }`}
            >
              {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sol Kolon - Kamera ve Manuel Giriş */}
            <div className="space-y-6">
              {/* Kamera */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Camera className="h-5 w-5 text-blue-600" />
                  Kamera Tarama
                </h2>
                
                <div className="relative">
                  <video
                    ref={videoRef}
                    className="w-full h-64 bg-gray-100 rounded-lg object-cover"
                    autoPlay
                    playsInline
                  />
                  
                  {scanning && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-lg">
                      <div className="text-center text-white">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
                        <p>Taranıyor...</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={startCamera}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Kamerayı Başlat
                    </button>
                    <button
                      onClick={stopCamera}
                      className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Kamerayı Durdur
                    </button>
                  </div>
                </div>
              </div>

              {/* Manuel Barkod Girişi */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Barcode className="h-5 w-5 text-green-600" />
                  Manuel Barkod Girişi
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Barkod
                    </label>
                    <input
                      type="text"
                      value={manualBarcode}
                      onChange={(e) => setManualBarcode(e.target.value)}
                      placeholder="2800176008583"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      onKeyPress={(e) => e.key === 'Enter' && handleManualScan()}
                    />
                  </div>
                  
                  <button
                    onClick={handleManualScan}
                    disabled={scanning}
                    className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {scanning ? 'Taranıyor...' : 'Tara'}
                  </button>
                </div>
              </div>

              {/* Hızlı Test Barkodları */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Test Barkodları
                </h3>
                
                <div className="space-y-2">
                  <button
                    onClick={() => handleScan('2800176008583')}
                    className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="font-mono text-sm">2800176008583</div>
                    <div className="text-xs text-gray-600">Banvit Baget (858gr)</div>
                  </button>
                  
                  <button
                    onClick={() => handleScan('2800176005000')}
                    className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="font-mono text-sm">2800176005000</div>
                    <div className="text-xs text-gray-600">Banvit Baget (500gr)</div>
                  </button>
                  
                  <button
                    onClick={() => handleScan('2800176001000')}
                    className="w-full text-left p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className="font-mono text-sm">2800176001000</div>
                    <div className="text-xs text-gray-600">Banvit Baget (1kg)</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Sağ Kolon - Sonuç ve İşlemler */}
            <div className="space-y-6">
              {/* Tarama Sonucu */}
              {scanResult && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    {scanResult.found ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-600" />
                    )}
                    Tarama Sonucu
                  </h2>
                  
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="font-mono text-lg text-center mb-2">
                        {scanResult.barcode}
                      </div>
                      <div className="text-center text-sm text-gray-600">
                        Barkod
                      </div>
                    </div>

                    {scanResult.found && scanResult.product ? (
                      <div className="space-y-3">
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <h3 className="font-semibold text-green-900 mb-2">
                            {scanResult.product.name}
                          </h3>
                          <div className="text-sm text-green-700 space-y-1">
                            <p><strong>Marka:</strong> {scanResult.product.brand}</p>
                            <p><strong>Kategori:</strong> {scanResult.product.category}</p>
                            <p><strong>Ağırlık:</strong> {scanResult.product.weight} {scanResult.product.unit}</p>
                            <p><strong>Fiyat:</strong> ₺{scanResult.product.price}</p>
                          </div>
                        </div>

                        {scanResult.inventoryItem && (
                          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-2">
                              Mevcut Stok Bilgisi
                            </h4>
                            <div className="text-sm text-blue-700 space-y-1">
                              <p><strong>Mevcut Stok:</strong> {scanResult.inventoryItem.currentStock}</p>
                              <p><strong>Rezerve Stok:</strong> {scanResult.inventoryItem.reservedStock}</p>
                              <p><strong>Kullanılabilir:</strong> {scanResult.inventoryItem.availableStock}</p>
                            </div>
                          </div>
                        )}

                        {/* Miktar Seçimi */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Eklenecek Miktar
                          </label>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => setQuantity(Math.max(1, quantity - 1))}
                              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="text-2xl font-bold text-gray-900 min-w-[3rem] text-center">
                              {quantity}
                            </span>
                            <button
                              onClick={() => setQuantity(quantity + 1)}
                              className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {/* İşlem Butonları */}
                        <div className="space-y-2">
                          <button
                            onClick={handleAddToInventory}
                            disabled={isSubmitting}
                            className="w-full px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors"
                          >
                            {isSubmitting ? (
                              <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Ekleniyor...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4" />
                                Stoka Ekle ({quantity} adet)
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-5 w-5 text-red-600" />
                          <h3 className="font-semibold text-red-900">
                            Ürün Bulunamadı
                          </h3>
                        </div>
                        <p className="text-sm text-red-700 mb-4">
                          Bu barkod ile kayıtlı ürün bulunamadı. Yeni ürün olarak eklemek ister misiniz?
                        </p>
                        <button
                          onClick={handleCreateProduct}
                          className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Yeni Ürün Oluştur
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Kullanım Talimatları */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Kullanım Talimatları
                </h3>
                
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Kamerayı başlatın ve ürün barkodunu görüntü alanına getirin</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Veya manuel olarak barkod numarasını girin</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Ürün bulunduğunda miktar seçin ve stoka ekleyin</p>
                  </div>
                  <div className="flex items-start gap-2">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <p>Ürün bulunamadığında yeni ürün olarak oluşturabilirsiniz</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
} 