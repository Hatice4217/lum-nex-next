// LUMINEX - Robots.txt
// SEO için robots.txt oluşturma

import { MetadataRoute } from 'next';

const baseUrl = 'https://luminex.com.tr';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/doctor/',
          '/dashboard',
          '/messages',
          '/notifications',
          '/forgot-password',
          '/reset-password'
        ]
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard'
        ]
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  };
}

// Alternatif robots.txt için daha fazla kontrol
export function generateAdvancedRobots() {
  return {
    rules: [
      // Tüm botlar için
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          // API endpoint'leri
          '/api/',

          // Admin panel
          '/admin/',

          // Doktor panel
          '/doctor/',

          // Kullanıcı dashboard
          '/dashboard',

          // Özel sayfalar
          '/messages',
          '/notifications',
          '/forgot-password',
          '/reset-password',
          '/payment/demo'
        ],
        crawlDelay: 1
      },

      // Google özel
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard'
        ]
      },

      // Bing özel
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard'
        ],
        crawlDelay: 2
      },

      // Yandex özel
      {
        userAgent: 'Yandexbot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard'
        ]
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  };
}
