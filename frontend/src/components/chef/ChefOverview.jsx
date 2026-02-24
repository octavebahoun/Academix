import { motion } from "framer-motion";
import {
  BookOpen,
  Users,
  LayoutList,
  TrendingUp,
  Download,
  Calendar,
  FileText,
  Plus,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { authService } from "../../services/authService";

export default function ChefOverview({ data, onTabChange }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const dept = data?.resume?.departement || {};
  const resume = data?.resume || {};
  const filieres = data?.filieres || [];

  const stats = [
    {
      label: "FILIÈRES",
      value: resume.total_filieres || 0,
      icon: BookOpen,
      color: "bg-blue-50 text-blue-500",
    },
    {
      label: "ÉTUDIANTS",
      value: resume.total_etudiants || 0,
      icon: Users,
      color: "bg-purple-50 text-purple-500",
    },
    {
      label: "MATIÈRES",
      value: resume.total_matieres || 0,
      icon: LayoutList,
      color: "bg-orange-50 text-orange-500",
    },
    {
      label: "MOYENNE GÉNÉRALE",
      value: `${resume.moyenne_generale || 0}/20`,
      icon: TrendingUp,
      color: "bg-emerald-50 text-emerald-500",
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Banner */}
      <motion.div
        variants={itemVariants}
        className="w-full bg-gradient-to-r from-emerald-500 to-blue-600 rounded-2xl p-8 flex justify-between items-center text-white shadow-lg"
      >
        <div>
          <h2 className="text-3xl font-bold font-display">
            Département {dept.nom || "Chargement..."}
          </h2>
          <p className="opacity-90 mt-1 font-medium">
            Code: {dept.code || "..."} • Chef:{" "}
            {authService.getCurrentUser()?.prenom}{" "}
            {authService.getCurrentUser()?.nom}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm opacity-80 uppercase tracking-widest font-bold">
            Année académique
          </p>
          <p className="text-2xl font-black">2025-2026</p>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {stats.map((stat, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow"
          >
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                stat.color,
              )}
            >
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                {stat.label}
              </p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white mt-1">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Filières du Département */}
        <motion.div variants={itemVariants} className="xl:col-span-2">
          <div className="mb-4">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Filières du Département
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {resume.total_filieres || 0} filières actives -{" "}
              {resume.total_etudiants || 0} étudiants au total
            </p>
          </div>
          <div className="space-y-4">
            {filieres.map((filiere, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm hover:border-emerald-200 transition-colors cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center font-bold",
                      filiere.color,
                    )}
                  >
                    {filiere.initial}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors">
                      {filiere.name}
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                      {filiere.years} années • {filiere.students} étudiants •{" "}
                      {filiere.matieres} matières
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 text-xs px-3 py-1 rounded-full font-bold">
                    Actif
                  </span>
                  <div className="w-8 h-8 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center text-slate-400">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="w-4 h-4"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Sidebar Widgets */}
        <div className="space-y-6">
          {/* Stats Département */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm"
          >
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">
              Stats Département
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  Taux de Réussite
                </span>
                <span className="font-bold text-emerald-500">82.4%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  Moyenne Générale
                </span>
                <span className="font-bold text-blue-500">
                  {resume.moyenne_generale || 0}/20
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  Taux Assiduité
                </span>
                <span className="font-bold text-purple-500">91.8%</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  Abandons
                </span>
                <span className="font-bold text-red-500">3.2%</span>
              </div>
            </div>
          </motion.div>

          {/* Actions Rapides */}
          <motion.div
            variants={itemVariants}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm"
          >
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4">
              Actions Rapides
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => onTabChange("import")}
                className="w-full bg-slate-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-50 transition-colors"
              >
                <Download size={16} /> Import CSV
              </button>
              <button
                onClick={() => onTabChange("emploi-temps")}
                className="w-full bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-purple-100 transition-colors"
              >
                <Calendar size={16} /> Emploi du Temps
              </button>
              <button
                onClick={() => window.print()}
                className="w-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
              >
                <FileText size={16} /> Rapports
              </button>
            </div>
          </motion.div>

          {/* Ajouter Filière */}
          <motion.div
            variants={itemVariants}
            className="bg-emerald-50 dark:bg-slate-900 border border-emerald-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm"
          >
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tight">
              Ajouter Filière
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 mb-4">
              Créer une nouvelle filière dans ce département
            </p>
            <button
              onClick={() => onTabChange("filieres")}
              className="w-full bg-emerald-500 text-white font-bold text-sm py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-600 transition-all shadow-md active:scale-95"
            >
              <Plus size={16} /> Nouvelle Filière
            </button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
