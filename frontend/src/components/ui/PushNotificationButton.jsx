import { Bell, BellOff, BellRing, Loader2 } from "lucide-react";
import { usePushNotifications } from "../../hooks/usePushNotifications";

export function PushNotificationButton({ className = "" }) {
  const {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    canSubscribe,
    error,
    subscribe,
    unsubscribe,
  } = usePushNotifications();

  /** Confirmation avant désabonnement */
  const handleClick = () => {
    if (isSubscribed) {
      if (
        window.confirm(
          "Désactiver les notifications push ? Tu ne recevras plus d'alertes.",
        )
      ) {
        unsubscribe();
      }
    } else {
      subscribe();
    }
  };

  if (!isSupported) return null;

  if (permission === "denied" && !isSubscribed) return null;

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {/* Bouton principal */}
      <button
        onClick={handleClick}
        disabled={isLoading}
        title={
          isSubscribed
            ? "Notifications activées — cliquer pour désactiver"
            : "Activer les notifications push"
        }
        className={[
          "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium",
          "transition-all duration-200 focus:outline-none focus:ring-2",
          isLoading ? "opacity-60 cursor-wait" : "cursor-pointer",
          isSubscribed
            ? "text-emerald-700 bg-emerald-50 hover:bg-emerald-100 focus:ring-emerald-300 dark:text-emerald-400 dark:bg-emerald-900/20 dark:hover:bg-emerald-900/30"
            : "text-violet-700 bg-violet-50 hover:bg-violet-100 focus:ring-violet-300 dark:text-violet-400 dark:bg-violet-900/20 dark:hover:bg-violet-900/30",
        ].join(" ")}
      >
        {/* Icône animée */}
        {isLoading ? (
          <Loader2 size={15} className="animate-spin" />
        ) : isSubscribed ? (
          <BellRing size={15} className="shrink-0" />
        ) : (
          <Bell size={15} className="shrink-0" />
        )}

        {/* Libellé */}
        <span>
          {isLoading
            ? "En cours…"
            : isSubscribed
              ? "Notifications activées"
              : "Activer les notifications"}
        </span>

        {/* Pastille verte quand abonné */}
        {isSubscribed && !isLoading && (
          <span
            className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"
            aria-hidden
          />
        )}
      </button>

      {/* Message d'erreur discret */}
      {error && (
        <p className="text-xs text-red-500 dark:text-red-400 px-1">{error}</p>
      )}

      {/* Aide quand permission denied */}
      {permission === "denied" && isSubscribed === false && (
        <p className="text-xs text-gray-400 px-1 flex items-center gap-1">
          <BellOff size={12} />
          Notifications bloquées — active-les dans les réglages du navigateur.
        </p>
      )}
    </div>
  );
}
