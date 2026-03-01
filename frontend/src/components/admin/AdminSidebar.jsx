import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutGrid,
  Building2,
  UserCog,
  LogOut,
  X,
  ShieldCheck,
} from "lucide-react";
import { cn } from "../../utils/cn";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { authService } from "../../services/authService";
import logoSvg from "../../assets/logo.svg";
import logoDarkSvg from "../../assets/logo-dark.svg";

const navItems = [
  { id: "overview", label: "Vue d'ensemble", icon: LayoutGrid },
  { id: "departements", label: "Départements", icon: Building2 },
  { id: "chefs", label: "Chefs de Département", icon: UserCog },
];

function getInitials(user) {
  if (!user) return "A";
  return (
    `${(user.prenom || "").charAt(0)}${(user.nom || "").charAt(0)}`.toUpperCase() ||
    "A"
  );
}

export default function AdminSidebar({
  activeTab,
  onTabChange,
  onLogout,
  isOpen,
  onClose,
}) {
  const user = authService.getCurrentUser();
  const fullName = user
    ? `${user.prenom || ""} ${user.nom || ""}`.trim()
    : "Administrateur";

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 md:hidden"
            onClick={onClose}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 flex h-screen w-64 flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-transform duration-200 ease-out md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-2.5">
          <img
            src={logoSvg}
            alt="AcademiX"
            className="h-14 w-auto dark:hidden"
          />
          <img
            src={logoDarkSvg}
            alt="AcademiX"
            className="h-14 w-auto hidden dark:block"
          />
          <button
            onClick={onClose}
            aria-label="Fermer le menu"
            className="md:hidden rounded-md p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:text-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        <Separator />

        {/* Section label */}
        <div className="px-5 pt-6 pb-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500">
            Administration
          </span>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 px-3">
          <nav className="space-y-1 py-2" aria-label="Navigation principale">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onTabChange(item.id);
                    onClose?.();
                  }}
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "group relative w-full flex items-center gap-3 rounded-md px-3 py-3 text-sm font-medium transition-colors duration-150",
                    isActive
                      ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200",
                  )}
                >
                  {isActive && (
                    <motion.span
                      layoutId="admin-active-bar"
                      className="absolute left-0 inset-y-1.5 w-0.5 rounded-r-full bg-emerald-500 dark:bg-emerald-400"
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 35,
                      }}
                      aria-hidden="true"
                    />
                  )}
                  <Icon
                    size={16}
                    aria-hidden="true"
                    className={cn(
                      "shrink-0 transition-colors duration-150",
                      isActive
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300",
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </ScrollArea>

        {/* User + Logout inline */}
        <div className="mt-auto">
          <Separator />
          <div className="px-4 py-4">
            <div className="flex items-center gap-3">
              <div
                aria-hidden="true"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400 text-xs font-semibold select-none"
              >
                {getInitials(user)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                  {fullName}
                </p>
                <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                  <ShieldCheck size={11} aria-hidden="true" />
                  Super Admin
                </span>
              </div>
              <button
                onClick={onLogout}
                aria-label="Déconnexion"
                className="shrink-0 rounded-md p-2 text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 dark:hover:text-red-400 transition-colors duration-150"
              >
                <LogOut size={15} aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
