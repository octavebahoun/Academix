import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { RangeRequestsPlugin } from 'workbox-range-requests';


precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();

// ── Fallback offline pour la navigation (SPA) ──────────────────
// NetworkFirst : essaie le réseau, sinon sert la version en cache.
// Comme index.html est précaché, l'app se charge toujours hors-ligne.
const navigationHandler = new NetworkFirst({
    cacheName: 'navigations-v1',
    plugins: [
        new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
});
registerRoute(new NavigationRoute(navigationHandler));


registerRoute(
    ({ request }) =>
        request.destination === 'script' ||
        request.destination === 'style' ||
        request.destination === 'font',
    new CacheFirst({
        cacheName: 'static-assets-v1',
        plugins: [
            new ExpirationPlugin({ maxAgeSeconds: 30 * 24 * 60 * 60, maxEntries: 100 }),
            new CacheableResponsePlugin({ statuses: [0, 200] }),
        ],
    })
);


registerRoute(
    /\/api\/v1\/student\/(notes|emploi-temps|profil|moyennes)/,
    new StaleWhileRevalidate({
        cacheName: 'student-api-v1',
        plugins: [
            new ExpirationPlugin({ maxAgeSeconds: 7 * 24 * 60 * 60, maxEntries: 50 }),
            new CacheableResponsePlugin({ statuses: [0, 200] }),
        ],
    })
);


registerRoute(
    /\/api\/v1\/(summary|quiz)\/[\w-]+/,
    new CacheFirst({
        cacheName: 'ai-results-v1',
        plugins: [
            new ExpirationPlugin({ maxAgeSeconds: 7 * 24 * 60 * 60, maxEntries: 200 }),
            new CacheableResponsePlugin({ statuses: [0, 200] }),
        ],
    })
);


registerRoute(
    /\/api\/v1\/(exercises|images)\/[\w-]+/,
    new CacheFirst({
        cacheName: 'ai-exercices-images-v1',
        plugins: [
            new ExpirationPlugin({ maxAgeSeconds: 7 * 24 * 60 * 60, maxEntries: 200 }),
            new CacheableResponsePlugin({ statuses: [0, 200] }),
        ],
    })
);


registerRoute(
    /\.(?:mp3|wav|ogg|m4a|aac)$/i,
    new CacheFirst({
        cacheName: 'audio-podcasts-v1',
        plugins: [
            new ExpirationPlugin({ maxAgeSeconds: 7 * 24 * 60 * 60, maxEntries: 50 }),
            new CacheableResponsePlugin({ statuses: [0, 200, 206] }),
            new RangeRequestsPlugin(),
        ],
    })
);


self.addEventListener('push', (event) => {
    if (!event.data) return;

    let data = {};
    try {
        data = event.data.json();
    } catch {
        data = { title: 'AcademiX', body: event.data.text() };
    }

    const title = data.title || 'AcademiX';
    const options = {
        body: data.body || 'Tu as une nouvelle notification',
        icon: data.icon || '/icons/icon-192x192.png',
        badge: data.badge || '/icons/icon-72x72.png',
        tag: data.tag || 'academix-notification',
        data: { url: data.url || '/dashboard' },
        vibrate: [200, 100, 200],
        renotify: false,
    };


    event.waitUntil(self.registration.showNotification(title, options));
});



self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const targetUrl = event.notification.data?.url || '/dashboard';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Chercher un onglet AcademiX déjà ouvert
            for (const client of windowClients) {
                const clientUrl = new URL(client.url);
                // Si l'onglet pointe vers notre app, on le focus et on navigue
                if (clientUrl.origin === self.location.origin) {
                    client.focus();
                    return client.navigate(targetUrl);
                }
            }
            // Sinon ouvrir un nouvel onglet
            return clients.openWindow(targetUrl);
        })
    );
});
