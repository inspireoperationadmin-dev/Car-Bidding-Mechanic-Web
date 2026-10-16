import { Moon, Sun } from "lucide-react";
import { useAppTheme } from "../../theme/ThemeContext";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { mode, toggleTheme } = useAppTheme();
  const isDark = mode === "dark";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleTheme();
      }}
      className={`relative inline-flex h-9 w-9 items-center justify-center rounded-xl border border-slate-300 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-md text-slate-800 dark:text-white transition-all hover:bg-white dark:hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 shadow-sm cursor-pointer ${className}`}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="h-4 w-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
      ) : (
        <Moon className="h-4 w-4 text-slate-700 transition-transform duration-200 hover:-rotate-12" />
      )}
    </button>
  );
}
