const CACHE_NAME = 'reflecto-v1';
const STATIC_CACHE = 'reflecto-static-v1';
const DYNAMIC_CACHE = 'reflecto-dynamic-v1';

// Static resources to cache on install
const STATIC_URLS = ['/', '/static/js/main.bundle.js', '/static/css/main.css'];

// Service Worker installation
self.addEventListener('install', event => {
  event.waitUntil(
    Promise.all([
      // Cache static resources
      caches
        .open(STATIC_CACHE)
        .then(cache => {
          return cache.addAll(STATIC_URLS);
        }),
      // Cache main pages
      caches
        .open(CACHE_NAME)
        .then(cache => {
          return cache.addAll(['/', '/ru', '/en']);
        }),
    ])
  );

  // Activate new Service Worker immediately
  self.skipWaiting();
});

// Service Worker activation
self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches
        .keys()
        .then(cacheNames => {
          return Promise.all(
            cacheNames.map(cacheName => {
              if (
                cacheName !== CACHE_NAME &&
                cacheName !== STATIC_CACHE &&
                cacheName !== DYNAMIC_CACHE
              ) {
                return caches.delete(cacheName);
              }
              return Promise.resolve();
            })
          );
        }),
      // Take control of all clients
      self.clients.claim(),
    ])
  );
});

// Intercept requests
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Strategy for API requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Strategy for static resources
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/static/') ||
    url.pathname.includes('.js') ||
    url.pathname.includes('.css') ||
    url.pathname.includes('.png') ||
    url.pathname.includes('.jpg') ||
    url.pathname.includes('.webp') ||
    url.pathname.includes('.svg')
  ) {
    event.respondWith(handleStaticRequest(request));
    return;
  }

  // Strategy for pages
  if (request.mode === 'navigate') {
    event.respondWith(handlePageRequest(request));
    return;
  }

  // For other requests - network with cache fallback
  event.respondWith(handleOtherRequest(request));
});

// Handle API requests
async function handleApiRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);

    // If successful, cache the response
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch {
    // If network is unavailable, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // If nothing available, return error
    return new Response('Network error', { status: 503 });
  }
}

// Handle static resources
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);

  // Try cache first
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    // If not in cache, load from network
    const networkResponse = await fetch(request);

    // Cache for future use
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch {
    return new Response('Resource not found', { status: 404 });
  }
}

// Handle pages
async function handlePageRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);

    // If successful, cache
    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch {
    // If network is unavailable, try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    // If nothing available, return offline page
    return (
      caches.match('/offline.html') ||
      new Response('You are offline', { status: 503 })
    );
  }
}

// Handle other requests
async function handleOtherRequest(request) {
  try {
    return await fetch(request);
  } catch {
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }

    return new Response('Network error', { status: 503 });
  }
}

// Handle push notifications (if needed in the future)
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New notification',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'View',
        icon: '/icon-192x192.png',
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icon-192x192.png',
      },
    ],
  };

  event.waitUntil(self.registration.showNotification('Reflecto', options));
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(clients.openWindow('/'));
  }
});
