import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppService } from '@/services/whatsappService';
import { OrderService } from '@/services/orderService';
import { RestaurantService } from '@/services/restaurantService';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, data } = body;

    switch (type) {
      case 'new_order':
        return await handleNewOrder(data);
      
      case 'status_update':
        return await handleStatusUpdate(data);
      
      case 'cancellation':
        return await handleCancellation(data);
      
      case 'emergency':
        return await handleEmergency(data);
      
      case 'custom':
        return await handleCustomMessage(data);
      
      default:
        return NextResponse.json({ error: 'Invalid message type' }, { status: 400 });
    }
  } catch (error) {
    console.error('WhatsApp mesaj gönderme hatası:', error);
    return NextResponse.json({ error: 'Failed to send WhatsApp message' }, { status: 500 });
  }
}

// Yeni sipariş bildirimi
async function handleNewOrder(data: any) {
  try {
    const { orderId, restaurantId } = data;
    
    // Sipariş bilgilerini al
    const order = await OrderService.getOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Restoran bilgilerini al
    const restaurant = await RestaurantService.getRestaurant(restaurantId);
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    // Restoran telefon numarasını formatla
    const formattedPhone = WhatsAppService.formatPhoneNumber(restaurant.phoneNumber);
    
    // WhatsApp bildirim verilerini hazırla
    const notificationData = {
      orderId: order.id,
      restaurantId: restaurant.id,
      customerName: order.user.displayName,
      customerPhone: order.user.phoneNumber,
      totalAmount: order.total,
      items: order.items.map(item => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price
      })),
      deliveryAddress: order.deliveryAddress ? 
        `${order.deliveryAddress.street}, ${order.deliveryAddress.district}, ${order.deliveryAddress.city}` : 
        undefined,
      estimatedTime: order.estimatedDeliveryTime ? 
        Math.ceil((order.estimatedDeliveryTime.getTime() - Date.now()) / 60000) : 
        undefined,
      specialInstructions: order.specialInstructions
    };

    // WhatsApp mesajını gönder
    const success = await WhatsAppService.sendNewOrderNotification({
      ...notificationData,
      restaurantPhone: formattedPhone
    });

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'WhatsApp notification sent successfully' 
      });
    } else {
      return NextResponse.json({ 
        error: 'Failed to send WhatsApp notification' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Yeni sipariş WhatsApp bildirimi hatası:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Durum güncelleme bildirimi
async function handleStatusUpdate(data: any) {
  try {
    const { orderId, status, restaurantId, estimatedTime } = data;
    
    // Sipariş bilgilerini al
    const order = await OrderService.getOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Restoran bilgilerini al
    const restaurant = await RestaurantService.getRestaurant(restaurantId);
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    // Restoran telefon numarasını formatla
    const formattedPhone = WhatsAppService.formatPhoneNumber(restaurant.phoneNumber);
    
    // WhatsApp mesajını gönder
    const success = await WhatsAppService.sendOrderStatusUpdate(
      formattedPhone,
      orderId,
      status,
      order.user.displayName,
      estimatedTime
    );

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Status update notification sent successfully' 
      });
    } else {
      return NextResponse.json({ 
        error: 'Failed to send status update notification' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Durum güncelleme WhatsApp bildirimi hatası:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// İptal bildirimi
async function handleCancellation(data: any) {
  try {
    const { orderId, restaurantId, reason } = data;
    
    // Sipariş bilgilerini al
    const order = await OrderService.getOrder(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Restoran bilgilerini al
    const restaurant = await RestaurantService.getRestaurant(restaurantId);
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    // Restoran telefon numarasını formatla
    const formattedPhone = WhatsAppService.formatPhoneNumber(restaurant.phoneNumber);
    
    // WhatsApp mesajını gönder
    const success = await WhatsAppService.sendOrderCancellation(
      formattedPhone,
      orderId,
      order.user.displayName,
      reason
    );

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Cancellation notification sent successfully' 
      });
    } else {
      return NextResponse.json({ 
        error: 'Failed to send cancellation notification' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('İptal WhatsApp bildirimi hatası:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Acil durum bildirimi
async function handleEmergency(data: any) {
  try {
    const { restaurantId, message, orderId } = data;
    
    // Restoran bilgilerini al
    const restaurant = await RestaurantService.getRestaurant(restaurantId);
    if (!restaurant) {
      return NextResponse.json({ error: 'Restaurant not found' }, { status: 404 });
    }

    // Restoran telefon numarasını formatla
    const formattedPhone = WhatsAppService.formatPhoneNumber(restaurant.phoneNumber);
    
    // WhatsApp mesajını gönder
    const success = await WhatsAppService.sendEmergencyNotification(
      formattedPhone,
      message,
      orderId
    );

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Emergency notification sent successfully' 
      });
    } else {
      return NextResponse.json({ 
        error: 'Failed to send emergency notification' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Acil durum WhatsApp bildirimi hatası:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Özel mesaj
async function handleCustomMessage(data: any) {
  try {
    const { phoneNumber, message, buttons } = data;
    
    // Telefon numarasını formatla
    const formattedPhone = WhatsAppService.formatPhoneNumber(phoneNumber);
    
    // WhatsApp mesajını gönder
    const success = await WhatsAppService.sendCustomMessage(
      formattedPhone,
      message,
      buttons
    );

    if (success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Custom message sent successfully' 
      });
    } else {
      return NextResponse.json({ 
        error: 'Failed to send custom message' 
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Özel WhatsApp mesajı hatası:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 