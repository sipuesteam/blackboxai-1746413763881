// Service Worker script for caching static assets and enabling offline functionality.

// Increment the cache version any time you make changes to the cached assets list (urlsToCache) or the caching logic.
// Changing the version name forces the browser to download a new Service Worker and install a new cache.
const CACHE_NAME = 'hygiene-cleaning-store-cache-v4'; // Incremented cache version (e.g., v4) to ensure updates

// List of URLs to cache. These are the core assets required for your application to function offline.
// Make sure these paths and URLs match the actual files and external resources your index.html loads.
const urlsToCache = [
  '/', // Cache the root path, which typically serves index.html
  'index.html', // Cache the main HTML file
  'main.js', // Cache your main application JavaScript file
  // Corrected script name to match index.html's script tag for the Visitor Bubble:
  'visitorCountBubble.js', // Cache the Visitor Count Bubble script assuming it's at the root

  'manifest.json', // Cache the PWA manifest file

  'https://cdn.tailwindcss.com', // Cache the Tailwind CSS CDN file

  // Google Fonts - Make sure these URLs match exactly what's loaded by your browser based on your CSS
  // Inspect the Network tab in your browser's developer tools to find the actual font file URLs (.woff2, .woff, etc.)
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600&family=Roboto:wght@700&display=swap', // Cache the Google Fonts CSS file
  // Example font file URLs (these might change, verify them in your network tab):
  'https://fonts.gstatic.com/s/inter/v13/UcC7GpmsEVsKgwSyq_LwBDxkAw.woff2',
  'https://fonts.gstatic.com/s/inter/v13/UcC7GpmsEVsKgwSyq_LwBSxk.woff2',
  'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu9DN5ncwptlzdA.woff2',
  'https://fonts.gstatic.com/s/roboto/v20/KFOmCnqEu9DN5ncwptOykA.woff2', // Another Roboto weight/style example

  // Material Icons - Verify the exact URLs loaded for the icon font files
  'https://fonts.googleapis.com/icon?family=Material+Icons', // Cache the Material Icons CSS file
  // Example Material Icons font file URL (verify in network tab):
  'https://fonts.gstatic.com/s/materialicons/v140/flUhRq6tzZclQEJ-Vdg-Iorthqu_gZUPqA.woff2',

  // Cache external assets loaded directly by your HTML or scripts
  // Amazon Pay Widgets SDK:
  'https://static-na.payments-amazon.com/OffAmazonPayments/us/js/Widgets.js', // Cache Amazon Pay SDK

  // YouTube Iframe API Script (dynamically loaded by main.js):
  // Verify the exact URL used in your main.js when loading the API.
  // This is the standard URL for the API script provided by Google/YouTube.
  'https://www.youtube.com/iframe_api', // Cache YouTube Iframe API script

  // Images used in the HTML (e.g., flag, placeholder ads)
  'https://flagcdn.com/us.svg', // Cache the USA flag image
  'https://via.placeholder.com/300x200?text=Sample+Product+Image', // Cache sample product image placeholder
  'https://via.placeholder.com/600x200?text=Sponsored+Ad+Image', // Cache ad image placeholder

  // Add any other static assets your page directly links to (e.g., logos, specific product images you want to pre-cache, but be mindful of cache size)
  // 'images/logo.png',
  // 'path/to/some/other/static/image.jpg',

  // If you have an offline fallback page, include it here
  // '/offline.html',
];

// Service Worker Installation Event:
// This event fires when the service worker is installed for the first time or when a new version is detected.
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installation started...');
  // `event.waitUntil` ensures the service worker doesn't install until the promise resolves.
  // This is used to ensure all assets are cached before the service worker is considered installed.
  event.waitUntil(
    // Open a cache with the name defined in CACHE_NAME.
    caches.open(CACHE_NAME)
      .then(async (cache) => { // Use async/await for cleaner syntax with cache.addAll
        console.log('Service Worker: Caching assets defined in urlsToCache list...');
        try {
          // Add all the URLs from the `urlsToCache` array to the cache.
          // If any URL in the list fails to fetch or cache, the entire `addAll` operation and thus the installation will fail.
          await cache.addAll(urlsToCache);
          console.log('Service Worker: All defined assets cached successfully during installation.');
        } catch (error) {
          // Log an error if caching fails for any reason (e.g., network issue, incorrect URL).
          console.error('Service Worker: Failed to cache some assets during installation:', error);
          // Note: If addAll fails for *any* URL, the whole installation fails.
          // For more robust production scenarios with potentially flaky resources, consider using Workbox
          // or implementing a custom caching logic (e.g., fetching individually and handling errors per asset).
        }
      })
      .catch((error) => {
         console.error('Service Worker: Cache opening failed during installation:', error);
      })
  );
   console.log('Service Worker: Installation event finished.');
});

