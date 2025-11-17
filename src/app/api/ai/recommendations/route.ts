import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      success: true,
      recommendations: []
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'AI Recommendations API error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'AI Recommendations API is available'
  });
} 