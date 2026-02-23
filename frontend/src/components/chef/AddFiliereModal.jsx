import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Book, Hash, Calendar, FileText, Layers } from "lucide-react";
import { useState } from "react";
import { laravelApiClient } from "../../api/client";
import { toast } from "react-hot-toast";

export default function AddFiliereModal({ isOpen, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    nom: "",
    code: "",
    niveau: "",
    annee_academique: "2025-2026",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.niveau) {
      toast.error("Veuillez choisir un niveau");
      return;
    }
    setIsLoading(true);
    try {
      // Le backend injecte automatiquement le departement_id du chef
      await laravelApiClient.post("/departement/filieres", formData);
      toast.success("Filière créée avec succès !");
      onSuccess();
      onClose();
      setFormData({
        nom: "",
        code: "",
        niveau: "",
        annee_academique: "2025-2026",
        description: "",
      });
    } catch (error) {
      console.error(error);
      const message =
        error.response?.data?.message || "Erreur lors de la création";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-white/20 my-8"
          >
            {/* Header */}
            <div className="p-4 pb-3 flex justify-between items-center">
              <div>
                <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Nouvelle Filière
                </h3>
                <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">
                  Ajouter un programme d'études
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 pt-2 space-y-3">
              <div className="space-y-4">
                {/* Nom */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Nom de la Filière
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Book size={18} />
                    </div>
                    <input
                      required
                      type="text"
                      value={formData.nom}
                      onChange={(e) =>
                        setFormData({ ...formData, nom: e.target.value })
                      }
                      placeholder="Ex: Génie Logiciel"
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Code */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Code Unique
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Hash size={18} />
                      </div>
                      <input
                        required
                        type="text"
                        value={formData.code}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            code: e.target.value.toUpperCase(),
                          })
                        }
                        placeholder="Ex: GL-2026"
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Niveau */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Niveau
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <Layers size={18} />
                      </div>
                      <select
                        required
                        value={formData.niveau}
                        onChange={(e) =>
                          setFormData({ ...formData, niveau: e.target.value })
                        }
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none"
                      >
                        <option value="">Niveau</option>
                        <option value="L1">Licence 1 (L1)</option>
                        <option value="L2">Licence 2 (L2)</option>
                        <option value="L3">Licence 3 (L3)</option>
                        <option value="M1">Master 1 (M1)</option>
                        <option value="M2">Master 2 (M2)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Année Académique */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Année Académique
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Calendar size={18} />
                    </div>
                    <input
                      required
                      type="text"
                      value={formData.annee_academique}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          annee_academique: e.target.value,
                        })
                      }
                      placeholder="Ex: 2025-2026"
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Description (Optionnel)
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-4 text-slate-400">
                      <FileText size={18} />
                    </div>
                    <textarea
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      placeholder="Objectifs de la formation..."
                      rows={3}
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white font-black uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Créer la Filière <Send size={18} />
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
