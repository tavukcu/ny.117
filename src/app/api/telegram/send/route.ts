import { NextRequest, NextResponse } from 'next/server';
import { TelegramService } from '@/services/telegramService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    console.log('📨 Telegram mesaj gönderme isteği:', type, data?.orderId);

    switch (type) {
      case 'new_order':
        const success = await TelegramService.sendNewOrderNotification(data);
        return NextResponse.json({ 
          success, 
          message: success ? 'Telegram bildirimi gönderildi' : 'Telegram bildirimi gönderilemedi' 
        });

      case 'status_update':
        const statusSuccess = await TelegramService.sendStatusUpdateNotification(
          data.orderId,
          data.newStatus,
          data.restaurantId,
          data.customerName
        );
        return NextResponse.json({ 
          success: statusSuccess, 
          message: statusSuccess ? 'Durum güncelleme bildirimi gönderildi' : 'Durum güncelleme bildirimi gönderilemedi' 
        });

      default:
        return NextResponse.json({ 
          success: false, 
          error: 'Geçersiz mesaj tipi' 
        }, { status: 400 });
    }

  } catch (error) {
    console.error('❌ Telegram mesaj gönderme API hatası:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Telegram mesajı gönderilemedi' 
    }, { status: 500 });
  }
}