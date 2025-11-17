import { NextRequest, NextResponse } from 'next/server';
import { OrderTrackingService } from '@/services/orderTrackingService';
import { OrderService } from '@/services/orderService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!orderId) {
      return NextResponse.json(
        { error: 'Sipariş ID gerekli' },
        { status: 400 }
      );
    }

    // Sipariş bilgilerini getir
    const order = await OrderService.getOrderById(orderId);
    if (!order) {
      return NextResponse.json(
        { error: 'Sipariş bulunamadı' },
        { status: 404 }
      );
    }

    // Takip bilgilerini getir
    const tracking = await OrderTrackingService.getOrderTracking(orderId);
    if (!tracking) {
      return NextResponse.json(
        { error: 'Takip bilgileri bulunamadı' },
        { status: 404 }
      );
    }

    // Gerçek süreleri hesapla
    const actualTimes = OrderTrackingService.calculateActualTimes(tracking);

    // Yanıt verisi
    const response = {
      orderId,
      status: tracking.status,
      deliveryStatus: tracking.deliveryStatus,
      driver: tracking.driver,
      timestamps: tracking.timestamps,
      estimatedTimes: tracking.estimatedTimes,
      actualTimes,
      locationHistory: tracking.locationHistory,
      statusUpdates: tracking.statusUpdates,
      customerInteractions: tracking.customerInteractions,
      notifications: tracking.notifications,
      lastUpdated: new Date().toISOString()
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Sipariş takip hatası:', error);
    return NextResponse.json(
      { error: 'Sipariş takip bilgileri alınamadı' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, action, data } = body;

    if (!orderId || !action) {
      return NextResponse.json(
        { error: 'Sipariş ID ve işlem türü gerekli' },
        { status: 400 }
      );
    }

    let success = false;

    switch (action) {
      case 'update_status':
        const { status, updatedBy, description, metadata } = data;
        success = await OrderTrackingService.updateOrderStatus(
          orderId,
          status,
          updatedBy,
          description,
          metadata
        );
        break;

      case 'assign_driver':
        const { driver } = data;
        success = await OrderTrackingService.assignDriver(orderId, driver);
        break;

      case 'update_location':
        const { lat, lng, status: locationStatus, description: locationDescription } = data;
        success = await OrderTrackingService.updateLocation(
          orderId,
          lat,
          lng,
          locationStatus,
          locationDescription
        );
        break;

      case 'add_interaction':
        const { type, notes } = data;
        success = await OrderTrackingService.addCustomerInteraction(
          orderId,
          type,
          notes
        );
        break;

      default:
        return NextResponse.json(
          { error: 'Geçersiz işlem türü' },
          { status: 400 }
        );
    }

    if (success) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: 'İşlem başarısız' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Sipariş takip güncelleme hatası:', error);
    return NextResponse.json(
      { error: 'İşlem gerçekleştirilemedi' },
      { status: 500 }
    );
  }
} 