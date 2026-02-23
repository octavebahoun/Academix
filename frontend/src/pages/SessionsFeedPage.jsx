import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { createSession, getSessions, joinSession } from "../api/sessions";
import {
  getNotifications,
  getNotificationUnreadCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../api/notifications";

import { authService } from "../services/authService";

const AUTH_USER = authService.getCurrentUser();
const CURRENT_USER = {
  id: AUTH_USER?.id || 1,
  nom: AUTH_USER?.nom || "Dupont",
  prenom: AUTH_USER?.prenom || "Jean",
  avatar_url:
    AUTH_USER?.avatar_url ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${AUTH_USER?.prenom || "Jean"}`,
};

const FILTERS = [
  { id: "all", label: "Toutes" },
  { id: "math", label: "Mathématiques" },
  { id: "cs", label: "Informatique" },
  { id: "history", label: "Histoire" },
  { id: "today", label: "Aujourd'hui" },
  { id: "upcoming", label: "À venir" },
];

const SUBJECT_MAP = {
  1: "Mathématiques",
  2: "Informatique",
  3: "Histoire",
  4: "Physique",
  5: "Littérature",
};

const FALLBACK_SESSIONS = [
  {
    id: "demo-1",
    titre: "Calcul III : Intégrales multiples",
    description: "Révision guidée pour l'examen final.",
    date_debut: new Date(Date.now() + 1000 * 60 * 30).toISOString(),
    duree_minutes: 120,
    format: "chat",
    max_participants: 10,
    participants_actuels: 6,
    createur: {
      id: 2,
      nom: "Miller",
      prenom: "Sarah",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    },
    matiere: { id: 1, nom: "Mathématiques" },
  },
  {
    id: "demo-2",
    titre: "Révolution industrielle : analyse critique",
    description: "Discussion structurée en petits groupes.",
    date_debut: new Date(Date.now() + 1000 * 60 * 60 * 4).toISOString(),
    duree_minutes: 90,
    format: "visio",
    max_participants: 8,
    participants_actuels: 5,
    createur: {
      id: 3,
      nom: "Chen",
      prenom: "David",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
    },
    matiere: { id: 3, nom: "Histoire" },
  },
  {
    id: "demo-3",
    titre: "Mécanique quantique : série d'exercices #4",
    description: "Résolution collective des exercices avancés.",
    date_debut: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString(),
    duree_minutes: 75,
    format: "presentiel",
    max_participants: 12,
    participants_actuels: 3,
    createur: {
      id: 4,
      nom: "Rodriguez",
      prenom: "Elena",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Elena",
    },
    matiere: { id: 4, nom: "Physique" },
  },
  {
    id: "demo-4",
    titre: "Structures de données : Hash Map Lab",
    description: "Atelier en live avec code partagé.",
    date_debut: new Date(Date.now() + 1000 * 60 * 60 * 24 * 3).toISOString(),
    duree_minutes: 120,
    format: "chat",
    max_participants: 15,
    participants_actuels: 9,
    createur: {
      id: 5,
      nom: "Tso",
      prenom: "Marcus",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
    },
    matiere: { id: 2, nom: "Informatique" },
  },
  {
    id: "demo-5",
    titre: "Poésie moderne : lire " + '"The Waste Land"',
    description: "Analyse guidée et échanges libres.",
    date_debut: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString(),
    duree_minutes: 60,
    format: "presentiel",
    max_participants: 10,
    participants_actuels: 4,
    createur: {
      id: 6,
      nom: "Banks",
      prenom: "Chloe",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Chloe",
    },
    matiere: { id: 5, nom: "Littérature" },
  },
];

const formatDateTime = (dateIso, duration) => {
  const start = new Date(dateIso);
  const end = new Date(start.getTime() + duration * 60000);
  const dayLabel = start.toLocaleDateString("fr-FR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const startTime = start.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const endTime = end.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${dayLabel} · ${startTime} - ${endTime}`;
};

const isToday = (dateIso) => {
  const date = new Date(dateIso);
  const now = new Date();
  return date.toDateString() === now.toDateString();
};

const isUpcoming = (dateIso) => new Date(dateIso) > new Date();

const SessionsFeedPage = ({ onJoinSession }) => {
  const [sessions, setSessions] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notificationUnreadCount, setNotificationUnreadCount] = useState(0);
  const [form, setForm] = useState({
    titre: "",
    description: "",
    date_debut: "",
    duree_minutes: 90,
    format: "chat",
    max_participants: 10,
    matiere_id: 1,
    matiere_nom: SUBJECT_MAP[1],
    lieu: "Salle collaborative 402",
    lien_visio: "",
  });

  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true);
      try {
        const response = await getSessions();
        if (response?.success && Array.isArray(response.sessions)) {
          setSessions(response.sessions);
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error("Erreur chargement sessions:", error);
      }
      setSessions(FALLBACK_SESSIONS);
      setIsLoading(false);
    };

    fetchSessions();
  }, []);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        const [listResponse, unreadResponse] = await Promise.all([
          getNotifications({ limit: 12 }),
          getNotificationUnreadCount(),
        ]);
        if (listResponse?.success) {
          setNotifications((listResponse.notifications || []).slice(0, 12));
        }
        if (unreadResponse?.success) {
          setNotificationUnreadCount(unreadResponse.unreadCount || 0);
        }
      } catch (error) {
        console.error("Erreur chargement notifications:", error);
      }
    };

    loadNotifications();
  }, []);

  const handleMarkNotificationRead = async (id) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === id
            ? { ...notification, is_read: true }
            : notification,
        ),
      );
      setNotificationUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Erreur lecture notification:", error);
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, is_read: true })),
      );
      setNotificationUnreadCount(0);
    } catch (error) {
      console.error("Erreur lecture globale notifications:", error);
    }
  };

  const filteredSessions = useMemo(() => {
    if (activeFilter === "all") return sessions;

    if (activeFilter === "today") {
      return sessions.filter((session) => isToday(session.date_debut));
    }

    if (activeFilter === "upcoming") {
      return sessions.filter((session) => isUpcoming(session.date_debut));
    }

    return sessions.filter((session) => {
      const label =
        session.matiere?.nom || SUBJECT_MAP[session.matiere?.id] || "";
      if (activeFilter === "math") return label === "Mathématiques";
      if (activeFilter === "cs") return label === "Informatique";
      if (activeFilter === "history") return label === "Histoire";
      return true;
    });
  }, [sessions, activeFilter]);

  const handleJoin = async (session) => {
    try {
      const sessionKey = session.id || session._id;
      if (!String(sessionKey).startsWith("demo-")) {
        await joinSession(sessionKey);
      }
    } catch (error) {
      console.error("Erreur join session:", error);
    }
    onJoinSession(session);
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    try {
      const payload = {
        ...form,
        matiere_nom: SUBJECT_MAP[form.matiere_id],
      };
      const response = await createSession(payload);
      if (response?.success && response.session) {
        setSessions((prev) => [response.session, ...prev]);
        setShowCreate(false);
        setForm({
          titre: "",
          description: "",
          date_debut: "",
          duree_minutes: 90,
          format: "chat",
          max_participants: 10,
          matiere_id: 1,
          matiere_nom: SUBJECT_MAP[1],
          lieu: "Salle collaborative 402",
          lien_visio: "",
        });
      }
    } catch (error) {
      console.error("Erreur création session:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white">
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M4 6h16" />
                <path d="M6 6l6-3 6 3" />
                <path d="M6 6v12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V6" />
              </svg>
            </div>
            <div>
              <p className="font-display text-lg font-semibold">EduTrack</p>
              <p className="text-xs text-slate-500">Sessions collaboratives</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen((prev) => !prev)}
                className="relative rounded-full border border-slate-200 bg-white p-2 text-slate-600 transition hover:border-blue-200 hover:text-blue-600"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
                  <path d="M9 17a3 3 0 0 0 6 0" />
                </svg>
                {notificationUnreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                    {notificationUnreadCount > 99
                      ? "99+"
                      : notificationUnreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 top-12 z-20 w-80 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-800">
                      Notifications
                    </p>
                    <button
                      onClick={handleMarkAllNotificationsRead}
                      className="text-xs font-semibold text-blue-600"
                    >
                      Tout lire
                    </button>
                  </div>
                  <div className="max-h-72 space-y-2 overflow-y-auto">
                    {notifications.length === 0 && (
                      <p className="rounded-xl bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
                        Aucune notification
                      </p>
                    )}
                    {notifications.map((notification) => (
                      <button
                        key={notification._id}
                        onClick={() =>
                          handleMarkNotificationRead(notification._id)
                        }
                        className={`w-full rounded-xl px-3 py-2 text-left transition ${
                          notification.is_read ? "bg-slate-50" : "bg-blue-50"
                        }`}
                      >
                        <p className="text-xs font-semibold text-slate-800">
                          {notification.titre}
                        </p>
                        <p className="mt-1 text-xs text-slate-600">
                          {notification.message}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-blue-200"
            >
              <span className="text-base">+</span>
              Créer une session
            </button>
            <img
              src={CURRENT_USER.avatar_url}
              alt="Profil"
              className="h-10 w-10 rounded-full border border-white"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-20 pt-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-semibold text-slate-900">
              Sessions collaboratives
            </h1>
            <p className="mt-2 text-slate-500">
              Rejoins un groupe et avance sur tes cours ensemble.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                activeFilter === filter.id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-blue-200 hover:text-blue-600"
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {isLoading && (
            <div className="col-span-full rounded-3xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-slate-500">
              Chargement des sessions...
            </div>
          )}

          {!isLoading &&
            filteredSessions.map((session) => {
              const startDate = session.date_debut;
              const duration = session.duree_minutes || 90;
              const subject =
                session.matiere?.nom ||
                SUBJECT_MAP[session.matiere?.id] ||
                "Session";
              const isLive =
                isToday(startDate) && new Date(startDate) <= new Date();
              const ctaLabel = isLive ? "Rejoindre la session" : "Réserver";
              return (
                <motion.article
                  key={session.id || session._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex h-full flex-col rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                      {subject}
                    </span>
                    {isLive && (
                      <span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-semibold text-rose-600">
                        • EN DIRECT
                      </span>
                    )}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">
                    {session.titre}
                  </h3>
                  <p className="mt-2 text-sm text-slate-500">
                    {session.description || "Session de révision collaborative"}
                  </p>
                  <div className="mt-4 space-y-2 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500">📅</span>
                      {formatDateTime(startDate, duration)}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-500">📍</span>
                      {session.lieu || session.lien_visio || "Salle virtuelle"}
                    </div>
                  </div>
                  <div className="mt-5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          session.createur?.avatar_url ||
                          CURRENT_USER.avatar_url
                        }
                        alt="Organisateur"
                        className="h-9 w-9 rounded-full"
                      />
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          {session.createur?.prenom || "Organisateur"}{" "}
                          {session.createur?.nom || ""}
                        </p>
                        <p className="text-xs text-slate-400">Organisateur</p>
                      </div>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                      {session.participants_actuels || 0}/
                      {session.max_participants || 10}
                    </span>
                  </div>
                  <button
                    onClick={() => handleJoin(session)}
                    className="mt-6 rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-500"
                  >
                    {ctaLabel}
                  </button>
                </motion.article>
              );
            })}

          <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-blue-200 bg-blue-50/60 p-6 text-center text-slate-600"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-2xl text-blue-600">
              +
            </div>
            <h3 className="mt-4 text-base font-semibold text-slate-800">
              Tu veux créer ta session ?
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Lance une nouvelle session de révision pour ton groupe.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="mt-4 text-sm font-semibold text-blue-600"
            >
              Créer une session maintenant
            </button>
          </motion.article>
        </div>

        <div className="mt-10 flex justify-center">
          <button className="rounded-full border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600">
            Voir plus de sessions
          </button>
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-white/70">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-display text-base font-semibold text-blue-600">
              EduTrack
            </span>
            <span>© 2026</span>
          </div>
          <div className="flex flex-wrap gap-4">
            <span>Guides</span>
            <span>Sécurité</span>
            <span>Centre d'aide</span>
            <span>Confidentialité</span>
          </div>
        </div>
      </footer>

      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <motion.form
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onSubmit={handleCreate}
            className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">
                Créer une session
              </h3>
              <button
                type="button"
                onClick={() => setShowCreate(false)}
                className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 space-y-4">
              <input
                value={form.titre}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, titre: e.target.value }))
                }
                placeholder="Titre de la session"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="Description"
                rows={3}
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
              <input
                type="datetime-local"
                value={form.date_debut}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, date_debut: e.target.value }))
                }
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                required
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <input
                  type="number"
                  min="30"
                  value={form.duree_minutes}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      duree_minutes: e.target.value,
                    }))
                  }
                  placeholder="Durée (min)"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
                <input
                  type="number"
                  min="2"
                  value={form.max_participants}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      max_participants: e.target.value,
                    }))
                  }
                  placeholder="Participants max"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <select
                  value={form.format}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, format: e.target.value }))
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  <option value="chat">Chat</option>
                  <option value="visio">Visio</option>
                  <option value="presentiel">Présentiel</option>
                </select>
                <select
                  value={form.matiere_id}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      matiere_id: Number(e.target.value),
                      matiere_nom: SUBJECT_MAP[Number(e.target.value)],
                    }))
                  }
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
                >
                  {Object.entries(SUBJECT_MAP).map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
              <input
                value={form.lieu}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, lieu: e.target.value }))
                }
                placeholder="Lieu / Salle"
                className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>
            <button
              type="submit"
              className="mt-6 w-full rounded-2xl bg-blue-600 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200"
            >
              Publier la session
            </button>
          </motion.form>
        </div>
      )}
    </div>
  );
};

export default SessionsFeedPage;
