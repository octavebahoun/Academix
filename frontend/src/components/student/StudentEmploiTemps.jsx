import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Clock,
  User,
  BookOpen,
  CalendarDays,
  Calendar,
  RefreshCw,
  Plus,
  X,
  Flag,
  CheckCircle2,
  Trash2,
  AlarmClock,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { studentService } from "../../services/studentService";
import toast from "react-hot-toast";

// ─── Constants ────────────────────────────────────────────────────────────────
const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

const DAY_JS_MAP = [
  null,
  "Lundi",
  "Mardi",
  "Mercredi",
  "Jeudi",
  "Vendredi",
  "Samedi",
]; // 0=dim

const PRIORITE_STYLES = {
  haute: {
    badge: "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300",
    dot: "bg-red-400",
  },
  moyenne: {
    badge:
      "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
    dot: "bg-orange-400",
  },
  basse: {
    badge: "bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400",
    dot: "bg-slate-400",
  },
};

const STATUT_STYLES = {
  a_faire: "border-orange-400 bg-orange-50/80 dark:bg-orange-500/10",
  en_cours: "border-yellow-400 bg-yellow-50/80 dark:bg-yellow-500/10",
  terminee:
    "border-emerald-400 bg-emerald-50/80 dark:bg-emerald-500/10 opacity-70",
};

const TYPE_STYLES = {
  CM: {
    card: " border-blue-400 bg-blue-50/80 dark:bg-blue-500/10",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
    dot: "bg-blue-400",
    icon: "text-blue-500",
  },
  TD: {
    card: " border-emerald-400 bg-emerald-50/80 dark:bg-emerald-500/10",
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
    dot: "bg-emerald-400",
    icon: "text-emerald-500",
  },
  TP: {
    card: " border-violet-400 bg-violet-50/80 dark:bg-violet-500/10",
    badge:
      "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
    dot: "bg-violet-400",
    icon: "text-violet-500",
  },
};

const DEFAULT_STYLE = {
  card: " border-slate-300 bg-slate-50 dark:bg-slate-800/50",
  badge: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
  dot: "bg-slate-400",
  icon: "text-slate-400",
};

// ─── Animation Variants ───────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function getTodayFR() {
  const raw = new Date().toLocaleDateString("fr-FR", { weekday: "long" });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

function toMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.substring(0, 5).split(":").map(Number);
  return h * 60 + m;
}

/** Retourne le nom FR du jour de la semaine d'une date ISO (null si dimanche) */
function getDayFR(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  return DAY_JS_MAP[d.getDay()] ?? null;
}

/** Formate une date ISO en "jj/mm" */
function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Retourne la date locale ISO (YYYY-MM-DDThh:mm) pour un input datetime-local */
function toLocalDatetimeValue(date = new Date()) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, Icon, iconBg, iconColor, accentFrom }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
      <div
        className={cn(
          "absolute inset-0 bg-linear-to-br to-transparent opacity-0 group-hover:opacity-100 transition-opacity",
          accentFrom,
        )}
      />
      <div className="flex items-start justify-between gap-3 relative">
        <div>
          <p className="text-[10px] font-black text-slate-400 dark:text-white uppercase tracking-widest mb-2">
            {label}
          </p>
          <p className="text-3xl font-black italic tabular-nums text-slate-900 dark:text-white">
            {value ?? "—"}
          </p>
          {sub && (
            <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-white">
              {sub}
            </p>
          )}
        </div>
        <div
          className={cn(
            "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 mt-1",
            iconBg,
          )}
        >
          <Icon size={18} className={iconColor} />
        </div>
      </div>
    </div>
  );
}

