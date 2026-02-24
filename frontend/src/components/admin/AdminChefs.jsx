import { motion } from "framer-motion";
import {
  UserCheck,
  Users,
  Clock,
  ShieldCheck,
  Plus,
  Eye,
  Edit3,
  UserMinus,
  AlertTriangle,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { useState, useEffect } from "react";
import { laravelApiClient } from "../../api/client";
import AddChefModal from "./AddChefModal";

export default function AdminChefs() {
  const [chefs, setChefs] = useState([]);
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
    fetchChefs();
  }, []);

  const fetchChefs = async () => {
    setLoading(true);
    try {
      const response = await laravelApiClient.get("/admin/chefs-departement");
      setChefs(response.data.data);
    } catch (error) {
      console.error("Erreur chefs:", error);
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
        className="space-y-8 pb-20"
      >
        {/* Search & Actions Header */}
        <motion.div variants={itemVariants} className="flex justify-end mb-6">
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-emerald-500 text-white font-black text-xs uppercase tracking-wider px-6 py-4 rounded-2xl flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-95 whitespace-nowrap"
          >
            <Plus size={18} /> Assigner un Chef
          </button>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <UserCheck size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Chefs Actifs
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {chefs.filter((c) => c.is_active).length}
              </h3>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Users size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Total Chefs
              </p>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {chefs.length}
              </h3>
            </div>
          </div>
        </motion.div>

        {/* Main Table */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[32px] p-8 shadow-sm overflow-hidden"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                Liste des Responsables
              </h3>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">
                Gérez les comptes et les accès
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-10">
              <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-8 px-8">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <th className="pb-4 pr-6">Chef</th>
                    <th className="pb-4 pr-6">Département</th>
                    <th className="pb-4 pr-6">Contact</th>
                    <th className="pb-4 pr-6">Statut</th>
                    <th className="pb-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {chefs.map((chef) => (
                    <tr
                      key={chef.id}
                      className="border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors"
                    >
                      <td className="py-6 pr-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center font-black text-sm shrink-0">
                            {chef.prenom.charAt(0)}
                            {chef.nom.charAt(0)}
                          </div>
                          <div>
                            <span className="font-black text-sm text-slate-900 dark:text-white whitespace-nowrap block">
                              {chef.prenom} {chef.nom}
                            </span>
                            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                              ID: #{chef.id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 pr-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-black text-[10px] shrink-0">
                            {chef.departement?.code || "??"}
                          </div>
                          <span className="font-bold text-sm text-slate-900 dark:text-white whitespace-nowrap">
                            {chef.departement?.nom || "Non assigné"}
                          </span>
                        </div>
                      </td>
                      <td className="py-6 pr-6">
                        <div className="space-y-1">
                          <span className="flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                            {chef.email}
                          </span>
                          <span className="flex items-center gap-2 text-[10px] font-medium text-slate-400 uppercase">
                            {chef.telephone || "N/A"}
                          </span>
                        </div>
                      </td>
                      <td className="py-6 pr-6">
                        <span
                          className={cn(
                            "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full inline-block",
                            chef.is_active
                              ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10"
                              : "text-rose-600 bg-rose-50 dark:bg-rose-500/10",
                          )}
                        >
                          {chef.is_active ? "Actif" : "Inactif"}
                        </span>
                      </td>
                      <td className="py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => {
                              const tel = window.prompt(
                                `Modifier le téléphone pour ${chef.nom} :`,
                                chef.telephone || "",
                              );
                              if (tel !== null) {
                                laravelApiClient
                                  .put(`/admin/chefs-departement/${chef.id}`, {
                                    telephone: tel,
                                  })
                                  .then(() => fetchChefs())
                                  .catch((err) =>
                                    alert(
                                      "Erreur de mise à jour: " +
                                        (err.response?.data?.message ||
                                          err.message),
                                    ),
                                  );
                              }
                            }}
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 hover:text-blue-500 transition-all border border-transparent hover:border-blue-100"
                            title="Editer"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            onClick={() => {
                              if (
                                window.confirm(
                                  `Voulez-vous vraiment révoquer le chef ${chef.prenom} ${chef.nom} ?`,
                                )
                              ) {
                                laravelApiClient
                                  .delete(`/admin/chefs-departement/${chef.id}`)
                                  .then(() => fetchChefs())
                                  .catch((err) =>
                                    alert(
                                      "Erreur lors de la révocation du chef",
                                    ),
                                  );
                              }
                            }}
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 hover:text-rose-500 transition-all border border-transparent hover:border-rose-100"
                            title="Révoquer"
                          >
                            <UserMinus size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </motion.div>

      <AddChefModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchChefs}
      />
    </>
  );
}
