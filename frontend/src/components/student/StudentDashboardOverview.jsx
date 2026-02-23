import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Award, Trophy, Clock, Medal, AlertTriangle } from "lucide-react";
import { cn } from "../../utils/cn";
import { studentService } from "../../services/studentService";

export default function StudentDashboardOverview() {
  const [moyennesData, setMoyennesData] = useState(null);
  const [alertes, setAlertes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moyennes, alertesRes] = await Promise.all([
          studentService.getMoyennes(),
          studentService.getAlertes(),
        ]);
        setMoyennesData(moyennes);
        setAlertes(alertesRes.alertes || []);
      } catch (error) {
        console.error("Erreur lors du chargement de l'overview :", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // Traitement des données
  const moyenne = moyennesData?.moyenne_generale || 0;
  const objectif = moyennesData?.objectif_moyenne || 0;
  const diff = (moyenne - objectif).toFixed(2);
  const alerteImportante = alertes.filter(
    (a) =>
      (!a.est_lue && a.niveau_severite === "Haute") ||
      a.niveau_severite === "Moyenne",
  )[0];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-20"
    >
      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="bg-emerald-500 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
            <Award size={64} />
          </div>
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-100">
              Moyenne Générale
            </h3>
            <div className="w-8 h-8 rounded-full bg-emerald-400 flex items-center justify-center shrink-0">
              <Award size={16} className="text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-black font-display italic tracking-tight mb-2">
              {moyenne.toFixed(2)}
            </h2>
            <p className="text-xs font-bold text-emerald-100 uppercase tracking-widest flex gap-1 items-center">
              <span>Objectif: {parseFloat(objectif).toFixed(2)}</span>
              {diff >= 0 ? (
                <span className="bg-white/20 px-2 py-0.5 rounded-full text-[10px] ml-2">
                  +{diff}
                </span>
              ) : (
                <span className="bg-red-500/50 px-2 py-0.5 rounded-full text-[10px] ml-2 text-white">
                  {diff}
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="bg-blue-500 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
            <Trophy size={64} />
          </div>
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-blue-100">
              Position Classe
            </h3>
            <div className="w-8 h-8 rounded-full bg-blue-400 flex items-center justify-center shrink-0">
              <Trophy size={16} className="text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-black font-display italic tracking-tight mb-2">
              N/D
            </h2>
            <p className="text-xs font-bold text-blue-100 uppercase tracking-widest">
              Rang global
            </p>
          </div>
        </div>

        <div className="bg-purple-500 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
            <Clock size={64} />
          </div>
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-purple-100">
              Absences
            </h3>
            <div className="w-8 h-8 rounded-full bg-purple-400 flex items-center justify-center shrink-0">
              <Clock size={16} className="text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-black font-display italic tracking-tight mb-2">
              0
            </h2>
            <p className="text-xs font-bold text-purple-100 uppercase tracking-widest">
              Heures d'absences
            </p>
          </div>
        </div>

        <div className="bg-orange-500 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:scale-110 transition-transform">
            <Medal size={64} />
          </div>
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-orange-100">
              Crédits ECTS
            </h3>
            <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center shrink-0">
              <Medal size={16} className="text-white" />
            </div>
          </div>
          <div>
            <h2 className="text-4xl font-black font-display italic tracking-tight mb-2">
              -
            </h2>
            <p className="text-xs font-bold text-orange-100 uppercase tracking-widest">
              Calcul en cours
            </p>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <motion.div
          variants={itemVariants}
          className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-sm flex flex-col"
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h3 className="text-lg font-black font-display uppercase italic tracking-tight text-slate-900 dark:text-white mb-1">
                Évolution Mensuelle
              </h3>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Performance académique globale
              </p>
            </div>
            <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 outline-none font-bold text-slate-700 dark:text-slate-300 text-sm cursor-pointer shadow-sm">
              <option>Semestre 2</option>
              <option>Semestre 1</option>
            </select>
          </div>

          <div className="flex-1 min-h-[300px] flex items-end relative pt-10">
            {/* Fake Chart Lines */}
            <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col justify-between pointer-events-none">
              <div className="flex items-center gap-4 text-xs font-bold text-slate-300 dark:text-slate-700 w-full">
                <span className="w-8 text-right">16.5</span>
                <div className="h-px bg-slate-100 dark:bg-slate-800/50 flex-1"></div>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold text-slate-300 dark:text-slate-700 w-full">
                <span className="w-8 text-right">16.0</span>
                <div className="h-px bg-slate-100 dark:bg-slate-800/50 flex-1"></div>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold text-slate-300 dark:text-slate-700 w-full">
                <span className="w-8 text-right">15.5</span>
                <div className="h-px bg-slate-100 dark:bg-slate-800/50 flex-1"></div>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold text-slate-300 dark:text-slate-700 w-full">
                <span className="w-8 text-right">15.0</span>
                <div className="h-px bg-slate-100 dark:bg-slate-800/50 flex-1"></div>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold text-slate-300 dark:text-slate-700 w-full">
                <span className="w-8 text-right">14.5</span>
                <div className="h-px bg-slate-100 dark:bg-slate-800/50 flex-1"></div>
              </div>
            </div>

            {/* Simulated Chart Line (SVG Path) */}
            <div className="w-full h-full relative z-10 ml-12 overflow-hidden flex items-end">
              {/* Just a decorative shape for the mockup */}
              <svg
                viewBox="0 0 400 200"
                className="w-full h-[80%] drop-shadow-lg preserve-aspect-ratio-none"
              >
                <path
                  d="M 0,200 L 0,100 L 40,30 L 80,140 L 120,50 L 160,110 L 200,20 L 200,200 Z"
                  fill="rgba(16, 185, 129, 0.15)"
                  stroke="none"
                />
                <path
                  d="M 0,100 L 40,30 L 80,140 L 120,50 L 160,110 L 200,20"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx="40"
                  cy="30"
                  r="6"
                  fill="#fff"
                  stroke="#10b981"
                  strokeWidth="4"
                />
                <circle
                  cx="80"
                  cy="140"
                  r="6"
                  fill="#fff"
                  stroke="#10b981"
                  strokeWidth="4"
                />
                <circle
                  cx="120"
                  cy="50"
                  r="6"
                  fill="#fff"
                  stroke="#10b981"
                  strokeWidth="4"
                />
                <circle
                  cx="160"
                  cy="110"
                  r="6"
                  fill="#fff"
                  stroke="#10b981"
                  strokeWidth="4"
                />
                <circle
                  cx="200"
                  cy="20"
                  r="6"
                  fill="#fff"
                  stroke="#10b981"
                  strokeWidth="4"
                />
              </svg>
            </div>

            {/* X Axis labels */}
            <div className="absolute inset-x-0 bottom-[-30px] ml-12 flex justify-between text-xs font-bold text-slate-400">
              <span>Jan</span>
              <span>Feb</span>
              <span>Mar</span>
              <span>Apr</span>
              <span>May</span>
              <span>Jun</span>
            </div>
          </div>
        </motion.div>

        {/* Announcements Widget */}
        <motion.div
          variants={itemVariants}
          className="bg-slate-900 dark:bg-slate-950 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden flex flex-col justify-center"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern
                  id="grid"
                  width="40"
                  height="40"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="white"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          {/* Lightning bolt decorative */}
          <svg
            className="absolute right-0 top-1/2 -translate-y-1/2 w-48 h-48 text-slate-800 opacity-50"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
          </svg>

          <div className="relative z-10 w-full">
            {alerteImportante ? (
              <>
                <div className="flex items-center gap-2 mb-6">
                  <span className="bg-red-500/20 text-red-100 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full inline-flex items-center gap-1 border border-red-500/30">
                    <AlertTriangle size={12} /> Alerte Active
                  </span>
                </div>

                <h3 className="text-2xl font-black font-display italic uppercase tracking-tight mb-4 leading-tight">
                  {alerteImportante.titre}
                </h3>

                <p className="text-sm text-slate-300 font-medium leading-relaxed mb-6">
                  {alerteImportante.message}
                </p>

                {alerteImportante.actions_suggerees &&
                  alerteImportante.actions_suggerees.length > 0 && (
                    <div className="mb-6 space-y-2">
                      {alerteImportante.actions_suggerees.map((action, i) => (
                        <div
                          key={i}
                          className="text-xs font-medium text-slate-400 flex items-center gap-2"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                          {action}
                        </div>
                      ))}
                    </div>
                  )}

                <button className="bg-white text-slate-900 font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl hover:bg-slate-200 transition-colors shadow-m active:scale-95 w-max">
                  Marquer Compris
                </button>
              </>
            ) : (
              <>
                <span className="bg-emerald-500/20 text-emerald-100 border border-emerald-500/30 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full mb-6 inline-block">
                  Infos
                </span>

                <h3 className="text-3xl font-black font-display italic uppercase tracking-tight mb-4 leading-tight">
                  Tout semble
                  <br />
                  parfait
                </h3>

                <p className="text-sm text-slate-300 font-medium leading-relaxed mb-8">
                  Vous n'avez aucune alerte en cours. Continuez sur cette belle
                  lancée !
                </p>

                <button className="bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider px-6 py-3.5 rounded-xl hover:bg-emerald-400 transition-colors shadow-m active:scale-95 w-max">
                  Voir les stats détaillées
                </button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
