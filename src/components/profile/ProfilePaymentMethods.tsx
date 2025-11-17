'use client';

import { useState } from 'react';
import { CreditCard, Plus, Edit, Trash2 } from 'lucide-react';

interface PaymentMethod {
  id: string;
  type: 'credit' | 'debit';
  last4: string;
  brand: string;
  expiryMonth: string;
  expiryYear: string;
  isDefault: boolean;
}

export default function ProfilePaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'credit',
      last4: '1234',
      brand: 'Visa',
      expiryMonth: '12',
      expiryYear: '25',
      isDefault: true
    }
  ]);

  const addPaymentMethod = () => {
    // Payment method ekleme modal'ı açılabilir
  };

  const deletePaymentMethod = (id: string) => {
    setPaymentMethods(prev => prev.filter(pm => pm.id !== id));
  };

  const setDefaultPaymentMethod = (id: string) => {
    setPaymentMethods(prev => prev.map(pm => ({
      ...pm,
      isDefault: pm.id === id
    })));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Ödeme Yöntemlerim</h3>
        <button
          onClick={addPaymentMethod}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Yeni Kart Ekle
        </button>
      </div>

      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <div key={method.id} className="card p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="h-6 w-6 text-gray-500" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {method.brand} •••• {method.last4}
                    </span>
                    {method.isDefault && (
                      <span className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full">
                        Varsayılan
                      </span>
                    )}
                  </div>
                  <p className="text-gray-500 text-sm">
                    {method.expiryMonth}/{method.expiryYear}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                {!method.isDefault && (
                  <button
                    onClick={() => setDefaultPaymentMethod(method.id)}
                    className="text-primary-600 hover:text-primary-800 text-sm"
                  >
                    Varsayılan Yap
                  </button>
                )}
                <button className="text-gray-400 hover:text-gray-600">
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deletePaymentMethod(method.id)}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {paymentMethods.length === 0 && (
        <div className="text-center py-8">
          <CreditCard className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Henüz ödeme yöntemi eklenmemiş</p>
        </div>
      )}
    </div>
  );
} 