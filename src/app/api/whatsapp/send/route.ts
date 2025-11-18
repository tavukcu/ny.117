import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppService } from '@/services/whatsappService';
import { OrderService } from '@/services/orderService';
import { RestaurantService } from '@/services/restaurantService';

const WABA_TOKEN = process.env.NEXT_PUBLIC_WABA_TOKEN;
const WABA_PHONE_ID = process.env.NEXT_PUBLIC_WABA_PHONE_NUMBER_ID;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body as {
      type: 'plain_message' | 'order_confirmation';
      data: any;
    };

    if (!type || !data) {
      return NextResponse.json(
        { success: false, error: 'type ve data alanları gereklidir' },
        { status: 400 }
      );
    }

    if (!WABA_TOKEN || !WABA_PHONE_ID) {
      return NextResponse.json(
        { success: false, error: 'WhatsApp API yapılandırması eksik' },
        { status: 500 }
      );
    }

    const whatsappService = new WhatsAppService(WABA_TOKEN, WABA_PHONE_ID);
    const orderService = new OrderService();
    const restaurantService = new RestaurantService();

    if (type === 'plain_message') {
      const { phone, message } = data as { phone?: string; message?: string };

      if (!phone || !message) {
        return NextResponse.json(
          { success: false, error: 'phone ve message alanları gereklidir' },
          { status: 400 }
        );
      }

      const result = await whatsappService.sendTextMessage(phone, message);
      return NextResponse.json({ success: true, data: result });
    }

    if (type === 'order_confirmation') {
      const { orderId } = data as { orderId?: string };

      if (!orderId) {
        return NextResponse.json(
          { success: false, error: 'orderId gereklidir' },
          { status: 400 }
        );
      }

      const order = await orderService.getOrderById(orderId);
      if (!order) {
        return NextResponse.json(
          { success: false, error: 'Sipariş bulunamadı' },
          { status: 404 }
        );
      }

      const restaurant = await restaurantService.getRestaurantById(
        order.restaurantId
      );

      const message = whatsappService.buildOrderConfirmationMessage(
        order,
        restaurant
      );

      const result = await whatsappService.sendTextMessage(order.customerPhone, message);
      return NextResponse.json({ success: true, data: result });
    }

    return NextResponse.json(
      { success: false, error: 'Desteklenmeyen type değeri' },
      { status: 400 }
    );
  } catch (error) {
    console.error('WhatsApp API isteği başarısız:', error);
    const message =
      error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
