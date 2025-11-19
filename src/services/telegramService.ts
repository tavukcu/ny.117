import { Order, OrderStatus } from '@/types';
import { OrderService } from './orderService';

function buildMapsLink(address: string, provider: 'google' | 'apple' = 'google'): string {
  const encoded = encodeURIComponent(address);
  if (provider === 'apple') {
    return `https://maps.apple.com/?q=${encoded}`;
  }
  return `https://www.google.com/maps?q=${encoded}`;
}

export interface TelegramMessage {
  chat_id: string | number;
  text: string;
  reply_markup?: {
    inline_keyboard: Array<Array<{
      text: string;
      callback_data: string;
    }>>;
  };
  parse_mode?: 'HTML' | 'Markdown';
}

export interface TelegramNotificationData {
  orderId: string;
  restaurantId: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  deliveryAddress?: string;
  estimatedTime?: number;
  specialInstructions?: string;
}

interface RestaurantApplicationNotification {
  applicationId: string;
  restaurantName: string;
  contactName: string;
  phone: string;
  fullAddress: string;
  cuisineType: string;
  note?: string;
}

export class TelegramService {
  private static readonly BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  private static readonly API_URL = `https://api.telegram.org/bot${this.BOT_TOKEN}`;

  // Yeni sipariş bildirimi gönder (Admin + Restoran Sahibi)
  static async sendNewOrderNotification(data: TelegramNotificationData): Promise<boolean> {
    try {
      console.log('🤖 Telegram yeni sipariş bildirimi gönderiliyor:', data.orderId);

      // Admin chat ID'sini al - fallback ile
      const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID || '6343230742';
      console.log('🔍 DEBUG - adminChatId (with fallback):', adminChatId);
      
      // Restoran sahibinin Telegram chat ID'sini al
      const restaurantChatId = await this.getRestaurantTelegramId(data.restaurantId);

      const message = this.createNewOrderMessage(data);

      // Admin'e bildirim gönder
      if (adminChatId) {
        console.log('🔍 DEBUG - Sending admin message to:', adminChatId);
        await this.sendMessage({
          chat_id: adminChatId,
          text: `🔴 *ADMİN BİLDİRİMİ*\n\n${message.text}`,
          reply_markup: message.reply_markup,
          parse_mode: message.parse_mode
        });
        console.log('✅ DEBUG - Admin message sent successfully');
      }

      // Restoran sahibine bildirim gönder
      if (restaurantChatId) {
        await this.sendMessage({
          chat_id: restaurantChatId,
          text: message.text,
          reply_markup: message.reply_markup,
          parse_mode: message.parse_mode
        });
      }

      return true;
    } catch (error) {
      console.error('❌ Telegram yeni sipariş bildirimi hatası:', error);
      return false;
    }
  }

  static async sendRestaurantApplicationNotification(data: RestaurantApplicationNotification) {
    try {
      if (!this.BOT_TOKEN) {
        console.warn('Telegram bot token tanımsız, başvuru bildirimi gönderilemedi');
        return;
      }

      const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
      if (!adminChatId) return;

      const text = `
📥 *Yeni Restoran Başvurusu*

🏪 *Restoran:* ${data.restaurantName}
👤 *Yetkili:* ${data.contactName}
📞 *Telefon:* ${data.phone}
🍽️ *Mutfağı:* ${data.cuisineType}

📍 *Adres:*
${data.fullAddress}

📝 *Not:* ${data.note || 'Belirtilmedi'}
🆔 *Başvuru ID:* ${data.applicationId}
      `.trim();

      await this.sendMessage({
        chat_id: adminChatId,
        text,
        parse_mode: 'Markdown',
      });
    } catch (error) {
      console.error('Telegram başvuru bildirimi hatası:', error);
    }
  }

