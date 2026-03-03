import { motion } from "framer-motion";
import {
  Building2,
  GraduationCap,
  BookOpen,
  Users,
  Activity,
  Download,
  CheckCircle2,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { useState, useEffect } from "react";
import { laravelApiClient } from "../../api/client";
import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { Separator } from "../ui/separator";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// ─── Animation Variants ────────────────────────────────────────────────────
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.04 },
  },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 24 },
  },
};

// ─── Decorative SVGs ───────────────────────────────────────────────────────
function GridSVG() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      className="absolute -right-2 -bottom-2 w-24 h-24 pointer-events-none text-slate-300 dark:text-slate-600"
    >
      {[30, 50, 70, 90].map((v) => (
        <g key={v}>
          <line
            x1={v}
            y1="30"
            x2={v}
            y2="100"
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <line
            x1="30"
            y1={v}
            x2="100"
            y2={v}
            stroke="currentColor"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>
      ))}
    </svg>
  );
}
function CircleClusterSVG() {
  const pos = [
    [68, 68],
    [82, 68],
    [75, 80],
    [68, 82],
    [88, 78],
    [82, 86],
    [70, 92],
    [88, 88],
  ];
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      className="absolute -right-2 -bottom-2 w-24 h-24 pointer-events-none text-slate-300 dark:text-slate-600"
    >
      {pos.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="5" fill="currentColor" />
      ))}
    </svg>
  );
}
function NodeNetworkSVG() {
  const nodes = [
    [70, 70],
    [88, 60],
    [95, 82],
    [78, 92],
    [60, 85],
  ];
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      className="absolute -right-2 -bottom-2 w-24 h-24 pointer-events-none text-slate-300 dark:text-slate-600"
    >
      {nodes.map(([x1, y1], i) =>
        nodes
          .slice(i + 1)
          .map(([x2, y2], j) => (
            <line
              key={`${i}-${j}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth="3"
            />
          )),
      )}
      {nodes.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="5" fill="currentColor" />
      ))}
    </svg>
  );
}
function ShieldSVG() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      className="absolute -right-2 -bottom-2 w-24 h-24 pointer-events-none text-slate-300 dark:text-slate-600"
    >
      <path
        d="M75 35 L75 62 Q75 80 60 88 Q45 80 45 62 L45 35 L60 29 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AdminOverview() {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const resume = dashboardData?.resume || {};

  const stats = [
    {
      label: "Départements",
      value: resume.total_departements ?? 0,
      sub: "Actifs sur la plateforme",
      Icon: Building2,
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      Decoration: GridSVG,
    },
    {
      label: "Étudiants",
      value: resume.total_etudiants ?? 0,
      sub: "Inscrits cette année",
      Icon: GraduationCap,
      iconBg: "bg-blue-50 dark:bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
      Decoration: CircleClusterSVG,
    },
    {
      label: "Filières",
      value: resume.total_filieres ?? 0,
      sub: "Formations disponibles",
      Icon: BookOpen,
      iconBg: "bg-orange-50 dark:bg-orange-500/10",
      iconColor: "text-orange-600 dark:text-orange-400",
      Decoration: NodeNetworkSVG,
    },
    {
      label: "Chefs de Dépt.",
      value: resume.total_chefs ?? 0,
      sub: "Responsables assignés",
      Icon: Users,
      iconBg: "bg-purple-50 dark:bg-purple-500/10",
      iconColor: "text-purple-600 dark:text-purple-400",
      Decoration: ShieldSVG,
    },
  ];

  const barData = (dashboardData?.departements_stats ?? []).map((d) => ({
    name: (d.code || d.nom || "?").substring(0, 8),
    value: d.total_etudiants || 0,
  }));

  const systemHealth = [
    { label: "Service d'import CSV", ok: true },
    { label: "Module IA", ok: !!dashboardData },
  ];

  const typeImportLabel = {
    import_notes: "Import Notes",
    import_etudiants: "Import Étudiants",
    import_emploi_temps: "Import Emploi du Temps",
  };
  const auditLogs = (dashboardData?.derniers_imports ?? []).map((log) => {
    const adminName = log.admin
      ? `${log.admin.prenom ?? ""} ${log.admin.nom ?? ""}`.trim()
      : "Système";
    const initials =
      adminName
        .split(" ")
        .filter(Boolean)
        .map((w) => w[0])
        .join("")
        .substring(0, 2)
        .toUpperCase() || "SY";
    const isSuccess = log.statut === "success" || log.statut === "termine";
    const isError = log.statut === "error" || log.statut === "echec";
    const date = log.created_at
      ? new Date(log.created_at).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "short",
          hour: "2-digit",
          minute: "2-digit",
        })
      : "—";
    return {
      admin: adminName,
      initials,
      action: typeImportLabel[log.type_import] ?? log.type_import ?? "Import",
      target: log.fichier_nom ?? "—",
      date,
      status: isSuccess ? "Succès" : isError ? "Erreur" : "En cours",
      statusColor: isSuccess
        ? "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10"
        : isError
          ? "text-red-600 bg-red-50 dark:bg-red-500/10"
          : "text-orange-600 bg-orange-50 dark:bg-orange-500/10",
      initialsColor:
        "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
    };
  });

  // ── Skeleton ────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div
        className="space-y-6"
        aria-busy="true"
        aria-label="Chargement du tableau de bord admin…"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card
              key={i}
              className="rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
            >
              <CardContent className="px-4 py-3.5">
                <div className="flex justify-between mb-3">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-7 w-7 rounded-lg" />
                </div>
                <Skeleton className="h-8 w-14 mb-1.5" />
                <Skeleton className="h-3 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Skeleton className="h-72 rounded-2xl" />
        <Skeleton className="h-52 rounded-2xl" />
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6 pb-10"
    >
      {/* ── Stats Cards ─────────────────────────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        {stats.map(
          ({ label, value, sub, Icon, iconBg, iconColor, Decoration }) => (
            <Card
              key={label}
              className="relative overflow-hidden border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <Decoration />
              <CardContent className="px-4 py-3.5 relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-white">
                    {label}
                  </span>
                  <div
                    className={cn(
                      "w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                      iconBg,
                    )}
                  >
                    <Icon size={16} aria-hidden="true" className={iconColor} />
                  </div>
                </div>
                <p className="text-2xl font-black font-display tracking-tight text-slate-900 dark:text-white tabular-nums leading-none mb-1.5">
                  {value}
                </p>
                <span className="text-xs font-medium text-slate-400 dark:text-white">
                  {sub}
                </span>
              </CardContent>
            </Card>
          ),
        )}
      </motion.div>

      {/* ── Main Grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
                    Étudiants par Département
                  </h3>
                  <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wider">
                    Répartition · Année 2025–2026
                  </p>
                </div>
                <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  {resume.total_etudiants ?? 0} total
                </span>
              </div>
              <Separator className="my-4" />
              {barData.length === 0 ? (
                <div className="h-44 flex items-center justify-center text-slate-400 text-sm font-medium">
                  Aucune donnée disponible
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart
                    data={barData}
                    margin={{ top: 10, right: 8, left: -18, bottom: 0 }}
                  >
                    <CartesianGrid vertical={false} stroke="#e2e8f0" />
                    <XAxis
                      dataKey="name"
                      tick={{ fontSize: 11, fontWeight: 700, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 11, fontWeight: 700, fill: "#94a3b8" }}
                      axisLine={false}
                      tickLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      cursor={{ fill: "rgba(5,150,105,0.06)" }}
                      contentStyle={{
                        background: "#0f172a",
                        border: "1px solid rgba(100,116,139,0.2)",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: 700,
                        color: "#f8fafc",
                      }}
                      formatter={(val) => [val, "Étudiants"]}
                    />
                    <Bar
                      dataKey="value"
                      fill="#059669"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={56}
                    />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* System Health widget */}
        <motion.div variants={itemVariants}>
          <Card className="border-0 bg-slate-900 dark:bg-slate-950 rounded-2xl shadow-xl overflow-hidden relative min-h-64 flex flex-col">
            {/* dot pattern */}
            <div
              className="absolute inset-0 pointer-events-none"
              aria-hidden="true"
            >
              <svg width="100%" height="100%">
                <defs>
                  <pattern
                    id="adminDots"
                    width="20"
                    height="20"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle cx="2" cy="2" r="1.2" fill="white" opacity="0.05" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#adminDots)" />
              </svg>
            </div>
            <div
              className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"
              aria-hidden="true"
            />
            <CardContent className="p-6 relative z-10 flex flex-col justify-between flex-1">
              <div>
                <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-5">
                  <Activity size={10} aria-hidden="true" />
                  État de la Plateforme
                </div>
                <h3 className="text-xl font-bold font-display text-white mb-5 leading-snug">
                  Plateforme
                  <br />
                  opérationnelle
                </h3>
                <ul className="space-y-2.5" role="list">
                  {systemHealth.map(({ label, ok }) => (
                    <li
                      key={label}
                      className="flex items-center justify-between"
                    >
                      <span className="text-xs font-medium text-slate-400">
                        {label}
                      </span>
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full",
                          ok
                            ? "bg-emerald-500/20 text-emerald-300"
                            : "bg-red-500/20 text-red-300",
                        )}
                      >
                        <CheckCircle2 size={9} aria-hidden="true" />
                        {ok ? "OK" : "Erreur"}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => window.print()}
                className="mt-6 inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-white outline-none touch-manipulation active:scale-95 w-max"
                aria-label="Exporter le rapport en PDF"
              >
                <Download size={13} aria-hidden="true" />
                Exporter PDF
              </button>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Journal de bord ─────────────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <Card className="border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-1">
              <div>
                <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
                  Journal d'Activité
                </h3>
                <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wider">
                  Dernières opérations sur la plateforme
                </p>
              </div>
            </div>
            <Separator className="my-4" />
            {auditLogs.length === 0 ? (
              <p className="text-sm text-slate-400 dark:text-slate-500 text-center py-8 font-medium">
                Aucun import récent
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800">
                      <th className="pb-3 pr-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Administrateur
                      </th>
                      <th className="pb-3 pr-6 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Action
                      </th>
                      <th className="pb-3 pr-6 text-[9px] font-black text-slate-400 uppercase tracking-widest hidden sm:table-cell">
                        Cible
                      </th>
                      <th className="pb-3 pr-6 text-[9px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">
                        Date
                      </th>
                      <th className="pb-3 text-right text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {auditLogs.map((log, i) => (
                      <tr
                        key={i}
                        className="border-b border-slate-50 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <td className="py-3.5 pr-6">
                          <div className="flex items-center gap-2.5">
                            <div
                              className={cn(
                                "w-7 h-7 rounded-lg flex items-center justify-center font-black text-[10px] shrink-0",
                                log.initialsColor ??
                                  "bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700",
                              )}
                            >
                              {log.initials ?? "?"}
                            </div>
                            <span className="font-bold text-sm text-slate-900 dark:text-white whitespace-nowrap min-w-0 truncate">
                              {log.admin}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 pr-6 text-sm font-medium text-slate-700 dark:text-slate-300">
                          {log.action}
                        </td>
                        <td className="py-3.5 pr-6 text-[10px] font-bold text-slate-400 uppercase tracking-wider hidden sm:table-cell">
                          {log.target}
                        </td>
                        <td className="py-3.5 pr-6 text-[10px] font-bold text-slate-400 whitespace-nowrap hidden md:table-cell">
                          {log.date}
                        </td>
                        <td className="py-3.5 text-right">
                          <span
                            className={cn(
                              "text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full",
                              log.statusColor ??
                                "text-emerald-600 bg-emerald-50 dark:bg-emerald-500/10",
                            )}
                          >
                            {log.status ?? "OK"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
