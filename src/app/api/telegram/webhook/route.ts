import { NextRequest, NextResponse } from 'next/server';
import { TelegramService } from '@/services/telegramService';
import { OrderService } from '@/services/orderService';
import { OrderStatus } from '@/types';

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

async function answerCallback(callbackId: string, text: string) {
  if (!BOT_TOKEN) {
    console.warn('Telegram bot token tanımlı değil, callback yanıtlanamadı');
    return;
  }

  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      callback_query_id: callbackId,
      text,
      show_alert: false,
    }),
  });
}

async function handleInlineCallback(callback: any): Promise<boolean> {
  const data: string | undefined = callback?.data;
  if (!data || typeof data !== 'string' || !data.includes(':')) {
    return false;
  }

  const [action, orderId] = data.split(':');
  if (!orderId) {
    await answerCallback(callback.id, '❌ Geçersiz sipariş ID');
    return true;
  }

  if (action === 'call') {
    await answerCallback(callback.id, '📞 Müşteri telefonu mesajda yazıyor, arayabilirsiniz.');
    return true;
  }

  if (action === 'status_info') {
    await answerCallback(callback.id, 'ℹ️ Bu adım zaten tamamlandı');
    return true;
  }

  const statusMap: Record<string, { status: OrderStatus; message: string }> = {
    approve: { status: OrderStatus.CONFIRMED, message: '✅ Sipariş onaylandı' },
    reject: { status: OrderStatus.CANCELLED, message: '❌ Sipariş reddedildi' },
    preparing: { status: OrderStatus.PREPARING, message: '👨‍🍳 Sipariş hazırlanıyor' },
    on_the_way: { status: OrderStatus.DELIVERING, message: '🚚 Sipariş yolda' },
    delivered: { status: OrderStatus.DELIVERED, message: '✅ Sipariş teslim edildi' },
  };

  const mapped = statusMap[action];
  if (!mapped) {
    await answerCallback(callback.id, '❌ Bilinmeyen işlem');
    return true;
  }

  try {
    const updatedBy = callback.from?.id ? `telegram:${callback.from.id}` : 'telegram';
    await OrderService.updateOrderStatus(orderId, mapped.status, updatedBy);
    await answerCallback(callback.id, mapped.message);
  } catch (error) {
    console.error('Telegram inline callback hata:', error);
    await answerCallback(callback.id, '❌ Sipariş durumu güncellenemedi');
  }

  return true;
}

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

    if (body.callback_query) {
      const handled = await handleInlineCallback(body.callback_query);
      if (handled) {
        return NextResponse.json({ ok: true });
      }
    }

    // Telegram servisine mesajı işlet (diğer senaryolar)
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