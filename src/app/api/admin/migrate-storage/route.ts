import { NextRequest, NextResponse } from 'next/server';
import { StorageMigrationService } from '@/scripts/storageMigration';

// POST: Storage migration işlemi
export async function POST(request: NextRequest) {
  try {
    // Development ortamında çalışır
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Bu işlem sadece development ortamında çalışır' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { action, folders } = body;

    console.log('🚀 Storage Migration API çağrıldı:', { action, folders });

    let result;

    switch (action) {
      case 'all':
        console.log('📦 Tüm ana klasörler migrate ediliyor...');
        result = await StorageMigrationService.migrateAllStorageFolders();
        break;

      case 'entire':
        console.log('📦 Tüm storage migrate ediliyor...');
        result = await StorageMigrationService.migrateEntireStorage();
        break;

      case 'folder':
        const folderName = folders?.[0];
        if (!folderName) {
          return NextResponse.json(
            { error: 'Tek klasör migration için folder adı gerekli' },
            { status: 400 }
          );
        }
        console.log('📦 Tek klasör migrate ediliyor:', folderName);
        result = [await StorageMigrationService.migrateStorageFolder(folderName)];
        break;

      case 'validate':
        console.log('🔍 Storage migration doğrulaması yapılıyor...');
        const validation = await StorageMigrationService.validateStorageMigration();
        return NextResponse.json({
          success: true,
          action: 'validate',
          validation
        });

      default:
        return NextResponse.json(
          { error: 'Geçersiz action. Kullanılabilir: all, entire, folder, validate' },
          { status: 400 }
        );
    }

    // Sonuçları analiz et
    const totalFiles = result.reduce((sum, r) => sum + r.totalFiles, 0);
    const totalMigrated = result.reduce((sum, r) => sum + r.migratedFiles, 0);
    const totalErrors = result.reduce((sum, r) => sum + r.errors.length, 0);
    const hasErrors = totalErrors > 0;

    // Toplam dosya boyutunu hesapla
    const totalSize = result.reduce((sum, r) => 
      sum + r.fileDetails.reduce((fileSum, file) => fileSum + file.size, 0), 0
    );

    console.log('✅ Storage Migration API tamamlandı');
    return NextResponse.json({
      success: !hasErrors,
      action,
      results: result,
      summary: {
        totalFiles,
        totalMigrated,
        totalErrors,
        totalSize,
        totalSizeFormatted: StorageMigrationService.formatFileSize(totalSize),
        successRate: totalFiles > 0 ? Math.round((totalMigrated / totalFiles) * 100) : 0,
        foldersProcessed: result.length
      }
    });

  } catch (error) {
    console.error('❌ Storage Migration API hatası:', error);
    return NextResponse.json(
      { 
        error: 'Storage migration işlemi sırasında hata oluştu', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

// GET: Storage migration durumunu kontrol et
export async function GET(request: NextRequest) {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Bu endpoint sadece development ortamında çalışır' },
        { status: 403 }
      );
    }

    // Storage validation yap
    const validation = await StorageMigrationService.validateStorageMigration();
    
    // Özet çıkar
    const folders = Object.keys(validation);
    const totalOld = Object.values(validation).reduce((sum, v) => sum + v.old, 0);
    const totalNew = Object.values(validation).reduce((sum, v) => sum + v.new, 0);
    const matchingFolders = Object.values(validation).filter(v => v.match).length;

    return NextResponse.json({
      success: true,
      validation,
      summary: {
        totalFolders: folders.length,
        totalOldFiles: totalOld,
        totalNewFiles: totalNew,
        matchingFolders,
        migrationComplete: matchingFolders === folders.length && totalOld > 0
      }
    });

  } catch (error) {
    console.error('❌ Storage validation hatası:', error);
    return NextResponse.json(
      { 
        error: 'Storage validation sırasında hata oluştu', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
} 