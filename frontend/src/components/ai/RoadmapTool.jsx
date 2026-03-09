import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  Map,
  RefreshCcw,
  Download,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";

import { aiService } from "../../services/aiService";
import { cn } from "../../utils/cn";

const STATUS_LABELS = {
  pending: "En attente",
  analyzing: "Analyse IA",
  scraping: "Recherche de ressources",
  transcribing: "Transcription",
  evaluating: "Evaluation IA",
  building: "Construction",
  done: "Termine",
  failed: "Echec",
};

const STATUS_ORDER = [
  "pending",
  "analyzing",
  "scraping",
  "transcribing",
  "evaluating",
  "building",
  "done",
];

function formatDuration(seconds) {
  if (!seconds || Number.isNaN(seconds)) return null;
  const minutes = Math.round(seconds / 60);
  return `${minutes} min`;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function RoadmapTool() {
  const pollRef = useRef(null);
  const [form, setForm] = useState({
    mode: "Revision guidee",
    matiere: "",
    notion: "",
    niveau: "intermediaire",
  });

  const [job, setJob] = useState(null);
  const [status, setStatus] = useState(null);
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const activeStatusIndex = useMemo(() => {
    const current = status?.status;
    const idx = STATUS_ORDER.indexOf(current);
    return idx === -1 ? 0 : idx;
  }, [status?.status]);

  const cleanupPolling = () => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  };

  useEffect(() => cleanupPolling, []);

  const fetchRoadmapIfReady = async (roadmapUuid) => {
    if (!roadmapUuid) return;
    const res = await aiService.getRoadmap(roadmapUuid);
    setRoadmap(res);
  };

  const pollStatus = async (jobId) => {
    try {
      const res = await aiService.getRoadmapStatus(jobId);
      setStatus(res);

      if (res.status === "failed") {
        cleanupPolling();
        setError(
          res.error_message || "Echec lors de la generation de la roadmap.",
        );
        setLoading(false);
        return;
      }

      if (res.status === "done" && res.roadmap_uuid) {
        cleanupPolling();
        await fetchRoadmapIfReady(res.roadmap_uuid);
        setLoading(false);
      }
    } catch (e) {
      cleanupPolling();
      setLoading(false);
      setError(
        e?.response?.data?.message || "Impossible de suivre le statut du job.",
      );
    }
  };

  const handleGenerate = async () => {
    setError(null);
    setRoadmap(null);
    setStatus(null);
    setJob(null);
    setLoading(true);

    try {
      const res = await aiService.generateRoadmap({
        mode: form.mode,
        matiere: form.matiere || null,
        notion: form.notion || null,
        niveau: form.niveau || null,
      });
      setJob(res);

      await pollStatus(res.job_id);
      cleanupPolling();
      pollRef.current = setInterval(() => pollStatus(res.job_id), 2000);
    } catch (e) {
      setLoading(false);
      setError(
        e?.response?.data?.message ||
          "Erreur lors du declenchement de la generation.",
      );
    }
  };

  const handleReset = () => {
    cleanupPolling();
    setJob(null);
    setStatus(null);
    setRoadmap(null);
    setError(null);
    setLoading(false);
  };

  const handleDownloadPdf = async () => {
    try {
      const roadmapUuid =
        roadmap?.roadmap_uuid || status?.roadmap_uuid || job?.roadmap_uuid;
      if (!roadmapUuid) return;
      const blob = await aiService.downloadRoadmapPdf(roadmapUuid);
      downloadBlob(blob, `roadmap_${roadmapUuid}.pdf`);
    } catch (e) {
      setError(
        e?.response?.data?.message || "Erreur lors du telechargement du PDF.",
      );
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <div className="lg:col-span-4 space-y-4 w-full">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl lg:rounded-[2rem] p-4 lg:p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-indigo-500 to-violet-600 text-white flex items-center justify-center shadow-md">
              <Map size={22} />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Plan d'apprentissage
              </p>
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Roadmap Analysis
              </h3>
            </div>
          </div>

          <div className="space-y-3">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                Mode
              </label>
              <select
                value={form.mode}
                onChange={(e) =>
                  setForm((p) => ({ ...p, mode: e.target.value }))
                }
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20"
                disabled={loading}
              >
                <option value="Revision guidee">Revision guidee</option>
                <option value="Preparation examen">Preparation examen</option>
                <option value="Apprentissage accelere">
                  Apprentissage accelere
                </option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                Matiere
              </label>
              <input
                value={form.matiere}
                onChange={(e) =>
                  setForm((p) => ({ ...p, matiere: e.target.value }))
                }
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="Ex: Maths, Algorithmes..."
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                Notion
              </label>
              <input
                value={form.notion}
                onChange={(e) =>
                  setForm((p) => ({ ...p, notion: e.target.value }))
                }
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20"
                placeholder="Ex: Integrales, POO..."
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-2">
                Niveau
              </label>
              <select
                value={form.niveau}
                onChange={(e) =>
                  setForm((p) => ({ ...p, niveau: e.target.value }))
                }
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/20"
                disabled={loading}
              >
                <option value="debutant">Debutant</option>
                <option value="intermediaire">Intermediaire</option>
                <option value="avance">Avance</option>
              </select>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              onClick={handleGenerate}
              disabled={
                loading || !form.mode || (!form.matiere && !form.notion)
              }
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[10px] uppercase tracking-[0.2em] py-4 rounded-2xl hover:scale-[1.02] transition-all disabled:opacity-50 disabled:scale-100 shadow-xl flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Generation...
                </>
              ) : (
                "Generer"
              )}
            </button>

            <button
              onClick={handleReset}
              disabled={loading}
              className="bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-black text-[10px] uppercase tracking-[0.2em] py-4 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCcw size={16} /> Reset
            </button>
          </div>

          {status && (
            <div className="mt-5 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 bg-slate-50 dark:bg-slate-950">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                Statut
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm font-black text-slate-900 dark:text-white">
                  {STATUS_LABELS[status.status] || status.status}
                </span>
                <span className="text-[11px] font-bold text-slate-500">
                  {status.current_step || ""}
                </span>
              </div>
              {status.progress && (
                <p className="text-xs text-slate-500 mt-2">
                  {status.progress.detail || ""}
                </p>
              )}
              <div className="mt-3 flex gap-2 flex-wrap">
                {STATUS_ORDER.map((key, idx) => (
                  <span
                    key={key}
                    className={cn(
                      "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg border",
                      idx <= activeStatusIndex
                        ? "bg-indigo-500/10 text-indigo-600 border-indigo-500/20 dark:text-indigo-300"
                        : "bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800",
                    )}
                  >
                    {STATUS_LABELS[key]}
                  </span>
                ))}
              </div>

              {/* Sources debug : vidéos trouvées sur YouTube pendant le scraping */}
              {status.progress?.sources?.length > 0 && (
                <div className="mt-4">
                  <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    🎬 {status.progress.sources.length} source(s) trouvée(s) —
                    transcription en cours...
                  </p>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {status.progress.sources.map((src, i) => (
                      <div
                        key={i}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2 flex items-start gap-2"
                      >
                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-300 border border-violet-500/20 shrink-0">
                          {src.concept || "—"}
                        </span>
                        <div className="min-w-0 flex-1">
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] font-bold text-slate-800 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-300 truncate block transition-colors"
                          >
                            {src.title || src.url}
                          </a>
                          {src.duration_seconds && (
                            <span className="text-[9px] text-slate-400">
                              {Math.round(src.duration_seconds / 60)} min
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="mt-4 flex items-start gap-3 rounded-2xl border border-rose-200 dark:border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 p-4">
              <AlertTriangle
                size={18}
                className="text-rose-600 dark:text-rose-400 mt-0.5"
              />
              <p className="text-sm font-semibold text-rose-700 dark:text-rose-200">
                {error}
              </p>
            </div>
          )}
        </div>

        <button
          onClick={handleDownloadPdf}
          disabled={
            !roadmap?.roadmap_uuid &&
            !status?.roadmap_uuid &&
            !job?.roadmap_uuid
          }
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[10px] uppercase tracking-[0.2em] py-4 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Download size={16} /> Telecharger PDF
        </button>
      </div>

      <div className="lg:col-span-8 min-w-0">
        <AnimatePresence mode="wait">
          {!roadmap ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl lg:rounded-[2rem] p-6 lg:p-8"
            >
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                Lance une generation pour afficher une roadmap (semaines, videos
                et ressources).
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="roadmap"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl lg:rounded-[2rem] p-5 lg:p-8"
            >
              <div className="flex items-start justify-between gap-4 mb-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
                    Roadmap
                  </p>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {roadmap.mode}
                    {roadmap.matiere ? ` · ${roadmap.matiere}` : ""}
                  </h3>
                  {roadmap.notion && (
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold mt-1">
                      Notion: {roadmap.notion}
                    </p>
                  )}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20">
                  {roadmap.status}
                </span>
              </div>

              <div className="space-y-6">
                {(roadmap.sections || []).map((section) => (
                  <div
                    key={section.section_id}
                    className="border border-slate-200 dark:border-slate-800 rounded-2xl p-6 bg-slate-50 dark:bg-slate-950"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          {section.period_label ||
                            `Semaine ${section.position}`}
                        </p>
                        <h4 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                          {section.title}
                        </h4>
                      </div>
                      {section.metadata?.level && (
                        <span className="text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
                          {section.metadata.level}
                        </span>
                      )}
                    </div>
                    {section.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mb-4">
                        {section.description}
                      </p>
                    )}

                    <div className="space-y-3">
                      {(section.resources || []).map((resource) => (
                        <div
                          key={resource.resource_id}
                          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex items-start justify-between gap-4"
                        >
                          <div className="min-w-0">
                            <a
                              href={resource.url}
                              target="_blank"
                              rel="noreferrer"
                              className="font-black text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors inline-flex items-center gap-2"
                            >
                              <span className="truncate">
                                {resource.title || "Ressource"}
                              </span>
                              <ExternalLink size={14} className="shrink-0" />
                            </a>
                            {resource.summary && (
                              <p className="text-sm text-slate-600 dark:text-slate-300 font-medium mt-1">
                                {resource.summary}
                              </p>
                            )}
                            <div className="mt-2 flex gap-2 flex-wrap">
                              {resource.score != null && (
                                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 border border-emerald-500/20">
                                  Score: {resource.score}
                                </span>
                              )}
                              {formatDuration(resource.duration_seconds) && (
                                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                  {formatDuration(resource.duration_seconds)}
                                </span>
                              )}
                              {resource.level && (
                                <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-300 border border-indigo-500/20">
                                  {resource.level}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
