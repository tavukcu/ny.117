import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      performance: {
        loadTime: 0,
        responseTime: 0,
        uptime: 0
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Analytics Performance API error' },
      { status: 500 }
    );
  }
} 