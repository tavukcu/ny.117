import { NextRequest, NextResponse } from 'next/server';
import { TelegramService } from '@/services/telegramService';

export async function POST(request: NextRequest) {
  try {
    const { webhookUrl } = await request.json();
    
    if (!webhookUrl) {
      return NextResponse.json({ 
        error: 'Webhook URL gerekli' 
      }, { status: 400 });
    }

    console.log('🔧 Telegram webhook ayarlanıyor:', webhookUrl);

    // Bot bilgilerini al
    const botInfo = await TelegramService.getBotInfo();
    console.log('🤖 Bot bilgileri:', botInfo);

    // Webhook'u ayarla
    const webhookResult = await TelegramService.setWebhook(webhookUrl);
    console.log('🔗 Webhook sonucu:', webhookResult);

    return NextResponse.json({ 
      success: true,
      botInfo,
      webhookResult,
      message: 'Telegram webhook başarıyla ayarlandı'
    });

  } catch (error) {
    console.error('❌ Telegram setup hatası:', error);
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Bilinmeyen hata'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    // Bot durumunu kontrol et
    const botInfo = await TelegramService.getBotInfo();
    
    // Webhook URL'ini güvenli bir şekilde oluştur
    const domain = process.env.NEXT_PUBLIC_DOMAIN || 'https://neyisek.com';
    const webhookUrl = `${domain}/api/telegram/webhook`;
    
    return NextResponse.json({ 
      success: true,
      botInfo,
      status: 'Bot aktif',
      webhookUrl,
      domain: process.env.NEXT_PUBLIC_DOMAIN, // Debug için
      env_check: {
        NEXT_PUBLIC_DOMAIN: process.env.NEXT_PUBLIC_DOMAIN,
        NODE_ENV: process.env.NODE_ENV
      }
    });

  } catch (error) {
    console.error('❌ Telegram bot status hatası:', error);
    return NextResponse.json({ 
      success: false,
      error: 'Bot bilgileri alınamadı'
    }, { status: 500 });
  }
}