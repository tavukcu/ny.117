import { NextRequest, NextResponse } from 'next/server';
import { DataMigrationService } from '@/scripts/migrationScript';

// POST: Veri migration işlemi
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
    const { action, collections } = body;

    console.log('🚀 Migration API çağrıldı:', { action, collections });

    let result;

    switch (action) {
      case 'all':
        console.log('📦 Tüm koleksiyonlar migrate ediliyor...');
        result = await DataMigrationService.migrateAllCollections();
        break;

      case 'selected':
        if (!collections || !Array.isArray(collections)) {
          return NextResponse.json(
            { error: 'Seçili koleksiyonlar için collections array gerekli' },
            { status: 400 }
          );
        }
        console.log('📦 Seçili koleksiyonlar migrate ediliyor:', collections);
        result = await DataMigrationService.migrateSelectedCollections(collections);
        break;

      case 'single':
        const collectionName = collections?.[0];
        if (!collectionName) {
          return NextResponse.json(
            { error: 'Tek koleksiyon migration için collection adı gerekli' },
            { status: 400 }
          );
        }
        console.log('📦 Tek koleksiyon migrate ediliyor:', collectionName);
        result = [await DataMigrationService.migrateCollection(collectionName)];
        break;

      case 'validate':
        console.log('🔍 Migration doğrulaması yapılıyor...');
        const validation = await DataMigrationService.validateMigration();
        return NextResponse.json({
          success: true,
          action: 'validate',
          validation
        });

      default:
        return NextResponse.json(
          { error: 'Geçersiz action. Kullanılabilir: all, selected, single, validate' },
          { status: 400 }
        );
    }

    // Sonuçları analiz et
    const totalDocuments = result.reduce((sum, r) => sum + r.totalDocuments, 0);
    const totalMigrated = result.reduce((sum, r) => sum + r.migratedDocuments, 0);
    const totalErrors = result.reduce((sum, r) => sum + r.errors.length, 0);
    const hasErrors = totalErrors > 0;

    console.log('✅ Migration API tamamlandı');
    return NextResponse.json({
      success: !hasErrors,
      action,
      results: result,
      summary: {
        totalDocuments,
        totalMigrated,
        totalErrors,
        successRate: totalDocuments > 0 ? Math.round((totalMigrated / totalDocuments) * 100) : 0
      }
    });

  } catch (error) {
    console.error('❌ Migration API hatası:', error);
    return NextResponse.json(
      { 
        error: 'Migration işlemi sırasında hata oluştu', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
}

// GET: Migration durumunu kontrol et
export async function GET(request: NextRequest) {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return NextResponse.json(
        { error: 'Bu endpoint sadece development ortamında çalışır' },
        { status: 403 }
      );
    }

    // Migration validation yap
    const validation = await DataMigrationService.validateMigration();
    
    // Özet çıkar
    const collections = Object.keys(validation);
    const totalOld = Object.values(validation).reduce((sum, v) => sum + v.old, 0);
    const totalNew = Object.values(validation).reduce((sum, v) => sum + v.new, 0);
    const matchingCollections = Object.values(validation).filter(v => v.match).length;

    return NextResponse.json({
      success: true,
      validation,
      summary: {
        totalCollections: collections.length,
        totalOldDocuments: totalOld,
        totalNewDocuments: totalNew,
        matchingCollections,
        migrationComplete: matchingCollections === collections.length
      }
    });

  } catch (error) {
    console.error('❌ Migration validation hatası:', error);
    return NextResponse.json(
      { 
        error: 'Migration validation sırasında hata oluştu', 
        details: error instanceof Error ? error.message : String(error) 
      },
      { status: 500 }
    );
  }
} 