  // Sipariş durum güncelleme bildirimi
  static async sendStatusUpdateNotification(
    orderId: string,
    newStatus: OrderStatus,
    restaurantId: string,
    customerName: string
  ): Promise<boolean> {
    try {
      const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
      const restaurantChatId = await this.getRestaurantTelegramId(restaurantId);

      const statusText = this.getStatusText(newStatus);
      const statusEmoji = this.getStatusEmoji(newStatus);

      const message = `
${statusEmoji} <b>SİPARİŞ DURUMU GÜNCELLENDİ</b>

🆔 <b>Sipariş No:</b> #${orderId}
👤 <b>Müşteri:</b> ${customerName}
📊 <b>Yeni Durum:</b> ${statusText}
🕐 <b>Güncelleme:</b> ${new Date().toLocaleString('tr-TR')}

Müşteri otomatik olarak bilgilendirildi.
      `.trim();

      // Admin'e bildir
      if (adminChatId) {
        await this.sendMessage({
          chat_id: adminChatId,
          text: `🔴 ADMİN BİLDİRİMİ\n\n${message}`,
          parse_mode: 'HTML'
        });
      }

      // Restoran sahibine bildir
      if (restaurantChatId) {
        await this.sendMessage({
          chat_id: restaurantChatId,
          text: message,
          parse_mode: 'HTML'
        });
      }

      return true;
    } catch (error) {
      console.error('❌ Telegram durum güncelleme bildirimi hatası:', error);
      return false;
    }
  }

