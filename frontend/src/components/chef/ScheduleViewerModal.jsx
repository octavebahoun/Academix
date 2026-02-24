import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
  BookOpen,
  Edit2,
  Trash2,
  Plus,
  Save,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { departementService } from "../../services/departementService";
import { cn } from "../../utils/cn";

export default function ScheduleViewerModal({
  isOpen,
  onClose,
  filiereId,
  filiereName,
}) {
  const [scheduleData, setScheduleData] = useState([]);
  const [matieresData, setMatieresData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Mode Edition
  const [isEditingMode, setIsEditingMode] = useState(false);

  // Formulaire d'édition/ajout
  const [courseModal, setCourseModal] = useState({ isOpen: false, item: null });

  useEffect(() => {
    let mounted = true;
    if (isOpen && filiereId) {
      // eslint-disable-next-line
      setIsLoading(true);
      setError(null);

      Promise.all([
        departementService.getFiliereEmploiTemps(filiereId),
        departementService.getFiliereMatieres(filiereId),
      ])
        .then(([edtData, matData]) => {
          if (mounted) {
            setScheduleData(edtData);
            setMatieresData(matData || []);
            setIsLoading(false);
          }
        })
        .catch((err) => {
          console.error(err);
          if (mounted) {
            setError(
              "Erreur lors du chargement des données de l'emploi du temps.",
            );
            setIsLoading(false);
          }
        });
    }
    return () => {
      mounted = false;
    };
  }, [isOpen, filiereId]);

  // Drag & Drop Handling
  const handleDragStart = (e, courseId) => {
    e.dataTransfer.setData("courseId", courseId);
    e.currentTarget.style.opacity = "0.5";
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = "1";
  };

  const handleDragOver = (e) => {
    if (isEditingMode) {
      e.preventDefault(); // Autorise le drop
    }
  };

  const handleDrop = async (e, targetDay) => {
    e.preventDefault();
    if (!isEditingMode) return;

    const courseId = e.dataTransfer.getData("courseId");
    if (!courseId) return;

    const numId = parseInt(courseId, 10);
    const draggedCourse = scheduleData.find((c) => c.id === numId);

    if (draggedCourse && draggedCourse.jour !== targetDay) {
      // Optimistic Update
      const previousSchedule = [...scheduleData];
      setScheduleData((prev) =>
        prev.map((c) => (c.id === numId ? { ...c, jour: targetDay } : c)),
      );

      try {
        await departementService.updateEmploiTemps(numId, { jour: targetDay });
      } catch (err) {
        console.error(err);
        setScheduleData(previousSchedule);
        alert("Erreur lors du déplacement du cours.");
      }
    }
  };

  // Suppression
  const handleDeleteCourse = async (id) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce cours ?"))
      return;
    try {
      await departementService.deleteEmploiTemps(id);
      setScheduleData((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression.");
    }
  };

  const days = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex"
            onClick={onClose}
          />

          <div className="fixed inset-0 flex items-center justify-center z-50 p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-6xl h-[95vh] flex flex-col bg-slate-50 dark:bg-slate-950 rounded-3xl shadow-2xl overflow-hidden border border-white/20 pointer-events-auto"
            >
              {/* Header */}
              <div className="p-4 md:px-8 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center shadow-sm z-10 shrink-0">
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center text-white transition-colors duration-300",
                      isEditingMode ? "bg-amber-500" : "bg-blue-600",
                    )}
                  >
                    <CalendarIcon size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
                      {filiereName || "Chargement..."}
                      {isEditingMode && (
                        <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                          Mode Édition
                        </span>
                      )}
                    </h3>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest mt-0.5">
                      Visualisation et Édition Rapide
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsEditingMode(!isEditingMode)}
                    className={cn(
                      "h-10 px-4 rounded-xl font-bold transition-colors flex items-center gap-2",
                      isEditingMode
                        ? "bg-amber-100 text-amber-700 hover:bg-amber-200 dark:bg-amber-500/20 dark:text-amber-400 dark:hover:bg-amber-500/30"
                        : "bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-500/10 dark:text-blue-400 dark:hover:bg-blue-500/20",
                    )}
                  >
                    <Edit2 size={16} />
                    <span className="hidden sm:inline">
                      {isEditingMode ? "Quitter l'Édition" : "Mode Édition"}
                    </span>
                  </button>

                  <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              {/* Body (Planning Grid/Columns) */}
              <div className="flex-1 overflow-x-auto overflow-y-auto p-4 md:p-6 bg-slate-50/50 dark:bg-slate-950/50">
                {isLoading ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                    <p className="text-slate-500 font-medium animate-pulse text-sm uppercase tracking-widest">
                      Chargement des horaires...
                    </p>
                  </div>
                ) : error ? (
                  <div className="flex flex-col items-center justify-center h-full text-center">
                    <X size={48} className="text-red-500 mb-4" />
                    <p className="text-lg font-bold text-slate-900 dark:text-white mb-4">
                      {error}
                    </p>
                    <button
                      onClick={onClose}
                      className="px-6 py-2 bg-slate-200 dark:bg-slate-800 rounded-xl font-bold"
                    >
                      Fermer
                    </button>
                  </div>
                ) : (
                  <div className="w-fit min-w-full flex gap-4 md:gap-6 items-start">
                    {days.map((jour) => {
                      const coursesForDay = scheduleData.filter(
                        (c) => c.jour === jour,
                      );

                      return (
                        <div
                          key={jour}
                          onDragOver={handleDragOver}
                          onDrop={(e) => handleDrop(e, jour)}
                          className={cn(
                            "flex-1 min-w-[280px] bg-white dark:bg-slate-900 rounded-2xl p-4 md:p-5 shadow-sm border transition-colors",
                            isEditingMode
                              ? "border-dashed border-amber-200 dark:border-amber-900/50"
                              : "border-slate-100 dark:border-slate-800",
                          )}
                        >
                          <h4 className="text-base font-black text-slate-900 dark:text-white mb-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                            <div className="flex items-center gap-2">
                              <span
                                className={cn(
                                  "w-2 h-6 rounded-full inline-block",
                                  isEditingMode
                                    ? "bg-amber-400"
                                    : "bg-blue-500",
                                )}
                              ></span>
                              {jour}
                            </div>
                            {isEditingMode && (
                              <button
                                onClick={() =>
                                  setCourseModal({
                                    isOpen: true,
                                    item: {
                                      jour,
                                      filiere_id: filiereId,
                                      semestre: "S1",
                                    },
                                  })
                                }
                                className="w-7 h-7 flex items-center justify-center bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-500 transition-colors"
                                title="Ajouter un cours"
                              >
                                <Plus size={16} />
                              </button>
                            )}
                          </h4>

                          <div className="space-y-3 min-h-[100px]">
                            {coursesForDay.map((cours) => (
                              <div
                                key={cours.id}
                                draggable={isEditingMode}
                                onDragStart={(e) =>
                                  handleDragStart(e, cours.id)
                                }
                                onDragEnd={handleDragEnd}
                                className={cn(
                                  "relative bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border transition-all",
                                  isEditingMode
                                    ? "cursor-grab active:cursor-grabbing border-slate-200 dark:border-slate-700 hover:border-amber-300 dark:hover:border-amber-600 shadow-sm hover:shadow"
                                    : "border-slate-100 dark:border-slate-800",
                                )}
                              >
                                {isEditingMode && (
                                  <div
                                    className="absolute top-2 right-2 flex gap-1 bg-white/90 dark:bg-slate-900/90 rounded-lg shadow-sm p-1 backdrop-blur-sm z-10 opacity-0 hover:opacity-100 focus-within:opacity-100 transition-opacity"
                                    style={{
                                      opacity: 1 /* Garder visible en dev pour confort */,
                                    }}
                                  >
                                    <button
                                      onClick={() =>
                                        setCourseModal({
                                          isOpen: true,
                                          item: cours,
                                        })
                                      }
                                      className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-md transition-colors"
                                      title="Modifier"
                                    >
                                      <Edit2 size={14} />
                                    </button>
                                    <button
                                      onClick={() =>
                                        handleDeleteCourse(cours.id)
                                      }
                                      className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                                      title="Supprimer"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                )}

                                <div className="flex justify-between items-start mb-2 pr-10">
                                  <span
                                    className={cn(
                                      "text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-widest",
                                      cours.type_cours === "CM"
                                        ? "bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400"
                                        : cours.type_cours === "TD"
                                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                                          : "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400",
                                    )}
                                  >
                                    {cours.type_cours}
                                  </span>
                                  <div className="flex items-center text-slate-500 text-[11px] font-bold font-mono">
                                    <Clock
                                      size={12}
                                      className="mr-1 opacity-70"
                                    />
                                    {cours.heure_debut.substring(0, 5)} -{" "}
                                    {cours.heure_fin.substring(0, 5)}
                                  </div>
                                </div>
                                <h5 className="font-extrabold text-slate-900 dark:text-white line-clamp-2 leading-snug mb-3">
                                  {cours.matiere?.nom || "Matière inconnue"}
                                </h5>

                                <div className="space-y-1.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                                  {cours.salle && (
                                    <div className="flex items-center gap-2">
                                      <MapPin
                                        size={14}
                                        className="text-slate-400 shrink-0"
                                      />
                                      <span className="truncate">
                                        {cours.salle}
                                      </span>
                                    </div>
                                  )}
                                  {cours.enseignant && (
                                    <div className="flex items-center gap-2">
                                      <User
                                        size={14}
                                        className="text-slate-400 shrink-0"
                                      />
                                      <span className="truncate">
                                        {cours.enseignant}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}

                            {isEditingMode && coursesForDay.length === 0 && (
                              <div className="h-24 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-slate-400 text-xs font-bold uppercase tracking-widest">
                                Déposer un cours
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Sous-Modale d'Edition/Ajout */}
          <CourseFormModal
            isOpen={courseModal.isOpen}
            onClose={() => setCourseModal({ isOpen: false, item: null })}
            item={courseModal.item}
            matieres={matieresData}
            filiereId={filiereId}
            onSuccess={(updatedCourse, isNew) => {
              setCourseModal({ isOpen: false, item: null });
              if (isNew) {
                setScheduleData((prev) =>
                  [...prev, updatedCourse].sort((a, b) =>
                    a.heure_debut.localeCompare(b.heure_debut),
                  ),
                );
              } else {
                setScheduleData((prev) =>
                  prev
                    .map((c) => (c.id === updatedCourse.id ? updatedCourse : c))
                    .sort((a, b) => a.heure_debut.localeCompare(b.heure_debut)),
                );
              }
            }}
          />
        </>
      )}
    </AnimatePresence>
  );
}

// -------------------------------------------------------------
// Composant Interne pour le Formulaire de Cours
// -------------------------------------------------------------
function CourseFormModal({
  isOpen,
  onClose,
  item,
  matieres,
  filiereId,
  onSuccess,
}) {
  const isEdit = !!(item && item.id);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    matiere_id: "",
    jour: "Lundi",
    heure_debut: "08:00",
    heure_fin: "10:00",
    salle: "",
    type_cours: "CM",
    enseignant: "",
    semestre: "S1",
    filiere_id: filiereId,
  });

  useEffect(() => {
    if (item) {
      setFormData({
        matiere_id:
          item.matiere_id || (matieres.length > 0 ? matieres[0].id : ""),
        jour: item.jour || "Lundi",
        heure_debut: item.heure_debut
          ? item.heure_debut.substring(0, 5)
          : "08:00",
        heure_fin: item.heure_fin ? item.heure_fin.substring(0, 5) : "10:00",
        salle: item.salle || "",
        type_cours: item.type_cours || "CM",
        enseignant: item.enseignant || "",
        semestre: item.semestre || "S1",
        filiere_id: filiereId,
      });
    }
  }, [item, matieres, filiereId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (isEdit) {
        const res = await departementService.updateEmploiTemps(
          item.id,
          formData,
        );
        onSuccess(res, false);
      } else {
        const res = await departementService.createEmploiTemps(formData);
        onSuccess(res, true);
      }
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message || "Erreur lors de la sauvegarde du cours.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[60] p-4 pointer-events-auto">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-6"
          >
            <h4 className="text-xl font-black text-slate-900 dark:text-white mb-6">
              {isEdit ? "Modifier le cours" : "Ajouter un cours"}
            </h4>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Matière
                </label>
                <select
                  required
                  value={formData.matiere_id}
                  onChange={(e) =>
                    setFormData({ ...formData, matiere_id: e.target.value })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 font-medium text-slate-900 dark:text-white"
                >
                  <option value="" disabled>
                    Sélectionnez une matière...
                  </option>
                  {matieres.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.nom} ({m.code})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Type
                  </label>
                  <select
                    value={formData.type_cours}
                    onChange={(e) =>
                      setFormData({ ...formData, type_cours: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 font-medium text-slate-900 dark:text-white"
                  >
                    <option value="CM">Cours Magistral (CM)</option>
                    <option value="TD">Travaux Dirigés (TD)</option>
                    <option value="TP">Travaux Pratiques (TP)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Jour
                  </label>
                  <select
                    value={formData.jour}
                    onChange={(e) =>
                      setFormData({ ...formData, jour: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 font-medium text-slate-900 dark:text-white"
                  >
                    {[
                      "Lundi",
                      "Mardi",
                      "Mercredi",
                      "Jeudi",
                      "Vendredi",
                      "Samedi",
                    ].map((j) => (
                      <option key={j} value={j}>
                        {j}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    H. Début
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.heure_debut}
                    onChange={(e) =>
                      setFormData({ ...formData, heure_debut: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 font-medium text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    H. Fin
                  </label>
                  <input
                    type="time"
                    required
                    value={formData.heure_fin}
                    onChange={(e) =>
                      setFormData({ ...formData, heure_fin: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 font-medium text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Salle (Optionnelle)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Amphi A, Salle 102..."
                    value={formData.salle}
                    onChange={(e) =>
                      setFormData({ ...formData, salle: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 font-medium text-slate-900 dark:text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                    Semestre
                  </label>
                  <select
                    value={formData.semestre}
                    onChange={(e) =>
                      setFormData({ ...formData, semestre: e.target.value })
                    }
                    className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 font-medium text-slate-900 dark:text-white"
                  >
                    <option value="S1">Semestre 1</option>
                    <option value="S2">Semestre 2</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  Enseignant (Optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Dr. Martin..."
                  value={formData.enseignant}
                  onChange={(e) =>
                    setFormData({ ...formData, enseignant: e.target.value })
                  }
                  className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl p-3 font-medium text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                  className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Save size={18} />
                  )}
                  Sauvegarder
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
