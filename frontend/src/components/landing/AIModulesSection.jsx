import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import {
  FileText,
  Mic,
  CheckSquare,
  PenTool,
  Bot,
  BarChart3,
  Sparkles,
  ArrowRight,
  Play,
} from "lucide-react";

const modules = [
  {
    id: "summary",
    icon: FileText,
    title: "Résumés Intelligents",
    subtitle: "Smart Summary",
    description:
      "Synthétisez instantanément de longs cours en fiches structurées. L'IA met en évidence les concepts clés, formules et définitions essentielles.",
    features: [
      "Fiches structurées",
      "Concepts clés extraits",
      "Formules mises en valeur",
      "Export PDF",
    ],
    color: "emerald",
    gradient: "from-emerald-500 to-teal-500",
    demo: "📄 → 🧠 → 📋",
  },
  {
    id: "podcast",
    icon: Mic,
    title: "Podcasts de Révision",
    subtitle: "Audio Learning",
    description:
      "Transformez vos cours en podcasts audio immersifs grâce à notre modèle Text-to-Speech. Révisez dans les transports ou en faisant du sport.",
    features: [
      "Text-to-Speech IA",
      "Révision audio",
      "Mains libres",
      "Partage facile",
    ],
    color: "cyan",
    gradient: "from-cyan-500 to-blue-500",
    demo: "📝 → 🎙️ → 🎧",
  },
  {
    id: "quiz",
    icon: CheckSquare,
    title: "Quiz Automatiques",
    subtitle: "Smart Testing",
    description:
      "Testez vos connaissances avec des QCM générés automatiquement à partir du contenu exact de vos cours. Préparez vos examens efficacement.",
    features: [
      "QCM contextuels",
      "Correction instantanée",
      "Score & progrès",
      "Niveaux adaptatifs",
    ],
    color: "amber",
    gradient: "from-amber-500 to-orange-500",
    demo: "📚 → ✅ → 💯",
  },
  {
    id: "exercises",
    icon: PenTool,
    title: "Exercices d'Application",
    subtitle: "Practice Mode",
    description:
      "L'IA génère des exercices pratiques inédits accompagnés de corrigés détaillés étape par étape pour un apprentissage en profondeur.",
    features: [
      "Exercices inédits",
      "Corrigés détaillés",
      "Étape par étape",
      "Niveau progressif",
    ],
    color: "violet",
    gradient: "from-violet-500 to-purple-500",
    demo: "🧠 → ✏️ → ✅",
  },
  {
    id: "tutor",
    icon: Bot,
    title: "Professeur IA",
    subtitle: "AI Tutor",
    description:
      "Posez vos questions à notre assistant IA spécialisé. Il agit comme votre tuteur personnel basé sur votre base de connaissance validée.",
    features: [
      "Réponses contextuelles",
      "Tuteur 24/7",
      "Base de connaissances",
      "Chat interactif",
    ],
    color: "rose",
    gradient: "from-rose-500 to-pink-500",
    demo: "❓ → 🤖 → 💡",
  },
  {
    id: "analytics",
    icon: BarChart3,
    title: "Analyse Prédictive",
    subtitle: "Performance Analytics",
    description:
      "Suivez vos performances avec des analytics avancés. Alertes précoces si votre moyenne baisse et recommandations personnalisées.",
    features: [
      "Graphiques de progrès",
      "Alertes précoces",
      "Prédictions IA",
      "Recommandations",
    ],
    color: "indigo",
    gradient: "from-indigo-500 to-blue-600",
    demo: "📊 → 📈 → 🎯",
  },
];

const colorStyles = {
  emerald: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-500",
    ring: "ring-emerald-500/30",
    badge:
      "bg-emerald-100 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-500",
    ring: "ring-cyan-500/30",
    badge: "bg-cyan-100 dark:bg-cyan-500/10 text-cyan-700 dark:text-cyan-400",
  },
  amber: {
    bg: "bg-amber-500/10",
    text: "text-amber-500",
    ring: "ring-amber-500/30",
    badge:
      "bg-amber-100 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  violet: {
    bg: "bg-violet-500/10",
    text: "text-violet-500",
    ring: "ring-violet-500/30",
    badge:
      "bg-violet-100 dark:bg-violet-500/10 text-violet-700 dark:text-violet-400",
  },
  rose: {
    bg: "bg-rose-500/10",
    text: "text-rose-500",
    ring: "ring-rose-500/30",
    badge: "bg-rose-100 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400",
  },
  indigo: {
    bg: "bg-indigo-500/10",
    text: "text-indigo-500",
    ring: "ring-indigo-500/30",
    badge:
      "bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400",
  },
};

export default function AIModulesSection() {
  const [active, setActive] = useState("summary");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const activeModule = modules.find((m) => m.id === active);
  const cs = colorStyles[activeModule.color];

  return (
    <section
      id="ai-modules"
      className="relative py-28 sm:py-36 bg-slate-950 overflow-hidden"
    >
      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] bg-gradient-to-r from-emerald-500/5 via-cyan-500/5 to-violet-500/5 rounded-full blur-3xl" />

      <div
        ref={ref}
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-semibold mb-6">
            <Sparkles className="w-4 h-4" />6 Modules IA
          </span>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            L'IA qui révolutionne{" "}
            <span className="bg-gradient-to-r from-cyan-500 to-violet-500 bg-clip-text text-transparent">
              ta façon d'apprendre
            </span>
          </h2>
          <p className="mt-6 text-lg text-slate-400">
            Sélectionne tes cours et laisse l'IA générer du contenu pédagogique
            sur mesure.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-[1fr_1.5fr] gap-10 items-start">
          {/* Tabs verticaux */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="space-y-2"
          >
            {modules.map((mod) => {
              const isActive = active === mod.id;
              const mcs = colorStyles[mod.color];
              return (
                <motion.button
                  key={mod.id}
                  onClick={() => setActive(mod.id)}
                  whileHover={{ x: 4 }}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl text-left transition-all duration-300 ${
                    isActive
                      ? `${mcs.bg} ring-2 ${mcs.ring} shadow-lg`
                      : "hover:bg-slate-800/60"
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                      isActive
                        ? `bg-gradient-to-br ${mod.gradient} text-white shadow-md`
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    <mod.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div
                      className={`text-sm font-bold ${isActive ? mcs.text : "text-white"}`}
                    >
                      {mod.title}
                    </div>
                    <div className="text-xs text-slate-400 truncate">
                      {mod.subtitle}
                    </div>
                  </div>
                  {isActive && (
                    <motion.div layoutId="ai-arrow" className={mcs.text}>
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </motion.div>

          {/* Détail du module actif */}
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              <div
                className={`rounded-3xl border border-slate-800 bg-slate-900 shadow-xl overflow-hidden`}
              >
                {/* Header du module */}
                <div
                  className={`p-8 bg-gradient-to-br ${activeModule.gradient} relative overflow-hidden`}
                >
                  <div className="absolute inset-0 bg-black/10" />
                  <div className="relative flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                      <activeModule.icon className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">
                        {activeModule.title}
                      </h3>
                      <p className="text-white/80 text-sm">
                        {activeModule.subtitle}
                      </p>
                    </div>
                  </div>
                  {/* Flow demo */}
                  <div className="mt-6 text-center">
                    <span className="text-3xl tracking-widest">
                      {activeModule.demo}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="p-8">
                  <p className="text-slate-400 leading-relaxed mb-6">
                    {activeModule.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3">
                    {activeModule.features.map((f, i) => (
                      <motion.div
                        key={f}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl ${cs.bg} text-sm font-medium ${cs.text}`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {f}
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
