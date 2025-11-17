#!/bin/bash

echo "🔧 Telegram Webhook Kurulum Script"
echo "=================================="

# Kullanıcıdan URL al
echo ""
echo "📝 LocalTunnel'dan aldığınız HTTPS URL'ini girin:"
echo "   Örnek: https://abc123.loca.lt"
echo ""
read -p "🔗 Tunnel URL: " TUNNEL_URL

if [ -z "$TUNNEL_URL" ]; then
    echo "❌ URL boş olamaz!"
    exit 1
fi

# URL formatını kontrol et
if [[ ! "$TUNNEL_URL" =~ ^https:// ]]; then
    echo "❌ URL https:// ile başlamalıdır!"
    exit 1
fi

echo ""
echo "🔧 Webhook ayarlanıyor..."
echo "📡 URL: $TUNNEL_URL/api/telegram/webhook"

# Webhook'u ayarla
WEBHOOK_RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot8167476570:AAGHdae2sJrcLIa6wlIm1EXrcZFaugAYc5s/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"$TUNNEL_URL/api/telegram/webhook\",\"allowed_updates\":[\"message\",\"callback_query\"]}")

echo "📋 Response: $WEBHOOK_RESPONSE"

# Sonucu kontrol et
if echo "$WEBHOOK_RESPONSE" | grep -q '"ok":true'; then
    echo ""
    echo "✅ WEBHOOK BAŞARIYLA AYARLANDI!"
    echo "🔗 Webhook URL: $TUNNEL_URL/api/telegram/webhook"
    
    # Webhook bilgilerini kontrol et
    echo ""
    echo "📊 Webhook bilgileri kontrol ediliyor..."
    WEBHOOK_INFO=$(curl -s "https://api.telegram.org/bot8167476570:AAGHdae2sJrcLIa6wlIm1EXrcZFaugAYc5s/getWebhookInfo")
    echo "📋 Webhook Info: $WEBHOOK_INFO"
    
    # Test bildirimi gönder
    echo ""
    echo "📨 Test bildirimi gönderiliyor..."
    curl -s -X POST "https://api.telegram.org/bot8167476570:AAGHdae2sJrcLIa6wlIm1EXrcZFaugAYc5s/sendMessage" \
      -H "Content-Type: application/json" \
      -d '{"chat_id":"6343230742","text":"🚀 Webhook aktif!\n\n✅ Interactive buttonlar çalışıyor\n🔄 Sipariş durumu güncellemeleri hazır\n\nTest için: http://localhost:3001/admin/telegram","parse_mode":"HTML","reply_markup":{"inline_keyboard":[[{"text":"✅ Test Başarılı","callback_data":"test_success"},{"text":"🔄 Durum Güncelle","callback_data":"status_update"}]]}}' > /dev/null
    
    echo ""
    echo "🎯 SISTEM HAZIR!"
    echo "==============="
    echo "• Admin Panel: http://localhost:3001/admin/telegram"
    echo "• Test buttonlarını Telegram'da deneyin"
    echo "• Yeni sipariş oluşturun ve bildirimleri kontrol edin"
    echo ""
    echo "⚠️  DİKKAT: LocalTunnel terminal'i açık tutun!"
    
else
    echo ""
    echo "❌ WEBHOOK AYARLANAMADI!"
    echo "📝 Hata detayları: $WEBHOOK_RESPONSE"
    echo ""
    echo "🔍 Olası Nedenler:"
    echo "• URL yanlış formatla"
    echo "• LocalTunnel çalışmıyor"
    echo "• İnternet bağlantısı problemi"
    echo ""
    echo "💡 Çözüm: URL'yi kontrol edin ve tekrar deneyin"
fi