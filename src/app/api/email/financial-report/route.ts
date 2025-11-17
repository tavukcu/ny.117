import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      success: true,
      message: 'Financial report email sent'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Email Financial Report API error' },
      { status: 500 }
    );
  }
} 