import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  Trophy,
  Clock,
  Medal,
  AlertTriangle,
  ChevronRight,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { studentService } from "../../services/studentService";
import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { Separator } from "../ui/separator";

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

// ─── Decorative SVGs ──────────────────────────────────────────────────────────
function ConcentricRingsSVG() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      className="absolute -right-2 -bottom-2 w-24 h-24 pointer-events-none text-slate-300 dark:text-slate-600"
    >
      <circle
        cx="85"
        cy="85"
        r="65"
        fill="none"
        stroke="currentColor"
        strokeWidth="10"
      />
      <circle
        cx="85"
        cy="85"
        r="45"
        fill="none"
        stroke="currentColor"
        strokeWidth="10"
      />
      <circle
        cx="85"
        cy="85"
        r="25"
        fill="none"
        stroke="currentColor"
        strokeWidth="10"
      />
    </svg>
  );
}

function RadialLinesSVG() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      className="absolute -right-2 -bottom-2 w-24 h-24 pointer-events-none text-slate-300 dark:text-slate-600"
    >
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i * Math.PI * 2) / 8;
        return (
          <line
            key={i}
            x1="85"
            y1="85"
            x2={85 + 70 * Math.cos(angle)}
            y2={85 + 70 * Math.sin(angle)}
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

function DotGridSVG() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      className="absolute -right-2 -bottom-2 w-24 h-24 pointer-events-none text-slate-300 dark:text-slate-600"
    >
      {[0, 1, 2, 3, 4].flatMap((r) =>
        [0, 1, 2, 3, 4].map((c) => (
          <circle
            key={`${r}-${c}`}
            cx={55 + c * 11}
            cy={55 + r * 11}
            r="3"
            fill="currentColor"
          />
        )),
      )}
    </svg>
  );
}

function DiamondStackSVG() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      className="absolute -right-2 -bottom-2 w-24 h-24 pointer-events-none text-slate-300 dark:text-slate-600"
    >
      <rect
        x="56"
        y="56"
        width="40"
        height="40"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        transform="rotate(45 76 76)"
      />
      <rect
        x="44"
        y="44"
        width="56"
        height="56"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        transform="rotate(45 72 72)"
      />
    </svg>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function computeChartData(notes, semestre) {
  const filtered = notes.filter((n) => n.semestre === semestre);
  if (filtered.length === 0) return [];
  const byMonth = {};
  filtered.forEach((n) => {
    const d = new Date(n.date_evaluation);
    const key =
      d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
    const label = d
      .toLocaleDateString("fr-FR", { month: "short" })
      .replace(".", "");
    if (!byMonth[key]) byMonth[key] = { label, items: [] };
    byMonth[key].items.push(n);
  });
  return Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([, v]) => {
      const tc = v.items.reduce((s, n) => s + (n.coefficient ?? 1), 0);
      const ws = v.items.reduce(
        (s, n) => s + parseFloat(n.note) * (n.coefficient ?? 1),
        0,
      );
      return { label: v.label, avg: tc ? ws / tc : 0 };
    });
}

