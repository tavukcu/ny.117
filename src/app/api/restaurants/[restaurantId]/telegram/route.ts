import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { TelegramService } from '@/services/telegramService';

// Restoran Telegram ayarlarını al
export async function GET(
  request: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    const { restaurantId } = params;

    // Restoran bilgilerini al
    const restaurantRef = doc(db, 'restaurants', restaurantId);
    const restaurantSnap = await getDoc(restaurantRef);

    if (!restaurantSnap.exists()) {
      return NextResponse.json(
        { error: 'Restoran bulunamadı' },
        { status: 404 }
      );
    }

    const restaurantData = restaurantSnap.data();
    const telegramSettings = restaurantData?.notifications?.telegram || {};

    return NextResponse.json({
      success: true,
      telegram: {
        isEnabled: telegramSettings.isEnabled || false,
        isConfigured: !!telegramSettings.chatId,
        setupAt: telegramSettings.setupAt,
        setupToken: telegramSettings.setupToken
      }
    });

  } catch (error) {
    console.error('❌ Telegram ayarları alınamadı:', error);
    return NextResponse.json(
      { error: 'Telegram ayarları alınamadı' },
      { status: 500 }
    );
  }
}

// Restoran Telegram kurulumunu başlat
export async function POST(
  request: NextRequest,
  { params }: { params: { restaurantId: string } }
) {
  try {
    const { restaurantId } = params;
    const body = await request.json();
    const { action, chatId } = body;

    const restaurantRef = doc(db, 'restaurants', restaurantId);
    const restaurantSnap = await getDoc(restaurantRef);

    if (!restaurantSnap.exists()) {
      return NextResponse.json(
        { error: 'Restoran bulunamadı' },
        { status: 404 }
      );
    }

    const restaurantData = restaurantSnap.data();

    switch (action) {
      case 'generate_setup_token':
        // Setup token oluştur
        const setupToken = `SETUP_${restaurantId}_${Date.now()}`;
        
        await updateDoc(restaurantRef, {
          'notifications.telegram.setupToken': setupToken,
          'notifications.telegram.isEnabled': false,
          updatedAt: serverTimestamp()
        });

        return NextResponse.json({
          success: true,
          setupToken,
          message: 'Setup token oluşturuldu',
          instructions: [
            `1. Telegram'da @${process.env.TELEGRAM_BOT_USERNAME || 'neyisek_bot'} botunu bulun`,
            '2. Bota /start komutunu gönderin',
            `3. Setup token'ınızı gönderin: ${setupToken}`,
            '4. Bot size onay mesajı gönderecek'
          ]
        });

      case 'configure_chat_id':
        if (!chatId) {
          return NextResponse.json(
            { error: 'Chat ID gerekli' },
            { status: 400 }
          );
        }

        // Chat ID'yi test et
        const testResult = await TelegramService.testRestaurantChat(chatId, restaurantData.name);
        
        if (!testResult.success) {
          return NextResponse.json(
            { error: 'Telegram test başarısız: ' + testResult.error },
            { status: 400 }
          );
        }

        // Chat ID'yi kaydet
        await updateDoc(restaurantRef, {
          'notifications.telegram.chatId': chatId,
          'notifications.telegram.isEnabled': true,
          'notifications.telegram.setupAt': serverTimestamp(),
          'notifications.telegram.setupToken': null, // Token'ı temizle
          updatedAt: serverTimestamp()
        });

        return NextResponse.json({
          success: true,
          message: 'Telegram başarıyla yapılandırıldı!',
          chatId
        });

      case 'disable':
        // Telegram bildirimlerini devre dışı bırak
        await updateDoc(restaurantRef, {
          'notifications.telegram.isEnabled': false,
          updatedAt: serverTimestamp()
        });

        return NextResponse.json({
          success: true,
          message: 'Telegram bildirimleri devre dışı bırakıldı'
        });

      case 'test':
        // Test mesajı gönder
        const currentChatId = restaurantData?.notifications?.telegram?.chatId;
        
        if (!currentChatId) {
          return NextResponse.json(
            { error: 'Telegram chat ID yapılandırılmamış' },
            { status: 400 }
          );
        }

        const testMessageResult = await TelegramService.sendTestMessage(
          currentChatId, 
          restaurantData.name
        );

        if (testMessageResult.success) {
          return NextResponse.json({
            success: true,
            message: 'Test mesajı gönderildi!'
          });
        } else {
          return NextResponse.json(
            { error: 'Test mesajı gönderilemedi: ' + testMessageResult.error },
            { status: 400 }
          );
        }

      default:
        return NextResponse.json(
          { error: 'Geçersiz aksiyon' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('❌ Telegram kurulum hatası:', error);
    return NextResponse.json(
      { error: 'Telegram kurulumu başarısız' },
      { status: 500 }
    );
  }
}