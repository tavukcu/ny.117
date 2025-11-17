import { NextResponse } from 'next/server';
import { OrderService } from '@/services/orderService';
import { OrderStatus } from '@/types';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('📦 Sipariş API: Yeni sipariş oluşturuluyor:', body);

    const {
      restaurantId,
      items,
      customerInfo,
      deliveryAddress,
      paymentMethod,
      notes,
      totalAmount
    } = body;

    // Gerekli alanları kontrol et
    if (!restaurantId || !items || items.length === 0 || !customerInfo || !totalAmount) {
      console.error('📦 Sipariş API: Eksik bilgiler');
      return NextResponse.json({
        success: false,
        error: 'Eksik sipariş bilgileri'
      }, { status: 400 });
    }

    // Sipariş verilerini Order tipine uygun şekilde hazırla
    const orderData = {
      userId: customerInfo.userId,
      user: {
        uid: customerInfo.userId,
        displayName: customerInfo.name,
        email: customerInfo.email || '',
        phoneNumber: customerInfo.phone,
        role: 'customer' as const,
        isActive: true,
        createdAt: new Date()
      },
      restaurantId,
      items: items.map((item: any) => ({
        productId: item.product?.id || item.id,
        product: {
          id: item.product?.id || item.id,
          name: item.product?.name || item.name,
          price: item.product?.price || item.price,
          categoryId: item.product?.categoryId || '',
          description: item.product?.description || '',
          restaurantId: restaurantId,
          imageUrl: item.product?.imageUrl || '',
          images: [],
          variants: [],
          ingredients: [],
          allergens: [],
          isVegetarian: false,
          isVegan: false,
          isGlutenFree: false,
          preparationTime: 0,
          calories: 0,
          isActive: true,
          stock: 100,
          minStock: 0,
          maxStock: 1000,
          tags: [],
          rating: 0,
          reviewCount: 0,
          isPopular: false,
          isFeatured: false,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        quantity: item.quantity,
        specialInstructions: item.notes || '',
        categoryId: item.product?.categoryId || '',
        price: item.product?.price || item.price
      })),
      subtotal: totalAmount,
      deliveryFee: 0, // Şimdilik 0
      total: totalAmount,
      status: OrderStatus.PENDING,
      deliveryAddress: {
        ...deliveryAddress,
        street: deliveryAddress?.street || '',
        city: deliveryAddress?.city || '',
        district: deliveryAddress?.district || '',
        zipCode: deliveryAddress?.zipCode || '',
        country: deliveryAddress?.country || 'Türkiye',
        coordinates: deliveryAddress?.coordinates || { lat: 0, lng: 0 },
        fullName: deliveryAddress?.fullName || customerInfo.name,
        phone: deliveryAddress?.phone || customerInfo.phone,
        isDefault: deliveryAddress?.isDefault || false,
        instructions: deliveryAddress?.instructions || ''
      },
      paymentMethod: paymentMethod || 'cash_on_delivery',
      specialInstructions: notes || '',
      estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000) // 30 dakika sonra
    };

    console.log('📦 Sipariş verisi hazırlandı:', orderData);

    const orderId = await OrderService.createOrder(orderData);
    
    if (orderId) {
      console.log('📦 Sipariş başarıyla oluşturuldu:', orderId);
      return NextResponse.json({
        success: true,
        orderId,
        message: 'Sipariş başarıyla oluşturuldu!'
      });
    } else {
      console.error('📦 Sipariş oluşturulamadı');
      return NextResponse.json({
        success: false,
        error: 'Sipariş oluşturulamadı'
      }, { status: 500 });
    }

  } catch (error: any) {
    console.error('📦 Sipariş API hatası:', error);
    
    // Detaylı hata bilgisi
    let errorMessage = 'Sipariş işlemi başarısız';
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      if ('code' in error && error.code === 'permission-denied') {
        errorMessage = 'Firestore yetki hatası: Sipariş oluşturma izni yok';
        statusCode = 403;
      } else if ('message' in error) {
        errorMessage = String(error.message);
      }
    }
    
    console.log('🔍 API Hata Detayları:', {
      error,
      errorType: typeof error,
      errorCode: error?.code,
      errorMessage,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json({
      success: false,
      error: errorMessage
    }, { status: statusCode });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const restaurantId = searchParams.get('restaurantId');

    if (userId) {
      // Kullanıcının siparişlerini getir
      const orders = await OrderService.getUserOrders(userId);
      return NextResponse.json({ success: true, orders });
    } else if (restaurantId) {
      // Restoranın siparişlerini getir
      const orders = await OrderService.getRestaurantOrders(restaurantId);
      return NextResponse.json({ success: true, orders });
    } else {
      return NextResponse.json({
        success: false,
        error: 'userId veya restaurantId gerekli'
      }, { status: 400 });
    }

  } catch (error: any) {
    console.error('📦 Sipariş listeleme hatası:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
} 