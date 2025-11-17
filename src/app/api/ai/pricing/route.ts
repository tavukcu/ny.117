import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      success: true,
      pricing: {
        basic: 29.99,
        pro: 59.99,
        enterprise: 199.99
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Pricing API error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'AI Pricing API is available'
  });
} 