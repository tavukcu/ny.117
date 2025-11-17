import { NextRequest, NextResponse } from 'next/server';
import { RestaurantService } from '@/services/restaurantService';

export async function GET(request: NextRequest) {
  try {
    console.log('🏪 Restaurants API: Restoranlar getiriliyor...');
    
    const restaurants = await RestaurantService.getActiveRestaurants();
    
    console.log(`✅ Restaurants API: ${restaurants.length} restoran bulundu`);
    
    return NextResponse.json({
      success: true,
      count: restaurants.length,
      restaurants: restaurants
    });
    
  } catch (error) {
    console.error('❌ Restaurants API hatası:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Restoranlar getirilirken bir hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('🏪 Restaurants API: Yeni restoran ekleniyor...', body);
    
    const newRestaurant = await RestaurantService.createRestaurant(body);
    
    console.log('✅ Restaurants API: Restoran başarıyla eklendi', newRestaurant);
    
    return NextResponse.json({
      success: true,
      restaurant: newRestaurant
    });
    
  } catch (error) {
    console.error('❌ Restaurants API POST hatası:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Restoran eklenirken bir hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
} 