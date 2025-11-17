import { Order, OrderStatus, Restaurant } from '@/types';

export interface WhatsAppMessage {
  to: string;
  type: 'text' | 'template' | 'interactive';
  text?: {
    body: string;
  };
  template?: {
    name: string;
    language: {
      code: string;
    };
    components?: any[];
  };
  interactive?: {
    type: 'button' | 'list';
    body: {
      text: string;
    };
    action: {
      buttons?: Array<{
        type: 'reply';
        reply: {
          id: string;
          title: string;
        };
      }>;
      sections?: any[];
    };
  };
}

export interface WhatsAppNotificationData {
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

export class WhatsAppService {
  private static readonly API_URL = process.env.WHATSAPP_API_URL || 'https://graph.facebook.com/v18.0';
  private static readonly PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
  private static readonly ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;

  // Yeni sipariş bildirimi gönder
  static async sendNewOrderNotification(data: WhatsAppNotificationData): Promise<boolean> {
    try {
      const message = this.createNewOrderMessage(data);
      return await this.sendMessage(message);
    } catch (error) {
      console.error('WhatsApp yeni sipariş bildirimi hatası:', error);
      return false;
    }
  }

  // Sipariş durumu güncelleme bildirimi gönder
  static async sendOrderStatusUpdate(
    restaurantPhone: string,
    orderId: string,
    status: OrderStatus,
    customerName: string,
    estimatedTime?: number
  ): Promise<boolean> {
    try {
      const message = this.createStatusUpdateMessage(orderId, status, customerName, estimatedTime);
      return await this.sendMessage({ ...message, to: restaurantPhone });
    } catch (error) {
      console.error('WhatsApp durum güncelleme hatası:', error);
      return false;
    }
  }

  // Sipariş iptal bildirimi gönder
  static async sendOrderCancellation(
    restaurantPhone: string,
    orderId: string,
    customerName: string,
    reason?: string
  ): Promise<boolean> {
    try {
      const message = this.createCancellationMessage(orderId, customerName, reason);
      return await this.sendMessage({ ...message, to: restaurantPhone });
    } catch (error) {
      console.error('WhatsApp iptal bildirimi hatası:', error);
      return false;
    }
  }

  // Acil durum bildirimi gönder
  static async sendEmergencyNotification(
    restaurantPhone: string,
    message: string,
    orderId?: string
  ): Promise<boolean> {
    try {
      const whatsappMessage = this.createEmergencyMessage(message, orderId);
      return await this.sendMessage({ ...whatsappMessage, to: restaurantPhone });
    } catch (error) {
      console.error('WhatsApp acil durum bildirimi hatası:', error);
      return false;
    }
  }

  // Özel mesaj gönder
  static async sendCustomMessage(
    phoneNumber: string,
    message: string,
    buttons?: Array<{ id: string; title: string }>
  ): Promise<boolean> {
    try {
      const whatsappMessage = buttons 
        ? this.createInteractiveMessage(message, buttons)
        : this.createTextMessage(message);
      
      return await this.sendMessage({ ...whatsappMessage, to: phoneNumber });
    } catch (error) {
      console.error('WhatsApp özel mesaj hatası:', error);
      return false;
    }
  }

