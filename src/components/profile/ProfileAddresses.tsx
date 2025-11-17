'use client';

import { useState } from 'react';
import { MapPin, Plus, Edit, Trash2 } from 'lucide-react';

interface Address {
  id: string;
  title: string;
  address: string;
  city: string;
  district: string;
  isDefault: boolean;
}

export default function ProfileAddresses() {
  const [addresses, setAddresses] = useState<Address[]>([
    {
      id: '1',
      title: 'Ev',
      address: 'Atatürk Mahallesi, Cumhuriyet Caddesi No:123',
      city: 'İstanbul',
      district: 'Kadıköy',
      isDefault: true
    }
  ]);

  const [isAdding, setIsAdding] = useState(false);

  const addAddress = () => {
    setIsAdding(true);
  };

  const deleteAddress = (id: string) => {
    setAddresses(prev => prev.filter(addr => addr.id !== id));
  };

  const setDefaultAddress = (id: string) => {
    setAddresses(prev => prev.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Adreslerim</h3>
        <button
          onClick={addAddress}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Yeni Adres Ekle
        </button>
      </div>

      <div className="space-y-4">
        {addresses.map((address) => (
          <div key={address.id} className="card p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="font-medium text-gray-900">{address.title}</span>
                  {address.isDefault && (
                    <span className="px-2 py-1 text-xs bg-primary-100 text-primary-700 rounded-full">
                      Varsayılan
                    </span>
                  )}
                </div>
                <p className="text-gray-600 text-sm mb-1">{address.address}</p>
                <p className="text-gray-500 text-sm">{address.district}, {address.city}</p>
              </div>
              
              <div className="flex items-center gap-2">
                {!address.isDefault && (
                  <button
                    onClick={() => setDefaultAddress(address.id)}
                    className="text-primary-600 hover:text-primary-800 text-sm"
                  >
                    Varsayılan Yap
                  </button>
                )}
                <button className="text-gray-400 hover:text-gray-600">
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => deleteAddress(address.id)}
                  className="text-red-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {addresses.length === 0 && (
        <div className="text-center py-8">
          <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Henüz adres eklenmemiş</p>
        </div>
      )}
    </div>
  );
} 