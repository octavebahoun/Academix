import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Clock,
  Zap,
  BookOpen,
  Globe,
  Video,
  MapPin,
  Plus,
  Users,
  X,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { createSession, getSessions, joinSession } from "../../api/sessions";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";
import toast from "react-hot-toast";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const isToday = (dateIso) => {
  if (!dateIso) return false;
  return new Date(dateIso).toDateString() === new Date().toDateString();
};

const isLiveNow = (dateIso, duree = 90) => {
  if (!dateIso) return false;
  const start = new Date(dateIso);
  const end = new Date(start.getTime() + duree * 60000);
  const now = new Date();
  return now >= start && now < end;
};

const isUpcoming = (dateIso) => {
  if (!dateIso) return false;
  return new Date(dateIso) > new Date();
};

const formatDateTime = (dateIso, duree = 90) => {
  if (!dateIso) return "Date à définir";
  const start = new Date(dateIso);
  const end = new Date(start.getTime() + duree * 60000);
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
  return `${dayLabel} · ${startTime} – ${endTime}`;
};

// ─── Constants ───────────────────────────────────────────────────────────────

const FORMAT_STYLES = {
  chat: {
    Icon: Globe,
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    label: "En ligne",
  },
  visio: {
    Icon: Video,
    badge:
      "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
    label: "Visio",
  },
  presentiel: {
    Icon: MapPin,
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    label: "Présentiel",
  },
};

const DEFAULT_FORMAT = {
  Icon: Globe,
  badge: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
  label: "Session",
};

const SUBJECT_PALETTE = [
  "bg-sky-100 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
  "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
  "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
  "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
  "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
];

const BASE_FILTERS = [
  { id: "all", label: "Toutes" },
  { id: "today", label: "Aujourd'hui" },
  { id: "upcoming", label: "À venir" },
  { id: "live", label: "En direct" },
  { id: "mine", label: "Mes sessions" },
];

// ─── StatCard ────────────────────────────────────────────────────────────────

function StatCard({ icon: Icon, label, value, color, bg }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 flex items-center gap-4 shadow-sm"
    >
      <div
        className={cn(
          "w-11 h-11 rounded-xl flex items-center justify-center shrink-0",
          bg,
        )}
      >
        <Icon size={20} className={color} />
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
          {label}
        </p>
        <p className={cn("text-2xl font-black", color)}>{value}</p>
      </div>
    </motion.div>
  );
}

// ─── SessionCard ─────────────────────────────────────────────────────────────

