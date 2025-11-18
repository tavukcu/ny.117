'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Store,
  ShoppingCart,
  ClipboardList,
  User,
} from 'lucide-react';

type NavKey = 'home' | 'restaurants' | 'cart' | 'orders' | 'profile';

interface MobileBottomNavProps {
  active?: NavKey;
}

const navItems: Array<{
  key: NavKey;
  href: string;
  label: string;
  icon: React.ReactNode;
}> = [
  { key: 'home', href: '/', label: 'Ana Sayfa', icon: <Home className="h-5 w-5" /> },
  { key: 'restaurants', href: '/restaurants', label: 'Restoranlar', icon: <Store className="h-5 w-5" /> },
  { key: 'cart', href: '/cart', label: 'Sepetim', icon: <ShoppingCart className="h-5 w-5" /> },
  { key: 'orders', href: '/orders', label: 'Siparişler', icon: <ClipboardList className="h-5 w-5" /> },
  { key: 'profile', href: '/profile', label: 'Profil', icon: <User className="h-5 w-5" /> },
];

export default function MobileBottomNav({ active }: MobileBottomNavProps) {
  const pathname = usePathname();

  const resolveActive = (key: NavKey, href: string) => {
    if (active) return active === key;
    if (href === '/') return pathname === '/';
    return pathname?.startsWith(href);
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-50">
      <div className="flex justify-around py-2">
        {navItems.map(({ key, href, label, icon }) => {
          const isActive = resolveActive(key, href);
          return (
            <Link
              key={key}
              href={href}
              className={`flex flex-col items-center gap-1 px-3 py-1 text-xs transition-colors ${
                isActive ? 'text-green-600 font-semibold' : 'text-gray-500'
              }`}
            >
              <span
                className={`rounded-full p-2 ${
                  isActive ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-500'
                }`}
              >
                {icon}
              </span>
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

