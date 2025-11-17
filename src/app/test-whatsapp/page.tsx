'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// UI Select components değiştirildi - standart HTML select kullanılıyor
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { OrderStatus } from '@/types';

export default function TestWhatsAppPage() {
  const [loading, setLoading] = useState(false);
  const [messageType, setMessageType] = useState('new_order');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [message, setMessage] = useState('');
  const [orderId, setOrderId] = useState('');
  const [restaurantId, setRestaurantId] = useState('');
  const [status, setStatus] = useState<OrderStatus>(OrderStatus.PENDING);

  const sendWhatsAppMessage = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: messageType,
          data: {
            phoneNumber,
            message,
            orderId,
            restaurantId,
            status,
            reason: messageType === 'cancellation' ? message : undefined
          }
        })
      });

      if (response.ok) {
        toast.success('WhatsApp mesajı başarıyla gönderildi!');
      } else {
        const error = await response.json();
        toast.error(`Hata: ${error.error}`);
      }
    } catch (error) {
      console.error('WhatsApp mesaj gönderme hatası:', error);
      toast.error('Mesaj gönderilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const sendTestNewOrder = async () => {
    setLoading(true);
    
    try {
      const response = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: 'new_order',
          data: {
            orderId: 'TEST123456',
            restaurantId: 'restaurant123',
            customerName: 'Test Müşteri',
            customerPhone: '+905551234567',
            totalAmount: 85.50,
            items: [
              { name: 'Pizza Margherita', quantity: 2, price: 35.00 },
              { name: 'Cola', quantity: 1, price: 15.50 }
            ],
            deliveryAddress: 'Test Mahallesi, Test Sokak No:1, İzmir',
            estimatedTime: 30,
            specialInstructions: 'Kapıya bırakabilirsiniz'
          }
        })
      });

      if (response.ok) {
        toast.success('Test sipariş bildirimi gönderildi!');
      } else {
        const error = await response.json();
        toast.error(`Hata: ${error.error}`);
      }
    } catch (error) {
      console.error('Test sipariş gönderme hatası:', error);
      toast.error('Test mesajı gönderilirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📱 WhatsApp Entegrasyon Testi</h1>
        <p className="text-gray-600">NeYisek.com WhatsApp Business API entegrasyonunu test edin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Test Mesajları */}
        <Card>
          <CardHeader>
            <CardTitle>🧪 Hızlı Test Mesajları</CardTitle>
            <CardDescription>Önceden hazırlanmış test mesajları</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={sendTestNewOrder}
              disabled={loading}
              className="w-full"
              variant="outline"
            >
              {loading ? 'Gönderiliyor...' : '🆕 Yeni Sipariş Testi'}
            </Button>
            
            <Button 
              onClick={() => {
                setMessageType('emergency');
                setMessage('Test acil durum mesajı');
                sendWhatsAppMessage();
              }}
              disabled={loading}
              className="w-full"
              variant="destructive"
            >
              {loading ? 'Gönderiliyor...' : '🚨 Acil Durum Testi'}
            </Button>
          </CardContent>
        </Card>

        {/* Özel Mesaj */}
        <Card>
          <CardHeader>
            <CardTitle>✉️ Özel Mesaj Gönder</CardTitle>
            <CardDescription>Özel WhatsApp mesajı gönderin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="phone">Telefon Numarası</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+905551234567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="customMessage">Mesaj</Label>
              <Textarea
                id="customMessage"
                placeholder="Göndermek istediğiniz mesajı yazın..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>
            
            <Button 
              onClick={() => {
                setMessageType('custom');
                sendWhatsAppMessage();
              }}
              disabled={loading || !phoneNumber || !message}
              className="w-full"
            >
              {loading ? 'Gönderiliyor...' : '📤 Mesaj Gönder'}
            </Button>
          </CardContent>
        </Card>

        {/* Sipariş Durum Güncelleme */}
        <Card>
          <CardHeader>
            <CardTitle>📊 Sipariş Durum Güncelleme</CardTitle>
            <CardDescription>Sipariş durumu güncelleme bildirimi gönderin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="orderId">Sipariş ID</Label>
              <Input
                id="orderId"
                placeholder="Sipariş ID"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="restaurantId">Restoran ID</Label>
              <Input
                id="restaurantId"
                placeholder="Restoran ID"
                value={restaurantId}
                onChange={(e) => setRestaurantId(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="status">Durum</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value as OrderStatus)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Durum seçin</option>
                <option value={OrderStatus.PENDING}>Beklemede</option>
                <option value={OrderStatus.CONFIRMED}>Onaylandı</option>
                <option value={OrderStatus.PREPARING}>Hazırlanıyor</option>
                <option value={OrderStatus.READY}>Hazır</option>
                <option value={OrderStatus.DELIVERING}>Teslim Ediliyor</option>
                <option value={OrderStatus.DELIVERED}>Teslim Edildi</option>
                <option value={OrderStatus.CANCELLED}>İptal Edildi</option>
              </select>
            </div>
            
            <Button 
              onClick={() => {
                setMessageType('status_update');
                sendWhatsAppMessage();
              }}
              disabled={loading || !orderId || !restaurantId}
              className="w-full"
              variant="outline"
            >
              {loading ? 'Gönderiliyor...' : '🔄 Durum Güncelle'}
            </Button>
          </CardContent>
        </Card>

        {/* Sipariş İptal */}
        <Card>
          <CardHeader>
            <CardTitle>❌ Sipariş İptal</CardTitle>
            <CardDescription>Sipariş iptal bildirimi gönderin</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cancelOrderId">Sipariş ID</Label>
              <Input
                id="cancelOrderId"
                placeholder="Sipariş ID"
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="cancelRestaurantId">Restoran ID</Label>
              <Input
                id="cancelRestaurantId"
                placeholder="Restoran ID"
                value={restaurantId}
                onChange={(e) => setRestaurantId(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="cancelReason">İptal Sebebi</Label>
              <Textarea
                id="cancelReason"
                placeholder="İptal sebebini yazın..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
              />
            </div>
            
            <Button 
              onClick={() => {
                setMessageType('cancellation');
                sendWhatsAppMessage();
              }}
              disabled={loading || !orderId || !restaurantId}
              className="w-full"
              variant="destructive"
            >
              {loading ? 'Gönderiliyor...' : '❌ İptal Bildirimi Gönder'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bilgi Kartı */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-900">ℹ️ WhatsApp Entegrasyon Bilgileri</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-blue-800">
          <p><strong>API URL:</strong> https://graph.facebook.com/v18.0</p>
          <p><strong>Webhook URL:</strong> /api/whatsapp/webhook</p>
          <p><strong>Mesaj Gönderme:</strong> /api/whatsapp/send</p>
          <p><strong>Desteklenen Mesaj Türleri:</strong></p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>new_order - Yeni sipariş bildirimi</li>
            <li>status_update - Durum güncelleme</li>
            <li>cancellation - İptal bildirimi</li>
            <li>emergency - Acil durum bildirimi</li>
            <li>custom - Özel mesaj</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
} 