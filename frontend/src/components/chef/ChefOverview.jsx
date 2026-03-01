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
  CheckCircle2,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { authService } from "../../services/authService";
import { Card, CardContent } from "../ui/card";
import { Skeleton } from "../ui/skeleton";
import { Separator } from "../ui/separator";

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
function WaveSVG() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      className="absolute -right-2 -bottom-2 w-24 h-24 pointer-events-none text-slate-300 dark:text-slate-600"
    >
      {[28, 42, 56, 70, 84].map((r, i) => (
        <circle
          key={i}
          cx="100"
          cy="100"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="5"
        />
      ))}
    </svg>
  );
}
function HexSVG() {
  const hexes = [
    [72, 68],
    [86, 68],
    [79, 80],
    [65, 80],
    [72, 92],
    [86, 92],
    [93, 80],
  ];
  const hexPath = (cx, cy, s) => {
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 180) * (60 * i - 30);
      return `${(cx + s * Math.cos(a)).toFixed(1)},${(cy + s * Math.sin(a)).toFixed(1)}`;
    });
    return `M${pts.join("L")}Z`;
  };
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      className="absolute -right-2 -bottom-2 w-24 h-24 pointer-events-none text-slate-300 dark:text-slate-600"
    >
      {hexes.map(([cx, cy], i) => (
        <path
          key={i}
          d={hexPath(cx, cy, 6)}
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
        />
      ))}
    </svg>
  );
}
function CrosshairSVG() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      className="absolute -right-2 -bottom-2 w-24 h-24 pointer-events-none text-slate-300 dark:text-slate-600"
    >
      <circle
        cx="78"
        cy="78"
        r="18"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
      />
      <circle
        cx="78"
        cy="78"
        r="9"
        fill="none"
        stroke="currentColor"
        strokeWidth="5"
      />
      <circle cx="78" cy="78" r="3" fill="currentColor" />
      <line
        x1="60"
        y1="78"
        x2="54"
        y2="78"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <line
        x1="96"
        y1="78"
        x2="90"
        y2="78"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <line
        x1="78"
        y1="60"
        x2="78"
        y2="54"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <line
        x1="78"
        y1="96"
        x2="78"
        y2="90"
        stroke="currentColor"
        strokeWidth="5"
        strokeLinecap="round"
      />
    </svg>
  );
}
function TrendLineSVG() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 100 100"
      className="absolute -right-2 -bottom-2 w-24 h-24 pointer-events-none text-slate-300 dark:text-slate-600"
    >
      <polyline
        points="50,90 62,72 74,78 86,55 98,38"
        fill="none"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {[
        [50, 90],
        [62, 72],
        [74, 78],
        [86, 55],
        [98, 38],
      ].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4.5" fill="currentColor" />
      ))}
    </svg>
  );
}

// ─── Filière color palette ─────────────────────────────────────────────────
const filiereColors = [
  {
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    text: "text-emerald-600 dark:text-emerald-400",
  },
  {
    bg: "bg-blue-50 dark:bg-blue-500/10",
    text: "text-blue-600 dark:text-blue-400",
  },
  {
    bg: "bg-orange-50 dark:bg-orange-500/10",
    text: "text-orange-600 dark:text-orange-400",
  },
  {
    bg: "bg-purple-50 dark:bg-purple-500/10",
    text: "text-purple-600 dark:text-purple-400",
  },
  {
    bg: "bg-rose-50 dark:bg-rose-500/10",
    text: "text-rose-600 dark:text-rose-400",
  },
];

