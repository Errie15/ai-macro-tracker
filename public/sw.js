const CACHE_NAME = 'ai-macro-tracker-v3-input-fixes';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/icon.svg'
];

// URLs that should never be cached (authentication related)
const EXCLUDED_URLS = [
  'accounts.google.com',
  'firebase',
  'firebaseapp.com',
  'googleapis.com',
  'identitytoolkit.googleapis.com'
];

self.addEventListener('install', (event) => {
  console.log('🔧 Installing SW v3 with input field fixes');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  );
  // Skip waiting to activate immediately
  self.skipWaiting();
});

self.addEventListener('fetch', (event) => {
  const url = event.request.url;
  
  // Don't cache authentication related requests
  const shouldExclude = EXCLUDED_URLS.some(excludedUrl => url.includes(excludedUrl));
  
  if (shouldExclude || event.request.method !== 'GET') {
    // For auth requests and non-GET requests, always fetch from network
    event.respondWith(fetch(event.request));
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        return response || fetch(event.request);
      }
    )
  );
});

self.addEventListener('activate', (event) => {
  console.log('🔧 Activating SW v3 with input field fixes');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Claim all clients immediately
  return self.clients.claim();
}); 