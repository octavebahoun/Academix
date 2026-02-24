import { motion } from "framer-motion";
import { Plus, Edit3, Eye, ArrowRight, Trash2 } from "lucide-react";
import { cn } from "../../utils/cn";
import { useState, useEffect } from "react";
import { laravelApiClient } from "../../api/client";
import AddDepartementModal from "./AddDepartementModal";

export default function AdminDepartements() {
  const [departements, setDepartements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    fetchDepartements();
  }, []);

  const fetchDepartements = async () => {
    setLoading(true);
    try {
      const response = await laravelApiClient.get("/admin/departements");
      setDepartements(response.data.data);
    } catch (error) {
      console.error("Erreur departements:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDeptColor = (index) => {
    const colors = [
      "bg-blue-100 text-blue-600",
      "bg-orange-100 text-orange-600",
      "bg-emerald-100 text-emerald-600",
      "bg-purple-100 text-purple-600",
      "bg-rose-100 text-rose-600",
      "bg-teal-100 text-teal-600",
    ];
    return colors[index % colors.length];
  };

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8 pb-20"
      >
        {/* Header with New Button */}
        <motion.div variants={itemVariants} className="flex justify-end mb-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-500 text-white font-black text-xs uppercase tracking-wider px-6 py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 whitespace-nowrap"
          >
            <Plus size={18} /> Nouveau Département
          </button>
        </motion.div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6"
          >
            {departements.map((dept, i) => (
              <motion.div
                key={dept.id}
                variants={itemVariants}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div
                      className={cn(
                        "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-xl uppercase",
                        getDeptColor(i),
                      )}
                    >
                      {dept.nom.charAt(0)}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const nouveauNom = window.prompt(
                            "Nouveau nom du département :",
                            dept.nom,
                          );
                          if (!nouveauNom) return;
                          laravelApiClient
                            .put(`/admin/departements/${dept.id}`, {
                              nom: nouveauNom,
                            })
                            .then(() => fetchDepartements())
                            .catch((err) =>
                              alert(
                                "Erreur lors de la mise à jour: " +
                                  (err.response?.data?.message || err.message),
                              ),
                            );
                        }}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              `Êtes-vous sûr de vouloir supprimer le département ${dept.nom} ?`,
                            )
                          ) {
                            laravelApiClient
                              .delete(`/admin/departements/${dept.id}`)
                              .then(() => fetchDepartements())
                              .catch((err) =>
                                alert(
                                  "Impossible de supprimer : " +
                                    (err.response?.data?.message ||
                                      err.message),
                                ),
                              );
                          }
                        }}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 dark:text-white mb-1">
                    {dept.nom}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    {dept.code}
                  </p>

                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-4 leading-relaxed line-clamp-2">
                    {dept.description ||
                      "Aucune description fournie pour ce département."}
                  </p>
                </div>

                <div className="mt-8 space-y-4">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">
                      Filières
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {dept.filieres_count}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">
                      Chefs
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {dept.chefs_count}
                    </span>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-sm">
                  <span className="text-slate-400 dark:text-slate-500 font-bold uppercase text-[10px] tracking-widest">
                    Détails
                  </span>
                  <button className="text-emerald-500 font-black flex items-center gap-1 hover:gap-2 transition-all">
                    VOIR PLUS <ArrowRight size={14} />
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Global Stats Footer */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-sm flex flex-wrap justify-around items-center gap-8 mt-12"
        >
          <h3 className="text-sm font-black font-display text-slate-900 dark:text-white uppercase tracking-tight w-full md:w-auto text-center md:text-left">
            Tableau de Bord Administration
          </h3>

          <div className="text-center">
            <p className="text-3xl font-black text-emerald-500 mb-1">
              {departements.length}
            </p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Départements
            </p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-black text-blue-500 mb-1">
              {departements.reduce(
                (acc, d) => acc + (d.filieres_count || 0),
                0,
              )}
            </p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              Filières
            </p>
          </div>
        </motion.div>
      </motion.div>

      <AddDepartementModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchDepartements}
      />
    </>
  );
}
