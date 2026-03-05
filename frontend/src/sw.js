import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import { CacheFirst, StaleWhileRevalidate, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { RangeRequestsPlugin } from 'workbox-range-requests';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

// ── Précache + nettoyage ───────────────────────────────────────
// Workbox injecte ici la liste des assets buildés (avec hash).
// Les scripts/styles/fonts sont donc DÉJÀ couverts ici → pas besoin
// d'une route CacheFirst séparée pour eux (évite le double cache).
precacheAndRoute(self.__WB_MANIFEST);
cleanupOutdatedCaches();


// ── 🔴 FIX 1 : Background Sync pour les requêtes POST offline ──
// Si l'utilisateur soumet un formulaire (quiz, profil…) sans connexion,
// la requête est mise en file d'attente et rejouée automatiquement
// dès que la connexion revient (via l'API Background Sync).
const bgSyncPlugin = new BackgroundSyncPlugin('post-queue', {
    maxRetentionTime: 24 * 60, // rejouer pendant 24h max
});

// On intercepte tous les POST vers notre API
registerRoute(
    ({ request }) => request.method === 'POST' && request.url.includes('/api/'),
    new NetworkFirst({
        cacheName: 'post-fallback',
        plugins: [
            bgSyncPlugin,
            new CacheableResponsePlugin({ statuses: [0, 200] }),
        ],
        networkTimeoutSeconds: 10,
    }),
    'POST'
);


// ── Navigation (SPA fallback) ──────────────────────────────────
// NetworkFirst : essaie le réseau, sinon sert la version en cache.
// index.html est précaché → l'app se charge toujours hors-ligne.
const navigationHandler = new NetworkFirst({
    cacheName: 'navigations-v1',
    plugins: [
        new CacheableResponsePlugin({ statuses: [0, 200] }),
    ],
});
registerRoute(new NavigationRoute(navigationHandler));


// ── 🔴 FIX 2 : Route CacheFirst scripts/styles SUPPRIMÉE ───────
// Ces fichiers sont déjà gérés par precacheAndRoute() ci-dessus.
// Les conserver ici créait un double cache avec comportements imprévisibles.
// (bloc supprimé volontairement)


// ── API étudiant (données personnelles) ───────────────────────
// On inclut désormais notes, emploi du temps, profil, tâches et alertes.
registerRoute(
    /\/api\/v1\/student\/(notes|emploi-temps|profil|moyennes|taches|alertes|analysis)/,
    new StaleWhileRevalidate({
        cacheName: 'student-api-v1',
        plugins: [
            new CacheableResponsePlugin({ statuses: [0, 200] }),
            new ExpirationPlugin({
                maxAgeSeconds: 7 * 24 * 60 * 60,
                maxEntries: 100
            }),
        ],
    })
);

// Écoute le message d'invalidation envoyé depuis l'app ou le push handler
self.addEventListener('message', async (event) => {
    if (event.data?.type === 'INVALIDATE_STUDENT_CACHE') {
        const cache = await caches.open('student-api-v1');
        const keys = await cache.keys();
        await Promise.all(keys.map((req) => cache.delete(req)));
        // Notifie tous les clients que le cache a été vidé
        const allClients = await clients.matchAll({ includeUncontrolled: true });
        allClients.forEach((client) =>
            client.postMessage({ type: 'STUDENT_CACHE_INVALIDATED' })
        );
    }
});


// ── Résultats IA (summary, quiz) ──────────────────────────────
// CacheFirst justifié : un résumé/quiz généré pour un doc donné ne change pas.
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


// ── Exercices & images ─────────────────────────────────────────
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


// ── 🟠 FIX 4 : Audio — Support Range Requests & CORS ──────────
// On utilise CacheFirst avec RangeRequestsPlugin pour permettre
// la lecture fluide (seek) hors-ligne, même sur iOS.
// On accepte les statuts 0 pour le support CORS (API externe).
registerRoute(
    ({ request }) =>
        request.destination === 'audio' ||
        /\.(?:mp3|wav|ogg|m4a|aac)(\?.*)?$/i.test(request.url),
    new CacheFirst({
        cacheName: 'audio-podcasts-v1',
        plugins: [
            new RangeRequestsPlugin(),
            new CacheableResponsePlugin({ statuses: [0, 200, 206] }),
            new ExpirationPlugin({
                maxAgeSeconds: 7 * 24 * 60 * 60,
                maxEntries: 30, // Limite le nombre de podcasts en cache
                purgeOnQuotaError: true // Nettoie auto si l'appareil est plein
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

    // 🔴 FIX 3 (suite) : si le push signale une mise à jour des notes,
    // on invalide immédiatement le cache student avant que l'app ne refetch.
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

        // 🟠 FIX 6 : Tag dynamique pour éviter que les notifs se remplacent
        // silencieusement. On utilise le tag fourni par le serveur si dispo,
        // sinon on génère un tag unique avec le timestamp.
        // renotify: true pour que le son/vibration se déclenche à chaque notif.
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