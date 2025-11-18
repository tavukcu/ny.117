import { NextRequest, NextResponse } from 'next/server';

const WABA_TOKEN = process.env.NEXT_PUBLIC_WABA_TOKEN;
const WABA_PHONE_ID = process.env.NEXT_PUBLIC_WABA_PHONE_NUMBER_ID;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // İstek tipine göre ayırmak istersen ileride kullanırız
    const { type, data } = body;

    // Şimdilik sadece düz mesajı destekleyelim
    if (type !== 'plain_message') {
      return NextResponse.json(
        { success: false, error: 'Desteklenmeyen istek tipi' },
        { status: 400 }
      );
    }

    const phone: string | undefined = data?.phone;
    const message: string | undefined = data?.message;

    if (!phone || !message) {
      return NextResponse.json(
        { success: false, error: 'phone ve message alanları gereklidir' },
        { status: 400 }
      );
    }

    if (!WABA_TOKEN || !WABA_PHONE_ID) {
      return NextResponse.json(
        { success: false, error: 'WhatsApp API yapılandırması eksik' },
        { status: 500 }
      );
    }

    const payload = {
      messaging_product: 'whatsapp',
      to: phone,
      type: 'text',
      text: { body: message },
    };

    const response = await fetch(
      `https://graph.facebook.com/v20.0/${WABA_PHONE_ID}/messages`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${WABA_TOKEN}`,
        },
        body: JSON.stringify(payload),
      }
    );

    const dataResponse = await response.json();

    if (!response.ok) {
      const errorMessage =
        dataResponse?.error?.message || 'WhatsApp API hatası';

      return NextResponse.json(
        { success: false, error: errorMessage, details: dataResponse },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, data: dataResponse });
  } catch (error) {
    console.error('WhatsApp API isteği başarısız:', error);
    const message =
      error instanceof Error ? error.message : 'Bilinmeyen bir hata oluştu';

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    );
  }
}
