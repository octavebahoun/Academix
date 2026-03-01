import { motion, AnimatePresence } from "framer-motion";
import { X, Send, User, Hash, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { laravelApiClient } from "../../api/client";
import { toast } from "react-hot-toast";

export default function AddEtudiantModal({
  isOpen,
  onClose,
  onSuccess,
  filiere,
}) {
  const [formData, setFormData] = useState({
    matricule: "",
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleClose = () => {
    setFormData({
      matricule: "",
      nom: "",
      prenom: "",
      email: "",
      telephone: "",
    });
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!filiere?.id) {
      toast.error("Filière non définie");
      return;
    }
    setIsLoading(true);
    try {
      await laravelApiClient.post("/auth/student/register", {
        ...formData,
        filiere_id: filiere.id,
      });
      toast.success(
        `Étudiant ${formData.prenom} ${formData.nom} ajouté avec succès !`,
      );
      onSuccess?.();
      handleClose();
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
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
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
                  Ajouter un Étudiant
                </h3>
                {filiere && (
                  <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5">
                    {filiere.code} — {filiere.nom}
                  </p>
                )}
              </div>
              <button
                onClick={handleClose}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Info */}
            <div className="mx-4 mb-2 p-3 bg-blue-50 dark:bg-blue-500/10 rounded-xl border border-blue-100 dark:border-blue-500/20">
              <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                💡 Le mot de passe initial sera le matricule de l'étudiant. Il
                pourra l'activer ultérieurement.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-4 pt-2 space-y-3">
              <div className="space-y-4">
                {/* Matricule */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Matricule
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Hash size={18} />
                    </div>
                    <input
                      required
                      type="text"
                      value={formData.matricule}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          matricule: e.target.value.toUpperCase(),
                        })
                      }
                      placeholder="Ex: ETU2025001"
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Nom */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Nom
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <User size={18} />
                      </div>
                      <input
                        required
                        type="text"
                        value={formData.nom}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            nom: e.target.value.toUpperCase(),
                          })
                        }
                        placeholder="DUPONT"
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                      />
                    </div>
                  </div>

                  {/* Prénom */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Prénom
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <User size={18} />
                      </div>
                      <input
                        required
                        type="text"
                        value={formData.prenom}
                        onChange={(e) =>
                          setFormData({ ...formData, prenom: e.target.value })
                        }
                        placeholder="Jean"
                        className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Email (Optionnel)
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Mail size={18} />
                    </div>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      placeholder="etudiant@email.com"
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Téléphone */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Téléphone (Optionnel)
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <Phone size={18} />
                    </div>
                    <input
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) =>
                        setFormData({ ...formData, telephone: e.target.value })
                      }
                      placeholder="+229 01 23 45 67"
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-emerald-600 text-white font-black uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Créer l'étudiant <Send size={18} />
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
