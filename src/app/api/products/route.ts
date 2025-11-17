import { NextRequest, NextResponse } from 'next/server';
import { ProductService } from '@/services/productService';

export async function GET(request: NextRequest) {
  try {
    console.log('📦 Products API: Ürünler getiriliyor...');
    
    const products = await ProductService.getAllProducts();
    
    console.log(`✅ Products API: ${products.products.length} ürün bulundu`);
    
    return NextResponse.json({
      success: true,
      count: products.products.length,
      products: products.products
    });
    
  } catch (error) {
    console.error('❌ Products API hatası:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Ürünler getirilirken bir hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📦 Products API: Yeni ürün ekleniyor...', body);
    
    const newProduct = await ProductService.createProduct(body);
    
    console.log('✅ Products API: Ürün başarıyla eklendi', newProduct);
    
    return NextResponse.json({
      success: true,
      product: newProduct
    });
    
  } catch (error) {
    console.error('❌ Products API POST hatası:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: 'Ürün eklenirken bir hata oluştu',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      },
      { status: 500 }
    );
  }
} 