import { motion } from "framer-motion";
import {
  Upload,
  MoreVertical,
  Plus,
  Users,
  BookOpen,
  GraduationCap,
  X,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { useState, useEffect } from "react";
import { laravelApiClient } from "../../api/client";
import AddFiliereModal from "./AddFiliereModal";
import ImportEtudiantsModal from "./ImportEtudiantsModal";

export default function ChefFilieres() {
  const [filieres, setFilieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedFiliere, setSelectedFiliere] = useState(null);
  const [activeTab, setActiveTab] = useState("matieres");

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    fetchFilieres();
  }, []);

  const fetchFilieres = async () => {
    setLoading(true);
    try {
      const response = await laravelApiClient.get("/departement/filieres");
      setFilieres(response.data);
    } catch (error) {
      console.error("Erreur filières:", error);
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
        className="space-y-6 pb-12"
      >
        {/* Header Section */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h2 className="text-lg font-black font-display text-slate-900 dark:text-white uppercase tracking-tight">
              Gestion des Filières
            </h2>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
              {filieres.length} Programmes d'études
            </p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex-1 md:flex-none border border-slate-900 dark:border-white text-slate-900 dark:text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all active:scale-95"
            >
              <Upload size={16} /> Import Étudiants
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 md:flex-none bg-blue-600 text-white font-bold text-xs px-5 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-md active:scale-95"
            >
              <Plus size={16} /> Nouvelle Filière
            </button>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 xl:grid-cols-2 gap-6"
          >
            {filieres.map((filiere) => (
              <motion.div
                key={filiere.id}
                variants={itemVariants}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-600 flex items-center justify-center font-black text-xl group-hover:scale-105 transition-transform">
                        {filiere.niveau?.charAt(0) || "F"}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                          {filiere.nom}
                        </h3>
                        <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">
                          {filiere.code} • {filiere.annee_academique}
                        </p>
                      </div>
                    </div>
                    <button className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors">
                      <MoreVertical size={20} />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <p className="text-lg font-black text-slate-900 dark:text-white">
                        {filiere.users_count || 0}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        Étudiants
                      </p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <p className="text-lg font-black text-slate-900 dark:text-white">
                        {filiere.matieres_count || 0}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        Matières
                      </p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <span className="text-[10px] font-black text-emerald-500 uppercase">
                        Actif
                      </span>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        Statut
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                    <div className="flex -space-x-2">
                      {[1, 2, 3].map((_, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800 overflow-hidden"
                        >
                          <img
                            src={`https://i.pravatar.cc/150?u=${filiere.id + i}`}
                            alt="avatar"
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() =>
                        setSelectedFiliere(
                          selectedFiliere?.id === filiere.id ? null : filiere,
                        )
                      }
                      className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-[10px] px-4 py-2 rounded-lg uppercase tracking-widest hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all border border-slate-200 dark:border-slate-700"
                    >
                      {selectedFiliere?.id === filiere.id
                        ? "Fermer Détails"
                        : "Voir Détails"}
                    </button>
                  </div>

                  {selectedFiliere?.id === filiere.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800"
                    >
                      <div className="flex gap-4 mb-4">
                        <button
                          onClick={() => setActiveTab("matieres")}
                          className={cn(
                            "text-[10px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all",
                            activeTab === "matieres"
                              ? "border-blue-500 text-blue-500"
                              : "border-transparent text-slate-400",
                          )}
                        >
                          Matières
                        </button>
                        <button
                          onClick={() => setActiveTab("etudiants")}
                          className={cn(
                            "text-[10px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all",
                            activeTab === "etudiants"
                              ? "border-blue-500 text-blue-500"
                              : "border-transparent text-slate-400",
                          )}
                        >
                          Étudiants
                        </button>
                        <button
                          onClick={() => setActiveTab("emploi")}
                          className={cn(
                            "text-[10px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all",
                            activeTab === "emploi"
                              ? "border-blue-500 text-blue-500"
                              : "border-transparent text-slate-400",
                          )}
                        >
                          Emploi du Temps
                        </button>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-4 min-h-[100px] flex items-center justify-center">
                        {activeTab === "emploi" ? (
                          <div className="text-center space-y-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase italic">
                              Aucun emploi du temps publié
                            </p>
                            <button className="flex items-center justify-center gap-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-emerald-600 transition-all mx-auto">
                              <Upload size={14} /> Upload Planning
                            </button>
                          </div>
                        ) : (
                          <p className="text-[10px] font-bold text-slate-400 uppercase italic">
                            Chargement des{" "}
                            {activeTab === "matieres"
                              ? "matières"
                              : "étudiants"}
                            ...
                          </p>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      <AddFiliereModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchFilieres}
      />

      <ImportEtudiantsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={fetchFilieres}
      />
    </>
  );
}
