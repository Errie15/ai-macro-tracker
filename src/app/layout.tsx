import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'
import CookieConsent from '@/components/CookieConsent'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '🤖 AI Macro Tracker',
  description: 'Din personliga AI-assistent för hälsosam näring',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AI Macro Tracker'
  },
  icons: {
    icon: [
      { url: '/icon-emoji.svg', type: 'image/svg+xml' }
    ],
    apple: '/icon-emoji.svg'
  }
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#22c55e'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="sv" className="dark">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AI Macro Tracker" />
        <meta name="theme-color" content="#22c55e" />
        <link rel="apple-touch-icon" href="/icon-emoji.svg" />
        <link rel="icon" href="/icon-emoji.svg" type="image/svg+xml" />
        
        {/* Google AdSense */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2464713169568824"
          crossOrigin="anonymous"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // PWA detection and dynamic viewport handling
              function updateViewportForPWA() {
                const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                             window.navigator.standalone === true ||
                             document.referrer.includes('android-app://');
                
                if (isPWA) {
                  console.log('🔧 PWA Mode: Disabling zoom');
                  // Ensure no zooming in PWA mode
                  let viewport = document.querySelector('meta[name="viewport"]');
                  if (viewport) {
                    viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
                  }
                } else {
                  console.log('🌐 Browser Mode: Allowing controlled zoom');
                }
              }
              
              // Run immediately and on load
              updateViewportForPWA();
              window.addEventListener('load', updateViewportForPWA);
              
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                      
                      // Check for updates
                      registration.addEventListener('updatefound', function() {
                        const newWorker = registration.installing;
                        if (newWorker) {
                          newWorker.addEventListener('statechange', function() {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                              console.log('🔄 New SW available, reloading...');
                              window.location.reload();
                            }
                          });
                        }
                      });
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <CookieConsent />
        </AuthProvider>
      </body>
    </html>
  )
} 