// ─── Performance Chart ────────────────────────────────────────────────────────
function PerformanceChart({ data = [], color = "#10b981" }) {
  const toY = (v) => 185 - (v / 20) * 165;
  const count = data.length;

  if (count === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-400 text-sm font-medium">
        Aucune donnée pour ce semestre
      </div>
    );
  }

  const xStart = 30;
  const xEnd = 570;
  const xStep = count === 1 ? 0 : (xEnd - xStart) / (count - 1);
  const pts = data.map((d, i) => ({
    x: xStart + i * xStep,
    y: toY(d.avg),
    label: d.label,
  }));

  const linePath = pts.reduce((acc, pt, i) => {
    if (i === 0) return "M " + pt.x + " " + pt.y;
    const prev = pts[i - 1];
    const cpx = (prev.x + pt.x) / 2;
    return (
      acc +
      " C " +
      cpx +
      " " +
      prev.y +
      " " +
      cpx +
      " " +
      pt.y +
      " " +
      pt.x +
      " " +
      pt.y
    );
  }, "");

  const areaPath =
    linePath + " L " + pts[pts.length - 1].x + " 190 L " + pts[0].x + " 190 Z";
  const threshold10Y = toY(10);

  return (
    <div className="relative w-full">
      {/* Y-axis labels */}
      <div
        className="absolute left-0 top-0 bottom-6 flex flex-col justify-between pr-2 pointer-events-none"
        aria-hidden="true"
      >
        {["20", "15", "10", "5", "0"].map((v) => (
          <span
            key={v}
            className="text-[10px] font-bold text-slate-300 dark:text-slate-700 tabular-nums"
          >
            {v}
          </span>
        ))}
      </div>

      {/* SVG Chart */}
      <div className="ml-7">
        <svg
          viewBox="0 0 600 200"
          className="w-full"
          role="img"
          aria-label="Graphique d'évolution des moyennes"
        >
          <defs>
            <linearGradient id="dynAreaGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.28" />
              <stop offset="100%" stopColor={color} stopOpacity="0.01" />
            </linearGradient>
          </defs>
          {[0, 5, 10, 15, 20].map((v) => (
            <line
              key={v}
              x1="10"
              y1={toY(v)}
              x2="590"
              y2={toY(v)}
              stroke="currentColor"
              strokeWidth="1"
              className="text-slate-100 dark:text-slate-800"
            />
          ))}
          {/* Seuil 10/20 */}
          <line
            x1="10"
            y1={threshold10Y}
            x2="590"
            y2={threshold10Y}
            stroke="#ef4444"
            strokeWidth="1.2"
            strokeDasharray="6 4"
            opacity="0.5"
          />
          <text
            x="12"
            y={threshold10Y - 4}
            fill="#ef4444"
            fontSize="8"
            opacity="0.7"
            fontWeight="bold"
          >
            10/20
          </text>
          <motion.path
            d={areaPath}
            fill="url(#dynAreaGrad)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />
          <motion.path
            d={linePath}
            fill="none"
            stroke={color}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
          />
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.75 }}
          >
            {pts.map((pt, i) => (
              <circle
                key={i}
                cx={pt.x}
                cy={pt.y}
                r="5"
                fill="white"
                stroke={color}
                strokeWidth="2.5"
              />
            ))}
          </motion.g>
        </svg>
        <div className="flex justify-between mt-1" aria-hidden="true">
          {pts.map((pt, i) => (
            <span
              key={i}
              className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider"
            >
              {pt.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Good Status Content ──────────────────────────────────────────────────────
function GoodStatusContent({ moyenne }) {
  const dots = [
    { l: "14%", t: "58%", s: 4, d: 0, c: "bg-emerald-400" },
    { l: "33%", t: "42%", s: 3, d: 0.4, c: "bg-yellow-300" },
    { l: "55%", t: "62%", s: 5, d: 0.2, c: "bg-emerald-300" },
    { l: "72%", t: "44%", s: 3, d: 0.65, c: "bg-yellow-400" },
    { l: "85%", t: "66%", s: 4, d: 0.85, c: "bg-emerald-500" },
    { l: "45%", t: "28%", s: 2, d: 1.1, c: "bg-white" },
  ];
  return (
    <div className="relative flex flex-col h-full">
      {dots.map((dot, i) => (
        <motion.div
          key={i}
          className={"absolute rounded-full pointer-events-none " + dot.c}
          style={{ width: dot.s, height: dot.s, left: dot.l, top: dot.t }}
          animate={{ y: [-4, -24, -4], opacity: [0, 0.85, 0] }}
          transition={{
            duration: 2.4 + i * 0.25,
            repeat: Infinity,
            delay: dot.d,
            ease: "easeInOut",
          }}
          aria-hidden="true"
        />
      ))}
      <motion.div
        animate={{ y: [0, -7, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
        className="mb-5"
      >
        <svg viewBox="0 0 80 80" className="w-16 h-16" aria-hidden="true">
          <circle
            cx="40"
            cy="40"
            r="34"
            fill="none"
            stroke="#fbbf24"
            strokeWidth="1.5"
            opacity="0.25"
          />
          <path
            d="M18 14 L62 14 L57 44 Q52 56 40 60 Q28 56 23 44 Z"
            fill="#fbbf24"
          />
          <path
            d="M10 14 L23 14 L23 30 Q10 28 10 14 Z"
            fill="#f59e0b"
            opacity="0.85"
          />
          <path
            d="M70 14 L57 14 L57 30 Q70 28 70 14 Z"
            fill="#f59e0b"
            opacity="0.85"
          />
          <rect x="34" y="60" width="12" height="9" fill="#f59e0b" />
          <rect x="27" y="69" width="26" height="5" rx="2.5" fill="#fbbf24" />
          <circle cx="30" cy="28" r="3" fill="white" opacity="0.4" />
          <circle cx="42" cy="22" r="2" fill="white" opacity="0.4" />
        </svg>
      </motion.div>
      <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-4 w-max">
        ✦ Bonne performance
      </div>
      <h3 className="text-2xl font-bold font-display text-white mb-2 leading-snug">
        Continuez
        <br />
        comme ça !
      </h3>
      <p className="text-sm text-slate-400 font-medium leading-relaxed mb-6">
        Moyenne de{" "}
        <span className="text-emerald-400 font-bold">
          {moyenne.toFixed(2)}/20
        </span>{" "}
        — Vous êtes sur la bonne voie.
      </p>
      <button className="inline-flex items-center gap-2 bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl hover:bg-emerald-400 transition-colors duration-200 w-max">
        Voir mes stats <ChevronRight size={14} aria-hidden="true" />
      </button>
    </div>
  );
}

// ─── Bad Status Content ───────────────────────────────────────────────────────
function BadStatusContent({ moyenne, onNavigate }) {
  return (
    <div className="relative flex flex-col h-full">
      <motion.div
        className="absolute -top-10 -right-10 w-44 h-44 rounded-full bg-red-500/20 blur-3xl pointer-events-none"
        animate={{ scale: [1, 1.45, 1], opacity: [0.35, 0.75, 0.35] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      />
      <div className="flex items-center gap-5 mb-5">
        <motion.div
          animate={{ rotate: [-4, 4] }}
          transition={{
            duration: 0.28,
            repeat: Infinity,
            repeatType: "mirror",
            ease: "linear",
          }}
        >
          <svg viewBox="0 0 68 62" className="w-14 h-14" aria-hidden="true">
            <motion.path
              d="M34 2 L66 60 L2 60 Z"
              fill="none"
              stroke="#fca5a5"
              strokeWidth="2.5"
              animate={{ opacity: [0.2, 0.75, 0.2] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
            <path d="M34 9 L62 57 L6 57 Z" fill="#ef4444" />
            <rect x="31" y="22" width="6" height="17" rx="2" fill="white" />
            <circle cx="34" cy="47.5" r="3.5" fill="white" />
          </svg>
        </motion.div>
        <div className="flex flex-col gap-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              animate={{ y: [0, 8, 0], opacity: [0.25, 1, 0.25] }}
              transition={{
                duration: 1.1,
                repeat: Infinity,
                delay: i * 0.22,
                ease: "easeInOut",
              }}
            >
              <svg
                viewBox="0 0 16 16"
                className="w-4 h-4 text-red-400"
                fill="currentColor"
                aria-hidden="true"
              >
                <path d="M8 2 L13 8 L10 8 L10 14 L6 14 L6 8 L3 8 Z" />
              </svg>
            </motion.div>
          ))}
        </div>
      </div>
      <div className="inline-flex items-center gap-1.5 bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-4 w-max">
        <AlertTriangle size={10} aria-hidden="true" /> Alerte Critique
      </div>
      <h3 className="text-xl font-bold font-display text-white mb-2 leading-snug">
        Moyenne sous
        <br />
        le seuil
      </h3>
      <p className="text-sm text-slate-400 font-medium leading-relaxed mb-6">
        Moyenne de{" "}
        <span className="text-red-400 font-bold">{moyenne.toFixed(2)}/20</span>{" "}
        — Utilisez l'IA pour vous rattraper.
      </p>
      <button
        onClick={() => onNavigate?.("ai-revision")}
        className="inline-flex items-center gap-2 bg-red-500 text-white font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl hover:bg-red-400 transition-colors duration-200 w-max"
      >
        Réviser avec l'IA <ChevronRight size={14} aria-hidden="true" />
      </button>
    </div>
  );
}

export default function StudentDashboardOverview({ onNavigate }) {
  const [moyennesData, setMoyennesData] = useState(null);
  const [alertes, setAlertes] = useState([]);
  const [notes, setNotes] = useState([]);
  const [selectedSemestre, setSelectedSemestre] = useState("S2");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moyennes, alertesRes, notesRes] = await Promise.all([
          studentService.getMoyennes(),
          studentService.getAlertes(),
          studentService.getNotes(),
        ]);
        setMoyennesData(moyennes);
        setAlertes(alertesRes.alertes || []);
        const raw = notesRes?.data ?? notesRes?.notes ?? notesRes ?? [];
        setNotes(Array.isArray(raw) ? raw : []);
      } catch (error) {
        console.error("Erreur lors du chargement de l'overview :", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // ── Données ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="space-y-8 pb-20"
        aria-busy="true"
        aria-label="Chargement du tableau de bord étudiant…"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card
              key={i}
              className="border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl shadow-sm"
            >
              <CardContent className="p-5">
                <div className="flex justify-between mb-4">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-8 w-8 rounded-xl" />
                </div>
                <Skeleton className="h-9 w-16 mb-2" />
                <Skeleton className="h-3 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-80 rounded-3xl" />
          </div>
          <Skeleton className="h-80 rounded-3xl" />
        </div>
      </div>
    );
  }

  const moyenne = moyennesData?.moyenne_generale ?? 0;
  const objectif = moyennesData?.objectif_moyenne ?? 0;
  const diff = (moyenne - objectif).toFixed(2);
  const isPositiveDiff = parseFloat(diff) >= 0;
  const alerteImportante = alertes.find(
    (a) =>
      !a.est_lue &&
      (a.niveau_severite === "Haute" || a.niveau_severite === "Moyenne"),
  );

  const isFailing = moyenne > 0 && moyenne < 10;
  const chartColor = isFailing
    ? "#ef4444"
    : moyenne > 0 && moyenne < 12
      ? "#f59e0b"
      : "#10b981";
  const chartData = computeChartData(notes, selectedSemestre);

  const stats = [
    {
      label: "Moyenne Générale",
      value: moyenne ? moyenne.toFixed(2) : "—",
      sub: `Objectif : ${parseFloat(objectif).toFixed(2)}`,
      badge: moyenne
        ? {
            label: isPositiveDiff ? `+${diff}` : diff,
            isPositive: isPositiveDiff,
          }
        : null,
      Icon: Award,
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      Decoration: ConcentricRingsSVG,
    },
    {
      label: "Position Classe",
      value: "N/D",
      sub: "Calcul en cours…",
      badge: null,
      Icon: Trophy,
      iconBg: "bg-blue-50 dark:bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
      Decoration: RadialLinesSVG,
    },
    {
      label: "Absences",
      value: "0",
      sub: "Heures manquées",
      badge: null,
      Icon: Clock,
      iconBg: "bg-purple-50 dark:bg-purple-500/10",
      iconColor: "text-purple-600 dark:text-purple-400",
      Decoration: DotGridSVG,
    },
    {
      label: "Crédits ECTS",
      value: "—",
      sub: "En attente",
      badge: null,
      Icon: Medal,
      iconBg: "bg-orange-50 dark:bg-orange-500/10",
      iconColor: "text-orange-600 dark:text-orange-400",
      Decoration: DiamondStackSVG,
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-20"
    >
      {/* ── Stats Cards ──────────────────────────────────────────────────────── */}
      <motion.div
        id="tour-stats"
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {stats.map(
          ({
            label,
            value,
            sub,
            badge,
            Icon,
            iconBg,
            iconColor,
            Decoration,
          }) => (
            <Card
              key={label}
              className="relative overflow-hidden border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <Decoration />
              <CardContent className="px-4 py-3.5 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400 leading-tight">
                    {label}
                  </span>
                  <div
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                      iconBg,
                    )}
                  >
                    <Icon size={13} aria-hidden="true" className={iconColor} />
                  </div>
                </div>
                <p className="text-2xl font-black font-display tracking-tight text-slate-900 dark:text-white tabular-nums leading-none mb-1.5">
                  {value}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-medium text-slate-400 dark:text-slate-500">
                    {sub}
                  </span>
                  {badge && (
                    <span
                      className={cn(
                        "text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ml-auto",
                        badge.isPositive
                          ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                          : "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400",
                      )}
                    >
                      {badge.label}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ),
        )}
      </motion.div>

      {/* ── Main Grid ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl shadow-sm">
            <CardContent className="p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
                <div>
                  <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
                    Évolution de la Performance
                  </h3>
                  <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wider">
                    Moyennes mensuelles · Semestre en cours
                  </p>
                </div>
                <select
                  value={selectedSemestre}
                  onChange={(e) => setSelectedSemestre(e.target.value)}
                  className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
                  aria-label="Sélectionner le semestre"
                >
                  <option value="S2">Semestre 2</option>
                  <option value="S1">Semestre 1</option>
                </select>
              </div>
              <Separator className="my-5" />
              <PerformanceChart data={chartData} color={chartColor} />
            </CardContent>
          </Card>
        </motion.div>

        {/* Alert / Status Widget */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 bg-slate-900 dark:bg-slate-950 rounded-3xl shadow-xl overflow-hidden relative min-h-80 flex flex-col">
            {/* Dot pattern */}
            <div
              className="absolute inset-0 pointer-events-none"
              aria-hidden="true"
            >
              <svg
                width="100%"
                height="100%"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern
                    id="studentStatusDots"
                    width="20"
                    height="20"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle cx="2" cy="2" r="1.2" fill="white" opacity="0.05" />
                  </pattern>
                </defs>
                <rect
                  width="100%"
                  height="100%"
                  fill="url(#studentStatusDots)"
                />
              </svg>
            </div>
            {/* Status glow */}
            <div
              className={`absolute -top-20 -right-20 w-64 h-64 rounded-full ${isFailing ? "bg-red-500/10" : "bg-emerald-500/10"} blur-3xl pointer-events-none`}
              aria-hidden="true"
            />
            <CardContent className="p-8 relative z-10 flex flex-col justify-center flex-1 overflow-hidden">
              <AnimatePresence mode="wait">
                {isFailing ? (
                  <motion.div
                    key="bad"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <BadStatusContent
                      moyenne={moyenne}
                      onNavigate={onNavigate}
                    />
                  </motion.div>
                ) : alerteImportante ? (
                  <motion.div
                    key="alert"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <div className="inline-flex items-center gap-1.5 bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-6 w-max">
                      <AlertTriangle size={11} aria-hidden="true" /> Alerte
                      Active
                    </div>
                    <h3 className="text-xl font-bold font-display text-white mb-3 leading-snug">
                      {alerteImportante.titre}
                    </h3>
                    <p className="text-sm text-slate-400 font-medium leading-relaxed mb-6">
                      {alerteImportante.message}
                    </p>
                    {alerteImportante.actions_suggerees?.length > 0 && (
                      <ul className="mb-6 space-y-2" role="list">
                        {alerteImportante.actions_suggerees.map((action, i) => (
                          <li
                            key={i}
                            className="flex items-center gap-2 text-xs font-medium text-slate-400"
                          >
                            <span
                              className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"
                              aria-hidden="true"
                            />
                            {action}
                          </li>
                        ))}
                      </ul>
                    )}
                    <button className="bg-white text-slate-900 font-bold text-xs uppercase tracking-wider px-5 py-3 rounded-xl hover:bg-slate-100 transition-colors w-max">
                      Marquer Compris
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="good"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                  >
                    <GoodStatusContent moyenne={moyenne} />
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
