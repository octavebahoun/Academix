import { Menu, Moon, Sun } from "lucide-react";

export default function ChefHeader({
  title,
  subtitle,
  theme,
  onThemeToggle,
  onMenuToggle,
}) {
  return (
    <header className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="md:hidden p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-black font-display italic text-slate-900 dark:text-white tracking-tight">
            {title}
          </h1>
          <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mt-1">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex flex-row self-end md:self-auto gap-4">
        <button
          onClick={onThemeToggle}
          className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm hover:shadow-md transition-all"
          aria-label="Toggle dark mode"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  );
}
