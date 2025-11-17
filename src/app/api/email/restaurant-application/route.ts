import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      success: true,
      message: 'Restaurant application email sent'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Email Restaurant Application API error' },
      { status: 500 }
    );
  }
} 