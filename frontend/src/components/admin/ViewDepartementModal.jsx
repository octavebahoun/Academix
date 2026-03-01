import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Mail,
  Phone,
  User,
  BookOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState, useEffect } from "react";
import { laravelApiClient } from "../../api/client";

export default function ViewDepartementModal({ isOpen, onClose, departement }) {
  const [details, setDetails] = useState(null);
  const [etudiantsParFiliere, setEtudiantsParFiliere] = useState({});
  const [loading, setLoading] = useState(false);
  const [expandedFilieres, setExpandedFilieres] = useState({});

  useEffect(() => {
    if (isOpen && departement?.id) {
      setDetails(null);
      setEtudiantsParFiliere({});
      setExpandedFilieres({});
      fetchDetails();
    }
  }, [isOpen, departement?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchDetails = async () => {
    setLoading(true);
    try {
      const res = await laravelApiClient.get(
        `/admin/departements/${departement.id}`,
      );
      const data = res.data.data;
      setDetails(data);

      if (data.filieres?.length > 0) {
        const promises = data.filieres.map((f) =>
          laravelApiClient
            .get(`/departement/filieres/${f.id}/etudiants`)
            .then((r) => ({
              id: f.id,
              etudiants: r.data?.data || r.data || [],
            }))
            .catch(() => ({ id: f.id, etudiants: [] })),
        );
        const results = await Promise.all(promises);
        const map = {};
        results.forEach(({ id, etudiants }) => {
          map[id] = etudiants;
        });
        setEtudiantsParFiliere(map);
      }
    } catch (err) {
      console.error("Erreur chargement département:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleFiliere = (id) => {
    setExpandedFilieres((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const chefActif = details?.chefs?.find((c) => c.is_active) ?? null;

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
            className="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden border border-white/20 my-8 flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="p-8 pb-6 flex justify-between items-center border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black text-xl uppercase">
                  {departement?.nom?.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {departement?.nom}
                  </h3>
                  <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mt-1">
                    {departement?.code} · Vue d'ensemble
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors shrink-0"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                </div>
              ) : details ? (
                <>
                  {/* Chef section */}
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <User size={12} /> Chef du Département
                    </p>
                    {chefActif ? (
                      <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl p-4 flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black text-sm shrink-0">
                          {chefActif.prenom?.charAt(0)}
                          {chefActif.nom?.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-black text-sm text-slate-900 dark:text-white">
                            {chefActif.prenom} {chefActif.nom}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1 truncate">
                            <Mail size={10} className="shrink-0" />{" "}
                            {chefActif.email}
                          </p>
                          {chefActif.telephone && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Phone size={10} className="shrink-0" />{" "}
                              {chefActif.telephone}
                            </p>
                          )}
                        </div>
                        <span className="text-[10px] font-black text-emerald-600 bg-emerald-100 dark:bg-emerald-500/20 px-3 py-1.5 rounded-full uppercase tracking-widest shrink-0">
                          Actif
                        </span>
                      </div>
                    ) : (
                      <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                          <User size={20} className="text-slate-400" />
                        </div>
                        <p className="font-bold text-sm text-slate-400 italic">
                          Non assigné
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Filières section */}
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <BookOpen size={12} /> Filières (
                      {details.filieres?.length || 0})
                    </p>
                    {!details.filieres?.length ? (
                      <div className="text-center py-8 text-sm text-slate-400 italic">
                        Aucune filière dans ce département.
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {details.filieres.map((filiere) => {
                          const etudiants =
                            etudiantsParFiliere[filiere.id] || [];
                          const expanded = !!expandedFilieres[filiere.id];
                          return (
                            <div
                              key={filiere.id}
                              className="border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden"
                            >
                              <button
                                onClick={() => toggleFiliere(filiere.id)}
                                className="w-full px-4 py-3 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-[10px] shrink-0">
                                    {filiere.niveau}
                                  </div>
                                  <div className="text-left">
                                    <p className="font-black text-sm text-slate-900 dark:text-white">
                                      {filiere.nom}
                                    </p>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase">
                                      {filiere.code} ·{" "}
                                      {filiere.annee_academique}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                  <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                                    {etudiants.length} étudiant
                                    {etudiants.length !== 1 ? "s" : ""}
                                  </span>
                                  {expanded ? (
                                    <ChevronUp
                                      size={16}
                                      className="text-slate-400"
                                    />
                                  ) : (
                                    <ChevronDown
                                      size={16}
                                      className="text-slate-400"
                                    />
                                  )}
                                </div>
                              </button>

                              {expanded && (
                                <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-3 bg-slate-50/50 dark:bg-slate-800/20">
                                  {etudiants.length === 0 ? (
                                    <p className="text-xs text-slate-400 italic py-2">
                                      Aucun étudiant dans cette filière.
                                    </p>
                                  ) : (
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                      {etudiants.map((etudiant) => (
                                        <div
                                          key={etudiant.id}
                                          className="flex items-center gap-3 py-1"
                                        >
                                          <div className="w-8 h-8 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center font-black text-[10px] shrink-0">
                                            {etudiant.prenom?.charAt(0)}
                                            {etudiant.nom?.charAt(0)}
                                          </div>
                                          <div className="min-w-0">
                                            <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                              {etudiant.prenom} {etudiant.nom}
                                            </p>
                                            <p className="text-[10px] text-slate-400 truncate">
                                              {etudiant.matricule ||
                                                etudiant.email}
                                            </p>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <p className="text-center text-sm text-slate-400 py-8">
                  Impossible de charger les détails.
                </p>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