// ─── Course Card ──────────────────────────────────────────────────────────────
function CourseCard({ item, isNow }) {
  const styles = TYPE_STYLES[item.type] || DEFAULT_STYLE;
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl p-3 shadow-sm transition-all hover:-translate-y-0.5 relative",
        styles.card,
        isNow && "ring-2 ring-emerald-400 ring-offset-1",
      )}
    >
      {isNow && (
        <span className="absolute -top-2 -right-1 text-[9px] font-black bg-emerald-500 text-white px-2 py-0.5 rounded-full uppercase tracking-wider shadow">
          En cours
        </span>
      )}

      {/* Heure + type */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1 text-[10px] font-black text-slate-500 dark:text-slate-400">
          <Clock size={10} />
          <span>
            {item.startTime}–{item.endTime}
          </span>
        </div>
        <span
          className={cn(
            "text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg",
            styles.badge,
          )}
        >
          {item.type}
        </span>
      </div>

      {/* Titre */}
      <p className="text-xs font-black uppercase tracking-tight text-slate-900 dark:text-white leading-tight mb-2">
        {item.title}
      </p>

      {/* Salle + Prof */}
      <div className="space-y-0.5">
        {item.location && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
            <MapPin size={9} />
            <span>{item.location}</span>
          </div>
        )}
        {item.prof && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
            <User size={9} />
            <span className="truncate">{item.prof}</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Task Card ────────────────────────────────────────────────────────────────
function TaskCard({ task, onComplete, onDelete }) {
  const prio = PRIORITE_STYLES[task.priorite] || PRIORITE_STYLES.basse;
  const statutBorder = STATUT_STYLES[task.statut] || STATUT_STYLES.a_faire;
  const done = task.statut === "terminee";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "rounded-2xl p-3 shadow-sm transition-all hover:-translate-y-0.5 relative group",
        statutBorder,
      )}
    >
      {/* Actions hover */}
      <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {!done && (
          <button
            onClick={() => onComplete(task.id)}
            title="Marquer terminée"
            className="w-5 h-5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center transition active:scale-90"
          >
            <CheckCircle2 size={11} />
          </button>
        )}
        <button
          onClick={() => onDelete(task.id)}
          title="Supprimer"
          className="w-5 h-5 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition active:scale-90"
        >
          <Trash2 size={10} />
        </button>
      </div>

      {/* Badge tâche + priorité */}
      <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
        <span className="text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md bg-orange-200 text-orange-800 dark:bg-orange-500/30 dark:text-orange-300">
          Tâche
        </span>
        <span
          className={cn(
            "text-[8px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-md",
            prio.badge,
          )}
        >
          <Flag size={7} className="inline mr-0.5" />
          {task.priorite}
        </span>
      </div>

      {/* Titre */}
      <p
        className={cn(
          "text-xs font-black uppercase tracking-tight leading-tight mb-1.5",
          done
            ? "line-through text-slate-400"
            : "text-slate-900 dark:text-white",
        )}
      >
        {task.titre}
      </p>

      {/* Échéance */}
      <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-slate-400">
        <AlarmClock size={9} />
        <span>{formatDate(task.date_limite)}</span>
      </div>
    </motion.div>
  );
}

