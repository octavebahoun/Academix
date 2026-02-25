import { motion } from "framer-motion";
import {
  Building2,
  GraduationCap,
  GraduationCap as FiliereIcon,
  ShieldAlert,
  Download,
  Users,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { useState, useEffect } from "react";
import { laravelApiClient } from "../../api/client";

export default function AdminOverview() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await laravelApiClient.get("/admin/stats/dashboard");
      setDashboardData(response.data);
    } catch (error) {
      console.error("Erreur dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    {
      label: "DÉPARTEMENTS ACTIFS",
      value: dashboardData?.resume?.total_departements || 0,
      icon: Building2,
      color: "bg-emerald-50 text-emerald-500",
    },
    {
      label: "TOTAL ÉTUDIANTS",
      value: dashboardData?.resume?.total_etudiants || 0,
      icon: GraduationCap,
      color: "bg-blue-50 text-blue-500",
    },
    {
      label: "FILIÈRES TOTAL",
      value: dashboardData?.resume?.total_filieres || 0,
      icon: FiliereIcon,
      color: "bg-orange-50 text-orange-500",
    },
    {
      label: "CHEFS DE DÉPT",
      value: dashboardData?.resume?.total_chefs || 0,
      icon: Users,
      color: "bg-purple-50 text-purple-500",
    },
  ];

  const auditLogs = [
    {
      admin: "Système",
      initials: "SY",
      action: "Bienvenue",
      target: "Admin Dashboard",
      date: "MAINTENANT",
      status: "ACTIF",
      statusColor: "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10",
      initialsColor: "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-600",
    },
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Stats Cards */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
      >
        {loading
          ? Array(4)
              .fill(0)
              .map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 h-40 animate-pulse"
                />
              ))
          : stats.map((stat, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm hover:shadow-xl hover:translate-y-[-4px] transition-all"
              >
                <div
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center mb-6",
                    stat.color,
                  )}
                >
                  <stat.icon size={24} />
                </div>
                <div>
                  <h3 className="text-4xl font-black font-display text-slate-900 dark:text-white mb-2 italic">
                    {stat.value}
                  </h3>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                    {stat.label}
                  </p>
                </div>
              </div>
            ))}
      </motion.div>

      {/* Audit Journal */}
      <motion.div
        variants={itemVariants}
        className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-sm"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-100 dark:border-slate-800 pb-6">
          <div>
            <h2 className="text-2xl font-black font-display text-slate-900 dark:text-white uppercase tracking-tight italic">
              Journal de Bord
            </h2>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
              Activités globales de la plateforme
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-[10px] px-5 py-3 rounded-xl uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-lg active:scale-95"
          >
            Exporter PDF
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="pb-4 pr-6">Administrateur</th>
                <th className="pb-4 pr-6">Action</th>
                <th className="pb-4 pr-6">Cible</th>
                <th className="pb-4 pr-6">Date</th>
                <th className="pb-4 text-right">Statut</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((log, i) => (
                <tr
                  key={i}
                  className="border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                >
                  <td className="py-5 pr-6">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0",
                          log.initialsColor,
                        )}
                      >
                        {log.initials}
                      </div>
                      <span className="font-black text-sm text-slate-900 dark:text-white whitespace-nowrap">
                        {log.admin}
                      </span>
                    </div>
                  </td>
                  <td className="py-5 pr-6 text-sm font-bold text-slate-700 dark:text-slate-300 italic">
                    {log.action}
                  </td>
                  <td className="py-5 pr-6 text-xs font-black text-slate-400 uppercase tracking-widest">
                    {log.target}
                  </td>
                  <td className="py-5 pr-6 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">
                    {log.date}
                  </td>
                  <td className="py-5 text-right">
                    <span
                      className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full inline-block",
                        log.statusColor,
                      )}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
}