function SessionCard({ session, onJoin, subjectColor }) {
  const fmt = FORMAT_STYLES[session.format] || DEFAULT_FORMAT;
  const live = isLiveNow(session.date_debut, session.duree_minutes);
  const today = isToday(session.date_debut);
  const upcoming = isUpcoming(session.date_debut);
  const subject = session.matiere?.nom || "Session";
  const pct = session.max_participants
    ? Math.min(
        Math.round(
          ((session.participants_actuels || 0) / session.max_participants) *
            100,
        ),
        100,
      )
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      layout
      className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full"
    >
      {/* Badges top */}
      <div className="flex items-center justify-between mb-4">
        <span
          className={cn(
            "text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg",
            subjectColor,
          )}
        >
          {subject}
        </span>
        {live ? (
          <span className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-rose-100 text-rose-600 dark:bg-rose-500/10 dark:text-rose-400">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
            En direct
          </span>
        ) : today ? (
          <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-sky-100 text-sky-600 dark:bg-sky-500/10 dark:text-sky-400">
            Aujourd'hui
          </span>
        ) : upcoming ? (
          <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            À venir
          </span>
        ) : null}
      </div>

      {/* Title */}
      <h3 className="text-base font-black tracking-tight text-slate-900 dark:text-white mb-4 line-clamp-2 leading-tight grow">
        {session.titre}
      </h3>

      {/* Meta */}
      <div className="space-y-2 mb-5">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <Calendar size={13} className="shrink-0" />
          <span className="text-xs font-bold">
            {formatDateTime(session.date_debut, session.duree_minutes)}
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <fmt.Icon size={13} className="shrink-0" />
          <span className="text-xs font-bold truncate">
            {session.lieu || session.lien_visio || fmt.label}
          </span>
        </div>
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <Clock size={13} className="shrink-0" />
          <span className="text-xs font-bold">
            {session.duree_minutes || 90} min
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-5">
        <div className="flex justify-between text-[10px] font-bold text-slate-400 mb-1.5">
          <span className="flex items-center gap-1">
            <Users size={10} />
            Participants
          </span>
          <span>
            {session.participants_actuels || 0} /{" "}
            {session.max_participants || "∞"}
          </span>
        </div>
        <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className={cn(
              "h-full rounded-full",
              pct >= 90
                ? "bg-rose-500"
                : pct >= 60
                  ? "bg-amber-500"
                  : "bg-emerald-500",
            )}
          />
        </div>
      </div>

      {/* Creator */}
      <div className="flex items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mb-4">
        {session.createur?.avatar_url ? (
          <img
            src={session.createur.avatar_url}
            alt=""
            className="w-7 h-7 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-[10px] font-black text-slate-600 dark:text-slate-300 shrink-0">
            {session.createur?.prenom?.[0] || "?"}
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
            {session.createur?.prenom || ""}{" "}
            {session.createur?.nom || "Organisateur"}
          </p>
          <p className="text-[10px] text-slate-400">
            {session.createur?.role === "professeur"
              ? "Professeur"
              : "Étudiant"}
          </p>
        </div>
      </div>

      {/* CTA */}
      <button
        onClick={() => onJoin(session)}
        className={cn(
          "w-full py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all active:scale-95",
          live
            ? "bg-rose-500 hover:bg-rose-600 text-white shadow-sm"
            : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm",
        )}
      >
        {live ? "Rejoindre maintenant" : "S'inscrire"}
      </button>
    </motion.div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────

export default function StudentSessions() {
  const navigate = useNavigate();
  const authUser = authService.getCurrentUser();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);

  const [form, setForm] = useState({
    titre: "",
    description: "",
    date_debut: "",
    duree_minutes: 90,
    format: "chat",
    max_participants: 10,
    matiere_nom: "",
    lieu: "",
    lien_visio: "",
  });

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const res = await getSessions();
        setSessions(
          res?.success && Array.isArray(res.sessions) ? res.sessions : [],
        );
      } catch {
        setSessions([]);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  // ── Computed ───────────────────────────────────────────────────────────────
  const stats = useMemo(
    () => ({
      todayCount: sessions.filter((s) => isToday(s.date_debut)).length,
      upcomingCount: sessions.filter((s) => isUpcoming(s.date_debut)).length,
      liveCount: sessions.filter((s) =>
        isLiveNow(s.date_debut, s.duree_minutes),
      ).length,
      myCount: sessions.filter((s) => s.createur?.id === authUser?.id).length,
    }),
    [sessions, authUser],
  );

  const subjects = useMemo(() => {
    const set = new Set(sessions.map((s) => s.matiere?.nom).filter(Boolean));
    return [...set];
  }, [sessions]);

  const subjectColorMap = useMemo(() => {
    const map = {};
    subjects.forEach((sub, i) => {
      map[sub] = SUBJECT_PALETTE[i % SUBJECT_PALETTE.length];
    });
    return map;
  }, [subjects]);

  const filtered = useMemo(() => {
    switch (activeFilter) {
      case "today":
        return sessions.filter((s) => isToday(s.date_debut));
      case "upcoming":
        return sessions.filter((s) => isUpcoming(s.date_debut));
      case "live":
        return sessions.filter((s) => isLiveNow(s.date_debut, s.duree_minutes));
      case "mine":
        return sessions.filter((s) => s.createur?.id === authUser?.id);
      default:
        if (subjects.includes(activeFilter)) {
          return sessions.filter((s) => s.matiere?.nom === activeFilter);
        }
        return sessions;
    }
  }, [sessions, activeFilter, subjects, authUser]);

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleJoin = async (session) => {
    try {
      await joinSession(session.id || session._id);
    } catch {
      // navigate anyway
    }
    navigate("/chat", { state: { session } });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await createSession(form);
      if (res?.success && res.session) {
        setSessions((prev) => [res.session, ...prev]);
        toast.success("Session créée !");
        setShowCreate(false);
        setForm({
          titre: "",
          description: "",
          date_debut: "",
          duree_minutes: 90,
          format: "chat",
          max_participants: 10,
          matiere_nom: "",
          lieu: "",
          lien_visio: "",
        });
      } else {
        toast.error("Erreur lors de la création.");
      }
    } catch {
      toast.error("Erreur lors de la création.");
    } finally {
      setCreating(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 pb-20 max-w-7xl mx-auto"
    >
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Calendar}
          label="Aujourd'hui"
          value={stats.todayCount}
          color="text-sky-500"
          bg="bg-sky-50 dark:bg-sky-500/10"
        />
        <StatCard
          icon={Clock}
          label="À venir"
          value={stats.upcomingCount}
          color="text-blue-500"
          bg="bg-blue-50 dark:bg-blue-500/10"
        />
        <StatCard
          icon={Zap}
          label="En direct"
          value={stats.liveCount}
          color="text-rose-500"
          bg="bg-rose-50 dark:bg-rose-500/10"
        />
        <StatCard
          icon={BookOpen}
          label="Mes sessions"
          value={stats.myCount}
          color="text-violet-500"
          bg="bg-violet-50 dark:bg-violet-500/10"
        />
      </div>

      {/* Filters + Créer */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {BASE_FILTERS.map((f) => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition",
                activeFilter === f.id
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700",
              )}
            >
              {f.label}
            </button>
          ))}
          {subjects.map((sub) => (
            <button
              key={sub}
              onClick={() => setActiveFilter(sub)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition",
                activeFilter === sub
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700",
              )}
            >
              {sub}
            </button>
          ))}
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider transition shadow-sm active:scale-95"
        >
          <Plus size={14} />
          Créer une session
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-slate-100 dark:bg-slate-800 rounded-3xl h-72 animate-pulse"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((session) => (
              <SessionCard
                key={session.id || session._id}
                session={session}
                onJoin={handleJoin}
                subjectColor={
                  subjectColorMap[session.matiere?.nom] ||
                  "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                }
              />
            ))}
          </AnimatePresence>

          {filtered.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full rounded-3xl border border-dashed border-slate-200 dark:border-slate-700 p-12 text-center"
            >
              <p className="text-sm font-bold text-slate-400">
                Aucune session disponible.
              </p>
            </motion.div>
          )}

          {/* Card "Créer" */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={() => setShowCreate(true)}
            className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group min-h-72"
          >
            <div className="w-14 h-14 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
              <Plus size={26} />
            </div>
            <p className="text-sm font-black text-slate-900 dark:text-white mb-1">
              Nouvelle session
            </p>
            <p className="text-xs text-slate-400 font-medium">
              Créez une session pour vos camarades
            </p>
          </motion.div>
        </div>
      )}

      {/* ── Modal Créer ── */}
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
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl w-full max-w-lg border border-slate-100 dark:border-slate-800 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Créer une session
                </h3>
                <button
                  onClick={() => setShowCreate(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleCreate} className="space-y-4">
                <input
                  value={form.titre}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, titre: e.target.value }))
                  }
                  placeholder="Titre de la session"
                  required
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-900 dark:text-white placeholder-slate-400"
                />

                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  placeholder="Description (optionnelle)…"
                  rows={3}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-900 dark:text-white placeholder-slate-400 resize-none"
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                      Date et heure
                    </label>
                    <input
                      type="datetime-local"
                      value={form.date_debut}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, date_debut: e.target.value }))
                      }
                      required
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                      Durée (min)
                    </label>
                    <input
                      type="number"
                      min="15"
                      value={form.duree_minutes}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          duree_minutes: Number(e.target.value),
                        }))
                      }
                      required
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                      Matière
                    </label>
                    <input
                      value={form.matiere_nom}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, matiere_nom: e.target.value }))
                      }
                      placeholder="Ex : Mathématiques"
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-900 dark:text-white placeholder-slate-400"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                      Format
                    </label>
                    <select
                      value={form.format}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, format: e.target.value }))
                      }
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-900 dark:text-white"
                    >
                      <option value="chat">Chat / En ligne</option>
                      <option value="visio">Visio</option>
                      <option value="presentiel">Présentiel</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                      Max participants
                    </label>
                    <input
                      type="number"
                      min="2"
                      value={form.max_participants}
                      onChange={(e) =>
                        setForm((p) => ({
                          ...p,
                          max_participants: Number(e.target.value),
                        }))
                      }
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                      Lieu / Lien
                    </label>
                    <input
                      value={
                        form.format === "visio" ? form.lien_visio : form.lieu
                      }
                      onChange={(e) =>
                        setForm((p) =>
                          form.format === "visio"
                            ? { ...p, lien_visio: e.target.value }
                            : { ...p, lieu: e.target.value },
                        )
                      }
                      placeholder={
                        form.format === "visio"
                          ? "Lien de la réunion"
                          : "Salle / lieu"
                      }
                      className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-900 dark:text-white placeholder-slate-400"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={creating}
                  className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider py-4 rounded-2xl transition active:scale-95"
                >
                  {creating ? "Publication en cours…" : "Publier la Session"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
