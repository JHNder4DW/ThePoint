import React, { useEffect, useState } from "react";

const STORAGE_KEY = "thepoint:theme";
export type ThemeName = "original" | "red";

function setHtmlTheme(t: ThemeName) {
  const el = document.documentElement;
  if (t === "red") el.classList.add("theme-red");
  else el.classList.remove("theme-red");
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeName>(() => {
    try {
      // Default changed to "red" for the red-clean branch
      return (localStorage.getItem(STORAGE_KEY) as ThemeName) || "red";
    } catch {
      return "red";
    }
  });

  useEffect(() => {
    setHtmlTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {}
  }, [theme]);

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        aria-label="Cambiar tema"
        onClick={() => setTheme((prev) => (prev === "red" ? "original" : "red"))}
        className="px-3 py-1 rounded bg-black/70 text-white backdrop-blur-sm"
      >
        {theme === "red" ? "Tema: Rojo" : "Tema: Original"}
      </button>
    </div>
  );
}
