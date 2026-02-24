import { Moon, Sun } from "lucide-react";

export default function ChefHeader({ title, subtitle, theme, onThemeToggle }) {
  return (
    <header className="flex items-center justify-between mb-8">
      <div>
        <h1 className="text-2xl font-black font-display italic text-slate-900 dark:text-white tracking-tight">
          {title}
        </h1>
        <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mt-1">
          {subtitle}
        </p>
      </div>

      <button
        onClick={onThemeToggle}
        className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 shadow-sm hover:shadow-md transition-all"
        aria-label="Toggle dark mode"
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </header>
  );
}
