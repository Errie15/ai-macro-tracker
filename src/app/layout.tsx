import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/contexts/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: '🤖 AI Macro Tracker',
  description: 'Din personliga AI-assistent för hälsosam näring',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
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
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="AI Macro Tracker" />
        <meta name="theme-color" content="#22c55e" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <link rel="apple-touch-icon" href="/icon-emoji.svg" />
        <link rel="icon" href="/icon-emoji.svg" type="image/svg+xml" />
        <style dangerouslySetInnerHTML={{
          __html: `
            /* PWA Input Field Fixes */
            @media (display-mode: standalone) {
              input, textarea, select {
                font-size: 16px !important;
                transform: translateZ(0);
                -webkit-appearance: none;
                -webkit-border-radius: 0;
                border-radius: 4px;
              }
              
              input:focus, textarea:focus, select:focus {
                -webkit-user-select: text;
                user-select: text;
                outline: none;
                transform: translateZ(0);
              }
              
              /* Prevent iOS safari issues */
              body {
                -webkit-touch-callout: none;
                -webkit-text-size-adjust: 100%;
                -webkit-tap-highlight-color: transparent;
              }
              
              /* Fix for iOS standalone input zoom */
              @supports (-webkit-touch-callout: none) {
                input[type="email"], 
                input[type="password"], 
                input[type="text"], 
                textarea, 
                select {
                  font-size: 16px !important;
                  -webkit-appearance: none;
                  border-radius: 8px;
                }
              }
            }
          `
        }} />
<script
          dangerouslySetInnerHTML={{
            __html: `
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
              
              // PWA input focus fixes
              document.addEventListener('DOMContentLoaded', function() {
                const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                             window.navigator.standalone === true;
                             
                if (isPWA) {
                  console.log('🔧 Applying PWA input fixes');
                  
                  // Fix for input focus on iOS PWA
                  document.addEventListener('focusin', function(e) {
                    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
                      setTimeout(function() {
                        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 300);
                    }
                  });
                }
              });
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
        {children}
        </AuthProvider>
      </body>
    </html>
  )
} 