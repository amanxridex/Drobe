import './globals.css';
import type { Metadata } from 'next';
import { AppProvider } from '@/context/AppContext';
import DesktopWrapper from '@/components/DesktopWrapper';

export const metadata: Metadata = {
  title: 'KNOT | 60-Mins Fashion Delivery | Try Before You Buy',
  description: 'Get fashion in 60-mins. Try before you buy. No waits or regrets, just fire fits!',
  icons: {
    icon: '/favicon.ico',
    apple: '/icons/Icon-192.webp'
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
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      <body>
        <AppProvider>
          <DesktopWrapper>{children}</DesktopWrapper>
        </AppProvider>
      </body>
    </html>
  );
}
