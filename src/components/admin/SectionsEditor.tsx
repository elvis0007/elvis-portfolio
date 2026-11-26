"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Eye, EyeOff, Loader2 } from "lucide-react";
import { saveSection } from "@/app/admin/actions";
import type { SectionContent } from "@/types/content";

export function SectionsEditor({ sections }: { sections: SectionContent[] }) {
  return (
    <div>
      <header className="mb-8">
        <p className="eyebrow">Gestión</p>
        <h1 className="mt-2 text-3xl font-semibold md:text-4xl">Contenido de secciones</h1>
        <p className="mt-1 text-sm text-mist">Textos (inglés + español), orden y visibilidad de cada sección del portafolio.</p>
      </header>
      <ul className="grid gap-4 xl:grid-cols-2">
        {sections.map((s) => (
          <SectionCard key={s.key} section={s} />
        ))}
      </ul>
    </div>
  );
}

function SectionCard({ section }: { section: SectionContent }) {
  const router = useRouter();
  const [v, setV] = useState(section);
  const [saving, start] = useTransition();
  const [status, setStatus] = useState<string | null>(null);
  const dirty = JSON.stringify(v) !== JSON.stringify(section);

  function save(next = v) {
    start(async () => {
      const res = await saveSection(next);
      setStatus(res.ok ? "Guardado" : res.error);
      if (res.ok) router.refresh();
      window.setTimeout(() => setStatus(null), 2500);
    });
  }

  return (
    <li className={`glass rounded-2xl p-5 ${!v.is_visible ? "opacity-60" : ""}`}>
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-xs uppercase tracking-widest text-pink">#{section.key}</span>
        <button
          onClick={() => {
            const next = { ...v, is_visible: !v.is_visible };
            setV(next);
            save(next);
          }}
          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs ${v.is_visible ? "bg-emerald-300/10 text-emerald-200" : "bg-white/5 text-mist"}`}
        >
          {v.is_visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />} {v.is_visible ? "Visible" : "Oculta"}
        </button>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_2fr_80px]">
        <label className="text-xs text-mist">
          Etiqueta
          <input className="field mt-1" value={v.eyebrow} maxLength={60} onChange={(e) => setV({ ...v, eyebrow: e.target.value })} />
        </label>
        <label className="text-xs text-mist">
          Título
          <input className="field mt-1" value={v.title} maxLength={120} onChange={(e) => setV({ ...v, title: e.target.value })} />
        </label>
        <label className="text-xs text-mist">
          Orden
          <input type="number" min={0} className="field mt-1" value={v.sort_order} onChange={(e) => setV({ ...v, sort_order: Number(e.target.value) })} />
        </label>
        <label className="text-xs text-mist sm:col-span-3">
          Subtítulo
          <textarea className="field mt-1" rows={2} maxLength={400} value={v.subtitle ?? ""} onChange={(e) => setV({ ...v, subtitle: e.target.value })} />
        </label>
      </div>
      <details className="mt-3 rounded-xl border border-white/[0.06] p-3" open={!!v.i18n?.es}>
        <summary className="cursor-pointer text-xs text-mist">Traducción al español (ES)</summary>
        <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_2fr]">
          {(["eyebrow", "title", "subtitle"] as const).map((k) => (
            <label key={k} className={`text-xs text-mist ${k === "subtitle" ? "sm:col-span-2" : ""}`}>
              {k === "eyebrow" ? "Etiqueta" : k === "title" ? "Título" : "Subtítulo"} · ES
              <input
                className="field mt-1"
                maxLength={k === "subtitle" ? 400 : 120}
                value={String(v.i18n?.es?.[k] ?? "")}
                onChange={(e) => setV({ ...v, i18n: { ...v.i18n, es: { ...v.i18n?.es, [k]: e.target.value } } })}
              />
            </label>
          ))}
        </div>
      </details>
      <div className="mt-3 flex items-center justify-end gap-3">
        {status && <span className="text-xs text-mist">{status}</span>}
        <button onClick={() => save()} disabled={!dirty || saving} className="inline-flex items-center gap-1.5 rounded-full bg-pink px-4 py-2 text-xs font-medium text-ink disabled:opacity-30">
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />} Guardar
        </button>
      </div>
    </li>
  );
}
