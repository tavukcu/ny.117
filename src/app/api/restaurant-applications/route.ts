import { NextResponse } from 'next/server';
import { RestaurantApplicationService } from '@/services/restaurantApplicationService';
import { TelegramService } from '@/services/telegramService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const requiredFields: Array<keyof typeof body> = [
      'restaurantName',
      'contactName',
      'phone',
      'fullAddress',
      'city',
      'district',
      'cuisineType',
      'consent',
    ];

    for (const field of requiredFields) {
      const value = body[field];
      if (field === 'consent') {
        if (value !== true) {
          return NextResponse.json(
            { success: false, error: 'Başvuru için izin onayı gereklidir' },
            { status: 400 }
          );
        }
      } else if (!value || typeof value !== 'string' || !value.trim()) {
        return NextResponse.json(
          { success: false, error: `${field} alanı zorunludur` },
          { status: 400 }
        );
      }
    }

    const phone = String(body.phone).trim();
    if (!/^(?:\+90|0)?5\d{9}$/.test(phone.replace(/\s+/g, ''))) {
      return NextResponse.json(
        { success: false, error: 'Lütfen geçerli bir telefon numarası yazın.' },
        { status: 400 }
      );
    }

    const applicationId = await RestaurantApplicationService.createApplication({
      restaurantName: body.restaurantName.trim(),
      contactName: body.contactName.trim(),
      phone,
      fullAddress: body.fullAddress.trim(),
      city: body.city.trim(),
      district: body.district.trim(),
      cuisineType: body.cuisineType,
      note: body.note?.trim(),
    });

    await TelegramService.sendRestaurantApplicationNotification({
      applicationId,
      restaurantName: body.restaurantName.trim(),
      contactName: body.contactName.trim(),
      phone,
      fullAddress: body.fullAddress.trim(),
      city: body.city.trim(),
      district: body.district.trim(),
      cuisineType: body.cuisineType,
      note: body.note?.trim(),
    });

    return NextResponse.json({ success: true, applicationId });
  } catch (error) {
    console.error('Restaurant application API error:', error);
    const message =
      error instanceof Error ? error.message : 'Başvuru işlenirken bir hata oluştu';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

