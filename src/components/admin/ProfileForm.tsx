"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { saveProfile } from "@/app/admin/actions";
import type { Profile } from "@/types/content";
import { Field, type FieldConfig, type Values } from "./fields";

const FIELDS: FieldConfig[] = [
  { name: "full_name", label: "Nombre completo", type: "text", required: true, maxLength: 120 },
  { name: "brand_name", label: "Marca (hero)", type: "text", required: true, maxLength: 60 },
  { name: "role", label: "Profesión / rol", type: "text", maxLength: 160, translatable: true },
  { name: "availability", label: "Etiqueta de disponibilidad (hero)", type: "text", maxLength: 160, placeholder: "Ej.: Open to internships", translatable: true },
  { name: "hero_tagline", label: "Frase principal", type: "text", span: 2, maxLength: 160, translatable: true },
  { name: "hero_subtitle", label: "Subtítulo del hero", type: "textarea", span: 2, rows: 2, maxLength: 400, translatable: true },
  { name: "photo_url", label: "Fotografía profesional", type: "image", folder: "profile", span: 2, pending: true },
  { name: "bio", label: "Descripción personal", type: "textarea", span: 2, rows: 5, pending: true, translatable: true },
  { name: "education_summary", label: "Formación académica", type: "textarea", span: 2, rows: 3, pending: true, translatable: true },
  { name: "goals", label: "Objetivos profesionales", type: "textarea", span: 2, rows: 3, pending: true, translatable: true },
  { name: "interests", label: "Intereses tecnológicos", type: "tags", span: 2, placeholder: "Web development, 3D, AI…", pending: true, translatable: true },
  { name: "whatsapp", label: "WhatsApp (con código de país, ej. 593995737456)", type: "text", maxLength: 20, pending: true },
  { name: "email", label: "Correo (opcional, no se muestra en el formulario)", type: "email" },
  { name: "location", label: "Ubicación (opcional)", type: "text", maxLength: 120 },
  { name: "cv_url", label: "CV (PDF)", type: "file", uploadKind: "pdf", folder: "cv", span: 2, pending: true },
];

export function ProfileForm({ profile }: { profile: Profile }) {
  const router = useRouter();
  const [values, setValues] = useState<Values>({ ...profile });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [saving, start] = useTransition();

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const payload = { ...Object.fromEntries(FIELDS.map((f) => [f.name, values[f.name]])), i18n: values.i18n ?? {} };
    start(async () => {
      const res = await saveProfile(payload);
      if (!res.ok) {
        setErrors(res.fieldErrors ?? {});
        setMsg({ ok: false, text: res.error });
        return;
      }
      setErrors({});
      setMsg({ ok: true, text: "Perfil actualizado y publicado." });
      router.refresh();
    });
  }

  return (
    <form onSubmit={submit} noValidate>
      <header className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <p className="eyebrow">Gestión</p>
          <h1 className="mt-2 text-3xl font-semibold md:text-4xl">Perfil</h1>
          <p className="mt-1 text-sm text-mist">Hero, About, contacto y CV. Escribe en inglés (idioma principal) y añade la versión en español.</p>
        </div>
        <button type="submit" disabled={saving} className="inline-flex h-11 items-center gap-2 self-start rounded-full bg-pink px-6 text-sm font-medium text-ink disabled:opacity-50">
          {saving && <Loader2 className="size-4 animate-spin" />} Guardar perfil
        </button>
      </header>
      {msg && (
        <p role="status" className={`mb-4 flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${msg.ok ? "border-emerald-300/30 bg-emerald-300/10 text-emerald-100" : "border-red-400/30 bg-red-400/10 text-red-100"}`}>
          {msg.ok && <CheckCircle2 className="size-4" />} {msg.text}
        </p>
      )}
      <div className="glass grid gap-5 rounded-2xl p-6 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <Field
            key={f.name}
            field={f}
            values={values}
            error={errors[f.name]}
            setValue={(n, v) => {
              setValues((p) => ({ ...p, [n]: v }));
              if (errors[n]) setErrors((e) => ({ ...e, [n]: "" }));
            }}
          />
        ))}
      </div>
    </form>
  );
}
