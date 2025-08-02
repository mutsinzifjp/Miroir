const CACHE_NAME = 'miroir-v1.0.0';
const STATIC_CACHE_URLS = [
  '/',
  '/index.html',
  '/about.html',
  '/my-miroir.html',
  '/our-miroirs.html',
  '/truth-tools.html',
  '/living-archive.html',
  '/reflections.html',
  '/publications.html',
  '/timeline.html',
  '/style.css',
  '/miroir-features.css',
  '/client.js',
  '/miroir-features.js',
  '/miroir-notifications.js',
  '/miroir.png',
  '/relaxing-electronic-ambient-music-354471.mp3',
  '/manifest.json'
];

// Assets that can be cached on demand
const RUNTIME_CACHE_URLS = [
  '/carmen.jpeg',
  '/crossing.jpeg',
  '/derholle.jpeg',
  '/lacrimosa.jpeg',
  '/lostchildhood.jpeg',
  '/ofortuna.jpeg',
  '/reflect1.png',
  '/the-threshold.png',
  '/trianglecover.jpg',
  '/triangle-formed-me.pdf',
  '/unboxedcover.png'
];

// Background sync data
const SYNC_QUEUE = 'miroir-sync-queue';

// Install event - cache core resources
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching static resources');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => {
        console.log('[SW] Installation complete');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  
  // Skip non-GET requests and external URLs
  if (event.request.method !== 'GET' || !url.origin === location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        if (cachedResponse) {
          console.log('[SW] Serving from cache:', event.request.url);
          return cachedResponse;
        }

        console.log('[SW] Fetching from network:', event.request.url);
        return fetch(event.request)
          .then(response => {
            // Don't cache non-successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Cache runtime assets
            if (RUNTIME_CACHE_URLS.some(url => event.request.url.includes(url))) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => {
                  cache.put(event.request, responseToCache);
                });
            }

            return response;
          })
          .catch(error => {
            console.error('[SW] Fetch failed:', error);
            
            // Return offline page for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
            
            throw error;
          });
      })
  );
});

// Background sync for form submissions
self.addEventListener('sync', event => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'story-submission') {
    event.waitUntil(syncStorySubmissions());
  }
  
  if (event.tag === 'reflection-submission') {
    event.waitUntil(syncReflectionSubmissions());
  }
});

// Push notification handler
self.addEventListener('push', event => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New reflection available',
    icon: '/miroir.png',
    badge: '/miroir.png',
    vibrate: [200, 100, 200],
    tag: 'miroir-notification',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/miroir.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Miroir - Truth Reflection', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/timeline.html')
    );
  }
});

// Helper function to sync story submissions
async function syncStorySubmissions() {
  try {
    const db = await openIndexedDB();
    const submissions = await getUnsynced(db, 'story-submissions');
    
    for (const submission of submissions) {
      try {
        // In a real app, this would send to your backend
        console.log('[SW] Syncing story submission:', submission);
        
        // Mark as synced
        await markAsSynced(db, 'story-submissions', submission.id);
      } catch (error) {
        console.error('[SW] Failed to sync story submission:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// Helper function to sync reflection submissions
async function syncReflectionSubmissions() {
  try {
    const db = await openIndexedDB();
    const submissions = await getUnsynced(db, 'reflection-submissions');
    
    for (const submission of submissions) {
      try {
        // In a real app, this would send to your backend
        console.log('[SW] Syncing reflection submission:', submission);
        
        // Mark as synced
        await markAsSynced(db, 'reflection-submissions', submission.id);
      } catch (error) {
        console.error('[SW] Failed to sync reflection submission:', error);
      }
    }
  } catch (error) {
    console.error('[SW] Background sync failed:', error);
  }
}

// IndexedDB helpers
function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('MiroirDB', 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = event => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains('story-submissions')) {
        const storyStore = db.createObjectStore('story-submissions', { keyPath: 'id' });
        storyStore.createIndex('synced', 'synced', { unique: false });
      }
      
      if (!db.objectStoreNames.contains('reflection-submissions')) {
        const reflectionStore = db.createObjectStore('reflection-submissions', { keyPath: 'id' });
        reflectionStore.createIndex('synced', 'synced', { unique: false });
      }
    };
  });
}

function getUnsynced(db, storeName) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const index = store.index('synced');
    const request = index.getAll(false);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function markAsSynced(db, storeName, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.get(id);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => {
      const data = request.result;
      data.synced = true;
      const updateRequest = store.put(data);
      updateRequest.onerror = () => reject(updateRequest.error);
      updateRequest.onsuccess = () => resolve();
    };
  });
}