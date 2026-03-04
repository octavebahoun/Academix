import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  ClipboardCheck,
  Headphones,
  Dumbbell,
  Image as ImageIcon,
  Bot,
  ArrowLeft,
  Sparkles,
  Zap,
  BookOpen,
  BrainCircuit,
  ChevronRight,
} from "lucide-react";
import { cn } from "../../utils/cn";

import SummaryTool from "../ai/SummaryTool";
import QuizTool from "../ai/QuizTool";
import PodcastTool from "../ai/PodcastTool";
import ExerciseTool from "../ai/ExerciseTool";
import ImageTool from "../ai/ImageTool";
import ProfAITool from "../ai/ProfAITool";

// ─── Constantes ───────────────────────────────────────────────────────────────

const TOOLS = [
  {
    id: "summary",
    num: "01",
    title: "Résumés",
    description: "Transformez vos notes en fiches synthétiques intelligentes.",
    icon: FileText,
    gradient: "from-blue-500 to-indigo-600",
    accent: "border-blue-500",
    tag: "bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-400",
    label: "Cours & PDF",
  },
  {
    id: "quiz",
    num: "02",
    title: "Quiz",
    description: "Mémorisez plus vite avec des QCM personnalisés sur vos PDF.",
    icon: ClipboardCheck,
    gradient: "from-emerald-500 to-teal-600",
    accent: "border-emerald-500",
    tag: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400",
    label: "Mémorisation",
  },
  {
    id: "podcast",
    num: "03",
    title: "Podcasts IA",
    description: "Écoutez vos révisions en format audio immersif.",
    icon: Headphones,
    gradient: "from-rose-500 to-orange-500",
    accent: "border-rose-500",
    tag: "bg-rose-100 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
    label: "Audio",
  },
  {
    id: "exercises",
    num: "04",
    title: "Exercices",
    description: "Entraînez-vous avec des séries d'exercices progressifs.",
    icon: Dumbbell,
    gradient: "from-violet-500 to-purple-600",
    accent: "border-rose-500",
    tag: "bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
    label: "Pratique",
  },
  {
    id: "image",
    num: "05",
    title: "Visualisation",
    description: "Créez des schémas et illustrations pour mieux comprendre.",
    icon: ImageIcon,
    gradient: "from-amber-500 to-yellow-500",
    accent: "border-amber-500",
    tag: "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
    label: "Visuel",
    isFuture: true,
  },
  {
    id: "prof",
    num: "06",
    title: "Prof IA",
    description: "Posez toutes vos questions à votre tuteur personnel IA.",
    icon: Bot,
    gradient: "from-slate-700 to-slate-900",
    accent: "border-rose-500",
    tag: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    label: "Tuteur",
  },
];

const STATS = [
  {
    icon: BookOpen,
    label: "Outils IA",
    value: "6",
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
  },
  {
    icon: Zap,
    label: "Toujours dispo",
    value: "24/7",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-500/10",
  },
  {
    icon: BrainCircuit,
    label: "Modèles actifs",
    value: "3",
    color: "text-violet-500",
    bg: "bg-violet-50 dark:bg-violet-500/10",
  },
  {
    icon: Sparkles,
    label: "Générations/jour",
    value: "∞",
    color: "text-amber-500",
    bg: "bg-amber-50 dark:bg-amber-500/10",
  },
];

