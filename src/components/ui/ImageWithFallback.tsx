'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ImageWithFallbackProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  fallbackSrc?: string;
  onError?: () => void;
  priority?: boolean;
  loading?: 'lazy' | 'eager';
}

export default function ImageWithFallback({
  src,
  alt,
  width,
  height,
  className = '',
  fallbackSrc = '/images/restaurant-placeholder.svg',
  onError,
  priority = false,
  loading = 'lazy'
}: ImageWithFallbackProps) {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const handleError = () => {
    if (!hasError && imgSrc !== fallbackSrc) {
      console.warn(`🖼️ Görsel yüklenemedi, fallback kullanılıyor: ${src}`);
      setImgSrc(fallbackSrc);
      setHasError(true);
      onError?.();
    }
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  // URL validasyonu ve düzeltme
  const normalizeSrc = (url: string): string => {
    if (!url || url.trim() === '') return fallbackSrc;
    
    // Eğer zaten tam URL ise (http:// veya https:// ile başlıyorsa)
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    
    // Eğer public klasöründen bir resim ise (/ ile başlıyorsa)
    if (url.startsWith('/')) {
      return url;
    }
    
    // Diğer durumlarda fallback kullan
    return fallbackSrc;
  };

  // Eğer src boş ise direkt fallback kullan
  const finalSrc = src && src.trim() !== '' ? normalizeSrc(imgSrc) : fallbackSrc;

  return (
    <div className={`relative ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <Image
        src={finalSrc}
        alt={alt}
        width={width}
        height={height}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onError={handleError}
        onLoad={handleLoad}
        priority={priority}
        loading={loading}
        unoptimized={finalSrc.includes('firebasestorage.googleapis.com') || finalSrc.includes('firebasestorage.app')}
      />
      {hasError && (
        <div className="absolute top-2 right-2 bg-red-100 text-red-600 text-xs px-2 py-1 rounded">
          ⚠️
        </div>
      )}
    </div>
  );
}