  // Yeni sipariş mesajı oluştur
  private static createNewOrderMessage(data: TelegramNotificationData): { text: string; reply_markup: any; parse_mode: 'Markdown' } {
    const itemsList = data.items
      .map(item => `• ${item.quantity}x ${item.name} - ₺${item.price.toFixed(2)}`)
      .join('\n');

    const addressText = data.deliveryAddress || 'Adres belirtilmemiş';
    const googleMapsUrl = buildMapsLink(addressText, 'google');
    const appleMapsUrl = buildMapsLink(addressText, 'apple');

    const text = `
🔴 *YENİ SİPARİŞ ALINDI!*

🪪 *Sipariş No:* \`${data.orderId}\`
👤 *Müşteri:* ${data.customerName}
📞 *Telefon:* ${data.customerPhone}
💰 *Toplam:* ₺${data.totalAmount.toFixed(2)}

🍽️ *Sipariş İçeriği:*
${itemsList}

📍 *Teslimat Adresi:*
${addressText}
[Google Haritalar'da aç](${googleMapsUrl})
[iPhone Haritalar’da aç](${appleMapsUrl})

⏱ *Tahmini Süre:* ${data.estimatedTime ? `${data.estimatedTime} dakika` : 'Belirtilmedi'}
${data.specialInstructions ? `\n📝 *Özel Talimatlar:*\n${data.specialInstructions}` : ''}

🚀 Siparişi hazırlamaya başlayabilirsiniz!
    `.trim();

    const orderId = data.orderId;

    return {
      text,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '✅ Onayla', callback_data: `approve:${orderId}` },
            { text: '❌ Reddet', callback_data: `reject:${orderId}` }
          ],
          [
            { text: '👨‍🍳 Hazırlanıyor', callback_data: `preparing:${orderId}` },
            { text: '🚚 Yolda', callback_data: `on_the_way:${orderId}` }
          ],
          [
            { text: '✅ Teslim Edildi', callback_data: `delivered:${orderId}` },
            { text: '📞 Müşteriyi Ara', callback_data: `call:${orderId}` }
          ]
        ]
      }
    };
  }

  // Telegram mesajı gönder
  private static async sendMessage(message: TelegramMessage): Promise<any> {
    try {
      if (!this.BOT_TOKEN) {
        throw new Error('Telegram Bot Token bulunamadı');
      }

      const response = await fetch(`${this.API_URL}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Telegram API Error: ${errorData.description}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Telegram mesaj gönderme hatası:', error);
      throw error;
    }
  }

  // Restoran Telegram ID'sini al
  private static async getRestaurantTelegramId(restaurantId: string): Promise<string | null> {
    try {
      // Firestore'dan restoran bilgilerini al
      const { doc, getDoc } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      
      const restaurantRef = doc(db, 'restaurants', restaurantId);
      const restaurantSnap = await getDoc(restaurantRef);
      
      if (restaurantSnap.exists()) {
        const restaurantData = restaurantSnap.data();
        
        // Telegram chat ID'sini al
        const telegramChatId = restaurantData?.notifications?.telegram?.chatId;
        const isEnabled = restaurantData?.notifications?.telegram?.isEnabled;
        
        if (telegramChatId && isEnabled) {
          return telegramChatId;
        }
        
        console.log('🟡 Restoran Telegram ayarları bulunamadı, admin chat ID kullanılıyor:', restaurantId);
        
        // Geçici çözüm: Admin chat ID'sini fallback olarak kullan
        const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;
        if (adminChatId) {
          console.log('📢 Admin chat ID ile mesaj gönderiliyor:', adminChatId);
          return adminChatId;
        }
        
        return null;
      }
      
      console.log('🟡 Restoran bulunamadı, admin chat ID kullanılıyor:', restaurantId);
      
      // Fallback: Admin chat ID'sini kullan
      return process.env.TELEGRAM_ADMIN_CHAT_ID || null;
    } catch (error) {
      console.error('❌ Restoran Telegram ID alınamadı, admin chat ID kullanılıyor:', error);
      
      // Fallback: Admin chat ID'sini kullan
      return process.env.TELEGRAM_ADMIN_CHAT_ID || null;
    }
  }

  // Arama için sipariş bilgilerini al
  private static async getOrderForCall(orderId: string): Promise<{customerName: string, customerPhone: string} | null> {
    try {
      // OrderService'den doğrudan sipariş bilgilerini al
      const order = await OrderService.getOrder(orderId);
      
      if (!order) {
        return null;
      }
      
      return {
        customerName: order.user?.displayName || 'Bilinmeyen Müşteri',
        customerPhone: order.user?.phoneNumber || 'Belirtilmemiş'
      };
    } catch (error) {
      console.error('❌ Sipariş bilgileri alınırken hata:', error);
      return null;
    }
  }

  private static async handleCallAction(callbackQuery: any, orderId: string, chatId: number): Promise<{ success: boolean }> {
    try {
      const order = await this.getOrderForCall(orderId);

      if (order && order.customerPhone) {
        const phoneMessage = `📞 <b>Müşteri İletişim Bilgileri</b>\n\n👤 <b>Ad:</b> ${order.customerName}\n📱 <b>Telefon:</b> <a href="tel:${order.customerPhone}">${order.customerPhone}</a>\n📋 <b>Sipariş:</b> #${orderId}\n\n💡 <i>Telefon numarasına tıklayarak arama yapabilirsiniz.</i>`;

        await this.sendMessage({
          chat_id: chatId,
          text: phoneMessage,
          parse_mode: 'HTML'
        });

        await this.answerCallbackQuery(callbackQuery.id, '📞 Telefon numarası gönderildi!');
      } else {
        await this.answerCallbackQuery(callbackQuery.id, '❌ Müşteri telefonu bulunamadı!');
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Arama butonu hatası:', error);
      await this.answerCallbackQuery(callbackQuery.id, '❌ Hata oluştu!');
      return { success: false };
    }
  }

  // Sipariş durumu metni
  private static getStatusText(status: OrderStatus): string {
    const statusMap: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: 'Beklemede',
      [OrderStatus.CONFIRMED]: 'Onaylandı',
      [OrderStatus.PREPARING]: 'Hazırlanıyor',
      [OrderStatus.READY]: 'Hazır',
      [OrderStatus.ASSIGNED]: 'Kurye Atandı',
      [OrderStatus.PICKED_UP]: 'Kurye Aldı',
      [OrderStatus.DELIVERING]: 'Yolda',
      [OrderStatus.ARRIVED]: 'Adrese Vardı',
      [OrderStatus.DELIVERED]: 'Teslim Edildi',
      [OrderStatus.CANCELLED]: 'İptal Edildi',
      [OrderStatus.REFUNDED]: 'İade Edildi'
    };
    return statusMap[status] || status;
  }

  // Durum emojisi
  private static getStatusEmoji(status: OrderStatus): string {
    const emojiMap: Record<OrderStatus, string> = {
      [OrderStatus.PENDING]: '⏳',
      [OrderStatus.CONFIRMED]: '✅',
      [OrderStatus.PREPARING]: '👨‍🍳',
      [OrderStatus.READY]: '🎯',
      [OrderStatus.ASSIGNED]: '👤',
      [OrderStatus.PICKED_UP]: '📦',
      [OrderStatus.DELIVERING]: '🚚',
      [OrderStatus.ARRIVED]: '📍',
      [OrderStatus.DELIVERED]: '🎉',
      [OrderStatus.CANCELLED]: '❌',
      [OrderStatus.REFUNDED]: '💰'
    };
    return emojiMap[status] || '📊';
  }

  // Webhook mesajlarını işle
  static async processWebhookMessage(body: any): Promise<{ success: boolean; response?: string }> {
    try {
      if (body.callback_query) {
        // Inline button'a tıklanma
        return await this.handleCallbackQuery(body.callback_query);
      }

      if (body.message) {
        // Normal mesaj
        return await this.handleTextMessage(body.message);
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Telegram webhook işleme hatası:', error);
      return { success: false };
    }
  }

  // Callback query işle (Inline button tıklamaları)
  private static async handleCallbackQuery(callbackQuery: any): Promise<{ success: boolean; response?: string }> {
    try {
      const data = callbackQuery.data;
      const chatId = callbackQuery.message.chat.id;
      const messageId = callbackQuery.message.message_id;

      console.log('🎯 Telegram callback query:', data);

      // Yeni inline format (approve:orderId vb.)
      if (typeof data === 'string' && data.includes(':')) {
        const [action, orderId] = data.split(':');
        if (!orderId) {
          await this.answerCallbackQuery(callbackQuery.id, '❌ Geçersiz sipariş ID');
          return { success: false };
        }

        if (action === 'call') {
          return await this.handleCallAction(callbackQuery, orderId, chatId);
        }

        if (action === 'status_info') {
          await this.answerCallbackQuery(callbackQuery.id, 'ℹ️ Bu adım zaten tamamlandı');
          return { success: true };
        }

        const statusMap: Record<string, { status: OrderStatus; message: string }> = {
          approve: { status: OrderStatus.CONFIRMED, message: '✅ Sipariş onaylandı' },
          reject: { status: OrderStatus.CANCELLED, message: '❌ Sipariş reddedildi' },
          preparing: { status: OrderStatus.PREPARING, message: '👨‍🍳 Sipariş hazırlanıyor' },
          on_the_way: { status: OrderStatus.DELIVERING, message: '🚚 Sipariş yolda' },
          delivered: { status: OrderStatus.DELIVERED, message: '✅ Sipariş teslim edildi' }
        };

        const mapped = statusMap[action];
        if (!mapped) {
          await this.answerCallbackQuery(callbackQuery.id, '❌ Bilinmeyen işlem');
          return { success: false };
        }

        try {
          const updatedBy = `telegram:${callbackQuery.from.id}`;
          await this.updateOrderStatus(orderId, mapped.status, updatedBy);
          await this.answerCallbackQuery(callbackQuery.id, mapped.message);
          await this.editMessageReplyMarkup(chatId, messageId, this.getUpdatedKeyboard(orderId, mapped.status));
          return { success: true, response: mapped.message };
        } catch (error) {
          console.error('❌ Sipariş durumu güncelleme hatası:', error);
          const errorMessage = error instanceof Error && error.message.includes('not found')
            ? '❌ Sipariş bulunamadı!'
            : '❌ Sipariş durumu güncellenirken bir hata oluştu!';
          await this.answerCallbackQuery(callbackQuery.id, errorMessage);
          await this.sendMessage({
            chat_id: chatId,
            text: `⚠️ <b>Hata</b>\n\n${errorMessage}\n\n📋 <b>Sipariş ID:</b> #${orderId}\n🔄 <b>İşlem:</b> ${action}`,
            parse_mode: 'HTML'
          });
          return { success: false, response: errorMessage };
        }
      }

      // Eski format (order_confirm_x)
      if (data.startsWith('order_')) {
        const parts = data.split('_');
        console.log('🔍 Callback data parts:', parts);
        
        if (parts.length < 3) {
          console.error('❌ Invalid callback data format:', data);
          await this.answerCallbackQuery(callbackQuery.id, '❌ Geçersiz format!');
          return { success: false };
        }
        
        const [action, status, ...orderIdParts] = parts;
        const orderId = orderIdParts.join('_'); // Sipariş ID'sinde _ olabilir
        
        console.log('🔍 Parsed - Action:', action, 'Status:', status, 'OrderId:', orderId);
        
        let newStatus: OrderStatus;
        let responseText: string;

        switch (status) {
          case 'confirm':
            newStatus = OrderStatus.CONFIRMED;
            responseText = '✅ Sipariş onaylandı!';
            break;
          case 'reject':
            newStatus = OrderStatus.CANCELLED;
            responseText = '❌ Sipariş reddedildi!';
            break;
          case 'preparing':
            newStatus = OrderStatus.PREPARING;
            responseText = '👨‍🍳 Sipariş hazırlanıyor!';
            break;
          case 'delivery':
            newStatus = OrderStatus.DELIVERING;
            responseText = '🚚 Sipariş yola çıktı!';
            break;
          case 'completed':
            newStatus = OrderStatus.DELIVERED;
            responseText = '✅ Sipariş teslim edildi!';
            break;
          default:
            throw new Error('Bilinmeyen sipariş durumu');
        }

        try {
          // Sipariş durumunu güncelle (OrderService'i kullanarak)
          // updatedBy: telegram:<chatId> formatında
          const updatedBy = `telegram:${callbackQuery.from.id}`;
          await this.updateOrderStatus(orderId, newStatus, updatedBy);

          // Callback query'yi yanıtla
          await this.answerCallbackQuery(callbackQuery.id, responseText);

          // Mesajı güncelle
          await this.editMessageReplyMarkup(chatId, messageId, this.getUpdatedKeyboard(orderId, newStatus));

          return { success: true, response: responseText };
        } catch (error) {
          console.error('❌ Sipariş durumu güncelleme hatası:', error);
          
          // Telegram'a hata mesajı gönder
          const errorMessage = error instanceof Error && error.message.includes('not found')
            ? '❌ Sipariş bulunamadı!'
            : '❌ Sipariş durumu güncellenirken bir hata oluştu!';
          
          await this.answerCallbackQuery(callbackQuery.id, errorMessage);
          
          // Hata mesajını chat'e de gönder
          await this.sendMessage({
            chat_id: chatId,
            text: `⚠️ <b>Hata</b>\n\n${errorMessage}\n\n📋 <b>Sipariş ID:</b> #${orderId}\n🔄 <b>Durum:</b> ${status}`,
            parse_mode: 'HTML'
          });
          
          return { success: false, response: errorMessage };
        }
      }

      // Müşteriyi arama
      if (data.startsWith('call_customer_')) {
        const orderId = data.replace('call_customer_', '');
        return await this.handleCallAction(callbackQuery, orderId, chatId);
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Callback query işleme hatası:', error);
      await this.answerCallbackQuery(callbackQuery.id, '❌ Hata oluştu!');
      return { success: false };
    }
  }

  // Text mesaj işle
  private static async handleTextMessage(message: any): Promise<{ success: boolean; response?: string }> {
    try {
      const text = message.text;
      const chatId = message.chat.id;

      if (text === '/start') {
        await this.sendMessage({
          chat_id: chatId,
          text: `🤖 <b>NeYisek Telegram Bot</b>\n\nMerhaba! Bu bot üzerinden sipariş bildirimleri alabilir ve sipariş durumlarını güncelleyebilirsiniz.\n\n📞 <b>Destek:</b> /help\n🏪 <b>Restoran Kurulumu:</b> Setup token'ınızı buraya gönderin`,
          parse_mode: 'HTML'
        });
      }

      if (text === '/help') {
        await this.sendMessage({
          chat_id: chatId,
          text: `📚 <b>Yardım</b>\n\n🆕 Yeni siparişler otomatik olarak bildirilir\n✅ Butonlara tıklayarak sipariş durumunu güncelleyebilirsiniz\n📊 Anlık durum bilgisi alırsınız\n\n🏪 <b>Restoran Sahipleri İçin:</b>\nSetup token'ınızı buraya göndererek Telegram bildirimlerini aktifleştirebilirsiniz.`,
          parse_mode: 'HTML'
        });
      }

      // Setup token kontrolü
      if (text && text.startsWith('SETUP_')) {
        const setupResult = await this.handleSetupToken(text, chatId);
        
        if (setupResult.success) {
          await this.sendMessage({
            chat_id: chatId,
            text: `✅ <b>Kurulum Başarılı!</b>\n\n🏪 <b>Restoran:</b> ${setupResult.restaurantName}\n📱 <b>Chat ID:</b> ${chatId}\n\n🎉 Artık sipariş bildirimleri alacaksınız!`,
            parse_mode: 'HTML'
          });
        } else {
          await this.sendMessage({
            chat_id: chatId,
            text: `❌ <b>Kurulum Başarısız</b>\n\n${setupResult.error}\n\nLütfen doğru setup token'ı kullandığınızdan emin olun.`,
            parse_mode: 'HTML'
          });
        }
      }

      return { success: true };
    } catch (error) {
      console.error('❌ Text mesaj işleme hatası:', error);
      return { success: false };
    }
  }



  // Sipariş durumunu güncelle
  private static async updateOrderStatus(orderId: string, newStatus: OrderStatus, updatedBy: string): Promise<void> {
    try {
      // OrderService'i import et ve kullan
      const { OrderService } = await import('./orderService');
      await OrderService.updateOrderStatus(orderId, newStatus, updatedBy);
      
      console.log(`✅ Sipariş durumu güncellendi: ${orderId} -> ${newStatus} (by: ${updatedBy})`);
    } catch (error) {
      console.error('❌ Sipariş durumu güncelleme hatası:', error);
      
      // Sipariş bulunamadı hatası için Telegram'a uyarı gönder
      if (error instanceof Error && error.message.includes('not found')) {
        throw new Error('Sipariş bulunamadı');
      }
      
      throw error;
    }
  }

  // Bot bilgilerini al
  static async getBotInfo(): Promise<any> {
    try {
      const response = await fetch(`${this.API_URL}/getMe`);
      return await response.json();
    } catch (error) {
      console.error('❌ Bot bilgisi alınamadı:', error);
      throw error;
    }
  }

  // Webhook ayarla
  static async setWebhook(webhookUrl: string): Promise<any> {
    try {
      const response = await fetch(`${this.API_URL}/setWebhook`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: webhookUrl,
          allowed_updates: ['message', 'callback_query']
        })
      });
      return await response.json();
    } catch (error) {
      console.error('❌ Webhook ayarlanamadı:', error);
      throw error;
    }
  }

  // Callback query'yi yanıtla
  private static async answerCallbackQuery(callbackQueryId: string, text?: string): Promise<void> {
    try {
      await fetch(`${this.API_URL}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          callback_query_id: callbackQueryId,
          text: text || '',
          show_alert: false
        })
      });
      console.log('✅ Callback query yanıtlandı:', callbackQueryId);
    } catch (error) {
      console.error('❌ Callback query yanıtlanamadı:', error);
    }
  }

  // Mesaj reply markup'ını güncelle
  private static async editMessageReplyMarkup(chatId: number, messageId: number, replyMarkup: any): Promise<void> {
    try {
      await fetch(`${this.API_URL}/editMessageReplyMarkup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          message_id: messageId,
          reply_markup: replyMarkup
        })
      });
      console.log('✅ Mesaj reply markup güncellendi');
    } catch (error) {
      console.error('❌ Mesaj reply markup güncellenemedi:', error);
    }
  }

  // Güncellenmiş keyboard'ı al
  private static getUpdatedKeyboard(orderId: string, status: OrderStatus): any {
    const isFinalStatus = status === OrderStatus.DELIVERED || status === OrderStatus.CANCELLED || status === OrderStatus.REFUNDED;

    const buildActionButton = (
      label: string,
      action: string,
      isActive: boolean,
      completedLabel?: string
    ) => ({
      text: isActive ? label : (completedLabel || `✅ ${label}`),
      callback_data: isActive ? `${action}:${orderId}` : `status_info:${orderId}`
    });

    if (isFinalStatus) {
      return {
        inline_keyboard: [
          [
            {
              text: `${this.getStatusEmoji(status)} ${this.getStatusText(status)}`,
              callback_data: `status_info_${orderId}`
            }
          ],
          [
            { text: '📞 Müşteriyi Ara', callback_data: `call_customer_${orderId}` }
          ]
        ]
      };
    }

    const confirmActive = status === OrderStatus.PENDING;
    const preparingActive = status === OrderStatus.PENDING || status === OrderStatus.CONFIRMED || status === OrderStatus.PREPARING;
    const deliveringActive = status === OrderStatus.PREPARING || status === OrderStatus.READY || status === OrderStatus.ASSIGNED || status === OrderStatus.PICKED_UP || status === OrderStatus.DELIVERING || status === OrderStatus.ARRIVED;
    const completeActive = status === OrderStatus.DELIVERING || status === OrderStatus.ARRIVED || status === OrderStatus.READY || status === OrderStatus.PICKED_UP;
    const rejectActive = !isFinalStatus;

    return {
      inline_keyboard: [
        [
          buildActionButton(
            confirmActive ? '✅ Onayla' : '✅ Onaylandı',
            'approve',
            confirmActive,
            '✅ Onaylandı'
          ),
          buildActionButton('❌ Reddet', 'reject', rejectActive, '❌ Reddedildi')
        ],
        [
          buildActionButton(
            preparingActive ? '👨‍🍳 Hazırlanıyor' : '👨‍🍳 Hazırlanıyor ✅',
            'preparing',
            preparingActive,
            '👨‍🍳 Hazırlanıyor ✅'
          ),
          buildActionButton(
            deliveringActive ? '🚚 Yolda' : '🚚 Yolda ✅',
            'on_the_way',
            deliveringActive,
            '🚚 Yolda ✅'
          )
        ],
        [
          buildActionButton(
            '✅ Teslim Edildi',
            'delivered',
            completeActive,
            '✅ Teslim Edildi'
          ),
          { text: '📞 Müşteriyi Ara', callback_data: `call:${orderId}` }
        ]
      ]
    };
  }

  // Restoran chat'ini test et
  static async testRestaurantChat(chatId: string, restaurantName: string): Promise<{ success: boolean; error?: string }> {
    try {
      const testMessage = `🤖 <b>NeYisek Telegram Test</b>\n\n✅ <b>Bağlantı başarılı!</b>\n\n🏪 <b>Restoran:</b> ${restaurantName}\n📱 <b>Chat ID:</b> ${chatId}\n🕐 <b>Test Zamanı:</b> ${new Date().toLocaleString('tr-TR')}\n\n🎉 Artık sipariş bildirimleri alabilirsiniz!`;

      const response = await this.sendMessage({
        chat_id: chatId,
        text: testMessage,
        parse_mode: 'HTML'
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Telegram chat test hatası:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Bilinmeyen hata' 
      };
    }
  }

  // Test mesajı gönder
  static async sendTestMessage(chatId: string, restaurantName: string): Promise<{ success: boolean; error?: string }> {
    try {
      const testMessage = `🧪 <b>Test Mesajı</b>\n\n✅ <b>Telegram bildirimleri çalışıyor!</b>\n\n🏪 <b>Restoran:</b> ${restaurantName}\n🕐 <b>Test Zamanı:</b> ${new Date().toLocaleString('tr-TR')}\n\n💡 Bu bir test mesajıdır. Gerçek siparişlerde bu şekilde bildirim alacaksınız.`;

      await this.sendMessage({
        chat_id: chatId,
        text: testMessage,
        parse_mode: 'HTML'
      });

      return { success: true };
    } catch (error) {
      console.error('❌ Test mesajı gönderme hatası:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Test mesajı gönderilemedi' 
      };
    }
  }

  // Setup token işle
  private static async handleSetupToken(setupToken: string, chatId: number): Promise<{ success: boolean; error?: string; restaurantName?: string }> {
    try {
      // Token formatını kontrol et: SETUP_{restaurantId}_{timestamp}
      const tokenParts = setupToken.split('_');
      if (tokenParts.length !== 3 || tokenParts[0] !== 'SETUP') {
        return { success: false, error: 'Geçersiz token formatı' };
      }

      const restaurantId = tokenParts[1];
      
      // Firestore'dan restoran bilgilerini al
      const { doc, getDoc, updateDoc, serverTimestamp } = await import('firebase/firestore');
      const { db } = await import('@/lib/firebase');
      
      const restaurantRef = doc(db, 'restaurants', restaurantId);
      const restaurantSnap = await getDoc(restaurantRef);
      
      if (!restaurantSnap.exists()) {
        return { success: false, error: 'Restoran bulunamadı' };
      }

      const restaurantData = restaurantSnap.data();
      const storedSetupToken = restaurantData?.notifications?.telegram?.setupToken;

      // Token'ı doğrula
      if (storedSetupToken !== setupToken) {
        return { success: false, error: 'Geçersiz veya süresi dolmuş token' };
      }

      // Chat ID'yi ve diğer ayarları kaydet
      await updateDoc(restaurantRef, {
        'notifications.telegram.chatId': chatId.toString(),
        'notifications.telegram.isEnabled': true,
        'notifications.telegram.setupAt': serverTimestamp(),
        'notifications.telegram.setupToken': null, // Token'ı temizle
        updatedAt: serverTimestamp()
      });

      console.log(`✅ Restoran Telegram kurulumu tamamlandı: ${restaurantId} -> ${chatId}`);

      return { 
        success: true, 
        restaurantName: restaurantData.name || 'Bilinmeyen Restoran' 
      };

    } catch (error) {
      console.error('❌ Setup token işleme hatası:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Setup token işlenemedi' 
      };
    }
  }
}