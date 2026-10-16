import React, { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark";

interface ThemeContextType {
  mode: ThemeMode;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function applyThemeToDom(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === "dark") {
    root.classList.add("dark");
    root.style.colorScheme = "dark";
    document.body.classList.add("dark");
  } else {
    root.classList.remove("dark");
    root.style.colorScheme = "light";
    document.body.classList.remove("dark");
  }
}

export const AppThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const savedMode = localStorage.getItem("appThemeMode") as ThemeMode;
    if (savedMode === "dark" || savedMode === "light") {
      applyThemeToDom(savedMode);
      return savedMode;
    }
    if (
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      applyThemeToDom("dark");
      return "dark";
    }
    applyThemeToDom("light");
    return "light";
  });

  useEffect(() => {
    localStorage.setItem("appThemeMode", mode);
    applyThemeToDom(mode);
  }, [mode]);

  const toggleTheme = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme, setMode }}>{children}</ThemeContext.Provider>
  );
};

export const useAppTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useAppTheme must be used within an AppThemeProvider");
  }
  return context;
};
