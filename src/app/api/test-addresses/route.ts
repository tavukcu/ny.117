import { NextRequest, NextResponse } from 'next/server';
import { createAddressCollection, checkAddressCollection } from '@/scripts/createAddressCollection';

// Test endpoint - Adres koleksiyonu oluşturma ve kontrol
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Adres koleksiyonu test başlatılıyor...');

    // Mevcut adresleri kontrol et
    const currentCount = await checkAddressCollection();

    if (currentCount === 0) {
      console.log('📝 Örnek adresler oluşturuluyor...');
      await createAddressCollection();
    }

    // Son durumu kontrol et
    const finalCount = await checkAddressCollection();

    return NextResponse.json({
      success: true,
      message: 'Adres koleksiyonu test tamamlandı',
      initialCount: currentCount,
      finalCount: finalCount,
      addressesCreated: finalCount - currentCount
    });

  } catch (error) {
    console.error('❌ Adres koleksiyonu test hatası:', error);
    return NextResponse.json(
      { error: 'Test sırasında hata oluştu', details: error },
      { status: 500 }
    );
  }
}

// Test endpoint - Belirli kullanıcı için adres oluşturma
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, addressData } = body;

    if (!userId || !addressData) {
      return NextResponse.json(
        { error: 'userId ve addressData gerekli' },
        { status: 400 }
      );
    }

    const { createAddressForUser } = await import('@/scripts/createAddressCollection');
    const result = await createAddressForUser(userId, addressData);

    return NextResponse.json({
      success: true,
      message: 'Test adresi oluşturuldu',
      addressId: result.id
    });

  } catch (error) {
    console.error('❌ Test adresi oluşturma hatası:', error);
    return NextResponse.json(
      { error: 'Test adresi oluşturulurken hata oluştu' },
      { status: 500 }
    );
  }
} 