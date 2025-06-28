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
  maximumScale: 5,
  userScalable: true,
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

              // PWA Input Field Fix for iOS
              function fixPWAInputs() {
                const isPWA = window.matchMedia('(display-mode: standalone)').matches || 
                             (window.navigator).standalone === true ||
                             document.referrer.includes('android-app://');
                
                if (isPWA) {
                  console.log('🔧 Applying PWA input fixes');
                  
                  // Add event listeners to all input fields
                  document.addEventListener('DOMContentLoaded', function() {
                    const inputs = document.querySelectorAll('input, textarea, select');
                    
                    inputs.forEach(function(input) {
                      // Prevent viewport zoom on focus
                      input.addEventListener('focus', function(e) {
                        const viewport = document.querySelector('meta[name="viewport"]');
                        if (viewport) {
                          viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover');
                        }
                      });
                      
                      // Restore normal viewport on blur
                      input.addEventListener('blur', function(e) {
                        const viewport = document.querySelector('meta[name="viewport"]');
                        if (viewport) {
                          viewport.setAttribute('content', 'width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover');
                        }
                      });

                      // Force focus for iOS PWA
                      input.addEventListener('touchstart', function(e) {
                        e.preventDefault();
                        setTimeout(() => {
                          input.focus();
                          input.click();
                        }, 100);
                      });
                    });
                  });
                  
                  // Re-apply fixes when new content is loaded
                  const observer = new MutationObserver(function(mutations) {
                    mutations.forEach(function(mutation) {
                      if (mutation.addedNodes.length > 0) {
                        mutation.addedNodes.forEach(function(node) {
                          if (node.nodeType === 1) {
                            const newInputs = node.querySelectorAll ? node.querySelectorAll('input, textarea, select') : [];
                            newInputs.forEach(function(input) {
                              input.addEventListener('touchstart', function(e) {
                                e.preventDefault();
                                setTimeout(() => {
                                  input.focus();
                                  input.click();
                                }, 100);
                              });
                            });
                          }
                        });
                      }
                    });
                  });
                  
                  observer.observe(document.body, {
                    childList: true,
                    subtree: true
                  });
                }
              }

              // Apply fixes when DOM is ready
              if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', fixPWAInputs);
              } else {
                fixPWAInputs();
              }
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