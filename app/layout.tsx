import './globals.css';
import type { Metadata, Viewport } from 'next';
import { AppProvider } from '@/context/AppContext';
import DesktopWrapper from '@/components/DesktopWrapper';
import SecurityShield from '@/components/SecurityShield';
import SplashScreen from '@/components/SplashScreen';

import DevGatekeeper from '@/components/DevGatekeeper';

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
  viewportFit: 'cover',
  interactiveWidget: 'resizes-content'
};

export const metadata: Metadata = {
  title: 'DROBE | 30-Mins Fashion Delivery | Try Before You Buy',
  description: 'Get fashion in 30-mins. Try before you buy with Drobe. No waits or regrets, just fire fits!',
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
      { url: '/drobe-emblem.png', type: 'image/png' }
    ],
    apple: '/icons/Icon-192.png'
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

                // Register PWA service worker
                if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
                  window.addEventListener('load', function() {
                    navigator.serviceWorker.register('/sw.js').catch(function() {});
                  });
                }
              })();
            `
          }}
        />
      </head>
      <body>
        <SecurityShield />
        <AppProvider>
          <DesktopWrapper>
            <DevGatekeeper>
              <SplashScreen />
              {children}
            </DevGatekeeper>
          </DesktopWrapper>
        </AppProvider>
      </body>
    </html>
  );
}

