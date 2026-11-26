"use client";
/* eslint-disable @next/next/no-img-element */
import { useRef, useState } from "react";
import { FileText, ImagePlus, Loader2, Plus, Trash2, Upload, X } from "lucide-react";
import { uploadFile, type UploadKind } from "@/lib/storage";
import { cn } from "@/lib/utils";

export type FieldType =
  | "text"
  | "textarea"
  | "select"
  | "number"
  | "date"
  | "checkbox"
  | "url"
  | "email"
  | "tags"
  | "lines"
  | "image"
  | "file"
  | "gallery"
  | "color";

export interface FieldConfig {
  name: string;
  label: string;
  type: FieldType;
  options?: { value: string | number | ""; label: string }[];
  help?: string;
  placeholder?: string;
  required?: boolean;
  /** Se marca como "pendiente" en el listado si está vacío. */
  pending?: boolean;
  span?: 1 | 2;
  rows?: number;
  folder?: string;
  uploadKind?: UploadKind;
  /** Para type=file: nombre del campo donde se guarda "pdf" | "image". */
  typeField?: string;
  maxLength?: number;
  /** Muestra además un campo para la traducción al español (se guarda en i18n.es). */
  translatable?: boolean;
}

export type Values = Record<string, unknown>;

export function isEmpty(v: unknown) {
  return v === null || v === undefined || v === "" || (Array.isArray(v) && v.length === 0);
}

interface FieldProps {
  field: FieldConfig;
  values: Values;
  setValue: (name: string, value: unknown) => void;
  error?: string;
}

export function Field({ field, values, setValue, error }: FieldProps) {
  if (field.translatable) return <TranslatableField field={field} values={values} setValue={setValue} error={error} />;
  const id = `f-${field.name}`;
  const value = values[field.name];
  const common = {
    id,
    name: field.name,
    "aria-invalid": !!error,
    "aria-describedby": error ? `${id}-err` : field.help ? `${id}-help` : undefined,
  };

  let control: React.ReactNode;
  switch (field.type) {
    case "textarea":
      control = (
        <textarea
          {...common}
          rows={field.rows ?? 4}
          maxLength={field.maxLength}
          value={(value as string) ?? ""}
          placeholder={field.placeholder}
          onChange={(e) => setValue(field.name, e.target.value)}
          className="field resize-y"
        />
      );
      break;
    case "select":
      control = (
        <select {...common} value={value === null || value === undefined ? "" : String(value)} onChange={(e) => setValue(field.name, e.target.value)} className="field">
          {field.options?.map((o) => (
            <option key={String(o.value)} value={String(o.value)}>
              {o.label}
            </option>
          ))}
        </select>
      );
      break;
    case "checkbox":
      return (
        <label className={cn("flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3", field.span === 2 && "sm:col-span-2")}>
          <span>
            <span className="block text-sm">{field.label}</span>
            {field.help && <span className="block text-xs text-mist">{field.help}</span>}
          </span>
          <input type="checkbox" name={field.name} checked={!!value} onChange={(e) => setValue(field.name, e.target.checked)} className="size-5 accent-pink" />
        </label>
      );
    case "lines":
      control = (
        <LinesInput
          {...common}
          rows={field.rows ?? 5}
          value={(value as string[]) ?? []}
          placeholder={field.placeholder}
          onChange={(v) => setValue(field.name, v)}
        />
      );
      break;
    case "tags":
      control = <TagsInput id={id} value={(value as string[]) ?? []} onChange={(v) => setValue(field.name, v)} placeholder={field.placeholder} />;
      break;
    case "image":
    case "file":
      control = (
        <SingleUpload
          value={(value as string) ?? null}
          kind={field.uploadKind ?? (field.type === "image" ? "image" : "document")}
          folder={field.folder ?? "uploads"}
          fileType={field.typeField ? (values[field.typeField] as string | null) : null}
          onChange={(url, type) => {
            setValue(field.name, url);
            if (field.typeField) setValue(field.typeField, url ? type : null);
          }}
        />
      );
      break;
    case "gallery":
      control = <GalleryUpload value={(value as string[]) ?? []} folder={field.folder ?? "gallery"} onChange={(v) => setValue(field.name, v)} />;
      break;
    case "color":
      control = (
        <div className="flex gap-2">
          <input type="color" value={(value as string) || "#f4b6cc"} onChange={(e) => setValue(field.name, e.target.value)} className="h-11 w-14 cursor-pointer rounded-lg bg-transparent" aria-label={field.label} />
          <input {...common} value={(value as string) ?? ""} placeholder="#F4B6CC" onChange={(e) => setValue(field.name, e.target.value)} className="field font-mono" />
        </div>
      );
      break;
    default:
      control = (
        <input
          {...common}
          type={field.type === "url" ? "url" : field.type === "email" ? "email" : field.type === "date" ? "date" : field.type === "number" ? "number" : "text"}
          maxLength={field.maxLength}
          value={value === null || value === undefined ? "" : String(value)}
          placeholder={field.placeholder}
          onChange={(e) => setValue(field.name, field.type === "number" ? (e.target.value === "" ? "" : Number(e.target.value)) : e.target.value)}
          className={cn("field", field.type === "url" && "font-mono text-sm")}
        />
      );
  }

  return (
    <div className={cn(field.span === 2 && "sm:col-span-2")}>
      <label htmlFor={id} className="mb-1.5 flex items-center gap-2 text-sm text-mist">
        {field.label}
        {field.required && <span className="text-pink">*</span>}
        {field.pending && isEmpty(value) && <span className="rounded bg-amber-300/10 px-1.5 py-0.5 text-[0.65rem] text-amber-200">pendiente</span>}
      </label>
      {control}
      {error ? (
        <p id={`${id}-err`} className="mt-1 text-xs text-red-300">
          {error}
        </p>
      ) : (
        field.help && (
          <p id={`${id}-help`} className="mt-1 text-xs text-mist/80">
            {field.help}
          </p>
        )
      )}
    </div>
  );
}

