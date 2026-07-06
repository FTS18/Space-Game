const CACHE_NAME = 'finixx-cache-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/assets/images/logo.png',
  '/assets/css/theme.css',
  '/games/ludo/index.html',
  '/games/ludo/style.css',
  '/games/ludo/game.js',
  '/games/space-fire/index.html',
  '/games/space-fire/ghg.png',
  '/games/space-fire/background.jpg',
  '/games/space-fire/UFO2.png',
  '/games/pacman/index.html',
  '/games/pacman/style.css',
  '/assets/js/pacman.js',
  '/games/ping-pong/index.html',
  '/assets/js/pong.js',
  '/games/tic-tac-toe/index.html',
  '/games/tic-tac-toe/style.css',
  '/games/tic-tac-toe/game.js',
  '/games/scribble/index.html',
  '/games/scribble/scribble.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Ignore non-GET requests and API calls
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        
        // Clone request as it can only be consumed once
        const fetchRequest = event.request.clone();
        
        return fetch(fetchRequest).then(
          (response) => {
            // Check if we received a valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clone response as it can only be consumed once
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then((cache) => {
                // Don't cache media files dynamically to prevent bloat
                if (!event.request.url.match(/\.(mp4|webm|m4a|mp3)$/)) {
                  cache.put(event.request, responseToCache);
                }
              });
              
            return response;
          }
        ).catch(() => {
          // If fetch fails (offline), could return a custom offline page here
        });
      })
  );
});
