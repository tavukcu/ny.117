import { NextRequest, NextResponse } from 'next/server';
import { WhatsAppService } from '@/services/whatsappService';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode && token && challenge) {
    const verificationResult = WhatsAppService.verifyWebhook(mode, token, challenge);
    
    if (verificationResult) {
      return new NextResponse(verificationResult, { status: 200 });
    }
  }

  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Webhook mesajını işle
    await WhatsAppService.processWebhookMessage(body);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('WhatsApp webhook hatası:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
} 