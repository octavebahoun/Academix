import { motion } from "framer-motion";
import { Menu, Moon, Sun } from "lucide-react";
import { cn } from "../../utils/cn";
import { Separator } from "@/components/ui/separator";

export default function AdminHeader({
  title,
  subtitle,
  theme,
  onThemeToggle,
  rightAction,
  onMenuToggle,
}) {
  return (
    <div className="-mx-4 md:-mx-8 px-4 md:px-8 border-b border-slate-200 dark:border-slate-800 mb-6 flex items-center md:mt-2 h-14 md:h-17">
      <motion.header
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
        className="w-full flex flex-row items-center justify-between gap-3"
      >
        {/* Left : menu mobile + titres */}
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onMenuToggle}
            aria-label="Ouvrir le menu"
            className="md:hidden rounded-md p-2 -ml-1 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu size={20} aria-hidden="true" />
          </motion.button>
          <div>
            <h1 className="text-base md:text-xl font-bold font-display text-slate-900 dark:text-white tracking-tight leading-tight line-clamp-1">
              {title}
            </h1>
            {subtitle && (
              <p className="hidden md:block text-xs font-medium text-emerald-600 dark:text-emerald-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right : actions + theme */}
        <div className="flex items-center gap-2 shrink-0">
          {rightAction}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={onThemeToggle}
            aria-label={
              theme === "dark"
                ? "Passer en mode clair"
                : "Passer en mode sombre"
            }
            className="h-9 w-9 rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
          >
            {theme === "dark" ? (
              <Sun size={16} aria-hidden="true" />
            ) : (
              <Moon size={16} aria-hidden="true" />
            )}
          </motion.button>
        </div>
      </motion.header>
    </div>
  );
}
