import { motion } from "framer-motion";
import {
  LayoutGrid,
  GraduationCap,
  FileText,
  Calendar,
  BrainCircuit,
  User,
  LogOut,
} from "lucide-react";
import { cn } from "../../utils/cn";

export default function StudentSidebar({ activeTab, onTabChange, onLogout }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutGrid },
    { id: "sessions", label: "Sessions", icon: GraduationCap },
    { id: "notes", label: "Notes", icon: FileText },
    { id: "emploi-temps", label: "Emploi du temps", icon: Calendar },
    { id: "ai-revision", label: "AI Revision", icon: BrainCircuit },
    { id: "profil", label: "Profil", icon: User },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen fixed top-0 left-0 z-10">
      <div className="p-8">
        <h1 className="font-display text-2xl font-black text-emerald-500 tracking-tight italic">
          ACADEMIX
        </h1>
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
  );
}
