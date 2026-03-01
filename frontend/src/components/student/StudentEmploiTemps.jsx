import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { MapPin, Clock, User, BookOpen, CalendarDays } from "lucide-react";
import { cn } from "../../utils/cn";
import { studentService } from "../../services/studentService";

// ─── Constants ────────────────────────────────────────────────────────────────
const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

const TYPE_STYLES = {
  CM: {
    card: "border-l-4 border-blue-400 bg-blue-50/80 dark:bg-blue-500/10",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
    dot: "bg-blue-400",
    icon: "text-blue-500",
  },
  TD: {
    card: "border-l-4 border-emerald-400 bg-emerald-50/80 dark:bg-emerald-500/10",
    badge:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
    dot: "bg-emerald-400",
    icon: "text-emerald-500",
  },
  TP: {
    card: "border-l-4 border-violet-400 bg-violet-50/80 dark:bg-violet-500/10",
    badge:
      "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-300",
    dot: "bg-violet-400",
    icon: "text-violet-500",
  },
};

const DEFAULT_STYLE = {
  card: "border-l-4 border-slate-300 bg-slate-50 dark:bg-slate-800/50",
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
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
            {label}
          </p>
          <p className="text-3xl font-black italic tabular-nums text-slate-900 dark:text-white">
            {value ?? "—"}
          </p>
          {sub && (
            <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
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

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StudentEmploiTemps() {
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSemestre, setActiveSemestre] = useState("all");

  const today = useMemo(() => getTodayFR(), []);
  const nowMinutes = useMemo(() => {
    const now = new Date();
    return now.getHours() * 60 + now.getMinutes();
  }, []);

  useEffect(() => {
    const fetchEmploiTemps = async () => {
      try {
        const data = await studentService.getEmploiTemps();
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
      className="space-y-8 pb-20 max-w-7xl mx-auto"
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
                    {count > 0 && !isToday && (
                      <p className="text-[9px] font-black text-slate-300 dark:text-slate-700 mt-0.5">
                        {count} cours
                      </p>
                    )}
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

                return (
                  <div
                    key={day}
                    className={cn(
                      "divide-y divide-slate-200 dark:divide-slate-700 border-r last:border-r-0 border-slate-200 dark:border-slate-700 min-h-48",
                      isToday && "bg-emerald-50/30 dark:bg-emerald-500/5",
                    )}
                  >
                    {dayCours.length === 0 ? (
                      <div className="p-3 h-full flex items-center justify-center">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-200 dark:text-slate-800">
                          Libre
                        </span>
                      </div>
                    ) : (
                      dayCours.map((item) => {
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
                      })
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
