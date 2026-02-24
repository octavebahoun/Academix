import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlayCircle,
  Globe,
  Video,
  MapPin,
  Plus,
  ChevronDown,
  Filter,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { createSession, getSessions, joinSession } from "../../api/sessions";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";

const AUTH_USER = authService.getCurrentUser();
const CURRENT_USER = {
  id: AUTH_USER?.id || 1,
  nom: AUTH_USER?.nom || "Dupont",
  prenom: AUTH_USER?.prenom || "Jean",
  avatar_url:
    AUTH_USER?.avatar_url ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${AUTH_USER?.prenom || "Jean"}`,
};

const SUBJECT_MAP = {
  1: "Mathématiques",
  2: "Informatique",
  3: "Histoire",
  4: "Physique",
  5: "Littérature",
};

const FILTERS = [
  { id: "all", label: "Toutes les Sessions" },
  { id: "math", label: "Mathématiques" },
  { id: "cs", label: "Informatique" },
  { id: "history", label: "Histoire" },
];

const DATE_FILTERS = [
  { id: "today", label: "Aujourd'hui" },
  { id: "upcoming", label: "À venir" },
];

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
      nom: "Tao",
      prenom: "Marcus",
      avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus",
    },
    matiere: { id: 2, nom: "Informatique" },
  },
];

const isToday = (dateIso) => {
  if (!dateIso) return false;
  const date = new Date(dateIso);
  const now = new Date();
  return date.toDateString() === now.toDateString();
};

const isUpcoming = (dateIso) => {
  if (!dateIso) return false;
  return new Date(dateIso) > new Date();
};

const formatDateTime = (dateIso, duration) => {
  if (!dateIso) return "Date à définir";
  const start = new Date(dateIso);
  const end = new Date(start.getTime() + (duration || 90) * 60000);
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

export default function StudentSessions() {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [activeFilter, setActiveFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showDateFilter, setShowDateFilter] = useState(false);

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    const fetchSessions = async () => {
      setIsLoading(true);
      try {
        const response = await getSessions();
        if (
          response?.success &&
          Array.isArray(response.sessions) &&
          response.sessions.length > 0
        ) {
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
    navigate("/chat", { state: { session } });
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
          lieu: "Salle 402",
          lien_visio: "",
        });
      }
    } catch (error) {
      console.error("Erreur création session:", error);
    }
  };

  const getStyleForSubject = (subject) => {
    if (subject === "Mathématiques")
      return {
        colorTag: "text-emerald-600 bg-emerald-100",
        avatarColor: "bg-emerald-600 text-white",
      };
    if (subject === "Histoire")
      return {
        colorTag: "text-emerald-600 bg-emerald-100",
        avatarColor: "bg-emerald-500 text-white",
      };
    if (subject === "Informatique")
      return {
        colorTag: "text-purple-600 bg-purple-100",
        avatarColor: "bg-purple-500 text-white",
      };
    if (subject === "Physique")
      return {
        colorTag: "text-orange-600 bg-orange-100",
        avatarColor: "bg-orange-500 text-white",
      };
    if (subject === "Littérature")
      return {
        colorTag: "text-rose-600 bg-rose-100",
        avatarColor: "bg-rose-500 text-white",
      };
    return {
      colorTag: "text-slate-600 bg-slate-100",
      avatarColor: "bg-slate-600 text-white",
    };
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-20 max-w-7xl mx-auto"
    >
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap gap-2 items-center justify-between mb-8"
      >
        <div className="flex flex-wrap gap-2 items-center">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={cn(
                "px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition",
                activeFilter === filter.id
                  ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700",
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowDateFilter(!showDateFilter)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition",
              DATE_FILTERS.some((df) => df.id === activeFilter)
                ? "bg-emerald-600 text-white shadow-sm hover:bg-emerald-700"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700",
            )}
          >
            <Filter size={14} />
            {DATE_FILTERS.find((df) => df.id === activeFilter)?.label ||
              "Trier par Date"}
            <ChevronDown
              size={14}
              className={cn(
                "transition-transform",
                showDateFilter ? "rotate-180" : "",
              )}
            />
          </button>

          <AnimatePresence>
            {showDateFilter && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xl z-10 py-2"
              >
                {DATE_FILTERS.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => {
                      setActiveFilter(
                        activeFilter === filter.id ? "all" : filter.id,
                      );
                      setShowDateFilter(false);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-2 text-xs font-bold uppercase tracking-wider transition hover:bg-slate-50 dark:hover:bg-slate-800",
                      activeFilter === filter.id
                        ? "text-emerald-600"
                        : "text-slate-600 dark:text-slate-300",
                    )}
                  >
                    {filter.label}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading && (
          <div className="col-span-full rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 dark:text-slate-400">
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
            const { colorTag, avatarColor } = getStyleForSubject(subject);

            return (
              <motion.div
                key={session.id || session._id || Math.random()}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between h-full relative"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded",
                        colorTag,
                      )}
                    >
                      {subject}
                    </span>
                    <span
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded flex items-center gap-1",
                        isLive
                          ? "bg-rose-100 text-rose-600"
                          : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
                      )}
                    >
                      {isLive && (
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                      )}
                      {isLive ? "EN DIRECT" : "À VENIR"}
                    </span>
                  </div>

                  <h3 className="text-lg font-black font-display tracking-tight text-slate-900 dark:text-white mb-4 line-clamp-2 leading-tight">
                    {session.titre}
                  </h3>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <PlayCircle size={14} className="shrink-0" />
                      <span className="text-xs font-bold">
                        {formatDateTime(startDate, duration)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      {session.format === "visio" ? (
                        <Video size={14} className="shrink-0" />
                      ) : session.format === "chat" ? (
                        <Globe size={14} className="shrink-0" />
                      ) : (
                        <MapPin size={14} className="shrink-0" />
                      )}
                      <span className="text-xs font-bold line-clamp-1">
                        {session.lieu ||
                          session.lien_visio ||
                          "Salle virtuelle"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      {session.createur?.avatar_url ? (
                        <img
                          src={session.createur.avatar_url}
                          alt="Orga"
                          className="w-8 h-8 rounded-full object-cover"
                        />
                      ) : (
                        <div
                          className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
                            avatarColor,
                          )}
                        >
                          {session.createur?.prenom?.[0] || "O"}
                          {session.createur?.nom?.[0] || ""}
                        </div>
                      )}
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                          {session.createur?.prenom || "Organisateur"}{" "}
                          {session.createur?.nom || ""}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          {session.createur?.role === "professeur"
                            ? "Professeur"
                            : "Organisateur"}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {session.participants_actuels || 0}/
                        {session.max_participants || 10}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleJoin(session)}
                    className="w-full py-3.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm active:scale-95"
                  >
                    {isLive ? "Rejoindre la Session" : "S'inscrire"}
                  </button>
                </div>
              </motion.div>
            );
          })}

        {!isLoading && filteredSessions.length === 0 && (
          <div className="col-span-full rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 dark:text-slate-400">
            Aucune session trouvée.
          </div>
        )}

        {!isLoading && (
          <motion.div
            variants={itemVariants}
            initial="hidden"
            animate="visible"
            onClick={() => setShowCreate(true)}
            className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group min-h-[350px]"
          >
            <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-sm">
              <Plus size={28} />
            </div>
            <h3 className="text-base font-black font-display text-slate-900 dark:text-white mb-2">
              Organisez votre propre session
            </h3>
            <p className="text-sm text-slate-500 font-medium mb-8 max-w-xs">
              Vous ne trouvez pas ce que vous cherchez ? Créez une nouvelle
              session pour vos camarades de classe.
            </p>
            <button className="bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl hover:bg-emerald-700 transition-colors shadow-sm active:scale-95">
              Créer une Session
            </button>
          </motion.div>
        )}
      </div>

      <motion.div variants={itemVariants} className="flex justify-center mt-12">
        <button className="flex items-center gap-2 text-xs font-bold text-emerald-600 hover:text-emerald-700 transition-colors">
          Voir Plus de Sessions <ChevronDown size={14} />
        </button>
      </motion.div>

      {/* Modal Créer une Session */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl w-full max-w-lg border border-slate-100 dark:border-slate-800"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-display font-bold text-slate-900 dark:text-white">
                  Créer une session
                </h3>
                <button
                  onClick={() => setShowCreate(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <input
                  value={form.titre}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, titre: e.target.value }))
                  }
                  placeholder="Titre de la session"
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-900 dark:text-white placeholder-slate-400"
                />

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Description..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-900 dark:text-white placeholder-slate-400"
                ></textarea>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="datetime-local"
                    value={form.date_debut}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        date_debut: e.target.value,
                      }))
                    }
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-900 dark:text-white"
                  />
                  <input
                    type="number"
                    min="15"
                    value={form.duree_minutes}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        duree_minutes: Number(e.target.value),
                      }))
                    }
                    placeholder="Durée (min)"
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={form.matiere_id}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        matiere_id: Number(e.target.value),
                      }))
                    }
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-900 dark:text-white"
                  >
                    {Object.entries(SUBJECT_MAP).map(([id, nom]) => (
                      <option key={id} value={id}>
                        {nom}
                      </option>
                    ))}
                  </select>

                  <select
                    value={form.format}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, format: e.target.value }))
                    }
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-900 dark:text-white"
                  >
                    <option value="chat">Chat / Code En ligne</option>
                    <option value="visio">Visio Externe</option>
                    <option value="presentiel">Présentiel</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="number"
                    min="2"
                    value={form.max_participants}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        max_participants: Number(e.target.value),
                      }))
                    }
                    placeholder="Max participants"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-900 dark:text-white"
                  />
                  <input
                    type="text"
                    value={form.lieu}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, lieu: e.target.value }))
                    }
                    placeholder="Lieu / Salle"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-4 rounded-2xl transition-colors active:scale-95"
                >
                  Publier la Session
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
