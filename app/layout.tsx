import './globals.css';
import type { Metadata, Viewport } from 'next';
import { AppProvider } from '@/context/AppContext';
import DesktopWrapper from '@/components/DesktopWrapper';
import SecurityShield from '@/components/SecurityShield';

import DevGatekeeper from '@/components/DevGatekeeper';
import { Toaster } from 'sonner';

export const viewport: Viewport = {
  themeColor: '#E5002B',
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content'
};

export const metadata: Metadata = {
  metadataBase: new URL('https://drobe.one'),
  title: 'DROBE — Fashion in 30 Minutes | Launching Soon',
  description: 'Fashion in 30 minutes | Launching Soon in Ahmedabad, Gurgaon, Chandigarh, and Lucknow. Experience doorstep fashion delivery and 6-minute mirror trial before you buy.',
  manifest: '/manifest.json',
  applicationName: 'DROBE',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'DROBE'
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/drobe-emblem.png', type: 'image/png' },
      { url: '/og-square.png', type: 'image/png' }
    ],
    apple: [
      { url: '/og-square.png', sizes: '512x512', type: 'image/png' },
      { url: '/icons/Icon-192.png', sizes: '192x192', type: 'image/png' }
    ],
    shortcut: '/favicon.ico'
  },
  openGraph: {
    title: 'DROBE — Fashion in 30 Minutes | Launching Soon',
    description: 'Fashion in 30 minutes | Launching Soon in Ahmedabad, Gurgaon, Chandigarh, and Lucknow. Experience doorstep fashion delivery and 6-minute mirror trial before you buy.',
    url: 'https://drobe.one',
    siteName: 'DROBE',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'DROBE — Fashion in 30 Minutes | Launching Soon'
      },
      {
        url: '/og-square.png',
        width: 512,
        height: 512,
        alt: 'DROBE Logo'
      }
    ],
    locale: 'en_IN',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DROBE — Fashion in 30 Minutes | Launching Soon',
    description: 'Fashion in 30 minutes | Launching Soon in Ahmedabad, Gurgaon, Chandigarh, and Lucknow.',
    images: ['/og-image.png']
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover, interactive-widget=resizes-content"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Immediate pre-hydration guard against context menu, dragging, shortcuts & scraping
                try {
                  window.addEventListener('contextmenu', function(e) { e.preventDefault(); return false; }, true);
                  document.addEventListener('contextmenu', function(e) { e.preventDefault(); return false; }, true);
                  window.addEventListener('dragstart', function(e) { e.preventDefault(); return false; }, true);
                  document.addEventListener('dragstart', function(e) { e.preventDefault(); return false; }, true);
                  window.addEventListener('selectstart', function(e) {
                    var t = e.target;
                    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return true;
                    e.preventDefault(); return false;
                  }, true);
                  window.addEventListener('keydown', function(e) {
                    var isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
                    var cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
                    if (
                      (cmdOrCtrl && (e.key === 's' || e.key === 'S' || e.key === 'p' || e.key === 'P' || e.key === 'u' || e.key === 'U')) ||
                      e.key === 'F12' ||
                      (cmdOrCtrl && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c'))
                    ) {
                      e.preventDefault();
                      return false;
                    }
                  }, true);
                } catch(err) {}

                function updateAppHeight() {
                  if (window.innerWidth < 550) {
                    var vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
                    document.documentElement.style.setProperty('--app-height', vh + 'px');
                    document.documentElement.style.setProperty('--vh', (vh * 0.01) + 'px');
                  }
                }
                updateAppHeight();
                window.addEventListener('resize', updateAppHeight);
                window.addEventListener('orientationchange', updateAppHeight);
                if (window.visualViewport) {
                  window.visualViewport.addEventListener('resize', updateAppHeight);
                }

                // Purge any stale service worker caches from previous versions
                if ('caches' in window) {
                  caches.keys().then(function(keys) {
                    for (var k of keys) {
                      if (k !== 'drobe-pwa-v3') caches.delete(k);
                    }
                  });
                }

                // Register PWA service worker on production only; unregister on localhost
                if ('serviceWorker' in navigator) {
                  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
                    navigator.serviceWorker.getRegistrations().then(function(regs) {
                      for (var r of regs) { r.unregister(); }
                    });
                  } else if (window.location.protocol === 'https:') {
                    window.addEventListener('load', function() {
                      navigator.serviceWorker.register('/sw.js').catch(function() {});
                    });
                  }
                }
              })();
            `
          }}
        />
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />

        {/* PWA & Mobile Web App Native Directives */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="DROBE" />
        <meta name="theme-color" content="#E5002B" />
        <link rel="apple-touch-icon" href="/og-square.png" />

        {/* Direct Open Graph Meta Tags for WhatsApp, Telegram, iMessage & Social Crawlers */}
        <meta property="og:title" content="DROBE — Fashion in 30 Minutes | Launching Soon" />
        <meta
          property="og:description"
          content="Fashion in 30 minutes | Launching Soon in Ahmedabad, Gurgaon, Chandigarh, and Lucknow. Experience doorstep fashion delivery and 6-minute mirror trial before you buy."
        />
        <meta property="og:image" content="https://drobe.one/og-image.png" />
        <meta property="og:image:secure_url" content="https://drobe.one/og-image.png" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="DROBE — Fashion in 30 Minutes | Launching Soon" />
        <meta property="og:url" content="https://drobe.one" />
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="DROBE" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="DROBE — Fashion in 30 Minutes | Launching Soon" />
        <meta
          name="twitter:description"
          content="Fashion in 30 minutes | Launching Soon in Ahmedabad, Gurgaon, Chandigarh, and Lucknow."
        />
        <meta name="twitter:image" content="https://drobe.one/og-image.png" />

        {/* ========================================================
            SCHEMA.ORG RICH RESULTS & KNOWLEDGE GRAPH (SEO, AEO, GEO)
            Google Rich Snippets, Perplexity Citations, ChatGPT Citing
            ======================================================== */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'DROBE',
                legalName: 'Drobe Luxury Technologies Private Limited',
                url: 'https://drobe.one',
                logo: 'https://drobe.one/drobe-logo-full-white.png',
                image: 'https://drobe.one/og-image.png',
                description:
                  'India\'s first 30-minute doorstep fashion delivery platform with 6-minute mirror trial before you buy.',
                sameAs: [
                  'https://www.instagram.com/drobe.one',
                  'https://x.com/drobe_one',
                  'https://www.linkedin.com/company/drobe'
                ],
                contactPoint: {
                  '@type': 'ContactPoint',
                  telephone: '+91-800-376-2347',
                  contactType: 'customer service',
                  areaServed: 'IN',
                  availableLanguage: ['English', 'Hindi', 'Gujarati']
                }
              },
              {
                '@context': 'https://schema.org',
                '@type': 'WebSite',
                name: 'DROBE',
                url: 'https://drobe.one',
                potentialAction: {
                  '@type': 'SearchAction',
                  target: {
                    '@type': 'EntryPoint',
                    urlTemplate: 'https://drobe.one/search?q={search_term_string}'
                  },
                  'query-input': 'required name=search_term_string'
                }
              },
              {
                '@context': 'https://schema.org',
                '@type': 'DeliveryService',
                name: 'DROBE 30-Minute Fashion Delivery & Trial',
                provider: {
                  '@type': 'Organization',
                  name: 'DROBE',
                  url: 'https://drobe.one'
                },
                serviceType: '30-Minute Express Doorstep Fashion Delivery and Try Before You Buy Trial',
                areaServed: [
                  { '@type': 'City', name: 'Ahmedabad' },
                  { '@type': 'City', name: 'Gurgaon' },
                  { '@type': 'City', name: 'Chandigarh' },
                  { '@type': 'City', name: 'Lucknow' }
                ],
                hoursAvailable: {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: [
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                    'Sunday'
                  ],
                  opens: '08:00',
                  closes: '23:30'
                }
              },
              {
                '@context': 'https://schema.org',
                '@type': 'FAQPage',
                mainEntity: [
                  {
                    '@type': 'Question',
                    name: 'What is DROBE?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text:
                        'DROBE (drobe.one) is India\'s pioneer quick-commerce fashion platform delivering premium streetwear, casuals, and ethnic wear from leading brands to your doorstep in under 30 minutes with an integrated 6-minute mirror trial before you buy.'
                    }
                  },
                  {
                    '@type': 'Question',
                    name: 'Which cities does DROBE serve?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text:
                        'DROBE is launching across Ahmedabad (Central Hub #01 at Koteshwar Road / Motera), Gurgaon, Chandigarh, and Lucknow.'
                    }
                  },
                  {
                    '@type': 'Question',
                    name: 'How does Try Before You Buy work on DROBE?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text:
                        'When you place an order on DROBE, our delivery runner arrives within 30 minutes carrying your items and adjacent sizes. You take 6 minutes to try them on in front of your mirror, keep what fits, and return what doesn\'t on the spot with zero courier returns or repackaging.'
                    }
                  },
                  {
                    '@type': 'Question',
                    name: 'Which fashion brands are available on DROBE?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text:
                        'DROBE features top streetwear, casual, and ethnic fashion brands including The Souled Store, Snitch, What The Flex, Chapter 2, Main Character, Powerlook, GENRAGE, Ikoho, Rawayi, CALDRI, House of Koala, IWE Studios, Vastramay, TASVA, Manyavar, GIVA, and Chumbak.'
                    }
                  },
                  {
                    '@type': 'Question',
                    name: 'How do payments work on DROBE?',
                    acceptedAnswer: {
                      '@type': 'Answer',
                      text:
                        'Customers only pay after trying on their garments. You can pay instantly using any UPI app (Google Pay, PhonePe, Paytm), credit/debit card, or cash on delivery directly to the delivery runner.'
                    }
                  }
                ]
              }
            ])
          }}
        />
      </head>
      <body>
        <SecurityShield />
        <AppProvider>
          <DesktopWrapper>
            <DevGatekeeper>
              {children}
            </DevGatekeeper>
          </DesktopWrapper>
        </AppProvider>
        <Toaster richColors position="top-right" closeButton />
      </body>
    </html>
  );
}

