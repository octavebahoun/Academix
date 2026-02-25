import { motion } from "framer-motion";
import { LayoutGrid, Building2, UserCog, LogOut, X } from "lucide-react";
import { cn } from "../../utils/cn";
import logoSvg from "../../assets/logo.svg";
import logoDarkSvg from "../../assets/logo-dark.svg";

export default function AdminSidebar({
  activeTab,
  onTabChange,
  onLogout,
  isOpen,
  onClose,
}) {
  const navItems = [
    { id: "overview", label: "Vue d'ensemble", icon: LayoutGrid },
    { id: "departements", label: "Gestionnaire Départements", icon: Building2 },
    { id: "chefs", label: "Chefs de Département", icon: UserCog },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-30 md:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={cn(
          "bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen fixed top-0 left-0 z-40 w-64 transition-transform duration-300 md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-6 pb-2 flex justify-between items-center">
          <div>
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
          </div>
          <button
            onClick={onClose}
            className="md:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 p-1 rounded-md"
          >
            <X size={24} />
          </button>
        </div>

        <div className="px-6 pb-2 text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
          Admin Control
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-semibold text-sm relative",
                  isActive
                    ? "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800",
                )}
              >
                <Icon
                  size={18}
                  className={cn(isActive ? "text-emerald-500" : "")}
                />
                <span className="text-left leading-tight">{item.label}</span>
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-indicator"
                    className="absolute left-0 w-1 h-8 bg-emerald-500 rounded-r-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all font-semibold text-sm"
          >
            <LogOut size={18} />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
