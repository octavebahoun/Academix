import { Menu, Moon, Sun } from "lucide-react";

export default function StudentHeader({
  title,
  subtitle,
  theme,
  onThemeToggle,
  rightAction,
  onMenuToggle,
}) {
  return (
    <header className="flex flex-col md:flex-row justify-between mb-6 gap-4">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
        <div>
          <h1 className="text-3xl font-black font-display text-slate-900 dark:text-white tracking-tight capitalize">
            {title}
          </h1>
          {subtitle && (
            <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mt-1">
              {subtitle}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center self-end md:self-auto gap-4">
        {rightAction}
        {onThemeToggle && (
          <button
            onClick={onThemeToggle}
            className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm hover:shadow-md transition-all"
            aria-label="Toggle dark mode"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        )}
        <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-sm shadow-md">
          SA
        </div>
      </div>
    </header>
  );
}