// ─── Component ─────────────────────────────────────────────────────────────
export default function ChefOverview({ data, onTabChange }) {
  const user = authService.getCurrentUser();
  const dept = data?.resume?.departement || {};
  const resume = data?.resume || {};
  const filieres = data?.filieres || [];

  const stats = [
    {
      label: "Filières",
      value: resume.total_filieres ?? 0,
      sub: "Formations actives",
      Icon: BookOpen,
      iconBg: "bg-blue-50 dark:bg-blue-500/10",
      iconColor: "text-blue-600 dark:text-blue-400",
      Decoration: WaveSVG,
    },
    {
      label: "Étudiants",
      value: resume.total_etudiants ?? 0,
      sub: "Inscrits cette année",
      Icon: Users,
      iconBg: "bg-purple-50 dark:bg-purple-500/10",
      iconColor: "text-purple-600 dark:text-purple-400",
      Decoration: HexSVG,
    },
    {
      label: "Matières",
      value: resume.total_matieres ?? 0,
      sub: "Dans le département",
      Icon: LayoutList,
      iconBg: "bg-orange-50 dark:bg-orange-500/10",
      iconColor: "text-orange-600 dark:text-orange-400",
      Decoration: CrosshairSVG,
    },
    {
      label: "Moyenne Générale",
      value: resume.moyenne_generale
        ? `${Number(resume.moyenne_generale).toFixed(1)}/20`
        : "—",
      sub: "Performance globale",
      Icon: TrendingUp,
      iconBg: "bg-emerald-50 dark:bg-emerald-500/10",
      iconColor: "text-emerald-600 dark:text-emerald-400",
      Decoration: TrendLineSVG,
    },
  ];

  // ── Skeleton ─────────────────────────────────────────────────────────────
  if (!data) {
    return (
      <div
        className="space-y-6"
        aria-busy="true"
        aria-label="Chargement de la vue d'ensemble…"
      >
        <Skeleton className="h-32 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card
              key={i}
              className="rounded-2xl border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900"
            >
              <CardContent className="px-4 py-3.5">
                <div className="flex justify-between mb-3">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-9 w-9 rounded-xl" />
                </div>
                <Skeleton className="h-8 w-16 mb-1.5" />
                <Skeleton className="h-3 w-28" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <Skeleton className="xl:col-span-2 h-72 rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-48 rounded-2xl" />
            <Skeleton className="h-40 rounded-2xl" />
          </div>
        </div>
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
      {/* ── Banner ──────────────────────────────────────────────────────── */}
      <motion.div variants={itemVariants}>
        <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-800 to-slate-900 shadow-lg">
          {/* dot pattern */}
          <div
            className="absolute inset-0 pointer-events-none"
            aria-hidden="true"
          >
            <svg width="100%" height="100%">
              <defs>
                <pattern
                  id="chefDots"
                  width="20"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <circle cx="2" cy="2" r="1.2" fill="white" opacity="0.07" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#chefDots)" />
            </svg>
          </div>
          {/* glow */}
          <div
            className="absolute -top-16 -right-16 w-52 h-52 rounded-full bg-white/10 blur-3xl pointer-events-none"
            aria-hidden="true"
          />
          <div className="relative z-10 px-6 py-7 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">
                Chef de Département
              </p>
              <h2 className="text-2xl font-black font-display text-white leading-tight">
                {dept.nom || "Chargement…"}
              </h2>
              <p className="text-sm font-medium text-white/70 mt-1">
                Code&nbsp;
                <span className="font-bold text-white/90">
                  {dept.code || "—"}
                </span>
                {user && (
                  <>
                    {" "}
                    ·{" "}
                    <span className="font-bold text-white/90">
                      {user.prenom} {user.nom}
                    </span>
                  </>
                )}
              </p>
            </div>
            <div className="text-left sm:text-right shrink-0">
              <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-0.5">
                Année académique
              </p>
              <p className="text-2xl font-black font-display text-white tabular-nums">
                2025–2026
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Stats Cards ─────────────────────────────────────────────────── */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        {stats.map((stat) => {
          const StatIcon = stat.Icon;
          const DecoSVG = stat.Decoration;
          return (
            <Card
              key={stat.label}
              className="relative overflow-hidden border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-200"
            >
              <DecoSVG />
              <CardContent className="px-3 py-2.5 relative z-10">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </span>
                  <div
                    className={cn(
                      "w-7 h-7 rounded-lg flex items-center justify-center shrink-0",
                      stat.iconBg,
                    )}
                  >
                    <StatIcon
                      size={14}
                      aria-hidden="true"
                      className={stat.iconColor}
                    />
                  </div>
                </div>
                <p className="text-xl font-black font-display tracking-tight text-slate-900 dark:text-white tabular-nums leading-none mb-1">
                  {stat.value}
                </p>
                <span className="text-xs font-medium text-slate-400 dark:text-slate-500">
                  {stat.sub}
                </span>
              </CardContent>
            </Card>
          );
        })}
      </motion.div>

      {/* ── Main Grid ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Filières */}
        <motion.div variants={itemVariants} className="xl:col-span-2">
          <Card className="border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-1">
                <div>
                  <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
                    Filières du Département
                  </h3>
                  <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 uppercase tracking-wider">
                    {resume.total_filieres ?? 0} formation
                    {(resume.total_filieres ?? 0) > 1 ? "s" : ""} ·{" "}
                    {resume.total_etudiants ?? 0} étudiants
                  </p>
                </div>
                <button
                  onClick={() => onTabChange?.("filieres")}
                  className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
                  aria-label="Gérer les filières"
                >
                  Gérer
                </button>
              </div>
              <Separator className="my-4" />
              {filieres.length === 0 ? (
                <div className="py-10 text-center">
                  <p className="text-sm text-slate-400 dark:text-slate-500 font-medium">
                    Aucune filière dans ce département
                  </p>
                  <button
                    onClick={() => onTabChange?.("filieres")}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none"
                  >
                    <Plus size={13} aria-hidden="true" />
                    Ajouter une filière
                  </button>
                </div>
              ) : (
                <ul className="space-y-3" role="list">
                  {filieres.map((filiere, i) => {
                    const palette = filiereColors[i % filiereColors.length];
                    return (
                      <li
                        key={filiere.id ?? i}
                        onClick={() => onTabChange?.("filieres", filiere.id)}
                        className="group flex items-center justify-between p-3.5 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-500/30 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-all duration-150 cursor-pointer"
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) =>
                          e.key === "Enter" &&
                          onTabChange?.("filieres", filiere.id)
                        }
                        aria-label={`Voir les détails de ${filiere.name}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center font-black text-sm shrink-0",
                              palette.bg,
                              palette.text,
                            )}
                            aria-hidden="true"
                          >
                            {(
                              filiere.initial ||
                              filiere.name?.[0] ||
                              "?"
                            ).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-sm text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                              {filiere.name}
                            </p>
                            <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-0.5">
                              {filiere.niveau && (
                                <span className="mr-1">{filiere.niveau}</span>
                              )}
                              {filiere.students ?? 0} étudiant
                              {(filiere.students ?? 0) > 1 ? "s" : ""}
                              {filiere.matieres != null &&
                                ` · ${filiere.matieres} matière${filiere.matieres > 1 ? "s" : ""}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0 ml-3">
                          {filiere.has_emploi_temps && (
                            <span className="hidden sm:inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400">
                              <CheckCircle2 size={8} aria-hidden="true" />
                              EDT
                            </span>
                          )}
                          <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                            Actif
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Données réelles */}
          <motion.div variants={itemVariants}>
            <Card className="border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
              <CardContent className="p-5">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4">
                  Données du Département
                </h3>
                <ul className="space-y-3" role="list">
                  <li className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Filières
                    </span>
                    <span className="text-sm font-black text-slate-900 dark:text-white tabular-nums">
                      {resume.total_filieres ?? "—"}
                    </span>
                  </li>
                  <Separator />
                  <li className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Étudiants
                    </span>
                    <span className="text-sm font-black text-slate-900 dark:text-white tabular-nums">
                      {resume.total_etudiants ?? "—"}
                    </span>
                  </li>
                  <Separator />
                  <li className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Matières
                    </span>
                    <span className="text-sm font-black text-slate-900 dark:text-white tabular-nums">
                      {resume.total_matieres ?? "—"}
                    </span>
                  </li>
                  <Separator />
                  <li className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                      Moyenne générale
                    </span>
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400 tabular-nums">
                      {resume.moyenne_generale
                        ? `${Number(resume.moyenne_generale).toFixed(1)}/20`
                        : "—"}
                    </span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>

          {/* Actions Rapides */}
          <motion.div variants={itemVariants}>
            <Card className="border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl shadow-sm">
              <CardContent className="p-5">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-4">
                  Actions Rapides
                </h3>
                <div className="space-y-2.5">
                  <button
                    onClick={() => onTabChange?.("import")}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-500/10 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 font-bold text-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-blue-500 outline-none touch-manipulation active:scale-95"
                    aria-label="Importer un fichier CSV"
                  >
                    <Download
                      size={15}
                      aria-hidden="true"
                      className="shrink-0"
                    />
                    Import CSV
                  </button>
                  <button
                    onClick={() => onTabChange?.("emploi-temps")}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-500/10 text-slate-700 dark:text-slate-300 hover:text-purple-600 dark:hover:text-purple-400 font-bold text-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-purple-500 outline-none touch-manipulation active:scale-95"
                    aria-label="Gérer l'emploi du temps"
                  >
                    <Calendar
                      size={15}
                      aria-hidden="true"
                      className="shrink-0"
                    />
                    Emploi du Temps
                  </button>
                  <button
                    onClick={() => window.print()}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold text-sm transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-emerald-500 outline-none touch-manipulation active:scale-95"
                    aria-label="Imprimer le rapport"
                  >
                    <FileText
                      size={15}
                      aria-hidden="true"
                      className="shrink-0"
                    />
                    Rapport
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Ajouter Filière – dark card */}
          <motion.div variants={itemVariants}>
            <Card className="border-0 bg-slate-900 dark:bg-slate-950 rounded-2xl shadow-xl overflow-hidden relative">
              {/* dot pattern */}
              <div
                className="absolute inset-0 pointer-events-none"
                aria-hidden="true"
              >
                <svg width="100%" height="100%">
                  <defs>
                    <pattern
                      id="chefAddDots"
                      width="20"
                      height="20"
                      patternUnits="userSpaceOnUse"
                    >
                      <circle
                        cx="2"
                        cy="2"
                        r="1.2"
                        fill="white"
                        opacity="0.05"
                      />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#chefAddDots)" />
                </svg>
              </div>
              <div
                className="absolute -top-10 -right-10 w-36 h-36 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"
                aria-hidden="true"
              />
              <CardContent className="p-5 relative z-10">
                <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full mb-4">
                  <Plus size={9} aria-hidden="true" />
                  Nouvelle Filière
                </div>
                <p className="text-xs font-medium text-slate-400 mb-5 leading-relaxed">
                  Ajouter une formation au département
                </p>
                <button
                  onClick={() => onTabChange?.("filieres")}
                  className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-emerald-400 outline-none touch-manipulation active:scale-95"
                  aria-label="Créer une nouvelle filière"
                >
                  <Plus size={13} aria-hidden="true" />
                  Créer une filière
                </button>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
