import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  User,
  BookOpen,
  Star,
  Calendar,
  Hash,
  ChevronDown,
} from "lucide-react";
import { useState, useEffect } from "react";
import { laravelApiClient } from "../../api/client";
import { toast } from "react-hot-toast";

const TYPE_EVALUATIONS = ["Devoir", "Partiel", "TP", "Projet", "Examen"];
const SEMESTRES = ["S1", "S2"];

const currentYear = new Date().getFullYear();
const defaultAnnee = `${currentYear}-${currentYear + 1}`;

export default function AddNoteModal({ isOpen, onClose, onSuccess }) {
  const [filieres, setFilieres] = useState([]);
  const [etudiants, setEtudiants] = useState([]);
  const [matieres, setMatieres] = useState([]);
  const [selectedFiliereId, setSelectedFiliereId] = useState("");
  const [loadingFilieres, setLoadingFilieres] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    user_id: "",
    matiere_id: "",
    note: "",
    note_max: "20",
    type_evaluation: "",
    coefficient: "1",
    date_evaluation: new Date().toISOString().split("T")[0],
    semestre: "S1",
    annee_academique: defaultAnnee,
  });

  // Charger les filières à l'ouverture
  useEffect(() => {
    if (isOpen) {
      fetchFilieres();
    }
  }, [isOpen]);

  // Charger étudiants + matières quand on change de filière
  useEffect(() => {
    if (selectedFiliereId) {
      fetchFiliereData(selectedFiliereId);
    } else {
      setEtudiants([]);
      setMatieres([]);
      setFormData((prev) => ({ ...prev, user_id: "", matiere_id: "" }));
    }
  }, [selectedFiliereId]);

  const fetchFilieres = async () => {
    setLoadingFilieres(true);
    try {
      const res = await laravelApiClient.get("/departement/filieres");
      setFilieres(res.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingFilieres(false);
    }
  };

  const fetchFiliereData = async (filiereId) => {
    setLoadingData(true);
    try {
      const [etudRes, matRes] = await Promise.all([
        laravelApiClient.get(`/departement/filieres/${filiereId}/etudiants`),
        laravelApiClient.get(`/departement/filieres/${filiereId}/matieres`),
      ]);
      setEtudiants(etudRes.data?.data || etudRes.data || []);
      setMatieres(matRes.data || []);
    } catch (e) {
      console.error(e);
      toast.error("Erreur lors du chargement des données");
    } finally {
      setLoadingData(false);
    }
  };

  const handleClose = () => {
    setSelectedFiliereId("");
    setEtudiants([]);
    setMatieres([]);
    setFormData({
      user_id: "",
      matiere_id: "",
      note: "",
      note_max: "20",
      type_evaluation: "",
      coefficient: "1",
      date_evaluation: new Date().toISOString().split("T")[0],
      semestre: "S1",
      annee_academique: defaultAnnee,
    });
    onClose();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const noteVal = parseFloat(formData.note);
    const noteMax = parseFloat(formData.note_max);
    if (noteVal > noteMax) {
      toast.error("La note ne peut pas être supérieure à la note maximale");
      return;
    }
    setIsLoading(true);
    try {
      await laravelApiClient.post("/departement/notes", {
        ...formData,
        note: noteVal,
        note_max: noteMax,
        coefficient: parseInt(formData.coefficient, 10) || 1,
        user_id: parseInt(formData.user_id, 10),
        matiere_id: parseInt(formData.matiere_id, 10),
      });
      toast.success("Note ajoutée avec succès !");
      onSuccess?.();
      handleClose();
    } catch (error) {
      console.error(error);
      const message = error.response?.data?.message || "Erreur lors de l'ajout";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const selectClass =
    "w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none appearance-none";
  const inputClass =
    "w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-xl py-3 pl-12 pr-4 text-sm font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 transition-all outline-none";
  const iconClass =
    "absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none";

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
                  Ajouter une Note
                </h3>
                <p className="text-[9px] font-bold text-blue-500 uppercase tracking-widest mt-0.5">
                  Saisie individuelle d'évaluation
                </p>
              </div>
              <button
                onClick={handleClose}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 pt-2 space-y-4">
              {/* Étape 1 : Sélection filière */}
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Filière
                </label>
                <div className="relative">
                  <div className={iconClass}>
                    <BookOpen size={18} />
                  </div>
                  <select
                    required
                    value={selectedFiliereId}
                    onChange={(e) => setSelectedFiliereId(e.target.value)}
                    className={selectClass}
                    disabled={loadingFilieres}
                  >
                    <option value="">
                      {loadingFilieres
                        ? "Chargement..."
                        : "Sélectionner une filière"}
                    </option>
                    {filieres.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nom} ({f.code})
                      </option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>

              {/* Étape 2 : Étudiant + Matière */}
              {selectedFiliereId && (
                <>
                  {loadingData ? (
                    <div className="flex justify-center py-4">
                      <div className="w-6 h-6 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4">
                      {/* Étudiant */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                          Étudiant
                        </label>
                        <div className="relative">
                          <div className={iconClass}>
                            <User size={18} />
                          </div>
                          <select
                            required
                            value={formData.user_id}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                user_id: e.target.value,
                              })
                            }
                            className={selectClass}
                          >
                            <option value="">Sélectionner un étudiant</option>
                            {etudiants.map((etud) => (
                              <option key={etud.id} value={etud.id}>
                                {etud.nom} {etud.prenom} — {etud.matricule}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                            <ChevronDown size={16} />
                          </div>
                        </div>
                        {etudiants.length === 0 && (
                          <p className="text-[10px] text-amber-500 font-bold ml-1">
                            Aucun étudiant dans cette filière
                          </p>
                        )}
                      </div>

                      {/* Matière */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                          Matière
                        </label>
                        <div className="relative">
                          <div className={iconClass}>
                            <BookOpen size={18} />
                          </div>
                          <select
                            required
                            value={formData.matiere_id}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                matiere_id: e.target.value,
                              })
                            }
                            className={selectClass}
                          >
                            <option value="">Sélectionner une matière</option>
                            {matieres.map((mat) => (
                              <option key={mat.id} value={mat.id}>
                                {mat.nom} ({mat.code}) — Coef. {mat.coefficient}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                            <ChevronDown size={16} />
                          </div>
                        </div>
                        {matieres.length === 0 && (
                          <p className="text-[10px] text-amber-500 font-bold ml-1">
                            Aucune matière assignée à cette filière
                          </p>
                        )}
                      </div>

                      {/* Note + Note Max */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Note obtenue
                          </label>
                          <div className="relative">
                            <div className={iconClass}>
                              <Star size={18} />
                            </div>
                            <input
                              required
                              type="number"
                              min="0"
                              max={parseFloat(formData.note_max) || 20}
                              step="0.25"
                              value={formData.note}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  note: e.target.value,
                                })
                              }
                              placeholder="16.5"
                              className={inputClass}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Note Max
                          </label>
                          <div className="relative">
                            <div className={iconClass}>
                              <Star size={18} />
                            </div>
                            <input
                              required
                              type="number"
                              min="1"
                              step="1"
                              value={formData.note_max}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  note_max: e.target.value,
                                })
                              }
                              placeholder="20"
                              className={inputClass}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Type + Coefficient */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Type d'éval.
                          </label>
                          <div className="relative">
                            <div className={iconClass}>
                              <Hash size={18} />
                            </div>
                            <select
                              required
                              value={formData.type_evaluation}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  type_evaluation: e.target.value,
                                })
                              }
                              className={selectClass}
                            >
                              <option value="">Type</option>
                              {TYPE_EVALUATIONS.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                              <ChevronDown size={16} />
                            </div>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Coefficient
                          </label>
                          <div className="relative">
                            <div className={iconClass}>
                              <Hash size={18} />
                            </div>
                            <input
                              type="number"
                              min="1"
                              max="10"
                              value={formData.coefficient}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  coefficient: e.target.value,
                                })
                              }
                              placeholder="1"
                              className={inputClass}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Date + Semestre */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Date d'évaluation
                          </label>
                          <div className="relative">
                            <div className={iconClass}>
                              <Calendar size={18} />
                            </div>
                            <input
                              required
                              type="date"
                              value={formData.date_evaluation}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  date_evaluation: e.target.value,
                                })
                              }
                              className={inputClass}
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Semestre
                          </label>
                          <div className="relative">
                            <div className={iconClass}>
                              <Hash size={18} />
                            </div>
                            <select
                              required
                              value={formData.semestre}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  semestre: e.target.value,
                                })
                              }
                              className={selectClass}
                            >
                              {SEMESTRES.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                              <ChevronDown size={16} />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Année académique */}
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                          Année Académique
                        </label>
                        <div className="relative">
                          <div className={iconClass}>
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
                            placeholder="2025-2026"
                            className={inputClass}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || !selectedFiliereId}
                  className="w-full bg-blue-600 text-white font-black uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Enregistrer la Note <Send size={18} />
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
