import { NextRequest, NextResponse } from 'next/server';
import { TelegramService } from '@/services/telegramService';

export async function GET(request: NextRequest) {
  // Webhook verification için
  return NextResponse.json({ 
    status: 'OK', 
    message: 'Telegram Webhook endpoint is ready',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  try {
    console.log('🤖 Telegram webhook çağrıldı');
    
    const body = await request.json();
    console.log('📥 Telegram webhook verisi:', JSON.stringify(body, null, 2));

    // Telegram servisine mesajı işlet
    const result = await TelegramService.processWebhookMessage(body);

    if (result.success) {
      console.log('✅ Telegram webhook başarıyla işlendi:', result.response);
      return NextResponse.json({ 
        ok: true, 
        message: result.response || 'Processed successfully' 
      });
    } else {
      console.error('❌ Telegram webhook işleme hatası');
      return NextResponse.json({ 
        ok: false, 
        error: 'Processing failed' 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('❌ Telegram webhook kritik hata:', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}