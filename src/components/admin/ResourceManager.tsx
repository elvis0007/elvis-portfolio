"use client";
/* eslint-disable @next/next/no-img-element */
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, ArrowDown, ArrowUp, CheckCircle2, Eye, EyeOff, Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { deleteRecord, removeStorageFiles, reorder, saveRecord, setVisibility } from "@/app/admin/actions";
import type { ResourceTable } from "@/lib/validation/admin";
import { cn, slugify } from "@/lib/utils";
import { Field, isEmpty, type FieldConfig, type Values } from "./fields";

export interface ResourceConfig {
  table: ResourceTable;
  singular: string;
  plural: string;
  fields: FieldConfig[];
  defaults: Values;
  visibilityField: string;
  titleField: string;
  subtitle?: (row: Values) => string | null;
  imageField?: string;
  /** Si se define, el slug se genera desde este campo mientras no se edite manualmente. */
  slugFrom?: string;
  searchFields?: string[];
}

type Row = Values & { id: string };

export function ResourceManager({ config, rows }: { config: ResourceConfig; rows: Row[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<Row | "new" | null>(null);
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const flash = (kind: "ok" | "error", text: string) => {
    setNotice({ kind, text });
    window.setTimeout(() => setNotice(null), 4000);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    const fields = config.searchFields ?? [config.titleField];
    return rows.filter((r) => fields.some((f) => String(r[f] ?? "").toLowerCase().includes(q)));
  }, [rows, query, config]);

  const pendingCount = (row: Values) => config.fields.filter((f) => f.pending && isEmpty(row[f.name])).length;

  function toggleVisibility(row: Row) {
    setBusyId(row.id);
    startTransition(async () => {
      const res = await setVisibility(config.table, row.id, !row[config.visibilityField]);
      setBusyId(null);
      if (!res.ok) return flash("error", res.error);
      flash("ok", row[config.visibilityField] ? "Ocultado del sitio público." : "Publicado en el sitio.");
      router.refresh();
    });
  }

  function remove(row: Row) {
    setBusyId(row.id);
    startTransition(async () => {
      const res = await deleteRecord(config.table, row.id);
      setBusyId(null);
      setConfirmId(null);
      if (!res.ok) return flash("error", res.error);
      // Limpia archivos asociados en Storage.
      const files = config.fields
        .filter((f) => f.type === "image" || f.type === "file" || f.type === "gallery")
        .flatMap((f) => (Array.isArray(row[f.name]) ? (row[f.name] as string[]) : row[f.name] ? [row[f.name] as string] : []));
      if (files.length) await removeStorageFiles(files);
      flash("ok", `${config.singular} eliminado.`);
      router.refresh();
    });
  }

  function move(index: number, dir: -1 | 1) {
    const j = index + dir;
    if (j < 0 || j >= rows.length) return;
    const ids = rows.map((r) => r.id);
    [ids[index], ids[j]] = [ids[j], ids[index]];
    startTransition(async () => {
      const res = await reorder(config.table, ids);
      if (!res.ok) return flash("error", res.error);
      router.refresh();
    });
  }

  return (
    <div>
      <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">Gestión</p>
          <h1 className="mt-2 text-3xl font-semibold md:text-4xl">{config.plural}</h1>
          <p className="mt-1 text-sm text-mist">
            {rows.length} registros · {rows.filter((r) => r[config.visibilityField]).length} visibles
          </p>
        </div>
        <div className="flex gap-2">
          <label className="relative">
            <span className="sr-only">Buscar</span>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-mist" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar…" className="field h-11 w-48 py-0 pl-9" />
          </label>
          <button onClick={() => setEditing("new")} className="inline-flex h-11 items-center gap-2 rounded-full bg-pink px-5 text-sm font-medium text-ink hover:bg-pink-soft">
            <Plus className="size-4" /> Nuevo
          </button>
        </div>
      </header>

      <AnimatePresence>
        {notice && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            role="status"
            className={cn(
              "mb-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm",
              notice.kind === "ok" ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100" : "border-red-400/30 bg-red-400/10 text-red-100",
            )}
          >
            {notice.kind === "ok" ? <CheckCircle2 className="size-4" /> : <AlertCircle className="size-4" />} {notice.text}
          </motion.div>
        )}
      </AnimatePresence>

      {filtered.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-mist">{query ? "Sin resultados." : `Aún no hay ${config.plural.toLowerCase()}.`}</div>
      ) : (
        <ul className="space-y-2">
          {filtered.map((row) => {
            const index = rows.findIndex((r) => r.id === row.id);
            const visible = !!row[config.visibilityField];
            const pend = pendingCount(row);
            const img = config.imageField ? (row[config.imageField] as string | null) : null;
            return (
              <li key={row.id} className={cn("glass flex items-center gap-3 rounded-2xl p-3 pr-4 transition", !visible && "opacity-60")}>
                {!query && (
                  <div className="flex flex-col">
                    <button onClick={() => move(index, -1)} disabled={index === 0 || pending} className="rounded p-0.5 text-mist hover:text-pink disabled:opacity-20" aria-label="Subir">
                      <ArrowUp className="size-3.5" />
                    </button>
                    <button onClick={() => move(index, 1)} disabled={index === rows.length - 1 || pending} className="rounded p-0.5 text-mist hover:text-pink disabled:opacity-20" aria-label="Bajar">
                      <ArrowDown className="size-3.5" />
                    </button>
                  </div>
                )}
                {config.imageField && (
                  <div className={cn("size-12 shrink-0 overflow-hidden rounded-lg bg-white/5", config.table === "technologies" && "bg-snow p-2")}>
                    {img && <img src={img} alt="" className={cn("size-full", config.table === "technologies" ? "object-contain" : "object-cover")} />}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{String(row[config.titleField] ?? "")}</p>
                  <p className="truncate text-xs text-mist">
                    {config.subtitle?.(row)}
                    {pend > 0 && <span className="ml-2 rounded bg-amber-300/10 px-1.5 py-0.5 text-amber-200">{pend} pendiente{pend > 1 && "s"}</span>}
                  </p>
                </div>
                <button
                  onClick={() => toggleVisibility(row)}
                  disabled={busyId === row.id}
                  className={cn("hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs sm:inline-flex", visible ? "bg-emerald-300/10 text-emerald-200" : "bg-white/5 text-mist")}
                  aria-label={visible ? "Ocultar" : "Publicar"}
                >
                  {busyId === row.id ? <Loader2 className="size-3.5 animate-spin" /> : visible ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                  {visible ? "Visible" : "Oculto"}
                </button>
                <button onClick={() => setEditing(row)} className="grid size-9 place-items-center rounded-lg text-mist hover:bg-white/5 hover:text-snow" aria-label={`Editar ${row[config.titleField]}`}>
                  <Pencil className="size-4" />
                </button>
                {confirmId === row.id ? (
                  <span className="flex items-center gap-1">
                    <button onClick={() => remove(row)} className="rounded-lg bg-red-400/80 px-2.5 py-1.5 text-xs text-ink" disabled={busyId === row.id}>
                      {busyId === row.id ? "…" : "Eliminar"}
                    </button>
                    <button onClick={() => setConfirmId(null)} className="rounded-lg px-2 py-1.5 text-xs text-mist hover:text-snow">
                      No
                    </button>
                  </span>
                ) : (
                  <button onClick={() => setConfirmId(row.id)} className="grid size-9 place-items-center rounded-lg text-mist hover:bg-red-400/10 hover:text-red-200" aria-label={`Eliminar ${row[config.titleField]}`}>
                    <Trash2 className="size-4" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <AnimatePresence>
        {editing && (
          <Editor
            key={editing === "new" ? "new" : editing.id}
            config={config}
            row={editing === "new" ? null : editing}
            nextOrder={rows.length + 1}
            onClose={() => setEditing(null)}
            onSaved={(text) => {
              setEditing(null);
              flash("ok", text);
              router.refresh();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Editor({ config, row, nextOrder, onClose, onSaved }: { config: ResourceConfig; row: Row | null; nextOrder: number; onClose: () => void; onSaved: (msg: string) => void }) {
  const [values, setValues] = useState<Values>(() => (row ? { ...row } : { ...config.defaults, sort_order: nextOrder }));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [saving, startSaving] = useTransition();
  const [slugTouched, setSlugTouched] = useState(!!row);

  const setValue = (name: string, v: unknown) => {
    setValues((prev) => {
      const next = { ...prev, [name]: v };
      if (config.slugFrom && name === config.slugFrom && !slugTouched) next.slug = slugify(String(v));
      return next;
    });
    if (name === "slug") setSlugTouched(true);
    if (errors[name]) setErrors((e) => ({ ...e, [name]: "" }));
  };

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload: Values = {};
    for (const f of config.fields) {
      payload[f.name] = values[f.name];
      if (f.typeField) payload[f.typeField] = values[f.typeField];
    }
    payload.sort_order = values.sort_order ?? 0;
    payload.i18n = values.i18n ?? {};
    startSaving(async () => {
      const res = await saveRecord(config.table, row?.id ?? null, payload);
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        setFormError(res.error);
        return;
      }
      onSaved(row ? "Cambios guardados y publicados." : `${config.singular} creado.`);
    });
  }

  return (
    <motion.div className="fixed inset-0 z-50 flex justify-end" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-ink/70 backdrop-blur-sm" onClick={onClose} />
      <motion.form
        onSubmit={submit}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-label={row ? `Editar ${config.singular}` : `Nuevo ${config.singular}`}
        className="relative flex h-full w-full max-w-2xl flex-col border-l border-white/10 bg-ink-2"
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 60, opacity: 0 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        onKeyDown={(e) => e.key === "Escape" && onClose()}
      >
        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-4">
          <h2 className="text-lg font-semibold">{row ? `Editar ${config.singular.toLowerCase()}` : `Nuevo ${config.singular.toLowerCase()}`}</h2>
          <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-lg hover:bg-white/5" aria-label="Cerrar">
            <X className="size-4" />
          </button>
        </div>
        <div className="grid flex-1 content-start gap-5 overflow-y-auto p-6 sm:grid-cols-2">
          {config.fields.map((f) => (
            <Field key={f.name} field={f} values={values} setValue={setValue} error={errors[f.name]} />
          ))}
        </div>
        <div className="flex items-center justify-between gap-4 border-t border-white/[0.06] px-6 py-4">
          <p className="text-sm text-red-300" role="alert">
            {formError}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-full px-5 py-2.5 text-sm text-mist hover:text-snow">
              Cancelar
            </button>
            <button type="submit" disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-pink px-6 py-2.5 text-sm font-medium text-ink disabled:opacity-50">
              {saving && <Loader2 className="size-4 animate-spin" />} Guardar
            </button>
          </div>
        </div>
      </motion.form>
    </motion.div>
  );
}
