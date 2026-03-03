

import { laravelApiClient } from '../api/client';

// ── Clé publique VAPID
// Injectée via Vite à partir de la variable d'environnement.
// Elle doit correspondre exactement à VAPID_PUBLIC_KEY dans le .env Laravel.
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;


function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
}


async function getSWRegistration() {
    if (!('serviceWorker' in navigator)) return null;
    try {
        return await navigator.serviceWorker.ready;
    } catch {
        return null;
    }
}


export const pushNotificationService = {
    isSupported() {
        return (
            'serviceWorker' in navigator &&
            'PushManager' in window &&
            'Notification' in window
        );
    },


    getPermissionState() {
        if (!('Notification' in window)) return 'denied';
        return Notification.permission;
    },

    async requestPermission() {
        if (!this.isSupported()) return 'denied';
        return Notification.requestPermission();
    },


    async subscribe() {
        if (!this.isSupported()) {
            return { success: false, error: 'Push non supporté par ce navigateur' };
        }

        if (!VAPID_PUBLIC_KEY) {
            console.error('[Push] VITE_VAPID_PUBLIC_KEY manquante dans .env');
            return { success: false, error: 'Clé VAPID manquante' };
        }

        const registration = await getSWRegistration();
        if (!registration) {
            return { success: false, error: 'Service Worker non disponible' };
        }

        const existing = await registration.pushManager.getSubscription();
        if (existing) {
            // On renvoie quand même au serveur pour être sûr qu'il a bien l'entrée
            try {
                await this.sendSubscriptionToServer(existing);
            } catch (err) {
                console.warn('[Push] Impossible de synchroniser l\'abonnement existant :', err);
            }
            return { success: true, alreadySubscribed: true };
        }

        try {
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
            });

            await this.sendSubscriptionToServer(subscription);
            return { success: true };
        } catch (err) {
            console.error('[Push] Échec de l\'abonnement :', err);
            if (Notification.permission === 'denied') {
                return { success: false, error: 'Notifications bloquées par l\'utilisateur' };
            }
            return { success: false, error: err.message || 'Échec de l\'abonnement push' };
        }
    },


    async sendSubscriptionToServer(subscription) {
        await laravelApiClient.post('/push/subscribe', subscription.toJSON());
    },

    async unsubscribe() {
        const registration = await getSWRegistration();
        if (!registration) return false;

        const subscription = await registration.pushManager.getSubscription();
        if (!subscription) return true;

        try {
            await laravelApiClient.delete('/push/subscribe', {
                data: { endpoint: subscription.endpoint },
            });
        } catch {
            // On continue même si le serveur échoue
        }

        return subscription.unsubscribe();
    },
};