type I18nValue = { es?: Record<string, unknown> };

/** Campo base en inglés + su traducción al español (values.i18n.es[campo]). */
function TranslatableField({ field, values, setValue, error }: FieldProps) {
  const i18n = (values.i18n as I18nValue | undefined) ?? {};
  const es = i18n.es ?? {};
  const esName = `${field.name}__es`;
  return (
    <div className={cn("space-y-2 rounded-xl border border-white/[0.06] bg-white/[0.015] p-3", field.span === 2 && "sm:col-span-2")}>
      <Field field={{ ...field, translatable: false, span: 1, label: `${field.label} · EN` }} values={values} setValue={setValue} error={error} />
      <Field
        field={{ ...field, translatable: false, span: 1, name: esName, label: `${field.label} · ES`, required: false, pending: false, help: "Traducción al español (opcional: si está vacío se muestra el inglés)." }}
        values={{ [esName]: es[field.name] ?? (field.type === "tags" || field.type === "lines" ? [] : "") }}
        setValue={(_, v) => setValue("i18n", { ...i18n, es: { ...es, [field.name]: v } })}
      />
    </div>
  );
}

/** Lista de elementos, uno por línea. Conserva el texto mientras se edita. */
function LinesInput({ value, onChange, ...rest }: { value: string[]; onChange: (v: string[]) => void } & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange">) {
  const [text, setText] = useState(() => value.join("\n"));
  return (
    <textarea
      {...rest}
      value={text}
      onChange={(e) => {
        setText(e.target.value);
        onChange(e.target.value.split("\n").map((l) => l.trim()).filter(Boolean));
      }}
      className="field resize-y"
    />
  );
}

