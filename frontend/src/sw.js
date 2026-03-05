import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate, NetworkFirst, NetworkOnly } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { RangeRequestsPlugin } from 'workbox-range-requests';
import { BackgroundSyncPlugin } from 'workbox-background-sync';


// ── Précache + nettoyage ───────────────────────────────────────
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();


// ── Background Sync pour les POST offline ─────────────────────
// Les requêtes POST faites sans connexion sont mises en file
// d'attente et rejouées automatiquement au retour du réseau.
const bgSyncPlugin = new BackgroundSyncPlugin('post-queue', {
    maxRetentionTime: 24 * 60,
});

registerRoute(
    ({ request }) => request.method === 'POST' && (
        request.url.includes('/api/laravel/') ||
        request.url.includes('/api/node/') ||
        request.url.includes('/api/python/')
    ),
    new NetworkOnly({
        plugins: [bgSyncPlugin],
    }),
    'POST'
);


// ── Navigation SPA ─────────────────────────────────────────────
const navigationHandler = new NetworkFirst({
    cacheName: 'navigations-v1',
    plugins: [
        new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
});
registerRoute(new NavigationRoute(navigationHandler));


// ── API Laravel — données étudiant ────────────────────────────
// /api/laravel/student/notes
// /api/laravel/student/emploi-temps
// /api/laravel/student/profil
// /api/laravel/student/moyennes
// /api/laravel/student/taches
// /api/laravel/student/alertes
// /api/laravel/student/analysis
registerRoute(
    ({ url }) => url.pathname.match(
        /^\/api\/laravel\/student\/(notes|emploi-temps|profil|moyennes|taches|alertes|analysis)/
    ),
    new StaleWhileRevalidate({
        cacheName: 'student-api-v1',
        plugins: [
            new CacheableResponsePlugin({ statuses: [0, 200] }),
            new ExpirationPlugin({
                maxAgeSeconds: 7 * 24 * 60 * 60,
                maxEntries: 100,
            }),
        ],
    })
);

// ── API Node — Sessions ───────────────────────────────────────
registerRoute(
    ({ url }) => url.pathname.match(/^\/api\/node\/sessions/),
    new StaleWhileRevalidate({
        cacheName: 'node-sessions-v1',
        plugins: [
            new CacheableResponsePlugin({ statuses: [0, 200] }),
            new ExpirationPlugin({
                maxAgeSeconds: 7 * 24 * 60 * 60,
                maxEntries: 100,
            }),
        ],
    })
);

// Invalidation manuelle du cache étudiant (depuis l'app ou un push)
self.addEventListener('message', async (event) => {
    if (event.data?.type === 'INVALIDATE_STUDENT_CACHE') {
        const cache = await caches.open('student-api-v1');
        const keys = await cache.keys();
        await Promise.all(keys.map((req) => cache.delete(req)));
        const allClients = await clients.matchAll({ includeUncontrolled: true });
        allClients.forEach((client) =>
            client.postMessage({ type: 'STUDENT_CACHE_INVALIDATED' })
        );
    }
});


// ── API Python — résultats IA (summary, quiz) ─────────────────
// Ces contenus sont immuables une fois générés → CacheFirst.
registerRoute(
    ({ url }) => url.pathname.match(/^\/api\/python\/(summary|quiz)\/[\w-]+/),
    new CacheFirst({
        cacheName: 'ai-results-v1',
        plugins: [
            new ExpirationPlugin({ maxAgeSeconds: 7 * 24 * 60 * 60, maxEntries: 200 }),
            new CacheableResponsePlugin({ statuses: [0, 200] }),
        ],
    })
);


// ── API Python — exercices & images ───────────────────────────
registerRoute(
    ({ url }) => url.pathname.match(/^\/api\/python\/(exercises|images)\/[\w-]+/),
    new CacheFirst({
        cacheName: 'ai-exercices-images-v1',
        plugins: [
            new ExpirationPlugin({ maxAgeSeconds: 7 * 24 * 60 * 60, maxEntries: 200 }),
            new CacheableResponsePlugin({ statuses: [0, 200] }),
        ],
    })
);


// ── API Podcasts Audio (Laravel ou Python) ────────────────────
// Couvre : /api/laravel/podcast/download/<id> ou /api/python/podcast/download/<id>
//          /api/laravel/podcast/stream/<id>
// + fichiers audio par extension (mp3, wav, ogg…)
// + request.destination === 'audio' (balise <audio> native)
// RangeRequestsPlugin gère les requêtes partielles (HTTP 206) pour le seeking.
registerRoute(
    ({ request, url }) =>
        url.pathname.match(/^\/api\/(laravel|python)\/podcast\/(download|stream)\/[\w-]+/) ||
        request.destination === 'audio' ||
        /\.(?:mp3|wav|ogg|m4a|aac)(\?.*)?$/i.test(url.pathname),
    new CacheFirst({
        cacheName: 'audio-podcasts-v1',
        plugins: [
            new RangeRequestsPlugin(),
            new CacheableResponsePlugin({ statuses: [0, 200, 206] }),
            new ExpirationPlugin({
                maxAgeSeconds: 7 * 24 * 60 * 60,
                maxEntries: 30,
                purgeOnQuotaError: true,
            }),
        ],
    })
);


// ── Push Notifications ────────────────────────────────────────
self.addEventListener('push', (event) => {
    if (!event.data) return;

    let data = {};
    try {
        data = event.data.json();
    } catch {
        data = { title: 'AcademiX', body: event.data.text() };
    }

    // Invalidation immédiate du cache si les notes ont changé
    if (data.invalidateCache === 'student') {
        event.waitUntil(
            caches.open('student-api-v1').then(async (cache) => {
                const keys = await cache.keys();
                await Promise.all(keys.map((req) => cache.delete(req)));
            })
        );
    }

    const title = data.title || 'AcademiX';
    const options = {
        body: data.body || 'Tu as une nouvelle notification',
        icon: data.icon || '/icons/icon-192x192.svg',
        badge: data.badge || '/icons/icon-72x72.svg',
        tag: data.tag || `academix-${Date.now()}`,
        renotify: true,
        data: { url: data.url || '/dashboard' },
        vibrate: [200, 100, 200],
    };

    event.waitUntil(self.registration.showNotification(title, options));
});


// ── Notification click ────────────────────────────────────────
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    const targetUrl = event.notification.data?.url || '/dashboard';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            for (const client of windowClients) {
                const clientUrl = new URL(client.url);
                if (clientUrl.origin === self.location.origin) {
                    client.focus();
                    return client.navigate(targetUrl);
                }
            }
            return clients.openWindow(targetUrl);
        })
    );
});