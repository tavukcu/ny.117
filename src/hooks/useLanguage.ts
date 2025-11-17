'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const locales = ['tr', 'en'] as const;
type Locale = (typeof locales)[number];

export function useLanguage() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentLocale, setCurrentLocale] = useState<Locale>('tr');

  useEffect(() => {
    // URL'den mevcut dili tespit et
    const pathLocale = locales.find(locale => 
      pathname.startsWith(`/${locale}`)
    );
    
    if (pathLocale) {
      setCurrentLocale(pathLocale);
    } else {
      // Eğer hiçbir dil prefix'i yoksa, tr varsayılan
      setCurrentLocale('tr');
    }
  }, [pathname]);

  const changeLanguage = (newLocale: Locale) => {
    if (newLocale === currentLocale) return;

    console.log('Dil değiştirme başlatıldı:', { currentLocale, newLocale, pathname });

    // Mevcut path'i al
    let newPath = pathname;
    
    // Eğer mevcut path'te dil prefix'i varsa, onu değiştir
    const currentPathLocale = locales.find(locale => 
      pathname.startsWith(`/${locale}`)
    );
    
    if (currentPathLocale) {
      newPath = pathname.replace(`/${currentPathLocale}`, '');
    }
    
    // Yeni dil prefix'ini ekle (her zaman prefix kullan)
    newPath = `/${newLocale}${newPath}`;
    
    console.log('Yeni path:', newPath);
    
    // Dil tercihini localStorage'a kaydet
    localStorage.setItem('preferredLanguage', newLocale);
    
    // Sayfayı yönlendir
    router.push(newPath);
  };

  return {
    currentLocale,
    changeLanguage,
    locales
  };
} 