  // Yeni sipariş mesajı oluştur
  private static createNewOrderMessage(data: WhatsAppNotificationData): WhatsAppMessage {
    const itemsList = data.items
      .map(item => `• ${item.quantity}x ${item.name} - ₺${item.price}`)
      .join('\n');

    const body = `🆕 *YENİ SİPARİŞ ALINDI!*

📋 *Sipariş Detayları:*
🆔 Sipariş No: #${data.orderId.slice(-8)}
👤 Müşteri: ${data.customerName}
📞 Telefon: ${data.customerPhone}
💰 Toplam: ₺${data.totalAmount}

🍽️ *Sipariş İçeriği:*
${itemsList}

${data.deliveryAddress ? `📍 Teslimat Adresi:\n${data.deliveryAddress}\n` : ''}
${data.estimatedTime ? `⏱️ Tahmini Süre: ${data.estimatedTime} dakika\n` : ''}
${data.specialInstructions ? `📝 Özel Talimatlar:\n${data.specialInstructions}\n` : ''}

🚀 Siparişi hazırlamaya başlayabilirsiniz!`;

    return {
      to: '', // Restoran telefonu burada set edilecek
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: body
        },
        action: {
          buttons: [
            {
              type: 'reply',
              reply: {
                id: 'confirm_order',
                title: '✅ Onayla'
              }
            },
            {
              type: 'reply',
              reply: {
                id: 'reject_order',
                title: '❌ Reddet'
              }
            },
            {
              type: 'reply',
              reply: {
                id: 'contact_customer',
                title: '📞 Ara'
              }
            }
          ]
        }
      }
    };
  }

  // Durum güncelleme mesajı oluştur
  private static createStatusUpdateMessage(
    orderId: string,
    status: OrderStatus,
    customerName: string,
    estimatedTime?: number
  ): WhatsAppMessage {
    const statusText = this.getStatusText(status);
    const statusEmoji = this.getStatusEmoji(status);

    const body = `${statusEmoji} *SİPARİŞ DURUMU GÜNCELLENDİ*

🆔 Sipariş No: #${orderId.slice(-8)}
👤 Müşteri: ${customerName}
📊 Durum: ${statusText}
${estimatedTime ? `⏱️ Tahmini Süre: ${estimatedTime} dakika` : ''}

Müşteri bilgilendirildi.`;

    return {
      to: '',
      type: 'text',
      text: { body }
    };
  }

  // İptal mesajı oluştur
  private static createCancellationMessage(
    orderId: string,
    customerName: string,
    reason?: string
  ): WhatsAppMessage {
    const body = `❌ *SİPARİŞ İPTAL EDİLDİ*

🆔 Sipariş No: #${orderId.slice(-8)}
👤 Müşteri: ${customerName}
${reason ? `📝 Sebep: ${reason}` : ''}

Sipariş iptal edildi ve müşteri bilgilendirildi.`;

    return {
      to: '',
      type: 'text',
      text: { body }
    };
  }

  // Acil durum mesajı oluştur
  private static createEmergencyMessage(message: string, orderId?: string): WhatsAppMessage {
    const body = `🚨 *ACİL DURUM BİLDİRİMİ*

${orderId ? `🆔 Sipariş No: #${orderId.slice(-8)}\n` : ''}
⚠️ ${message}

Lütfen hemen müdahale edin!`;

    return {
      to: '',
      type: 'text',
      text: { body }
    };
  }

  // Metin mesajı oluştur
  private static createTextMessage(text: string): WhatsAppMessage {
    return {
      to: '',
      type: 'text',
      text: { body: text }
    };
  }

  // Etkileşimli mesaj oluştur
  private static createInteractiveMessage(
    text: string,
    buttons: Array<{ id: string; title: string }>
  ): WhatsAppMessage {
    return {
      to: '',
      type: 'interactive',
      interactive: {
        type: 'button',
        body: {
          text: text
        },
        action: {
          buttons: buttons.map(button => ({
            type: 'reply' as const,
            reply: {
              id: button.id,
              title: button.title
            }
          }))
        }
      }
    };
  }

  // WhatsApp API'ye mesaj gönder
  private static async sendMessage(message: WhatsAppMessage): Promise<boolean> {
    if (!this.PHONE_NUMBER_ID || !this.ACCESS_TOKEN) {
      console.error('WhatsApp API bilgileri eksik');
      return false;
    }

    try {
      const response = await fetch(`${this.API_URL}/${this.PHONE_NUMBER_ID}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(message)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('WhatsApp API hatası:', errorData);
        return false;
      }

      const result = await response.json();
      console.log('WhatsApp mesajı gönderildi:', result);
      return true;
    } catch (error) {
      console.error('WhatsApp mesaj gönderme hatası:', error);
      return false;
    }
  }

  // Durum metni al
  private static getStatusText(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING: return 'Beklemede';
      case OrderStatus.CONFIRMED: return 'Onaylandı';
      case OrderStatus.PREPARING: return 'Hazırlanıyor';
      case OrderStatus.READY: return 'Hazır';
      case OrderStatus.DELIVERING: return 'Teslim Ediliyor';
      case OrderStatus.DELIVERED: return 'Teslim Edildi';
      case OrderStatus.CANCELLED: return 'İptal Edildi';
      default: return 'Bilinmiyor';
    }
  }

  // Durum emoji al
  private static getStatusEmoji(status: OrderStatus): string {
    switch (status) {
      case OrderStatus.PENDING: return '⏳';
      case OrderStatus.CONFIRMED: return '✅';
      case OrderStatus.PREPARING: return '👨‍🍳';
      case OrderStatus.READY: return '🔔';
      case OrderStatus.DELIVERING: return '🚚';
      case OrderStatus.DELIVERED: return '🎉';
      case OrderStatus.CANCELLED: return '❌';
      default: return '❓';
    }
  }

  // Telefon numarasını formatla
  static formatPhoneNumber(phone: string): string {
    // Türkiye telefon numarası formatı
    let formatted = phone.replace(/\D/g, '');
    
    if (formatted.startsWith('0')) {
      formatted = formatted.substring(1);
    }
    
    if (formatted.startsWith('90')) {
      formatted = formatted.substring(2);
    }
    
    if (!formatted.startsWith('90')) {
      formatted = '90' + formatted;
    }
    
    return formatted;
  }

  // Webhook doğrulama
  static verifyWebhook(mode: string, token: string, challenge: string): string | null {
    const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN;
    
    if (mode === 'subscribe' && token === verifyToken) {
      return challenge;
    }
    
    return null;
  }

  // Webhook mesajını işle
  static async processWebhookMessage(body: any): Promise<void> {
    try {
      if (body.object === 'whatsapp_business_account') {
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        
        if (value?.messages) {
          for (const message of value.messages) {
            await this.handleIncomingMessage(message);
          }
        }
      }
    } catch (error) {
      console.error('Webhook mesaj işleme hatası:', error);
    }
  }

  // Gelen mesajı işle
  private static async handleIncomingMessage(message: any): Promise<void> {
    try {
      const { from, type, text, interactive } = message;
      
      if (type === 'text' && text) {
        await this.handleTextMessage(from, text.body);
      } else if (type === 'interactive' && interactive) {
        await this.handleInteractiveMessage(from, interactive);
      }
    } catch (error) {
      console.error('Gelen mesaj işleme hatası:', error);
    }
  }

  // Metin mesajını işle
  private static async handleTextMessage(from: string, text: string): Promise<void> {
    console.log(`Gelen mesaj: ${from} - ${text}`);
    
    // Basit komut işleme
    if (text.toLowerCase().includes('merhaba') || text.toLowerCase().includes('selam')) {
      await this.sendCustomMessage(from, 'Merhaba! NeYisek.com sipariş sistemi size nasıl yardımcı olabilir?');
    }
  }

  // Etkileşimli mesajı işle
  private static async handleInteractiveMessage(from: string, interactive: any): Promise<void> {
    if (interactive.type === 'button_reply') {
      const buttonId = interactive.button_reply.id;
      await this.handleButtonReply(from, buttonId);
    }
  }

  // Buton yanıtını işle
  private static async handleButtonReply(from: string, buttonId: string): Promise<void> {
    console.log(`Buton yanıtı: ${from} - ${buttonId}`);
    
    switch (buttonId) {
      case 'confirm_order':
        await this.sendCustomMessage(from, '✅ Sipariş onaylandı! Müşteri bilgilendirildi.');
        break;
      case 'reject_order':
        await this.sendCustomMessage(from, '❌ Sipariş reddedildi. Müşteri bilgilendirildi.');
        break;
      case 'contact_customer':
        await this.sendCustomMessage(from, '📞 Müşteri ile iletişime geçiliyor...');
        break;
      default:
        await this.sendCustomMessage(from, 'Anlaşılamayan komut. Lütfen tekrar deneyin.');
    }
  }
} 