// ─── Add Task Modal ───────────────────────────────────────────────────────────
function AddTaskModal({ isOpen, onClose, onCreated, defaultDay }) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [form, setForm] = useState({
    titre: "",
    description: "",
    date_limite: toLocalDatetimeValue(tomorrow),
    priorite: "moyenne",
  });
  const [saving, setSaving] = useState(false);

  // Réinitialise le formulaire à chaque ouverture
  useEffect(() => {
    if (isOpen) {
      const base = new Date();
      base.setDate(base.getDate() + 1);
      // Si un jour par défaut est fourni, on cible ce jour dans la semaine courante
      if (defaultDay) {
        const dayIdx = DAY_JS_MAP.indexOf(defaultDay);
        if (dayIdx > 0) {
          const now = new Date();
          const diff = dayIdx - now.getDay();
          base.setDate(now.getDate() + (diff >= 0 ? diff : diff + 7));
        }
      }
      base.setHours(23, 59, 0, 0);
      setForm({
        titre: "",
        description: "",
        date_limite: toLocalDatetimeValue(base),
        priorite: "moyenne",
      });
    }
  }, [isOpen, defaultDay]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const newTask = await studentService.createTache({
        titre: form.titre,
        description: form.description || undefined,
        date_limite: new Date(form.date_limite).toISOString(),
        priorite: form.priorite,
      });
      toast.success(
        "Tâche ajoutée ! 🗓 Synchronisée avec Google Tasks si connecté.",
      );
      onCreated(newTask);
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erreur lors de l'ajout.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 40, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-2xl w-full max-w-md border border-slate-100 dark:border-slate-800"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center">
                  <Plus size={16} className="text-orange-500" />
                </div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  Nouvelle tâche
                </h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Titre */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                  Titre *
                </label>
                <input
                  type="text"
                  value={form.titre}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, titre: e.target.value }))
                  }
                  required
                  maxLength={255}
                  placeholder="Ex : Réviser le chapitre 3"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm text-slate-900 dark:text-white placeholder-slate-400"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                  Description (optionnel)
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, description: e.target.value }))
                  }
                  rows={2}
                  placeholder="Détails supplémentaires…"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm text-slate-900 dark:text-white placeholder-slate-400 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Date limite */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                    Échéance *
                  </label>
                  <input
                    type="datetime-local"
                    value={form.date_limite}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, date_limite: e.target.value }))
                    }
                    required
                    className="w-full px-3 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm text-slate-900 dark:text-white"
                  />
                </div>

                {/* Priorité */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 block">
                    Priorité
                  </label>
                  <select
                    value={form.priorite}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, priorite: e.target.value }))
                    }
                    className="w-full px-3 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-400 text-sm text-slate-900 dark:text-white"
                  >
                    <option value="basse">🟢 Basse</option>
                    <option value="moyenne">🟡 Moyenne</option>
                    <option value="haute">🔴 Haute</option>
                  </select>
                </div>
              </div>

              {/* Info Google sync */}
              <p className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Calendar size={10} className="text-emerald-500 shrink-0" />
                Si Google Calendar est connecté, la tâche sera synchronisée
                automatiquement.
              </p>

              {/* Submit */}
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider py-4 rounded-2xl transition flex items-center justify-center gap-2 active:scale-95 shadow-md shadow-orange-500/20"
              >
                <Plus size={14} />
                {saving ? "Ajout en cours…" : "Ajouter la tâche"}
              </button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StudentEmploiTemps({ onNavigate }) {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSemestre, setActiveSemestre] = useState("all");

  // — Google Calendar ———————————————————————————————————
  const [googleStatus, setGoogleStatus] = useState(null);
  const [syncing, setSyncing] = useState(false);

  // — Tâches ————————————————————————————————————————————
  const [taches, setTaches] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [defaultDay, setDefaultDay] = useState(null);

  useEffect(() => {
    studentService
      .getGoogleStatus()
      .then(setGoogleStatus)
      .catch(() => setGoogleStatus(null));
  }, []);

  const handleGoogleSync = async () => {
    setSyncing(true);
    try {
      await studentService.syncGoogleCalendar();
      toast.success("Emploi du temps synchronisé avec Google Calendar !");
    } catch (err) {
      toast.error(
        err?.response?.data?.error || "Erreur lors de la synchronisation.",
      );
    } finally {
      setSyncing(false);
    }
  };

  const handleTaskCreated = (newTask) => {
    setTaches((prev) => [...prev, newTask]);
  };

  const handleCompleteTask = async (id) => {
    try {
      const updated = await studentService.completeTache(id);
      setTaches((prev) =>
        prev.map((t) =>
          t.id === id ? { ...t, ...updated, statut: "terminee" } : t,
        ),
      );
      toast.success("Tâche marquée comme terminée !");
    } catch {
      toast.error("Erreur lors de la mise à jour.");
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await studentService.deleteTache(id);
      setTaches((prev) => prev.filter((t) => t.id !== id));
      toast.success("Tâche supprimée.");
    } catch {
      toast.error("Erreur lors de la suppression.");
    }
  };

  const openAddModal = (day = null) => {
    setDefaultDay(day);
    setShowAddModal(true);
  };

  const today = useMemo(() => getTodayFR(), []);
  const nowMinutes = useMemo(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }, []);

  useEffect(() => {
    const fetchEmploiTemps = async () => {
      try {
        const [data, tachesData] = await Promise.all([
          studentService.getEmploiTemps(),
          studentService.getTaches(),
        ]);
        const list = Array.isArray(data) ? data : [];
        setSchedule(
          list.map((cours) => ({
            id: cours.id,
            day: cours.jour,
            startTime: (cours.heure_debut || "").substring(0, 5),
            endTime: (cours.heure_fin || "").substring(0, 5),
            title: cours.matiere?.nom || "Cours",
            code: cours.matiere?.code || null,
            location: cours.salle || null,
            type: cours.type_cours || null,
            prof: cours.enseignant || null,
            semestre: cours.semestre || null,
          })),
        );
        setTaches(Array.isArray(tachesData) ? tachesData : []);
      } catch (error) {
        console.error("Erreur chargement emploi du temps :", error);
      } finally {
        setLoading(false);
      }
    };
    fetchEmploiTemps();
  }, []);

  // ── Semestres disponibles ──────────────────────────────────────────────────
  const semestres = useMemo(
    () => [...new Set(schedule.map((c) => c.semestre).filter(Boolean))].sort(),
    [schedule],
  );

  // ── Schedule filtré ────────────────────────────────────────────────────────
  const filtered = useMemo(
    () =>
      activeSemestre === "all"
        ? schedule
        : schedule.filter((c) => c.semestre === activeSemestre),
    [schedule, activeSemestre],
  );

  // ── Stats ──────────────────────────────────────────────────────────────────
  const todayCours = filtered.filter((c) => c.day === today);
  const totalCours = filtered.length;
  const uniqueSubjects = new Set(filtered.map((c) => c.title)).size;

  // Prochain cours aujourd'hui (heure de fin > maintenant)
  const nextCours = todayCours
    .filter((c) => toMinutes(c.endTime) > nowMinutes)
    .sort((a, b) => toMinutes(a.startTime) - toMinutes(b.startTime))[0];

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="relative space-y-8 pb-24 max-w-7xl mx-auto"
    >
      {/* ── Stats Cards ───────────────────────────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <StatCard
          label="Cours Aujourd'hui"
          value={todayCours.length}
          sub={today}
          Icon={CalendarDays}
          iconBg="bg-sky-50 dark:bg-sky-500/10"
          iconColor="text-sky-500"
          accentFrom="from-sky-500/5"
        />
        <StatCard
          label="Total / Semaine"
          value={totalCours}
          sub={activeSemestre === "all" ? "Tous semestres" : activeSemestre}
          Icon={BookOpen}
          iconBg="bg-blue-50 dark:bg-blue-500/10"
          iconColor="text-blue-500"
          accentFrom="from-blue-500/5"
        />
        <StatCard
          label="Matières"
          value={uniqueSubjects}
          sub="Enseignements"
          Icon={BookOpen}
          iconBg="bg-violet-50 dark:bg-violet-500/10"
          iconColor="text-violet-500"
          accentFrom="from-violet-500/5"
        />
        <StatCard
          label="Prochain Cours"
          value={nextCours ? nextCours.startTime : "—"}
          sub={
            nextCours ? nextCours.title.substring(0, 16) : "Aucun aujourd'hui"
          }
          Icon={Clock}
          iconBg="bg-emerald-50 dark:bg-emerald-500/10"
          iconColor="text-emerald-500"
          accentFrom="from-emerald-500/5"
        />
      </motion.div>
      {/* ── Bandeau Google Calendar ─────────────────────────────── */}
      {googleStatus !== null && (
        <motion.div variants={itemVariants}>
          {googleStatus.connected ? (
            <div className="flex items-center justify-between px-5 py-3 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                <Calendar size={14} />
                <span className="text-xs font-black uppercase tracking-wider">
                  Google Calendar connecté
                </span>
              </div>
              <button
                onClick={handleGoogleSync}
                disabled={syncing}
                className="flex items-center gap-1.5 text-xs font-black text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 disabled:opacity-60 transition-colors"
              >
                <RefreshCw
                  size={12}
                  className={syncing ? "animate-spin" : ""}
                />
                {syncing ? "Sync…" : "Synchroniser"}
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between px-5 py-3 bg-amber-50 dark:bg-amber-500/10 rounded-2xl border border-amber-100 dark:border-amber-500/20">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                <Calendar size={14} />
                <span className="text-xs font-black uppercase tracking-wider">
                  Google Calendar non connecté
                </span>
              </div>
              {onNavigate && (
                <button
                  onClick={() => onNavigate("profil")}
                  className="text-xs font-black text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                >
                  Connecter →
                </button>
              )}
            </div>
          )}
        </motion.div>
      )}
      {/* ── Filtres Semestre + Légende ─────────────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="flex flex-wrap items-center gap-4 justify-between"
      >
        {/* Semestre pills */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Semestre :
          </span>
          {["all", ...semestres].map((s) => (
            <button
              key={s}
              onClick={() => setActiveSemestre(s)}
              className={cn(
                "px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider transition-all",
                activeSemestre === s
                  ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-emerald-300",
              )}
            >
              {s === "all" ? "Tous" : s}
            </button>
          ))}
        </div>

        {/* Légende */}
        <div className="flex items-center gap-4">
          {Object.entries(TYPE_STYLES).map(([type, styles]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className={cn("w-2.5 h-2.5 rounded-full", styles.dot)} />
              <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">
                {type}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Weekly Grid ───────────────────────────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        id="tour-schedule-grid"
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden"
      >
        <div className="overflow-x-auto">
          <div className="min-w-175">
            {/* Day headers */}
            <div className="grid grid-cols-6 border-b border-slate-200 dark:border-slate-700">
              {DAYS.map((day) => {
                const isToday = day === today;
                const count = filtered.filter((c) => c.day === day).length;
                const taskCount = taches.filter(
                  (t) => getDayFR(t.date_limite) === day,
                ).length;
                return (
                  <div
                    key={day}
                    className={cn(
                      "px-4 py-5 text-center border-r last:border-r-0 border-slate-200 dark:border-slate-700",
                      isToday && "bg-emerald-50/60 dark:bg-emerald-500/5",
                    )}
                  >
                    <p
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        isToday
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-slate-400",
                      )}
                    >
                      {day}
                    </p>
                    {isToday && (
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mx-auto mt-1" />
                    )}
                    <div className="flex items-center justify-center gap-1.5 mt-1">
                      {count > 0 && (
                        <span className="text-[9px] font-black text-slate-300 dark:text-slate-700">
                          {count} cours
                        </span>
                      )}
                      {taskCount > 0 && (
                        <span className="text-[9px] font-black text-orange-400">
                          {taskCount} tâche{taskCount > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Day columns */}
            <div className="grid grid-cols-6">
              {DAYS.map((day) => {
                const isToday = day === today;
                const dayCours = filtered
                  .filter((c) => c.day === day)
                  .sort(
                    (a, b) => toMinutes(a.startTime) - toMinutes(b.startTime),
                  );
                const dayTaches = taches.filter(
                  (t) => getDayFR(t.date_limite) === day,
                );

                return (
                  <div
                    key={day}
                    className={cn(
                      "border-r last:border-r-0 border-slate-200 dark:border-slate-700 min-h-48",
                      isToday && "bg-emerald-50/30 dark:bg-emerald-500/5",
                    )}
                  >
                    {/* Cours */}
                    {dayCours.length > 0 && (
                      <div className="divide-y divide-slate-200 dark:divide-slate-700">
                        {dayCours.map((item) => {
                          const startMin = toMinutes(item.startTime);
                          const endMin = toMinutes(item.endTime);
                          const isNow =
                            isToday &&
                            nowMinutes >= startMin &&
                            nowMinutes < endMin;
                          return (
                            <div key={item.id} className="p-3">
                              <CourseCard item={item} isNow={isNow} />
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Tâches */}
                    {dayTaches.length > 0 && (
                      <div
                        className={cn(
                          "divide-y divide-orange-100 dark:divide-orange-500/10",
                          dayCours.length > 0 &&
                            "border-t border-orange-200 dark:border-orange-500/20",
                        )}
                      >
                        {dayTaches.map((task) => (
                          <div key={`task-${task.id}`} className="p-3">
                            <TaskCard
                              task={task}
                              onComplete={handleCompleteTask}
                              onDelete={handleDeleteTask}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Vide */}
                    {dayCours.length === 0 && dayTaches.length === 0 && (
                      <div
                        className="p-3 h-full flex flex-col items-center justify-center gap-2 cursor-pointer group/empty"
                        onClick={() => openAddModal(day)}
                      >
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-200 dark:text-slate-800 group-hover/empty:text-slate-300 dark:group-hover/empty:text-slate-700 transition-colors">
                          Libre
                        </span>
                        <Plus
                          size={12}
                          className="text-slate-200 dark:text-slate-800 group-hover/empty:text-orange-400 transition-colors"
                        />
                      </div>
                    )}

                    {/* Bouton "+" en bas de colonne si elle n'est pas vide */}
                    {(dayCours.length > 0 || dayTaches.length > 0) && (
                      <div className="px-3 pb-2 pt-1">
                        <button
                          onClick={() => openAddModal(day)}
                          className="w-full flex items-center justify-center gap-1 py-1.5 rounded-xl text-[9px] font-black text-slate-300 dark:text-slate-700 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-500/10 transition-all uppercase tracking-wider"
                        >
                          <Plus size={10} /> Tâche
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── FAB : Ajouter une tâche ────────────────────────────────────────── */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.4, type: "spring", stiffness: 260, damping: 20 }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => openAddModal(null)}
        className="fixed bottom-8 right-8 z-40 w-14 h-14 bg-orange-500 hover:bg-orange-600 text-white rounded-full shadow-xl shadow-orange-500/40 flex items-center justify-center transition-colors"
        title="Ajouter une tâche"
      >
        <Plus size={22} strokeWidth={2.5} />
      </motion.button>

      {/* ── Modal ────────────────────────────────────────────────────────────── */}
      <AddTaskModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onCreated={handleTaskCreated}
        defaultDay={defaultDay}
      />
    </motion.div>
  );
}
