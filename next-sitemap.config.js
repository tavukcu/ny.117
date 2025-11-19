/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: 'https://www.neyisek.com',
  generateRobotsTxt: true,
  generateIndexSitemap: true,
  outDir: './public',
  exclude: [
    '/admin/*',
    '/api/*',
    '/debug/*',
    '/test-*',
    '/restaurant-login',
    '/restaurants/apply',
    '/register',
    '/profile',
    '/account/*',
    '/orders/*',
    '/cart',
    '/location',
    '/guest-profile',
    '/tesekkurler',
    '/_not-found',
    '/404',
    '/500'
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/debug/',
          '/test-',
          '/restaurant-login',
          '/restaurant-apply',
          '/register',
          '/profile',
          '/account/',
          '/orders/',
          '/cart',
          '/location',
          '/guest-profile',
          '/_not-found',
          '/404',
          '/500'
        ]
      }
    ],
    additionalSitemaps: [
      'https://www.neyisek.com/sitemap.xml'
    ]
  },
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
  transform: async (config, path) => {
    // Özel sayfa öncelikleri
    let priority = config.priority;
    let changefreq = config.changefreq;

    // Ana sayfa
    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    }
    
    // Menü sayfası
    else if (path === '/menu') {
      priority = 0.9;
      changefreq = 'daily';
    }
    
    // Restoran sayfaları
    else if (path.startsWith('/restaurant/') && !path.includes('/admin')) {
      priority = 0.8;
      changefreq = 'weekly';
    }
    
    // Ürün sayfaları
    else if (path.startsWith('/product/')) {
      priority = 0.8;
      changefreq = 'weekly';
    }
    
    // Hakkımızda, İletişim, Yardım sayfaları
    else if (['/about', '/contact', '/help', '/terms', '/privacy', '/returns'].includes(path)) {
      priority = 0.6;
      changefreq = 'monthly';
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
    };
  },
}; 