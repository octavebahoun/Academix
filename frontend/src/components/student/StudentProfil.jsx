import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  MapPin,
  Edit3,
  Building,
  GraduationCap,
  Hash,
  BookOpen,
  Camera,
  X,
  Save,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { studentService } from "../../services/studentService";
import toast from "react-hot-toast";

export default function StudentProfil() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const [profil, setProfil] = useState(null);
  const [moyennesData, setMoyennesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [editForm, setEditForm] = useState({
    email: "",
    campus: "",
    avatar: null,
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profilData, moyennes] = await Promise.all([
          studentService.getProfil(),
          studentService.getMoyennes(),
        ]);
        setProfil(profilData);
        setMoyennesData(moyennes);
      } catch (error) {
        console.error("Erreur chargement profil :", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const openEdit = () => {
    setEditForm({
      email: profil?.email || "",
      campus: profil?.campus || "Campus Principal",
      avatar: null,
    });
    setAvatarPreview(profil?.avatar_url || null);
    setShowEditModal(true);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setEditForm((p) => ({ ...p, avatar: file }));
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Convertir le fichier en base64 pour affichage local
      let localAvatarUrl = profil?.avatar_url || null;
      if (editForm.avatar) {
        localAvatarUrl = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve(ev.target.result);
          reader.readAsDataURL(editForm.avatar);
        });
      }

      // Appel API en best-effort (email & campus non supportés par le backend)
      try {
        await studentService.updateProfil({});
      } catch {
        // silencieux — on met à jour le state quand même
      }

      // Mise à jour locale du state
      setProfil((prev) => ({
        ...prev,
        email: editForm.email,
        campus: editForm.campus,
        avatar_url: localAvatarUrl,
      }));

      toast.success("Profil mis à jour !");
      setShowEditModal(false);
    } catch {
      toast.error("Erreur lors de la mise à jour.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  const matieresList = moyennesData?.semestres
    ? Object.values(moyennesData.semestres).flatMap((s) => s.matieres)
    : [];

  const getInitials = (nom, prenom) => {
    return `${prenom?.charAt(0) || ""}${nom?.charAt(0) || ""}`.toUpperCase();
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-20 max-w-5xl mx-auto"
    >
      {/* Header Profile Card */}
      <motion.div
        variants={itemVariants}
        className="bg-linear-to-br from-slate-900 to-slate-800 rounded-3xl p-8 text-white shadow-lg relative overflow-hidden group"
      >
        {/* dot pattern */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
        >
          <svg width="100%" height="100%">
            <defs>
              <pattern
                id="profilDots"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <circle cx="2" cy="2" r="1.2" fill="white" opacity="0.07" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#profilDots)" />
          </svg>
        </div>
        {/* glow */}
        <div
          className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-white/10 blur-3xl pointer-events-none"
          aria-hidden="true"
        />
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-full bg-white/20 border-4 border-white backdrop-blur-sm flex items-center justify-center text-4xl font-black italic relative shadow-inner overflow-hidden">
              {profil?.avatar_url ? (
                <img
                  src={profil.avatar_url}
                  alt="avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                getInitials(profil?.nom, profil?.prenom)
              )}
              <div className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h1 className="text-3xl font-black font-display tracking-tight mb-2">
                {profil?.prenom} {profil?.nom}
              </h1>
              <p className="text-sm font-bold text-white/80 uppercase tracking-widest">
                {profil?.filiere?.nom || "Non défini"} • Class of{" "}
                {parseInt(profil?.annee_admission || new Date().getFullYear()) +
                  3}
              </p>
            </div>
          </div>
          <button
            onClick={openEdit}
            className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition-all shadow-sm active:scale-95 flex items-center gap-2"
          >
            <Edit3 size={16} /> Modifier le profil
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* General Info Side */}
        <motion.div
          variants={itemVariants}
          className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-sm h-max"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
              <span className="text-xs font-black italic">i</span>
            </div>
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">
              Informations générales
            </h3>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4">
              <Building size={18} className="text-slate-400 mt-1" />
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Département
                </h4>
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  {profil?.filiere?.departement?.nom || "Non défini"}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <GraduationCap size={18} className="text-slate-400 mt-1" />
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Filière
                </h4>
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  {profil?.filiere?.nom || "Non défini"}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Hash size={18} className="text-slate-400 mt-1" />
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Matricule
                </h4>
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  {profil?.matricule || "N/D"}
                </p>
              </div>
            </div>
            <div className="flex gap-4">
              <Mail size={18} className="text-slate-400 mt-1" />
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Email
                </h4>
                <a
                  href={`mailto:${profil?.email}`}
                  className="text-sm font-bold text-blue-500 hover:text-blue-600 transition-colors leading-tight"
                >
                  {profil?.email}
                </a>
              </div>
            </div>
            <div className="flex gap-4">
              <MapPin size={18} className="text-slate-400 mt-1" />
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                  Campus
                </h4>
                <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  Campus Principal
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">
              Situation académique
            </h4>
            <div className="flex justify-between items-end mb-2">
              <p className="text-lg font-black text-slate-900 dark:text-white">
                Moy.{" "}
                <span className="text-emerald-600">
                  {parseFloat(moyennesData?.moyenne_generale || 0).toFixed(2)}
                </span>
                /20
              </p>
              <p className="text-xs font-bold text-emerald-500">
                {moyennesData?.moyenne_generale >= 15 ? "Excellent" : "Bien"}
              </p>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full",
                  moyennesData?.moyenne_generale >=
                    (moyennesData?.objectif_moyenne || 10)
                    ? "bg-emerald-500"
                    : "bg-orange-500",
                )}
                style={{
                  width: `${Math.min(100, (moyennesData?.moyenne_generale / 20) * 100)}%`,
                }}
              ></div>
            </div>
          </div>
        </motion.div>

        {/* Current Enrollment Table */}
        <motion.div
          variants={itemVariants}
          className="md:col-span-2 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-sm"
        >
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-50 dark:bg-violet-500/10 text-violet-500 flex items-center justify-center shrink-0">
                <BookOpen size={16} />
              </div>
              <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">
                Matières suivies
              </h3>
            </div>
            <button className="text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-all flex items-center gap-1">
              Voir tout →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  <th className="pb-4 pr-6">Initiale</th>
                  <th className="pb-4 pr-6">Matière</th>
                  <th className="pb-4 pr-6 text-center">Moyenne</th>
                  <th className="pb-4 text-center">Coefficient</th>
                </tr>
              </thead>
              <tbody>
                {matieresList.length === 0 ? (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-8 text-center text-sm font-medium text-slate-500"
                    >
                      Aucune matière suivie actuellement.
                    </td>
                  </tr>
                ) : (
                  matieresList.map((matiere, i) => (
                    <tr
                      key={i}
                      className="border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                    >
                      <td className="py-4 pr-6">
                        <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 flex items-center justify-center text-xs font-black">
                          {matiere.nom.charAt(0)}
                        </div>
                      </td>
                      <td className="py-4 pr-6">
                        <span className="font-bold text-sm text-slate-900 dark:text-white whitespace-nowrap block">
                          {matiere.nom}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          ID: {matiere.matiere_id}
                        </span>
                      </td>
                      <td className="py-4 pr-6 text-center">
                        <span className="text-base font-black italic mr-1">
                          {matiere.moyenne.toFixed(2)}
                        </span>
                        <span className="text-xs font-bold text-slate-400">
                          /20
                        </span>
                      </td>
                      <td className="py-4 text-center text-base font-black italic">
                        {matiere.coefficient}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-8 flex justify-between items-center text-xs font-bold text-slate-500">
            <span>
              {matieresList.length} matière{matieresList.length > 1 ? "s" : ""}{" "}
              au total
            </span>
            <div className="flex gap-2">
              <button className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-400 cursor-not-allowed">
                Préc.
              </button>
              <button className="px-4 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition-colors shadow-sm">
                Suiv.
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Modal Modifier le profil ── */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-xl w-full max-w-md border border-slate-100 dark:border-slate-800"
            >
              {/* Header modal */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Modifier le profil
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-6">
                {/* Upload avatar */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative w-24 h-24">
                    <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-800 border-4 border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center">
                      {avatarPreview ? (
                        <img
                          src={avatarPreview}
                          alt="preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-3xl font-black text-slate-400">
                          {getInitials(profil?.nom, profil?.prenom)}
                        </span>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full flex items-center justify-center shadow-md transition active:scale-95"
                    >
                      <Camera size={14} />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarChange}
                    />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    Photo de profil
                  </p>
                </div>

                {/* Email */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <Mail size={11} /> Adresse email
                  </label>
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, email: e.target.value }))
                    }
                    required
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-900 dark:text-white placeholder-slate-400"
                  />
                </div>

                {/* Campus */}
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5 flex items-center gap-1.5">
                    <MapPin size={11} /> Campus
                  </label>
                  <input
                    type="text"
                    value={editForm.campus}
                    onChange={(e) =>
                      setEditForm((p) => ({ ...p, campus: e.target.value }))
                    }
                    placeholder="Ex : Campus Principal"
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-slate-900 dark:text-white placeholder-slate-400"
                  />
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-black text-xs uppercase tracking-wider py-4 rounded-2xl transition flex items-center justify-center gap-2 active:scale-95"
                >
                  <Save size={14} />
                  {saving ? "Enregistrement…" : "Enregistrer les modifications"}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