const ToolView = ({ tool, onBack }) => {
  const renderTool = () => {
    switch (tool.id) {
      case "summary":
        return <SummaryTool />;
      case "quiz":
        return <QuizTool />;
      case "podcast":
        return <PodcastTool />;
      case "exercises":
        return <ExerciseTool />;
      case "image":
        return <ImageTool />;
      case "prof":
        return <ProfAITool />;
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      {/* Header outil */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-900 to-slate-800 shadow-lg">
        {/* dot pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <svg width="100%" height="100%">
            <defs>
              <pattern
                id="toolDots"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r="1.2" fill="white" opacity="0.07" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#toolDots)" />
          </svg>
        </div>
        <div
          className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-white/10 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative z-10 px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <button
              onClick={onBack}
              className="p-3 rounded-xl bg-white/10 hover:bg-white/20 text-white transition"
            >
              <ArrowLeft size={18} />
            </button>
            <div
              className={`p-3 rounded-2xl bg-linear-to-br ${tool.gradient} text-white shadow-lg`}
            >
              <tool.icon size={24} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/50 mb-0.5">
                {tool.label}
              </p>
              <h2 className="text-xl font-black text-white uppercase tracking-tight leading-none">
                {tool.title}
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 px-4 py-2 rounded-xl">
            <Sparkles size={14} className="text-emerald-400" />
            <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">
              IA Activée
            </span>
          </div>
        </div>
      </div>

      <div className="min-h-125">{renderTool()}</div>
    </motion.div>
  );
};

export default function StudentAIRevision({ isOnline = true }) {
  const [activeToolId, setActiveToolId] = useState(null);
  const activeTool = TOOLS.find((t) => t.id === activeToolId);

  const GENERATION_TOOLS = [
    "summary",
    "quiz",
    "podcast",
    "exercises",
    "image",
    "prof",
  ];

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <AnimatePresence mode="wait">
        {!activeToolId ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            className="space-y-8"
          >
            {/* ── Bannière hero ── */}
            <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-900 to-slate-800 shadow-lg">
              {/* dot pattern */}
              <div
                className="absolute inset-0 pointer-events-none"
                aria-hidden="true"
              >
                <svg width="100%" height="100%">
                  <defs>
                    <pattern
                      id="aiDots"
                      width="20"
                      height="20"
                      patternUnits="userSpaceOnUse"
                    >
                      <circle
                        cx="2"
                        cy="2"
                        r="1.2"
                        fill="white"
                        opacity="0.07"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#aiDots)" />
                </svg>
              </div>
              <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
              <div className="relative z-10 px-8 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={14} className="text-emerald-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                      Intelligence Artificielle Pédagogique
                    </span>
                  </div>
                  <h1 className="text-2xl font-black text-white uppercase tracking-tight leading-tight mb-2">
                    Portail de Révision IA
                  </h1>
                  <p className="text-sm text-white/60 font-medium max-w-sm">
                    6 outils IA pour optimiser chaque minute de vos révisions.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {["Résumés", "Quiz", "Podcasts", "Exercices"].map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-white/10 text-white/70"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ── Stat cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {STATS.map(({ icon: Icon, label, value, color, bg }) => (
                <motion.div
                  key={label}
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
              ))}
            </div>

            {/* ── Grille des outils ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {TOOLS.map((tool, i) => (
                <motion.button
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  whileHover={
                    isOnline ? { y: -4, transition: { duration: 0.18 } } : {}
                  }
                  onClick={() => setActiveToolId(tool.id)}
                  className={cn(
                    "group relative bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all border-t-4 border border-slate-100 dark:border-slate-800 text-left overflow-hidden flex flex-col justify-between min-h-52",
                    tool.accent,
                    !isOnline && "opacity-60",
                  )}
                >
                  {/* Badge offline sur la carte */}
                  {!isOnline && GENERATION_TOOLS.includes(tool.id) && (
                    <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/30">
                      <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 dark:text-amber-400">
                        Hors-ligne
                      </span>
                    </div>
                  )}
                  {/* Glow bg */}
                  <div
                    className={`absolute -right-8 -bottom-8 w-32 h-32 bg-linear-to-br ${tool.gradient} opacity-0 group-hover:opacity-8 rounded-full transition-opacity duration-500 blur-2xl`}
                  />

                  <div className="flex items-start justify-between mb-4">
                    {/* Numéro */}
                    <span className="text-[10px] font-black text-slate-300 dark:text-slate-700 tabular-nums">
                      {tool.num}
                    </span>
                    {/* Badge */}
                    <span
                      className={cn(
                        "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg",
                        tool.tag,
                      )}
                    >
                      {tool.label}
                    </span>
                    {tool.isFuture && (
                      <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-500/10 dark:text-orange-400">
                        Bientôt Disponible
                      </span>
                    )}
                  </div>

                  <div>
                    <div
                      className={`w-12 h-12 rounded-2xl bg-linear-to-br ${tool.gradient} flex items-center justify-center text-white shadow-md mb-4 group-hover:scale-105 transition-transform`}
                    >
                      <tool.icon size={22} />
                    </div>
                    <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight mb-1.5">
                      {tool.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium leading-relaxed line-clamp-2">
                      {tool.description}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      Ouvrir
                    </span>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        ) : (
          <ToolView
            key="tool"
            tool={activeTool}
            onBack={() => setActiveToolId(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
