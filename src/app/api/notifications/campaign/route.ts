import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Geçici olarak devre dışı - Firebase Admin SDK configuration gerekiyor
  return NextResponse.json({ 
    success: false, 
    message: 'Campaign notifications temporarily disabled - Firebase Admin SDK configuration required' 
  }, { status: 503 });
}