'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Loader2, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { toast } from 'sonner';
import Image from 'next/image';

export default function TestRestaurantUploadPage() {
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string>('');
  const [progress, setProgress] = useState(0);
  const [restaurantId, setRestaurantId] = useState('test-restaurant-123');

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
      
      console.log('🚀 Restoran kapak görseli yükleme başlatılıyor...', {
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        fileType: file.type,
        restaurantId
      });

      // Dosya yolu oluştur
      const timestamp = Date.now();
      const fileExtension = file.name.split('.').pop() || 'jpg';
      const fileName = `restaurants/${restaurantId}/cover-${timestamp}.${fileExtension}`;
      
      console.log('📁 Dosya yolu:', fileName);
      
      const imageRef = ref(storage, fileName);
      
      // Metadata ile yükle
      const metadata = {
        contentType: file.type,
        cacheControl: 'public,max-age=3600',
        customMetadata: {
          uploadedAt: new Date().toISOString(),
          originalName: file.name,
          restaurantId: restaurantId,
          type: 'cover',
          test: 'true'
        }
      };
      
      setProgress(25);
      console.log('⬆️ Firebase Storage\'a yükleniyor...');
      
      const uploadResult = await uploadBytes(imageRef, file, metadata);
      console.log('✅ Upload tamamlandı:', uploadResult.metadata);
      
      setProgress(75);
      console.log('🔗 Download URL alınıyor...');
      
      const downloadURL = await getDownloadURL(uploadResult.ref);
      console.log('✅ Download URL alındı:', downloadURL);
      
      setProgress(100);
      setUploadedUrl(downloadURL);
      toast.success('✅ Kapak görseli başarıyla yüklendi!');
      
    } catch (error) {
      console.error('❌ Kapak görseli yükleme hatası:', error);
      
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
      console.log('🗑️ Yüklenen görsel siliniyor:', uploadedUrl);
      
      const imageRef = ref(storage, uploadedUrl);
      await deleteObject(imageRef);
      
      setUploadedUrl('');
      toast.success('✅ Görsel başarıyla silindi!');
      
    } catch (error) {
      console.error('❌ Görsel silme hatası:', error);
      toast.error('❌ Görsel silinirken hata oluştu');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">🏪 Restoran Kapak Görseli Test</h1>
        <p className="text-gray-600">NeYisek.com restoran kapak görseli yükleme sistemini test edin</p>
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
              Restoran kapak görseli yükleme işlemini test edin
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

      {/* Bilgi Kartı */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">ℹ️ Test Bilgileri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-blue-800">
          <p><strong>Storage Path:</strong> restaurants/{restaurantId}/cover-{'{timestamp}'}.{'{extension}'}</p>
          <p><strong>Desteklenen Formatlar:</strong> PNG, JPG, JPEG, WebP</p>
          <p><strong>Maksimum Boyut:</strong> 10MB</p>
          <p><strong>Firebase Storage:</strong> {process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET}</p>
          <p><strong>Test Restoran ID:</strong> {restaurantId}</p>
        </CardContent>
      </Card>
    </div>
  );
} 