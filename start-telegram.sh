#!/bin/bash

echo "🤖 Telegram Bot Webhook Kurulumu"
echo "================================"

# Development server'ın çalışıp çalışmadığını kontrol et
if ! curl -s http://localhost:3001/api/telegram/webhook > /dev/null; then
    echo "❌ Development server çalışmıyor!"
    echo "📝 Önce şu komutu çalıştırın: npm run dev"
    exit 1
fi

echo "✅ Development server çalışıyor"

# LocalTunnel ile tunnel oluştur
echo "🌐 HTTPS tunnel oluşturuluyor..."
TUNNEL_URL=$(lt --port 3001 --print-requests 2>/dev/null | grep "your url is:" | awk '{print $4}' | head -1)

if [ -z "$TUNNEL_URL" ]; then
    echo "❌ Tunnel oluşturulamadı!"
    echo "📝 Manuel olarak çalıştırın:"
    echo "   Terminal 1: npm run dev"
    echo "   Terminal 2: npx localtunnel --port 3001"
    echo "   Çıkan HTTPS URL'ini kullanın"
    exit 1
fi

echo "🔗 Tunnel URL: $TUNNEL_URL"

# Webhook'u ayarla
echo "🔧 Webhook ayarlanıyor..."
WEBHOOK_RESPONSE=$(curl -s -X POST "https://api.telegram.org/bot8167476570:AAGHdae2sJrcLIa6wlIm1EXrcZFaugAYc5s/setWebhook" \
  -H "Content-Type: application/json" \
  -d "{\"url\":\"$TUNNEL_URL/api/telegram/webhook\",\"allowed_updates\":[\"message\",\"callback_query\"]}")

if echo "$WEBHOOK_RESPONSE" | grep -q '"ok":true'; then
    echo "✅ Webhook başarıyla ayarlandı!"
    echo "🔗 Webhook URL: $TUNNEL_URL/api/telegram/webhook"
    
    # Test bildirimi gönder
    echo "📨 Test bildirimi gönderiliyor..."
    curl -s -X POST "https://api.telegram.org/bot8167476570:AAGHdae2sJrcLIa6wlIm1EXrcZFaugAYc5s/sendMessage" \
      -H "Content-Type: application/json" \
      -d '{"chat_id":"6343230742","text":"🚀 Webhook aktif!\n\nTelegram entegrasyonu hazır. Artık interactive button'\''lar çalışacak!\n\nTest için yeni sipariş oluşturun: http://localhost:3001/admin/telegram","parse_mode":"HTML"}' > /dev/null
    
    echo "✅ Sistem hazır!"
    echo ""
    echo "🎯 Test Etmek İçin:"
    echo "   • Admin Panel: http://localhost:3001/admin/telegram"
    echo "   • Test bildirimi gönder"
    echo "   • Yeni sipariş oluştur"
    echo "   • Button'\''lara tıkla"
    echo ""
    echo "⚠️  Not: Bu terminal açık kaldığı sürece webhook çalışır"
    
    # Webhook aktif tutmak için bekle
    echo "🔄 Webhook aktif... (Ctrl+C ile çıkış)"
    tail -f /dev/null
    
else
    echo "❌ Webhook ayarlanamadı!"
    echo "📝 Hata: $WEBHOOK_RESPONSE"
    exit 1
fi