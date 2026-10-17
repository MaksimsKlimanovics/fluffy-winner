"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { type Lang, type T, tr } from "@/lib/i18n";

type Progress = Record<string, number>; // "grade/topicId" -> stars earned

type AppState = {
  lang: Lang;
  setLang: (lang: Lang) => void;
  t: (text: T) => string;
  stars: (grade: number, topicId: string) => number;
  addStar: (grade: number, topicId: string) => void;
  totalStars: number;
};

const AppContext = createContext<AppState | null>(null);

// Browser storage is a per-device convenience only: it may be unavailable
// (private mode, blocked storage) and the app must work without it.
function load<V>(key: string, fallback: V): V {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as V) : fallback;
  } catch {
    return fallback;
  }
}
function save(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("lv");
  const [progress, setProgress] = useState<Progress>({});

  useEffect(() => {
    const storedLang = load<Lang | null>("ciparini.lang", null);
    if (storedLang === "lv" || storedLang === "ru") setLangState(storedLang);
    else if (navigator.language.toLowerCase().startsWith("ru")) setLangState("ru");
    setProgress(load<Progress>("ciparini.progress", {}));
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = useCallback((next: Lang) => {
    setLangState(next);
    save("ciparini.lang", next);
  }, []);

  const addStar = useCallback((grade: number, topicId: string) => {
    setProgress((prev) => {
      const key = `${grade}/${topicId}`;
      const next = { ...prev, [key]: (prev[key] ?? 0) + 1 };
      save("ciparini.progress", next);
      return next;
    });
  }, []);

  const value = useMemo<AppState>(
    () => ({
      lang,
      setLang,
      t: (text) => tr(text, lang),
      stars: (grade, topicId) => progress[`${grade}/${topicId}`] ?? 0,
      addStar,
      totalStars: Object.values(progress).reduce((s, n) => s + n, 0),
    }),
    [lang, setLang, progress, addStar],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside <AppProvider>");
  return ctx;
}
