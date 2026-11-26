"use client";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_LOCALE, dictionaries, type Dictionary, type Locale } from "./dictionary";

const STORAGE_KEY = "elvis-flores:locale";

interface Ctx {
  locale: Locale;
  t: Dictionary;
  setLocale: (l: Locale) => void;
  toggle: () => void;
  /** Devuelve la traducción del campo (row.i18n.es[field]) o el valor base en inglés. */
  tr: <T extends object, K extends keyof T & string>(row: T, field: K) => T[K];
  formatDate: (value: string | null, opts?: Intl.DateTimeFormatOptions) => string | null;
}

const LocaleContext = createContext<Ctx | null>(null);

export function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(DEFAULT_LOCALE);

  // El HTML se genera en inglés (idioma principal). Si el visitante eligió español antes, se aplica tras montar.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- preferencia guardada, solo disponible en el cliente
      if (saved === "es" || saved === "en") setLocaleState(saved);
    } catch {
      /* almacenamiento no disponible */
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l);
    try {
      localStorage.setItem(STORAGE_KEY, l);
    } catch {
      /* almacenamiento no disponible */
    }
  }, []);

  const value = useMemo<Ctx>(
    () => ({
      locale,
      t: dictionaries[locale],
      setLocale,
      toggle: () => setLocale(locale === "en" ? "es" : "en"),
      tr: (row, field) => {
        if (locale === "en") return row[field];
        const i18n = (row as { i18n?: { es?: Record<string, unknown> } }).i18n;
        const v = i18n?.es?.[field];
        const empty = v === undefined || v === null || v === "" || (Array.isArray(v) && v.length === 0);
        return (empty ? row[field] : v) as never;
      },
      formatDate: (value, opts = { month: "short", year: "numeric" }) => {
        if (!value) return null;
        const d = new Date(value.length === 10 ? `${value}T12:00:00` : value);
        if (Number.isNaN(d.getTime())) return null;
        return new Intl.DateTimeFormat(locale === "es" ? "es-EC" : "en-US", opts).format(d);
      },
    }),
    [locale, setLocale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useI18n debe usarse dentro de <LocaleProvider>");
  return ctx;
}
