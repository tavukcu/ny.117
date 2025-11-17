import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      success: true,
      addresses: []
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Addresses API error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      success: true,
      message: 'Address created'
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Addresses API error' },
      { status: 500 }
    );
  }
} 