function TagsInput({ id, value, onChange, placeholder }: { id: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const parts = draft
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (parts.length) onChange([...new Set([...value, ...parts])]);
    setDraft("");
  };
  return (
    <div className="field flex flex-wrap items-center gap-1.5 py-2">
      {value.map((t) => (
        <span key={t} className="inline-flex items-center gap-1 rounded-full bg-pink/10 py-1 pl-2.5 pr-1 text-xs text-pink-soft">
          {t}
          <button type="button" onClick={() => onChange(value.filter((x) => x !== t))} className="grid size-4 place-items-center rounded-full hover:bg-pink hover:text-ink" aria-label={`Quitar ${t}`}>
            <X className="size-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          } else if (e.key === "Backspace" && !draft && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={add}
        placeholder={value.length ? "" : placeholder ?? "Escribe y pulsa Enter"}
        className="min-w-24 flex-1 bg-transparent py-1 text-sm outline-none"
      />
    </div>
  );
}

function SingleUpload({
  value,
  kind,
  folder,
  fileType,
  onChange,
}: {
  value: string | null;
  kind: UploadKind;
  folder: string;
  fileType: string | null;
  onChange: (url: string | null, type: "pdf" | "image" | null) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const isPdf = fileType === "pdf" || value?.toLowerCase().endsWith(".pdf");

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setErr(null);
    try {
      const { url, type } = await uploadFile(file, kind, folder);
      onChange(url, type);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Error al subir.");
    } finally {
      setBusy(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div>
      <div
        className="flex items-center gap-4 rounded-xl border border-dashed border-white/15 bg-white/[0.02] p-3"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          onFile(e.dataTransfer.files[0]);
        }}
      >
        <div className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-lg bg-white/5">
          {busy ? (
            <Loader2 className="size-5 animate-spin text-pink" />
          ) : value && !isPdf ? (
            <img src={value} alt="" className="size-full object-cover" />
          ) : value ? (
            <FileText className="size-6 text-pink" />
          ) : (
            <ImagePlus className="size-5 text-mist" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          {value ? (
            <a href={value} target="_blank" rel="noopener noreferrer" className="block truncate font-mono text-xs text-mist hover:text-pink">
              {value.split("/").pop()}
            </a>
          ) : (
            <p className="text-xs text-mist">Arrastra un archivo o selecciónalo</p>
          )}
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => input.current?.click()} disabled={busy} className="inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-1.5 text-xs hover:bg-white/10">
              <Upload className="size-3.5" /> {value ? "Reemplazar" : "Subir"}
            </button>
            {value && (
              <button type="button" onClick={() => onChange(null, null)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-mist hover:bg-red-400/10 hover:text-red-200">
                <Trash2 className="size-3.5" /> Quitar
              </button>
            )}
          </div>
        </div>
        <input ref={input} type="file" hidden accept={kind === "image" ? "image/*" : kind === "pdf" ? "application/pdf" : "application/pdf,image/*"} onChange={(e) => onFile(e.target.files?.[0])} />
      </div>
      {err && <p className="mt-1 text-xs text-red-300">{err}</p>}
    </div>
  );
}

function GalleryUpload({ value, folder, onChange }: { value: string[]; folder: string; onChange: (v: string[]) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setErr(null);
    const urls: string[] = [];
    for (const f of Array.from(files).slice(0, 20 - value.length)) {
      try {
        urls.push((await uploadFile(f, "image", folder)).url);
      } catch (e) {
        setErr(e instanceof Error ? `${f.name}: ${e.message}` : "Error al subir.");
      }
    }
    onChange([...value, ...urls]);
    setBusy(false);
    if (input.current) input.current.value = "";
  }

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };

  return (
    <div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {value.map((url, i) => (
          <div key={url} className="group relative aspect-video overflow-hidden rounded-lg border border-white/10">
            <img src={url} alt="" className="size-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center gap-1 bg-ink/70 opacity-0 transition group-hover:opacity-100 group-focus-within:opacity-100">
              <button type="button" onClick={() => move(i, -1)} className="rounded bg-white/10 px-1.5 text-xs" aria-label="Mover a la izquierda">
                ←
              </button>
              <button type="button" onClick={() => onChange(value.filter((u) => u !== url))} className="rounded bg-red-400/80 p-1" aria-label="Quitar imagen">
                <Trash2 className="size-3" />
              </button>
              <button type="button" onClick={() => move(i, 1)} className="rounded bg-white/10 px-1.5 text-xs" aria-label="Mover a la derecha">
                →
              </button>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => input.current?.click()}
          disabled={busy || value.length >= 20}
          className="grid aspect-video place-items-center rounded-lg border border-dashed border-white/15 text-mist hover:border-pink/40 hover:text-pink"
          aria-label="Añadir capturas"
        >
          {busy ? <Loader2 className="size-5 animate-spin" /> : <Plus className="size-5" />}
        </button>
      </div>
      <input ref={input} type="file" multiple hidden accept="image/*" onChange={(e) => onFiles(e.target.files)} />
      {err && <p className="mt-1 text-xs text-red-300">{err}</p>}
    </div>
  );
}
