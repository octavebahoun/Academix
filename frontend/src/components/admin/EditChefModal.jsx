import { motion, AnimatePresence } from "framer-motion";
import { X, Save, User, Mail, Lock, Phone, Landmark } from "lucide-react";
import { useState, useEffect } from "react";
import { laravelApiClient } from "../../api/client";
import { toast } from "react-hot-toast";

export default function EditChefModal({ isOpen, onClose, chef, onSuccess }) {
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    telephone: "",
    departement_id: "",
  });
  const [departements, setDepartements] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchDepartements();
    }
  }, [isOpen]);

  useEffect(() => {
    if (chef) {
      setFormData({
        nom: chef.nom || "",
        prenom: chef.prenom || "",
        email: chef.email || "",
        password: "",
        telephone: chef.telephone || "",
        departement_id: chef.departement_id || "",
      });
    }
  }, [chef]);

  const fetchDepartements = async () => {
    try {
      const response = await laravelApiClient.get("/admin/departements");
      setDepartements(response.data.data);
    } catch (error) {
      console.error("Erreur lors du chargement des départements", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const payload = {
      nom: formData.nom,
      prenom: formData.prenom,
      email: formData.email,
      telephone: formData.telephone,
      departement_id: formData.departement_id,
    };
    if (formData.password) payload.password = formData.password;

    try {
      await laravelApiClient.put(
        `/admin/chefs-departement/${chef.id}`,
        payload,
      );
      toast.success("Chef de département mis à jour !");
      onSuccess();
      onClose();
    } catch (error) {
      const message =
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Erreur lors de la mise à jour";
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
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden border border-white/20 my-8"
          >
            {/* Header */}
            <div className="p-8 pb-4 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Modifier le Chef
                </h3>
                <p className="text-xs font-bold text-amber-500 uppercase tracking-widest mt-1">
                  {chef ? `${chef.prenom} ${chef.nom}` : "—"}
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 pt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {/* Prénom */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Prénom
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <User size={16} />
                    </div>
                    <input
                      required
                      type="text"
                      value={formData.prenom}
                      onChange={(e) =>
                        setFormData({ ...formData, prenom: e.target.value })
                      }
                      placeholder="Jean"
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                    />
                  </div>
                </div>

                {/* Nom */}
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Nom
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <User size={16} />
                    </div>
                    <input
                      required
                      type="text"
                      value={formData.nom}
                      onChange={(e) =>
                        setFormData({ ...formData, nom: e.target.value })
                      }
                      placeholder="KOUTON"
                      className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Email Professionnel
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Mail size={16} />
                  </div>
                  <input
                    required
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="jean.kouton@univ.bj"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Téléphone */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Téléphone
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Phone size={16} />
                  </div>
                  <input
                    type="tel"
                    value={formData.telephone}
                    onChange={(e) =>
                      setFormData({ ...formData, telephone: e.target.value })
                    }
                    placeholder="+229 00 00 00 00"
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Département */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Département
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Landmark size={16} />
                  </div>
                  <select
                    value={formData.departement_id}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        departement_id: e.target.value,
                      })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 transition-all outline-none appearance-none"
                  >
                    <option value="">Sélectionner un département</option>
                    {departements.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.nom} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Mot de passe (optionnel) */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Nouveau mot de passe{" "}
                  <span className="text-slate-300 normal-case font-bold">
                    (optionnel)
                  </span>
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                    <Lock size={16} />
                  </div>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    placeholder="Laisser vide pour ne pas modifier"
                    minLength={formData.password ? 8 : undefined}
                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 transition-all outline-none"
                  />
                </div>
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-2 py-4 rounded-2xl bg-amber-500 text-white font-black text-xs uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Save size={18} /> Enregistrer
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
