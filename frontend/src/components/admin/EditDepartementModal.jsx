import { motion, AnimatePresence } from "framer-motion";
import { X, Building2, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { laravelApiClient } from "../../api/client";
import { toast } from "react-hot-toast";

export default function EditDepartementModal({
  isOpen,
  onClose,
  departement,
  onSuccess,
}) {
  const [form, setForm] = useState({ nom: "", code: "", description: "" });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (departement) {
      setForm({
        nom: departement.nom || "",
        code: departement.code || "",
        description: departement.description || "",
      });
    }
  }, [departement]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await laravelApiClient.put(`/admin/departements/${departement.id}`, form);
      toast.success("Département modifié avec succès !");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Erreur lors de la modification",
      );
    } finally {
      setLoading(false);
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
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden border border-white/20 my-8"
          >
            {/* Header */}
            <div className="p-8 pb-4 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-500/10 text-amber-500 flex items-center justify-center">
                  <Building2 size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    Modifier Département
                  </h3>
                  <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mt-1">
                    {departement?.code || "—"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-4">
              {/* Nom */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Nom du département *
                </label>
                <input
                  required
                  type="text"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  placeholder="ex: Génie Informatique"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                />
              </div>

              {/* Code */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Code *
                </label>
                <input
                  required
                  type="text"
                  maxLength={10}
                  value={form.code}
                  onChange={(e) =>
                    setForm({ ...form, code: e.target.value.toUpperCase() })
                  }
                  placeholder="ex: INFO"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-black text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 transition-all outline-none uppercase tracking-widest"
                />
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Description du département..."
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl py-3 px-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 transition-all outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-2 py-4 rounded-2xl bg-amber-500 text-white font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={16} /> Enregistrer
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
