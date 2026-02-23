import { motion } from "framer-motion";
import {
  Info,
  Download,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  History,
} from "lucide-react";
import { useState, useEffect } from "react";
import { laravelApiClient } from "../../api/client";
import ImportNotesModal from "./ImportNotesModal";

export default function ChefImportNotes() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const response = await laravelApiClient.get("/admin/import/history");
      // Filtrer pour n'avoir que les imports de type 'notes'
      setHistory(
        response.data.data.filter((log) => log.type_import === "notes"),
      );
    } catch (error) {
      console.error("Erreur historique:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-5xl mx-auto space-y-6 pb-12"
      >
        {/* Hero Section */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 overflow-hidden relative"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 blur-3xl" />

          <div className="relative z-10 text-center md:text-left">
            <h2 className="text-xl font-black font-display text-slate-900 dark:text-white uppercase tracking-tight">
              Importation des Notes
            </h2>
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1 max-w-md">
              Mise à jour massive des résultats académiques via fichier
              structuré.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="relative z-10 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold uppercase tracking-widest px-6 py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-blue-600 hover:text-white transition-all shadow-lg active:scale-95 whitespace-nowrap group text-xs"
          >
            <UploadCloud size={18} />
            Importer un CSV
          </button>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Instructions */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-1 space-y-6"
          >
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-2xl p-6 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-md mb-4">
                <Info size={20} />
              </div>
              <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">
                Guide d'utilisation
              </h3>
              <ul className="space-y-4">
                {[
                  "Utilisez obligatoirement le modèle CSV fourni.",
                  "Vérifiez les matricules avant l'envoi.",
                  "Les doublons sont automatiquement rejetés.",
                  "Format date : AAAA-MM-JJ.",
                ].map((text, i) => (
                  <li
                    key={i}
                    className="flex gap-3 text-sm font-bold text-slate-600 dark:text-slate-400"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                    {text}
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Right: History */}
          <motion.div
            variants={itemVariants}
            className="lg:col-span-2 space-y-6"
          >
            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm overflow-hidden">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Historique Récent
                  </h3>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                    Suivi des derniers imports effectués
                  </p>
                </div>
                <History size={20} className="text-slate-200" />
              </div>

              {loading ? (
                <div className="flex justify-center py-10">
                  <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-100 dark:border-slate-800">
                  <FileSpreadsheet
                    size={40}
                    className="mx-auto text-slate-300 mb-3"
                  />
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Aucun import trouvé
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {history.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-5 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-800 group"
                    >
                      <div className="flex items-center gap-4">
                        <div
                          className={cn(
                            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm",
                            log.statut === "termine"
                              ? "bg-emerald-50 text-emerald-500"
                              : "bg-rose-50 text-rose-500",
                          )}
                        >
                          {log.statut === "termine" ? (
                            <CheckCircle2 size={24} />
                          ) : (
                            <AlertTriangle size={24} />
                          )}
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 dark:text-white text-sm uppercase tracking-tight italic">
                            {log.fichier_nom}
                          </h4>
                          <p className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest">
                            {new Date(log.created_at).toLocaleString()} •{" "}
                            {log.lignes_valides} validés / {log.total_lignes}
                          </p>
                        </div>
                      </div>
                      <button className="w-10 h-10 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-blue-600 hover:text-white transition-all group-hover:scale-110">
                        <Download size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>

      <ImportNotesModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchHistory}
      />
    </>
  );
}
