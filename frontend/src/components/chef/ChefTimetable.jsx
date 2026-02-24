import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, Upload } from "lucide-react";
import { cn } from "../../utils/cn";
import ScheduleViewerModal from "./ScheduleViewerModal";
import ImportEmploiModal from "./ImportEmploiModal";

export const ChefEmploiTemps = ({ data }) => {
  const [filter, setFilter] = useState("Toutes");
  const [viewModalData, setViewModalData] = useState({
    isOpen: false,
    filiereId: null,
    name: "",
  });
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const getCycleTheme = (base) => {
    const themes = {
      blue: {
        icon: "bg-blue-100 dark:bg-blue-500/20 text-blue-600",
        bg: "bg-blue-50/50 dark:bg-slate-800/50",
        btnEye: "text-blue-500 hover:text-blue-600",
      },
      purple: {
        icon: "bg-purple-100 dark:bg-purple-500/20 text-purple-600",
        bg: "bg-purple-50/50 dark:bg-slate-800/50",
        btnEye: "text-purple-500 hover:text-purple-600",
      },
      emerald: {
        icon: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600",
        bg: "bg-emerald-50/50 dark:bg-slate-800/50",
        btnEye: "text-emerald-500 hover:text-emerald-600",
      },
    };
    return themes[base] || themes.blue;
  };

  const filieres = data?.filieres || [];

  const groupedFilieres = filieres.reduce((acc, f) => {
    let cycle = "";
    let cycleType = "";
    let label = f.niveau || "";
    let cycleColor = "blue";
    let iconLabel = "L";

    if (label.startsWith("L")) {
      cycle = `Licence ${f.name || ""}`;
      cycleType = "Licence";
      cycleColor = "blue";
      iconLabel = "L";
    } else if (label.startsWith("M")) {
      cycle = `Master ${f.name || ""}`;
      cycleType = "Master";
      cycleColor = "purple";
      iconLabel = "M";
    } else {
      cycle = `BTS ${f.name || ""}`;
      cycleType = "BTS";
      cycleColor = "emerald";
      iconLabel = "BTS";
    }

    if (!acc[cycle]) {
      acc[cycle] = {
        name: cycle,
        type: cycleType,
        years: f.years || 1,
        theme: getCycleTheme(cycleColor),
        icon: iconLabel,
        items: [],
      };
    }

    acc[cycle].items.push({
      id: f.id,
      label: label,
      students: f.students || 0,
      has_emploi_temps: f.has_emploi_temps || false,
    });

    return acc;
  }, {});

  const groups = Object.values(groupedFilieres).filter(
    (g) => filter === "Toutes" || g.type === filter,
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Filters Header */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
      >
        <div>
          <h2 className="text-lg font-black font-display text-slate-900 dark:text-white uppercase tracking-tight">
            Gestion des emplois du temps
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Consultez et gérez les emplois du temps pour chaque filière et année
            d'études
          </p>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3 text-sm text-slate-500 font-medium">
            <span>Filière:</span>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 outline-none font-bold text-slate-700 dark:text-slate-200 cursor-pointer shadow-sm"
            >
              <option value="Toutes">Toutes</option>
              <option value="Licence">Licence</option>
              <option value="Master">Master</option>
              <option value="BTS">BTS</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map((group, idx) => (
          <motion.div
            key={idx}
            variants={itemVariants}
            className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col gap-6"
          >
            <div className="flex items-center gap-4">
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center font-bold text-xl",
                  group.theme.icon,
                )}
              >
                {group.icon}
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 dark:text-white">
                  {group.name}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {group.years} années d'études
                </p>
              </div>
            </div>
            <div className="space-y-3">
              {group.items
                .sort((a, b) => (a.label || "").localeCompare(b.label || ""))
                .map((item) => (
                  <div
                    key={item.id}
                    className={cn(
                      "rounded-xl p-4 flex items-center justify-between border border-transparent transition-colors",
                      group.theme.bg,
                    )}
                  >
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                        {item.label}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {item.students} étudiants
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      {item.has_emploi_temps ? (
                        <>
                          <span className="bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 text-xs px-2.5 py-1 rounded font-bold">
                            Publié
                          </span>
                          <button
                            onClick={() =>
                              setViewModalData({
                                isOpen: true,
                                filiereId: item.id,
                                name: `${group.name} - ${item.label}`,
                              })
                            }
                            className={cn(
                              "transition-transform hover:scale-110",
                              group.theme.btnEye,
                            )}
                            title="Voir l'emploi du temps"
                          >
                            <Eye size={22} />
                          </button>
                        </>
                      ) : (
                        <>
                          <span className="bg-rose-50 text-rose-600 dark:bg-rose-500/10 text-xs px-2.5 py-1 rounded font-bold">
                            Non défini
                          </span>
                          <button
                            onClick={() => setIsUploadModalOpen(true)}
                            className="text-emerald-500 hover:text-emerald-600 transition-colors"
                            title="Uploader emploi du temps"
                          >
                            <Upload size={18} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </motion.div>
        ))}
        {groups.length === 0 && (
          <div className="col-span-full py-10 flex flex-col items-center justify-center text-slate-500">
            <p className="font-bold">
              Aucune filière trouvée pour cette sélection.
            </p>
          </div>
        )}
      </div>

      <ScheduleViewerModal
        isOpen={viewModalData.isOpen}
        onClose={() => setViewModalData({ ...viewModalData, isOpen: false })}
        filiereId={viewModalData.filiereId}
        filiereName={viewModalData.name}
      />

      <ImportEmploiModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onSuccess={() => {
          setIsUploadModalOpen(false);
          // Un refresh de la query/donnée serait idéal ici, mais pour l'instant on ferme juste.
          window.location.reload(); // Simple refresh pour l'update immédiat
        }}
      />
    </motion.div>
  );
};
