import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BrainCircuit,
  FileText,
  ClipboardCheck,
  Headphones,
  Dumbbell,
  Image as ImageIcon,
  Bot,
  ArrowLeft,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { aiService } from "../../services/aiService";

// Import des composants d'outils
import SummaryTool from "../ai/SummaryTool";
import QuizTool from "../ai/QuizTool";
import PodcastTool from "../ai/PodcastTool";
import ExerciseTool from "../ai/ExerciseTool";
import ImageTool from "../ai/ImageTool";
import ProfAITool from "../ai/ProfAITool";

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-6">
          <button
            onClick={onBack}
            className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-all text-slate-500 hover:text-indigo-500"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-4">
            <div
              className={`p-4 rounded-2xl bg-gradient-to-br ${tool.color} text-white shadow-lg`}
            >
              <tool.icon size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight italic leading-none mb-1">
                {tool.title}
              </h2>
              <p className="text-slate-500 text-xs font-medium">
                {tool.description}
              </p>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center gap-3 bg-indigo-50 dark:bg-indigo-500/10 px-4 py-2 rounded-xl">
          <Sparkles size={16} className="text-indigo-500" />
          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest leading-none">
            Intelligence Artificielle Activée
          </span>
        </div>
      </div>

      <div className="bg-transparent min-h-[500px]">{renderTool()}</div>
    </motion.div>
  );
};

export default function StudentAIRevision() {
  const [activeToolId, setActiveToolId] = useState(null);

  const tools = [
    {
      id: "summary",
      title: "Résumez vos cours",
      description:
        "Transformez vos notes en fiches synthétiques intelligentes.",
      icon: FileText,
      color: "from-blue-500 to-indigo-600",
      delay: 0,
    },
    {
      id: "quiz",
      title: "Obtenez des quiz",
      description:
        "Mémorisez plus vite avec des QCM personnalisés sur vos PDF.",
      icon: ClipboardCheck,
      color: "from-emerald-500 to-teal-600",
      delay: 0.1,
    },
    {
      id: "podcast",
      title: "Podcasts IA",
      description: "Écoutez vos révisions en format audio immersif.",
      icon: Headphones,
      color: "from-rose-500 to-orange-600",
      delay: 0.2,
    },
    {
      id: "exercises",
      title: "Exercices",
      description: "Entraînez-vous avec des séries d'exercices progressifs.",
      icon: Dumbbell,
      color: "from-purple-500 to-pink-600",
      delay: 0.3,
    },
    {
      id: "image",
      title: "Visualisez en images",
      description:
        "Créez des schémas et des illustrations pour mieux comprendre.",
      icon: ImageIcon,
      color: "from-amber-500 to-yellow-600",
      delay: 0.4,
    },
    {
      id: "prof",
      title: "Prof IA",
      description: "Posez toutes vos questions à votre tuteur personnel IA.",
      icon: Bot,
      color: "from-indigo-600 to-purple-800",
      delay: 0.5,
    },
  ];

  const activeTool = tools.find((t) => t.id === activeToolId);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <AnimatePresence mode="wait">
        {!activeToolId ? (
          <motion.div
            key="grid"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-12"
          >
            {/* Header / Intro */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <p className="text-slate-500 text-sm font-medium max-w-xs border-l-2 border-indigo-500 pl-4 py-1">
                Optimisez chaque minute de votre temps avec nos puissants
                moteurs d'intelligence artificielle pédagogique.
              </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tools.map((tool) => (
                <motion.button
                  key={tool.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: tool.delay }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  onClick={() => setActiveToolId(tool.id)}
                  className="group relative bg-white dark:bg-slate-900 rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl transition-all border border-slate-100 dark:border-slate-800 text-left overflow-hidden h-full flex flex-col justify-between"
                >
                  {/* Background Decoration */}
                  <div
                    className={`absolute -right-8 -top-8 w-32 h-32 bg-gradient-to-br ${tool.color} opacity-0 group-hover:opacity-10 rounded-full transition-opacity duration-500 blur-2xl`}
                  ></div>

                  <div>
                    <div
                      className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${tool.color} flex items-center justify-center text-white shadow-lg mb-8 group-hover:scale-110 transition-transform`}
                    >
                      <tool.icon size={28} />
                    </div>

                    <h3 className="text-xl font-black text-slate-800 dark:text-white uppercase tracking-tight italic mb-3">
                      {tool.title}
                    </h3>

                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed font-medium">
                      {tool.description}
                    </p>
                  </div>

                  <div className="mt-8 flex items-center justify-between">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-indigo-500 transition-colors">
                      Explorer l'outil
                    </span>
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 group-hover:bg-indigo-500 group-hover:text-white transition-all">
                      <ChevronRight size={16} />
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
