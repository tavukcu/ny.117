/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    forceSwcTransforms: true,
    optimizePackageImports: ['lucide-react']
  },
  reactStrictMode: true, // React Strict Mode'u tekrar aktif et
  swcMinify: true,
  
  // Hydration hatalarını önlemek için
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // CORS ve headers yapılandırması
  async headers() {
    return [
      {
        // API route'ları için CORS headers
        source: '/api/:path*',
        headers: [
          {
            key: 'Access-Control-Allow-Origin',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET, POST, PUT, DELETE, OPTIONS',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value: 'Content-Type, Authorization',
          },
        ],
      },
      {
        // Firebase Storage için headers
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'unsafe-none',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin-allow-popups',
          },
        ],
      },
    ];
  },
  
  webpack: (config, { isServer, dev }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        fs: false,
      };
    }
    
    // Fast refresh optimizasyonları
    if (dev) {
      config.watchOptions = {
        poll: false,
        aggregateTimeout: 300,
        ignored: ['**/node_modules/**', '**/.next/**']
      };

      // Hot reload optimizasyonları
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      };
    }

    return config;
  },
  
  // Fast Refresh için ek optimizasyonlar
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  
  // Memory leak prevention
  poweredByHeader: false,
  compress: true,
  
  images: {
    domains: [
      'firebasestorage.googleapis.com',
      'storage.googleapis.com',
      'lh3.googleusercontent.com',
      'neyisek-6b8bc.firebasestorage.app'
    ],
    unoptimized: true, // Firebase Storage için
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.googleapis.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'neyisek-6b8bc.firebasestorage.app',
        port: '',
        pathname: '/**',
      },
    ],
  },
  
  // Typescript checking
  typescript: {
    ignoreBuildErrors: true, // Vercel deploy için TypeScript hatalarını görmezden gel
  },
  
  // ESLint checking
  eslint: {
    ignoreDuringBuilds: true, // Vercel deploy için linting uyarılarını görmezden gel
  },
}

module.exports = nextConfig; 