// Service Worker Fetch Event:
// This event fires for every network request made by the page under the service worker's scope.
// This is where you intercept requests and decide how to respond (e.g., serve from cache or network).
self.addEventListener('fetch', (event) => {
  // `event.respondWith` allows us to intercept the network request and provide a custom response.
  event.respondWith(
    // Try to find a matching request in the caches.
    caches.match(event.request)
      .then((response) => {
        // If a match is found in the cache:
        if (response) {
          // console.log('Service Worker: Serving from cache for:', event.request.url); // Uncomment for detailed logging
          return response; // Return the cached response.
        }

        // If no match is found in the cache:
        // console.log('Service Worker: No cache match, fetching from network for:', event.request.url); // Uncomment for detailed logging
        // Fetch the resource from the network.
        return fetch(event.request)
          .then(
            (networkResponse) => {
              // You can optionally intercept the network response here.
              // For example, to dynamically cache new resources as they are fetched.
              // Be cautious with dynamically caching to manage cache size.
              // For this basic setup, pre-caching in 'install' is sufficient.

              // Example of dynamic caching for images (uncomment if needed, be mindful of storage):
              /*
              const url = event.request.url;
              // Cache images from your domain or trusted sources that were not pre-cached
              if (networkResponse.ok && networkResponse.type === 'basic' && (url.startsWith(self.location.origin) || url.startsWith('https://via.placeholder.com/'))) {
                  const responseToCache = networkResponse.clone(); // Clone the response as the original can only be consumed once
                  caches.open(CACHE_NAME).then(cache => {
                      cache.put(event.request, responseToCache); // Put the network response in the cache
                      console.log('Service Worker: Dynamically cached:', url);
                  });
              }
              */

              return networkResponse; // Return the response obtained from the network.
            }
          )
           .catch(networkError => {
              // This catch block handles errors that occur during the network fetch.
              console.error('Service Worker: Network fetch failed for:', event.request.url, networkError);
              // In case of a network error (e.g., offline), you might want to return a fallback response.
              // For example, return a cached offline page if the request was for an HTML page.
              // if (event.request.mode === 'navigate') { // Check if it was a navigation request
              //     return caches.match('/offline.html'); // Return a cached offline page
              // }
              // Otherwise, propagate the error or return a generic error response if appropriate.
              throw networkError; // Re-throw the error to indicate fetch failed.
           });
      })
      .catch((error) => {
         // This catch block handles errors from *both* the cache match and the network fetch.
         console.error('Service Worker: Cache match or network fetch failed for:', event.request.url, error);
         // You could return a generic fallback response here, like an offline page or a placeholder image.
         // Example for navigation requests failing both cache and network:
         // if (event.request.mode === 'navigate') {
         //     return caches.match('/offline.html'); // Return cached offline page
         // }
         // For other types of requests (images, scripts), you might just let the error propagate or return null/undefined.
         // Returning an empty Response object or null can sometimes prevent the browser's default error display.
         // return new Response(null, { status: 503, statusText: 'Service Unavailable' }); // Example: return a 503 response
         // return null; // Example: return null, might cause browser to show default error page
         throw error; // Re-throw the original error
      })
  );
});

// Service Worker Activation Event:
// This event fires when the service worker is activated. This is typically after installation
// and after any older service workers have been terminated.
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activation started. Cleaning up old caches...');
  // Define a whitelist of cache names that should be kept.
  // This should only contain the name of the current cache you want to use.
  const cacheWhitelist = [CACHE_NAME];

  // `event.waitUntil` ensures the service worker doesn't finish activating until the promise resolves.
  // This is used here to ensure old caches are deleted before activation is complete.
  event.waitUntil(
    // Get all existing cache names.
    caches.keys().then((cacheNames) => {
      // Iterate over all existing cache names.
      return Promise.all(
        cacheNames.map((cacheName) => {
          // If a cache name is NOT in the whitelist, delete that cache.
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Service Worker: Deleting old cache:', cacheName); // Log which cache is being deleted.
            return caches.delete(cacheName); // Delete the cache.
          }
           // If the cache name IS in the whitelist, do nothing (return undefined).
        })
      );
    }).then(() => {
      console.log('Service Worker: Activation complete. Old caches removed successfully.');
      // `self.clients.claim()` ensures that the currently open pages (within the service worker's scope)
      // are controlled by the *newly activated* service worker immediately, without needing a page refresh.
      // This is generally recommended for a better user experience during updates.
      return self.clients.claim(); // Claim control of the clients.
    })
  );
   console.log('Service Worker: Activation event finished.');
});

// Optional: Add a message event listener if your page needs to communicate with the service worker
/*
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received from page:', event.data);
  // Handle messages from the main thread if needed
  // event.source.postMessage('Service Worker received your message!');
});
*/