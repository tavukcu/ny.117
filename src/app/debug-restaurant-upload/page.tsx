'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Loader2, CheckCircle, AlertCircle, Image as ImageIcon, Bug, Database, HardDrive } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL, deleteObject, listAll } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { toast } from 'sonner';
import Image from 'next/image';

export default function DebugRestaurantUploadPage() {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [restaurantId, setRestaurantId] = useState('test-restaurant-123');
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [storageFiles, setStorageFiles] = useState<string[]>([]);

  // Firebase Storage bağlantısını test et
  useEffect(() => {
    testFirebaseConnection();
    listStorageFiles();
  }, []);

  const testFirebaseConnection = async () => {
    try {
      console.log('🔍 Firebase Storage bağlantısı test ediliyor...');
      
      const testRef = ref(storage, 'test-connection.txt');
      const testData = new Blob(['Test connection'], { type: 'text/plain' });
      
      await uploadBytes(testRef, testData);
      const testUrl = await getDownloadURL(testRef);
      await deleteObject(testRef);
      
      setDebugInfo(prev => ({
        ...prev,
        storageConnection: '✅ Başarılı',
        storageUrl: testUrl,
        timestamp: new Date().toISOString()
      }));
      
      console.log('✅ Firebase Storage bağlantısı başarılı');
      
    } catch (error) {
      console.error('❌ Firebase Storage bağlantı hatası:', error);
      setDebugInfo(prev => ({
        ...prev,
        storageConnection: '❌ Başarısız',
        error: error instanceof Error ? error.message : 'Bilinmeyen hata',
        timestamp: new Date().toISOString()
      }));
    }
  };

  const listStorageFiles = async () => {
    try {
      console.log('📁 Storage dosyaları listeleniyor...');
      
      const restaurantsRef = ref(storage, 'restaurants');
      const result = await listAll(restaurantsRef);
      
      const files: string[] = [];
      for (const item of result.items) {
        files.push(item.fullPath);
      }
      
      setStorageFiles(files);
      console.log('✅ Storage dosyaları listelendi:', files);
      
    } catch (error) {
      console.error('❌ Storage dosyaları listelenirken hata:', error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Dosya validasyonu
    if (!file.type.startsWith('image/')) {
      toast.error('Sadece resim dosyaları yüklenebilir');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Dosya boyutu 10MB\'dan küçük olmalıdır');
      return;
    }

    try {
      setUploading(true);
      setProgress(0);
      
      console.log('🚀 Debug: Kapak görseli yükleme başlatılıyor...', {
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        fileType: file.type,
        restaurantId,
        storageBucket: storage.app.options.storageBucket,
        projectId: storage.app.options.projectId
      });

      // Dosya yolu oluştur
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const fileName = `restaurants/${restaurantId}/cover-${timestamp}.${fileExtension}`;
      
      console.log('📁 Debug: Dosya yolu:', fileName);
      
      const imageRef = ref(storage, fileName);
      console.log('📍 Debug: Storage referansı:', imageRef.fullPath);
      
      // Metadata ile yükle
      const metadata = {
        contentType: file.type,
        cacheControl: 'public,max-age=3600',
        customMetadata: {
          uploadedAt: new Date().toISOString(),
          originalName: file.name,
          restaurantId: restaurantId,
          type: 'cover',
          debug: 'true'
        }
      };
      
      setProgress(25);
      console.log('⬆️ Debug: Firebase Storage\'a yükleniyor...');
      
      const uploadResult = await uploadBytes(imageRef, file, metadata);
      console.log('✅ Debug: Upload tamamlandı:', uploadResult.metadata);
      
      setProgress(75);
      console.log('🔗 Debug: Download URL alınıyor...');
      
      const downloadURL = await getDownloadURL(uploadResult.ref);
      console.log('✅ Debug: Download URL alındı:', downloadURL);
      
      setProgress(100);
      setUploadedUrl(downloadURL);
      
      // Debug bilgilerini güncelle
      setDebugInfo(prev => ({
        ...prev,
        lastUpload: {
          fileName,
          fileSize: file.size,
          fileType: file.type,
          downloadURL,
          timestamp: new Date().toISOString()
        }
      }));
      
      toast.success('✅ Kapak görseli başarıyla yüklendi!');
      
      // Storage dosyalarını yeniden listele
      setTimeout(listStorageFiles, 1000);
      
    } catch (error) {
      console.error('❌ Debug: Kapak görseli yükleme hatası:', error);
      
      let errorMessage = 'Kapak görseli yüklenirken hata oluştu';
      
      if (error instanceof Error) {
        if (error.message.includes('storage/unauthorized')) {
          errorMessage = 'Firebase Storage erişim izni yok. Lütfen Firebase Console\'dan Storage kurallarını kontrol edin.';
        } else if (error.message.includes('storage/quota-exceeded')) {
          errorMessage = 'Depolama kotası aşıldı. Lütfen daha küçük bir dosya seçin.';
        } else if (error.message.includes('storage/network-request-failed')) {
          errorMessage = 'Ağ bağlantısı hatası. Lütfen internet bağlantınızı kontrol edin.';
        } else {
          errorMessage = `Yükleme hatası: ${error.message}`;
        }
      }
      
      // Debug bilgilerini güncelle
      setDebugInfo(prev => ({
        ...prev,
        lastError: {
          message: errorMessage,
          originalError: error instanceof Error ? error.message : 'Bilinmeyen hata',
          timestamp: new Date().toISOString()
        }
      }));
      
      toast.error(`❌ ${errorMessage}`);
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const deleteUploadedImage = async () => {
    if (!uploadedUrl) return;

    try {
      setUploading(true);
      console.log('🗑️ Debug: Yüklenen görsel siliniyor:', uploadedUrl);
      
      const imageRef = ref(storage, uploadedUrl);
      await deleteObject(imageRef);
      
      setUploadedUrl('');
      toast.success('✅ Görsel başarıyla silindi!');
      
      // Storage dosyalarını yeniden listele
      setTimeout(listStorageFiles, 1000);
      
    } catch (error) {
      console.error('❌ Debug: Görsel silme hatası:', error);
      toast.error('❌ Görsel silinirken hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🐛 Restoran Kapak Görseli Debug</h1>
        <p className="text-gray-600">NeYisek.com restoran kapak görseli yükleme sorununu debug edin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Alanı */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Kapak Görseli Yükle
            </CardTitle>
            <CardDescription>
              Debug modunda kapak görseli yükleme
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Restoran ID */}
            <div>
              <Label htmlFor="restaurantId">Restoran ID</Label>
              <Input
                id="restaurantId"
                type="text"
                value={restaurantId}
                onChange={(e) => setRestaurantId(e.target.value)}
                placeholder="test-restaurant-123"
                disabled={uploading}
              />
            </div>

            {/* Dosya Seçimi */}
            <div>
              <Label htmlFor="fileUpload">Kapak Görseli</Label>
              <div className="mt-2">
                <Input
                  id="fileUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                PNG, JPG, WebP (Maks. 10MB)
              </p>
            </div>

            {/* Progress Bar */}
            {uploading && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Yükleniyor... %{progress}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Silme Butonu */}
            {uploadedUrl && (
              <Button
                onClick={deleteUploadedImage}
                variant="destructive"
                disabled={uploading}
                className="w-full"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Siliniyor...
                  </>
                ) : (
                  'Yüklenen Görseli Sil'
                )}
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Önizleme */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Önizleme
            </CardTitle>
            <CardDescription>
              Yüklenen kapak görselinin önizlemesi
            </CardDescription>
          </CardHeader>
          <CardContent>
            {uploadedUrl ? (
              <div className="space-y-4">
                <div className="relative">
                  <Image
                    src={uploadedUrl}
                    alt="Kapak görseli önizleme"
                    width={400}
                    height={200}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Yüklendi
                  </div>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Download URL:</p>
                  <div className="bg-gray-100 p-2 rounded text-xs break-all">
                    {uploadedUrl}
                  </div>
                </div>
              </div>
            ) : (
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">Henüz görsel yüklenmedi</p>
                <p className="text-sm text-gray-500 mt-2">
                  Bir kapak görseli yükleyin
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Debug Bilgileri */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardHeader>
          <CardTitle className="text-yellow-900 flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Debug Bilgileri
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-yellow-800">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">Firebase Storage Bağlantısı</h3>
              <p className="text-sm">{debugInfo.storageConnection || 'Test ediliyor...'}</p>
              {debugInfo.error && (
                <p className="text-sm text-red-600 mt-1">Hata: {debugInfo.error}</p>
              )}
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Son Yükleme</h3>
              {debugInfo.lastUpload ? (
                <div className="text-sm space-y-1">
                  <p>Dosya: {debugInfo.lastUpload.fileName}</p>
                  <p>Boyut: {(debugInfo.lastUpload.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                  <p>Tip: {debugInfo.lastUpload.fileType}</p>
                  <p>Zaman: {new Date(debugInfo.lastUpload.timestamp).toLocaleString('tr-TR')}</p>
                </div>
              ) : (
                <p className="text-sm">Henüz yükleme yapılmadı</p>
              )}
            </div>
          </div>
          
          {debugInfo.lastError && (
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <h3 className="font-semibold text-red-800 mb-2">Son Hata</h3>
              <p className="text-sm text-red-700">{debugInfo.lastError.message}</p>
              <p className="text-xs text-red-600 mt-1">Orijinal: {debugInfo.lastError.originalError}</p>
              <p className="text-xs text-red-600">Zaman: {new Date(debugInfo.lastError.timestamp).toLocaleString('tr-TR')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Storage Dosyaları */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900 flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Storage Dosyaları
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-blue-800">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Restaurants klasöründeki dosyalar:</p>
            <Button
              onClick={listStorageFiles}
              size="sm"
              variant="outline"
              disabled={uploading}
            >
              Yenile
            </Button>
          </div>
          
          {storageFiles.length > 0 ? (
            <div className="bg-white rounded border p-3 max-h-40 overflow-y-auto">
              {storageFiles.map((file, index) => (
                <div key={index} className="text-xs font-mono py-1 border-b border-gray-100 last:border-b-0">
                  {file}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm">Henüz dosya yok</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 