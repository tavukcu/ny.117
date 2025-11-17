import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      success: true,
      alert: 'Performance alert processed'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Analytics Performance Alert API error' },
      { status: 500 }
    );
  }
} 