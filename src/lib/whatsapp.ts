interface SendOrderStatusResult {
  success: boolean;
  error?: string;
  details?: unknown;
}

export async function sendOrderStatus(
  phone: string,
  statusMessage: string
): Promise<SendOrderStatusResult> {
  if (!phone || !statusMessage) {
    return { success: false, error: 'Telefon veya mesaj alanı eksik' };
  }

  try {
    const response = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone,
        message: `Neyisek.com Sipariş Güncelleme: ${statusMessage}`,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data?.success) {
      return {
        success: false,
        error: data?.error || 'WhatsApp bildirimi gönderilemedi',
        details: data,
      };
    }

    return { success: true };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Beklenmedik bir hata oluştu';
    return { success: false, error: message };
  }
}

