// Miroir PWA Service Worker
const CACHE_NAME = 'miroir-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/about.html',
  '/truth-tools.html',
  '/living-archive.html',
  '/our-miroirs.html',
  '/reflections.html',
  '/publications.html',
  '/my-miroir.html',
  '/style.css',
  '/miroir-features.css',
  '/miroir-features.js',
  '/client.js',
  '/miroir.png',
  '/reflect1.png',
  '/the-threshold.png',
  '/relaxing-electronic-ambient-music-354471.mp3'
];

// Install event - cache resources
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
      .catch((error) => {
        console.log('Cache install failed:', error);
      })
  );
});

// Fetch event - serve from cache when offline
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Return cached version or fetch from network
        if (response) {
          return response;
        }
        
        return fetch(event.request).then((response) => {
          // Check if we received a valid response
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clone the response for caching
          const responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(event.request, responseToCache);
            });

          return response;
        });
      })
      .catch(() => {
        // Return offline page if available
        if (event.request.destination === 'document') {
          return caches.match('/index.html');
        }
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Push notification handling
self.addEventListener('push', (event) => {
  const options = {
    body: event.data ? event.data.text() : 'New story available on Miroir',
    icon: '/miroir.png',
    badge: '/miroir.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/miroir.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/miroir.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('Miroir - Truth Awaits', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Background sync for story submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'story-submission') {
    event.waitUntil(syncStorySubmissions());
  }
});

async function syncStorySubmissions() {
  // Get pending submissions from IndexedDB
  const submissions = await getPendingSubmissions();
  
  for (const submission of submissions) {
    try {
      // Attempt to submit the story
      const response = await fetch('/api/submit-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submission)
      });

      if (response.ok) {
        // Remove from pending submissions
        await removePendingSubmission(submission.id);
      }
    } catch (error) {
      console.log('Failed to sync submission:', error);
    }
  }
}

// Helper functions for IndexedDB operations
async function getPendingSubmissions() {
  return new Promise((resolve) => {
    const request = indexedDB.open('MiroirDB', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['submissions'], 'readonly');
      const store = transaction.objectStore('submissions');
      const getAll = store.getAll();
      
      getAll.onsuccess = () => {
        resolve(getAll.result || []);
      };
    };
    
    request.onerror = () => {
      resolve([]);
    };
  });
}

async function removePendingSubmission(id) {
  return new Promise((resolve) => {
    const request = indexedDB.open('MiroirDB', 1);
    
    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['submissions'], 'readwrite');
      const store = transaction.objectStore('submissions');
      store.delete(id);
      
      transaction.oncomplete = () => {
        resolve();
      };
    };
  });
}