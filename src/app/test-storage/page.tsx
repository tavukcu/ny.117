'use client';

import { useState } from 'react';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL, listAll } from 'firebase/storage';
import Image from 'next/image';

export default function TestStoragePage() {
  const [uploadResult, setUploadResult] = useState<string>('');
  const [testFiles, setTestFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  // Firebase Storage bağlantısını test et
  const testStorageConnection = async () => {
    setLoading(true);
    setError('');
    setUploadResult('');
    
    try {
      console.log('🔥 Firebase Storage test başlatılıyor...');
      
      // Test dosyası oluştur
      const testData = new Blob(['Firebase Storage Connection Test'], { type: 'text/plain' });
      const testRef = ref(storage, 'test/connection-test.txt');
      
      // Test yüklemesi
      console.log('📤 Test dosyası yükleniyor...');
      await uploadBytes(testRef, testData);
      setUploadResult('✅ Yükleme başarılı!');
      
      // Test okuma
      console.log('📥 Test dosyası okunuyor...');
      const downloadURL = await getDownloadURL(testRef);
      console.log('🔗 Download URL:', downloadURL);
      
      setUploadResult(prev => prev + '\n✅ Okuma başarılı!\n🔗 URL: ' + downloadURL);
      
    } catch (error: any) {
      console.error('❌ Storage test hatası:', error);
      setError(`Hata: ${error.message}\nKod: ${error.code || 'N/A'}`);
    } finally {
      setLoading(false);
    }
  };

  // Mevcut dosyaları listele
  const listStorageFiles = async () => {
    setLoading(true);
    setError('');
    
    try {
      const restaurantsRef = ref(storage, 'restaurants');
      const result = await listAll(restaurantsRef);
      
      const files: string[] = [];
      for (const itemRef of result.items.slice(0, 5)) { // İlk 5 dosya
        try {
          const url = await getDownloadURL(itemRef);
          files.push(url);
        } catch (err) {
          console.warn('Dosya URL alınamadı:', itemRef.name, err);
        }
      }
      
      setTestFiles(files);
      setUploadResult(`✅ ${files.length} dosya bulundu ve URL'leri alındı`);
      
    } catch (error: any) {
      console.error('❌ Dosya listeleme hatası:', error);
      setError(`Listeleme hatası: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Test görsel yükleme
  const testImageUpload = async (file: File) => {
    setLoading(true);
    setError('');
    
    try {
      const imageRef = ref(storage, `test/images/${Date.now()}_${file.name}`);
      
      console.log('📤 Görsel yükleniyor:', file.name);
      const uploadResult = await uploadBytes(imageRef, file);
      
      console.log('🔗 Download URL alınıyor...');
      const downloadURL = await getDownloadURL(uploadResult.ref);
      
      setUploadResult(`✅ Görsel başarıyla yüklendi!\n🔗 URL: ${downloadURL}`);
      setTestFiles(prev => [downloadURL, ...prev]);
      
    } catch (error: any) {
      console.error('❌ Görsel yükleme hatası:', error);
      setError(`Görsel yükleme hatası: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          🔥 Firebase Storage Test Sayfası
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Test Butonları */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Test İşlemleri</h2>
            
            <div className="space-y-4">
              <button
                onClick={testStorageConnection}
                disabled={loading}
                className="w-full bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {loading ? '⏳ Test ediliyor...' : '🔗 Storage Bağlantısını Test Et'}
              </button>
              
              <button
                onClick={listStorageFiles}
                disabled={loading}
                className="w-full bg-green-600 text-white px-4 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {loading ? '⏳ Listeleniyor...' : '📁 Mevcut Dosyaları Listele'}
              </button>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Test Görseli Yükle
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) testImageUpload(file);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Sonuçlar */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Test Sonuçları</h2>
            
            {uploadResult && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <pre className="text-sm text-green-800 whitespace-pre-wrap">
                  {uploadResult}
                </pre>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <pre className="text-sm text-red-800 whitespace-pre-wrap">
                  {error}
                </pre>
              </div>
            )}
            
            {/* Storage Config Info */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
              <h3 className="font-medium text-gray-900 mb-2">Storage Konfigürasyonu:</h3>
              <div className="text-sm text-gray-600 space-y-1">
                <div>🪣 Bucket: {storage.app.options.storageBucket}</div>
                <div>🆔 Project ID: {storage.app.options.projectId}</div>
                <div>🌐 App ID: {storage.app.options.appId}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Test Görselleri */}
        {testFiles.length > 0 && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Test Görselleri</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {testFiles.map((url, index) => (
                <div key={index} className="bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={url}
                    alt={`Test ${index + 1}`}
                    width={200}
                    height={150}
                    className="w-full h-32 object-cover"
                    onError={(e) => {
                      console.error('Görsel yükleme hatası:', url);
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <div className="p-2">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline break-all"
                    >
                      URL'yi aç
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}