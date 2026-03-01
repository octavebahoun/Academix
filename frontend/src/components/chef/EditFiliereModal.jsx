import { motion, AnimatePresence } from "framer-motion";
import { X, Send, Book, Hash, Calendar, FileText, Layers } from "lucide-react";
import { useState, useEffect } from "react";
import { laravelApiClient } from "../../api/client";
import { toast } from "react-hot-toast";

export default function EditFiliereModal({
  isOpen,
  onClose,
  onSuccess,
  filiere,
}) {
  const [formData, setFormData] = useState({
    nom: "",
    code: "",
    niveau: "",
    annee_academique: "2025-2026",
    description: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Pré-remplir le formulaire quand la filière change
  useEffect(() => {
    if (filiere) {
      setFormData({
        nom: filiere.nom || "",
        code: filiere.code || "",
        niveau: filiere.niveau || "",
        annee_academique: filiere.annee_academique || "2025-2026",
        description: filiere.description || "",
      });
    }
  }, [filiere]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.niveau) {
      toast.error("Veuillez choisir un niveau");
      return;
    }
    setIsLoading(true);
    try {
      await laravelApiClient.put(
        `/departement/filieres/${filiere.id}`,
        formData,
      );
      toast.success("Filière mise à jour avec succès !");
      onSuccess();
      onClose();
    } catch (error) {
      console.error(error);
      const message =
        error.response?.data?.message || "Erreur lors de la mise à jour";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 overflow-y-auto">
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
                  Modifier la Filière
                </h3>
                <p className="text-[9px] font-bold text-amber-500 uppercase tracking-widest mt-0.5">
                  {filiere?.code} — Mise à jour du programme
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
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
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 transition-all outline-none"
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
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 transition-all outline-none"
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
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 transition-all outline-none appearance-none"
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
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 transition-all outline-none"
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
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 transition-all outline-none resize-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-amber-500 text-white font-black uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Enregistrer les modifications <Send size={18} />
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
