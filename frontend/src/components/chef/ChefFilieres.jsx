import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  MoreVertical,
  Plus,
  Users,
  BookOpen,
  GraduationCap,
  X,
  Pencil,
  Trash2,
  UserPlus,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { useState, useEffect, useRef } from "react";
import { laravelApiClient } from "../../api/client";
import { toast } from "react-hot-toast";
import AddFiliereModal from "./AddFiliereModal";
import EditFiliereModal from "./EditFiliereModal";
import AddEtudiantModal from "./AddEtudiantModal";
import ImportEtudiantsModal from "./ImportEtudiantsModal";
import ImportEmploiModal from "./ImportEmploiModal";

export default function ChefFilieres({
  initialFiliereId = null,
  onInitialFiliereConsumed,
}) {
  const [filieres, setFilieres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isImportEmploiModalOpen, setIsImportEmploiModalOpen] = useState(false);
  const [selectedFiliere, setSelectedFiliere] = useState(null);
  const [activeTab, setActiveTab] = useState("matieres");
  const [tabData, setTabData] = useState({
    matieres: [],
    etudiants: [],
    emploi: [],
    loading: false,
  });
  // Dropdown menu
  const [openMenuId, setOpenMenuId] = useState(null);
  const menuRef = useRef(null);
  // Edit / Delete filière
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [filiereToEdit, setFiliereToEdit] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  // Ajouter étudiant
  const [isAddEtudiantModalOpen, setIsAddEtudiantModalOpen] = useState(false);
  const [filiereForEtudiant, setFiliereForEtudiant] = useState(null);

  useEffect(() => {
    if (selectedFiliere) {
      fetchTabData(selectedFiliere.id, activeTab);
    }
  }, [selectedFiliere, activeTab]);

  const fetchTabData = async (filiereId, type) => {
    if (type === "emploi") type = "emploi-temps";
    setTabData((prev) => ({ ...prev, loading: true }));
    try {
      const response = await laravelApiClient.get(
        `/departement/filieres/${filiereId}/${type}`,
      );
      // L'API etudiants retourne une pagination (response.data.data), matieres retourne un tableau (response.data)
      const data =
        type === "etudiants" ? response.data.data || [] : response.data || [];
      const stateKey = type === "emploi-temps" ? "emploi" : type;
      setTabData((prev) => ({ ...prev, [stateKey]: data, loading: false }));
    } catch (error) {
      console.error(`Erreur chargement ${type}:`, error);
      setTabData((prev) => ({ ...prev, loading: false }));
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    fetchFilieres();
  }, []);

  const fetchFilieres = async () => {
    setLoading(true);
    try {
      const response = await laravelApiClient.get("/departement/filieres");
      setFilieres(response.data);
    } catch (error) {
      console.error("Erreur filières:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fermer le dropdown si on clique en dehors
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEditFiliere = (filiere) => {
    setFiliereToEdit(filiere);
    setIsEditModalOpen(true);
    setOpenMenuId(null);
  };

  const handleDeleteFiliere = async (filiere) => {
    if (
      !confirm(
        `Supprimer la filière "${filiere.nom}" ? Cette action est irréversible.`,
      )
    )
      return;
    setIsDeleting(true);
    setOpenMenuId(null);
    try {
      await laravelApiClient.delete(`/departement/filieres/${filiere.id}`);
      toast.success("Filière supprimée avec succès");
      if (selectedFiliere?.id === filiere.id) setSelectedFiliere(null);
      fetchFilieres();
    } catch (error) {
      const message =
        error.response?.data?.message || "Erreur lors de la suppression";
      toast.error(message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddEtudiant = (filiere) => {
    setFiliereForEtudiant(filiere);
    setIsAddEtudiantModalOpen(true);
  };

  // Auto-ouvre la filière ciblée depuis ChefOverview
  useEffect(() => {
    if (initialFiliereId != null && filieres.length > 0) {
      const target = filieres.find((f) => f.id === initialFiliereId);
      if (target) {
        setSelectedFiliere(target);
        // Scroll vers la filière après un court délai
        setTimeout(() => {
          const el = document.getElementById(`filiere-${target.id}`);
          el?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 200);
      }
      onInitialFiliereConsumed?.();
    }
  }, [initialFiliereId, filieres]);

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6 pb-12"
      >
        {/* Header Section */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h2 className="text-lg font-black font-display text-slate-900 dark:text-white uppercase tracking-tight">
              Gestion des Filières
            </h2>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
              {filieres.length} Programmes d'études
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <button
              onClick={() => setIsImportModalOpen(true)}
              className="flex-1 md:flex-none border border-emerald-600 text-emerald-600 dark:border-emerald-500 dark:text-emerald-400 font-bold text-xs px-4 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-600 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-white transition-all active:scale-95"
            >
              <Upload size={16} /> Import Étudiants
            </button>
            <button
              onClick={() => {
                setFiliereForEtudiant(null);
                setIsAddEtudiantModalOpen(true);
              }}
              className="flex-1 md:flex-none bg-emerald-500 text-white font-bold text-xs px-4 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-md shadow-emerald-500/20 active:scale-95"
            >
              <UserPlus size={16} /> Ajouter Étudiant
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex-1 md:flex-none bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs px-4 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-700 hover:text-white dark:hover:bg-emerald-600 dark:hover:text-slate-900 transition-all shadow-md active:scale-95"
            >
              <Plus size={16} /> Nouvelle Filière
            </button>
          </div>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 xl:grid-cols-2 gap-6"
          >
            {filieres.map((filiere) => (
              <motion.div
                key={filiere.id}
                id={`filiere-${filiere.id}`}
                variants={itemVariants}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-black text-xl group-hover:scale-105 transition-transform">
                        {filiere.niveau?.charAt(0) || "F"}
                      </div>
                      <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white uppercase tracking-tight">
                          {filiere.nom}
                        </h3>
                        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mt-0.5">
                          {filiere.code} • {filiere.annee_academique}
                        </p>
                      </div>
                    </div>
                    <div
                      className="relative"
                      ref={openMenuId === filiere.id ? menuRef : null}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuId(
                            openMenuId === filiere.id ? null : filiere.id,
                          );
                        }}
                        className="text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <MoreVertical size={20} />
                      </button>

                      <AnimatePresence>
                        {openMenuId === filiere.id && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: -4 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: -4 }}
                            transition={{ duration: 0.12 }}
                            className="absolute right-0 top-8 z-50 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden min-w-40"
                          >
                            <button
                              onClick={() => handleEditFiliere(filiere)}
                              className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-amber-500/10 hover:text-amber-600 dark:hover:text-amber-400 transition-colors uppercase tracking-widest"
                            >
                              <Pencil size={14} />
                              Modifier
                            </button>
                            <button
                              onClick={() => handleDeleteFiliere(filiere)}
                              disabled={isDeleting}
                              className="flex items-center gap-3 w-full px-4 py-3 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400 transition-colors uppercase tracking-widest disabled:opacity-50"
                            >
                              <Trash2 size={14} />
                              Supprimer
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-6">
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <p className="text-lg font-black text-slate-900 dark:text-white">
                        {filiere.users_count || 0}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        Étudiants
                      </p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <p className="text-lg font-black text-slate-900 dark:text-white">
                        {filiere.matieres_count || 0}
                      </p>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        Matières
                      </p>
                    </div>
                    <div className="text-center p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                      <span className="text-[10px] font-black text-emerald-500 uppercase">
                        Actif
                      </span>
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                        Statut
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="flex -space-x-2">
                        {["A", "B", "C"].map((letter, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-full border-2 border-white dark:border-slate-900 bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-black text-[10px]"
                          >
                            {letter}
                          </div>
                        ))}
                      </div>
                      {filiere.users_count > 0 && (
                        <span className="text-[10px] font-bold text-slate-400">
                          +{filiere.users_count} étudiant
                          {filiere.users_count > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() =>
                        setSelectedFiliere(
                          selectedFiliere?.id === filiere.id ? null : filiere,
                        )
                      }
                      className="bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-[10px] px-4 py-2 rounded-lg uppercase tracking-widest hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all border border-slate-200 dark:border-slate-700"
                    >
                      {selectedFiliere?.id === filiere.id
                        ? "Fermer Détails"
                        : "Voir Détails"}
                    </button>
                  </div>

                  {selectedFiliere?.id === filiere.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      className="mt-6 pt-6 border-t border-slate-50 dark:border-slate-800"
                    >
                      <div className="flex gap-4 mb-4">
                        <button
                          onClick={() => setActiveTab("matieres")}
                          className={cn(
                            "text-[10px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all",
                            activeTab === "matieres"
                              ? "border-emerald-500 text-emerald-500"
                              : "border-transparent text-slate-400",
                          )}
                        >
                          Matières
                        </button>
                        <button
                          onClick={() => setActiveTab("etudiants")}
                          className={cn(
                            "text-[10px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all",
                            activeTab === "etudiants"
                              ? "border-emerald-500 text-emerald-500"
                              : "border-transparent text-slate-400",
                          )}
                        >
                          Étudiants
                        </button>
                        <button
                          onClick={() => setActiveTab("emploi")}
                          className={cn(
                            "text-[10px] font-black uppercase tracking-widest pb-1 border-b-2 transition-all",
                            activeTab === "emploi"
                              ? "border-emerald-500 text-emerald-500"
                              : "border-transparent text-slate-400",
                          )}
                        >
                          Emploi du Temps
                        </button>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-800/30 rounded-xl p-4 min-h-25">
                        {tabData.loading ? (
                          <div className="flex justify-center items-center h-full pt-4">
                            <div className="w-6 h-6 border-2 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                          </div>
                        ) : activeTab === "emploi" &&
                          tabData.emploi.length === 0 ? (
                          <div className="text-center space-y-4 pt-4">
                            <p className="text-[10px] font-bold text-slate-400 uppercase italic">
                              Aucun emploi du temps publié
                            </p>
                            <button
                              onClick={() => setIsImportEmploiModalOpen(true)}
                              className="flex items-center justify-center gap-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-emerald-600 transition-all mx-auto"
                            >
                              <Upload size={14} /> Upload Planning
                            </button>
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                            {activeTab === "etudiants" &&
                              tabData.etudiants.length === 0 && (
                                <div className="text-center space-y-3 py-4">
                                  <p className="text-[10px] font-bold text-slate-400 uppercase italic">
                                    Aucun étudiant inscrit.
                                  </p>
                                  <button
                                    onClick={() => handleAddEtudiant(filiere)}
                                    className="flex items-center justify-center gap-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-lg hover:bg-emerald-600 transition-all mx-auto"
                                  >
                                    <UserPlus size={14} /> Ajouter un étudiant
                                  </button>
                                </div>
                              )}
                            {activeTab === "matieres" &&
                              tabData.matieres.length === 0 && (
                                <p className="text-[10px] text-center font-bold text-slate-400 py-4">
                                  Aucune matière assignée.
                                </p>
                              )}

                            {activeTab === "emploi" && (
                              <div className="flex justify-between items-center mb-2">
                                <p className="text-[10px] font-bold text-slate-400 uppercase">
                                  Planning Actuel
                                </p>
                                <button
                                  onClick={() =>
                                    setIsImportEmploiModalOpen(true)
                                  }
                                  className="text-[10px] font-bold text-emerald-500 hover:text-emerald-600 uppercase flex items-center gap-1"
                                >
                                  <Upload size={12} /> Remplacer CSV
                                </button>
                              </div>
                            )}

                            {activeTab === "emploi" &&
                              tabData.emploi.map((cours) => (
                                <div
                                  key={cours.id}
                                  className="flex justify-between items-center p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm"
                                >
                                  <div className="flex flex-col">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                                      {cours.matiere?.nom || "Matière Inconnue"}{" "}
                                      •{" "}
                                      <span className="text-emerald-500">
                                        {cours.type_cours}
                                      </span>
                                    </p>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-0.5">
                                      {cours.jour} |{" "}
                                      {cours.heure_debut.slice(0, 5)} -{" "}
                                      {cours.heure_fin.slice(0, 5)} | Salle:{" "}
                                      {cours.salle || "N/A"}
                                    </p>
                                  </div>
                                </div>
                              ))}

                            {activeTab === "etudiants" &&
                              tabData.etudiants.length > 0 && (
                                <div className="flex justify-end mb-2">
                                  <button
                                    onClick={() => handleAddEtudiant(filiere)}
                                    className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700 transition-colors"
                                  >
                                    <UserPlus size={13} /> Ajouter
                                  </button>
                                </div>
                              )}

                            {activeTab === "etudiants" &&
                              tabData.etudiants.map((etud) => (
                                <div
                                  key={etud.id}
                                  className="flex justify-between items-center p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm"
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 font-bold text-xs">
                                      {etud.nom.charAt(0)}
                                      {etud.prenom.charAt(0)}
                                    </div>
                                    <div>
                                      <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                                        {etud.nom} {etud.prenom}
                                      </p>
                                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
                                        {etud.matricule}
                                      </p>
                                    </div>
                                  </div>
                                  <span className="text-[9px] px-2 py-1 rounded-full font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10">
                                    Actif
                                  </span>
                                </div>
                              ))}

                            {activeTab === "matieres" &&
                              tabData.matieres.map((mat) => (
                                <div
                                  key={mat.id}
                                  className="flex justify-between items-center p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-sm"
                                >
                                  <div className="flex flex-col">
                                    <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                                      {mat.nom}
                                    </p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">
                                      {mat.code}
                                    </p>
                                  </div>
                                </div>
                              ))}
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </motion.div>

      <AddFiliereModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={fetchFilieres}
      />

      <EditFiliereModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setFiliereToEdit(null);
        }}
        onSuccess={fetchFilieres}
        filiere={filiereToEdit}
      />

      <AddEtudiantModal
        isOpen={isAddEtudiantModalOpen}
        onClose={() => {
          setIsAddEtudiantModalOpen(false);
          setFiliereForEtudiant(null);
        }}
        onSuccess={() => {
          if (selectedFiliere) fetchTabData(selectedFiliere.id, "etudiants");
          fetchFilieres();
        }}
        filiere={filiereForEtudiant}
      />

      <ImportEtudiantsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={fetchFilieres}
      />

      <ImportEmploiModal
        isOpen={isImportEmploiModalOpen}
        onClose={() => setIsImportEmploiModalOpen(false)}
        onSuccess={() => {
          if (selectedFiliere) {
            fetchTabData(selectedFiliere.id, "emploi-temps");
          }
        }}
      />
    </>
  );
}
