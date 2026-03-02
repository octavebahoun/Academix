import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Info,
  TrendingUp,
  TrendingDown,
  BookOpen,
  Lightbulb,
  Star,
  ChevronDown,
  ChevronUp,
  Clock,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { laravelApiClient } from "../../api/client";
import toast from "react-hot-toast";

// ── Helpers ──────────────────────────────────────────────────────────────────

const ALERT_STYLES = {
  info: {
    bg: "bg-blue-50 dark:bg-blue-950/30",
    border: "border-blue-200 dark:border-blue-800",
    badge: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
    icon: Info,
    iconColor: "text-blue-500",
    label: "Bilan positif",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    icon: AlertTriangle,
    iconColor: "text-amber-500",
    label: "Attention requise",
  },
  danger: {
    bg: "bg-red-50 dark:bg-red-950/30",
    border: "border-red-200 dark:border-red-800",
    badge: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
    icon: AlertTriangle,
    iconColor: "text-red-500",
    label: "Situation critique",
  },
};

function MatiereBar({ nom, moyenne }) {
  const pct = Math.min((moyenne / 20) * 100, 100);
  const color =
    moyenne >= 15
      ? "bg-emerald-500"
      : moyenne >= 12
        ? "bg-blue-500"
        : moyenne >= 10
          ? "bg-amber-500"
          : "bg-red-500";

  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs font-medium text-slate-600 dark:text-slate-400">
        <span className="truncate max-w-[70%]">{nom}</span>
        <span>{moyenne.toFixed(1)}/20</span>
      </div>
      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", color)}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ── Composant principal ───────────────────────────────────────────────────────

export default function StudentAnalysis() {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);

  // Chargement de la dernière analyse au montage
  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const res = await laravelApiClient.get("/student/analysis/history");
      const items = res.data?.data?.data ?? [];
      setHistory(items);
      if (items.length > 0) setAnalysis(items[0]);
    } catch {
      // Pas d'analyse existante, c'est normal
    } finally {
      setLoadingHistory(false);
    }
  };

  const triggerAnalysis = async () => {
    setLoading(true);
    try {
      const res = await laravelApiClient.get("/student/analysis");
      if (res.data?.success) {
        const newAnalysis = res.data.data;
        setAnalysis(newAnalysis);
        setHistory((prev) => [newAnalysis, ...prev]);
        toast.success("Bilan IA généré avec succès !");
      } else {
        toast.error(res.data?.message || "Impossible de générer le bilan.");
      }
    } catch (err) {
      const msg =
        err.response?.data?.message || "Erreur lors de la génération du bilan.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const style = ALERT_STYLES[analysis?.niveau_alerte ?? "info"];
  const AlertIcon = style.icon;

  return (
    <div className="space-y-6 py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Brain className="w-6 h-6 text-violet-500" />
            Bilan IA Personnalisé
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Analyse de vos performances académiques par intelligence
            artificielle
          </p>
        </div>

        <button
          onClick={triggerAnalysis}
          disabled={loading}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all",
            "bg-violet-600 hover:bg-violet-700 text-white shadow-sm",
            "disabled:opacity-60 disabled:cursor-not-allowed",
          )}
        >
          <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
          {loading ? "Analyse en cours…" : "Générer un bilan"}
        </button>
      </div>

      {/* Skeleton loading */}
      {loadingHistory && (
        <div className="space-y-3 animate-pulse">
          <div className="h-32 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="h-48 rounded-2xl bg-slate-200 dark:bg-slate-800" />
        </div>
      )}

      {/* Pas encore d'analyse */}
      {!loadingHistory && !analysis && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Brain className="w-14 h-14 text-slate-300 dark:text-slate-600 mb-4" />
          <p className="text-slate-500 dark:text-slate-400 text-base font-medium">
            Aucun bilan disponible
          </p>
          <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
            Cliquez sur "Générer un bilan" pour obtenir votre première analyse
            IA.
          </p>
        </div>
      )}

      {/* Carte principale */}
      <AnimatePresence mode="wait">
        {analysis && !loadingHistory && (
          <motion.div
            key={analysis.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-4"
          >
            {/* Bannière niveau d'alerte */}
            <div
              className={cn(
                "rounded-2xl border p-5 space-y-3",
                style.bg,
                style.border,
              )}
            >
              <div className="flex items-start gap-3">
                <AlertIcon
                  className={cn("w-6 h-6 mt-0.5 shrink-0", style.iconColor)}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span
                      className={cn(
                        "text-xs font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wide",
                        style.badge,
                      )}
                    >
                      {style.label}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(analysis.created_at).toLocaleDateString(
                        "fr-FR",
                        { day: "numeric", month: "long", year: "numeric" },
                      )}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                    {analysis.message_principal}
                  </p>
                </div>
              </div>

              {/* Moyenne générale */}
              <div className="flex items-center gap-4 pt-1">
                <div className="flex-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    Moyenne générale
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-3xl font-extrabold text-slate-800 dark:text-slate-100">
                      {Number(analysis.moyenne_generale).toFixed(2)}
                    </span>
                    <span className="text-slate-400 dark:text-slate-500 text-sm">
                      / 20
                    </span>
                    {analysis.moyenne_generale >= 12 ? (
                      <TrendingUp className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Grille 2 colonnes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Conseils */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  Conseils personnalisés
                </h3>
                <ul className="space-y-2">
                  {(analysis.conseils ?? []).map((conseil, i) => (
                    <li
                      key={i}
                      className="flex gap-2 text-sm text-slate-600 dark:text-slate-400"
                    >
                      <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{conseil}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Matières prioritaires */}
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-red-500" />
                  Matières prioritaires
                </h3>
                {(analysis.matieres_prioritaires ?? []).length === 0 ? (
                  <p className="text-sm text-slate-400 dark:text-slate-500">
                    Aucune matière critique 🎉
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {analysis.matieres_prioritaires.map((m, i) => (
                      <li
                        key={i}
                        className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300"
                      >
                        <span className="w-5 h-5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center text-xs font-bold">
                          {i + 1}
                        </span>
                        {m}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Point positif */}
            {analysis.point_positif && (
              <div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-4 flex items-start gap-3">
                <Star className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  {analysis.point_positif}
                </p>
              </div>
            )}

            {/* Détail par matière (si contexte_raw disponible) */}
            {analysis.contexte_raw?.matieres?.length > 0 && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-500" />
                  Détail par matière
                </h3>
                <div className="space-y-3">
                  {analysis.contexte_raw.matieres
                    .sort((a, b) => a.moyenne - b.moyenne)
                    .map((m, i) => (
                      <MatiereBar key={i} nom={m.nom} moyenne={m.moyenne} />
                    ))}
                </div>
              </div>
            )}

            {/* Historique */}
            {history.length > 1 && (
              <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
                <button
                  onClick={() => setShowHistory((v) => !v)}
                  className="w-full flex items-center justify-between px-5 py-4 text-sm font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span>Historique des analyses ({history.length})</span>
                  {showHistory ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>
                {showHistory && (
                  <div className="divide-y divide-slate-100 dark:divide-slate-800">
                    {history.slice(1).map((item) => (
                      <button
                        key={item.id}
                        onClick={() => setAnalysis(item)}
                        className="w-full flex items-center justify-between px-5 py-3 text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left"
                      >
                        <span>
                          {new Date(item.created_at).toLocaleDateString(
                            "fr-FR",
                            {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            },
                          )}
                        </span>
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full font-medium",
                            ALERT_STYLES[item.niveau_alerte ?? "info"].badge,
                          )}
                        >
                          {Number(item.moyenne_generale).toFixed(2)}/20
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
