import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronUp, ChevronDown, Filter } from "lucide-react";
import { cn } from "../../utils/cn";
import { studentService } from "../../services/studentService";

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

// ─── Type Évaluation Badges ───────────────────────────────────────────────────
const TYPE_COLORS = {
  Devoir: "bg-sky-50 text-sky-700 dark:bg-sky-500/10 dark:text-sky-400",
  Partiel:
    "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-400",
  TP: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400",
  Projet: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400",
  Examen: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

// ─── Note Bar ─────────────────────────────────────────────────────────────────
function NoteBar({ note, noteMax }) {
  const pct = Math.min(100, Math.round(((note || 0) / (noteMax || 20)) * 100));
  const isGood = pct >= 50;
  const isMid = pct >= 35 && pct < 50;
  const colorBar = isGood
    ? "bg-emerald-500"
    : isMid
      ? "bg-amber-400"
      : "bg-red-500";
  const colorTxt = isGood
    ? "text-emerald-500"
    : isMid
      ? "text-amber-500"
      : "text-red-500";

  return (
    <div className="flex items-center gap-3 justify-end">
      <div className="w-24 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className={cn("h-full rounded-full", colorBar)}
        />
      </div>
      <span
        className={cn(
          "text-base font-black italic tabular-nums min-w-15 text-right",
          colorTxt,
        )}
      >
        {parseFloat(note || 0).toFixed(2)}
        <span className="text-xs text-slate-400 font-bold ml-0.5">
          /{noteMax}
        </span>
      </span>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  label,
  value,
  unit,
  sub,
  accentFrom,
  barColor,
  barPct,
  subColor,
}) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm relative overflow-hidden group">
      <div
        className={cn(
          "absolute inset-0 bg-linear-to-br to-transparent opacity-0 group-hover:opacity-100 transition-opacity",
          accentFrom,
        )}
      />
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">
        {label}
      </p>
      <p
        className={cn(
          "text-4xl font-black italic tabular-nums",
          subColor || "text-slate-900 dark:text-white",
        )}
      >
        {value ?? "—"}
        {unit && (
          <span className="text-sm text-slate-400 font-bold ml-1">{unit}</span>
        )}
      </p>
      {barPct != null ? (
        <div className="mt-3 h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-700",
              barColor || "bg-emerald-500",
            )}
            style={{ width: `${Math.min(100, barPct)}%` }}
          />
        </div>
      ) : (
        <p
          className={cn(
            "mt-3 text-[10px] font-black uppercase tracking-widest",
            subColor || "text-slate-400",
          )}
        >
          {sub}
        </p>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function StudentNotes() {
  const [notes, setNotes] = useState([]);
  const [moyennesData, setMoyennesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeSemestre, setActiveSemestre] = useState("all");
  const [sortField, setSortField] = useState("date");
  const [sortDir, setSortDir] = useState("desc");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [notesData, moyennes] = await Promise.all([
          studentService.getNotes(),
          studentService.getMoyennes(),
        ]);
        setNotes(Array.isArray(notesData) ? notesData : []);
        setMoyennesData(moyennes);
      } catch (error) {
        console.error("Erreur chargement notes :", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  // Semestres disponibles
  const semestres = useMemo(
    () => [...new Set(notes.map((n) => n.semestre).filter(Boolean))].sort(),
    [notes],
  );

  // Notes filtrées + triées
  const filtered = useMemo(() => {
    let list =
      activeSemestre === "all"
        ? notes
        : notes.filter((n) => n.semestre === activeSemestre);

    return [...list].sort((a, b) => {
      let va, vb;
      if (sortField === "date") {
        va = new Date(a.date_evaluation || 0);
        vb = new Date(b.date_evaluation || 0);
      } else if (sortField === "note") {
        va = a.note || 0;
        vb = b.note || 0;
      } else if (sortField === "matiere") {
        va = a.matiere?.nom || "";
        vb = b.matiere?.nom || "";
      } else {
        va = a[sortField];
        vb = b[sortField];
      }
      if (va < vb) return sortDir === "asc" ? -1 : 1;
      if (va > vb) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [notes, activeSemestre, sortField, sortDir]);

  const toggleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortField(field);
      setSortDir("desc");
    }
  };

  // Stats
  const moyGen = moyennesData?.moyenne_generale;
  const objectif = moyennesData?.objectif_moyenne;
  const ecart = moyennesData?.ecart_objectif;
  const currentSemData =
    activeSemestre !== "all" ? moyennesData?.semestres?.[activeSemestre] : null;
  const displayMoy = currentSemData ? currentSemData.moyenne : moyGen;

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500" />
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-20 max-w-5xl mx-auto"
    >
      {/* ── Stats Cards ─────────────────────────────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <StatCard
          label="Moyenne Générale"
          value={displayMoy != null ? parseFloat(displayMoy).toFixed(2) : null}
          unit="/20"
          accentFrom="from-emerald-500/5"
          barColor={(displayMoy || 0) >= 10 ? "bg-emerald-500" : "bg-red-500"}
          barPct={displayMoy != null ? (displayMoy / 20) * 100 : 0}
          subColor={
            (displayMoy || 0) >= 10 ? "text-emerald-500" : "text-red-500"
          }
        />

        <StatCard
          label="Objectif"
          value={objectif != null ? parseFloat(objectif).toFixed(1) : null}
          unit="/20"
          accentFrom="from-violet-500/5"
          sub="Cible fixée"
          subColor="text-slate-400"
        />

        <StatCard
          label="Écart Objectif"
          value={
            ecart != null
              ? `${ecart >= 0 ? "+" : ""}${parseFloat(ecart).toFixed(2)}`
              : null
          }
          accentFrom={
            ecart == null
              ? "from-slate-500/5"
              : ecart >= 0
                ? "from-emerald-500/5"
                : "from-rose-500/5"
          }
          sub={
            ecart == null
              ? "N/A"
              : ecart >= 0
                ? "Objectif atteint ✓"
                : "En dessous"
          }
          subColor={
            ecart == null
              ? "text-slate-400"
              : ecart >= 0
                ? "text-emerald-500"
                : "text-rose-500"
          }
        />

        <StatCard
          label="Évaluations"
          value={filtered.length}
          accentFrom="from-sky-500/5"
          sub={activeSemestre === "all" ? "Au total" : `En ${activeSemestre}`}
          subColor="text-slate-400"
        />
      </motion.div>

      {/* ── Filtres Semestre ─────────────────────────────────────────────────── */}
      {semestres.length > 0 && (
        <motion.div
          variants={itemVariants}
          className="flex items-center gap-3 flex-wrap"
        >
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
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-emerald-300 dark:hover:border-emerald-700",
              )}
            >
              {s === "all" ? "Tous" : s}
            </button>
          ))}
        </motion.div>
      )}

      {/* ── Table ────────────────────────────────────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        id="tour-notes-list"
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl shadow-sm overflow-hidden"
      >
        {/* Header */}
        <div className="px-8 pt-8 pb-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Relevé de Notes
            </h2>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
              {filtered.length} évaluation{filtered.length !== 1 ? "s" : ""}
              {activeSemestre !== "all" ? ` · ${activeSemestre}` : ""}
            </p>
          </div>

          {/* Sort controls */}
          <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <Filter size={11} />
            <span>Trier :</span>
            {[
              { id: "date", label: "Date" },
              { id: "note", label: "Note" },
              { id: "matiere", label: "Matière" },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => toggleSort(f.id)}
                className={cn(
                  "flex items-center gap-0.5 px-2 py-1 rounded-lg transition-all",
                  sortField === f.id
                    ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400",
                )}
              >
                {f.label}
                {sortField === f.id &&
                  (sortDir === "asc" ? (
                    <ChevronUp size={10} className="ml-0.5" />
                  ) : (
                    <ChevronDown size={10} className="ml-0.5" />
                  ))}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-8 py-4 border-b border-slate-50 dark:border-slate-800/50">
                  Module
                </th>
                <th className="px-4 py-4 border-b border-slate-50 dark:border-slate-800/50">
                  Type
                </th>
                <th className="px-4 py-4 border-b border-slate-50 dark:border-slate-800/50 text-center">
                  Semestre
                </th>
                <th className="px-4 py-4 border-b border-slate-50 dark:border-slate-800/50 text-center">
                  Coeff.
                </th>
                <th className="px-4 py-4 border-b border-slate-50 dark:border-slate-800/50 text-center">
                  Date
                </th>
                <th className="px-8 py-4 border-b border-slate-50 dark:border-slate-800/50 text-right">
                  Note
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-8 py-16 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                        <BookOpen size={24} />
                      </div>
                      <p className="text-sm font-black text-slate-400 uppercase tracking-widest">
                        Aucune note
                      </p>
                      <p className="text-xs text-slate-400">
                        Aucune évaluation enregistrée
                        {activeSemestre !== "all"
                          ? ` pour le ${activeSemestre}`
                          : ""}
                        .
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="wait">
                  {filtered.map((note, i) => (
                    <motion.tr
                      key={note.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.025 }}
                      className="border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50/80 dark:hover:bg-slate-800/20 transition-colors group"
                    >
                      {/* Matière */}
                      <td className="px-8 py-5 w-1/3">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                            <BookOpen size={16} />
                          </div>
                          <div>
                            <span className="font-black text-sm text-slate-900 dark:text-white capitalize tracking-tight">
                              {note.matiere?.nom || "Non défini"}
                            </span>
                            {note.matiere?.code && (
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                                {note.matiere.code}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-4 py-5">
                        <span
                          className={cn(
                            "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl",
                            TYPE_COLORS[note.type_evaluation] ||
                              TYPE_COLORS.Examen,
                          )}
                        >
                          {note.type_evaluation || "—"}
                        </span>
                      </td>

                      {/* Semestre */}
                      <td className="px-4 py-5 text-center">
                        <span className="text-xs font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
                          {note.semestre || "—"}
                        </span>
                      </td>

                      {/* Coeff */}
                      <td className="px-4 py-5 text-center">
                        <span className="text-sm font-black text-slate-900 dark:text-white tabular-nums">
                          ×
                          {note.coefficient || note.matiere?.coefficient || "—"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="px-4 py-5 text-center text-sm font-medium text-slate-500 dark:text-slate-400 tabular-nums whitespace-nowrap">
                        {note.date_evaluation
                          ? new Date(note.date_evaluation).toLocaleDateString(
                              "fr-FR",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              },
                            )
                          : "—"}
                      </td>

                      {/* Note + barre */}
                      <td className="px-8 py-5 min-w-45">
                        <NoteBar
                          note={note.note}
                          noteMax={note.note_max || 20}
                        />
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer moyennes par semestre */}
        {moyennesData?.semestres &&
          Object.keys(moyennesData.semestres).length > 0 && (
            <div className="px-8 py-5 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-6 items-center bg-slate-50/50 dark:bg-slate-900/50">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Moyennes :
              </span>
              {Object.entries(moyennesData.semestres).map(([sem, data]) => (
                <div key={sem} className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded">
                    {sem}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-black italic tabular-nums",
                      (data.moyenne || 0) >= 10
                        ? "text-emerald-500"
                        : "text-rose-500",
                    )}
                  >
                    {parseFloat(data.moyenne || 0).toFixed(2)}/20
                  </span>
                </div>
              ))}
              <div className="ml-auto flex items-center gap-3">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Général
                </span>
                <span
                  className={cn(
                    "text-xl font-black italic tabular-nums",
                    (moyGen || 0) >= 10 ? "text-emerald-500" : "text-rose-500",
                  )}
                >
                  {moyGen != null ? parseFloat(moyGen).toFixed(2) : "—"}
                  <span className="text-sm text-slate-400 font-bold ml-1">
                    /20
                  </span>
                </span>
              </div>
            </div>
          )}
      </motion.div>
    </motion.div>
  );
}
