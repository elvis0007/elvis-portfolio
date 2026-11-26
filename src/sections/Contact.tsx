"use client";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight, Check, Copy, Download } from "lucide-react";
import { BrandIcon } from "@/components/ui/BrandIcon";
import { Button, LinkButton } from "@/components/ui/Button";
import { useCopy } from "@/hooks/useCopy";
import { waNumber, whatsappSchema, whatsappUrl, type ContactField } from "@/lib/validation/contact";
import { safeUrl } from "@/lib/utils";
import { useI18n } from "@/i18n/LocaleProvider";
import type { Profile, SectionContent, SocialLink } from "@/types/content";

const FIELDS: { name: ContactField; autoComplete?: string; textarea?: boolean; max: number }[] = [
  { name: "name", autoComplete: "name", max: 100 },
  { name: "subject", max: 150 },
  { name: "message", textarea: true, max: 1500 },
];

/** Contacto: el formulario arma el mensaje y lo abre en WhatsApp (app o WhatsApp Web). */
export function Contact({ profile, socials, section }: { profile: Profile; socials: SocialLink[]; section: SectionContent }) {
  const [errors, setErrors] = useState<Partial<Record<ContactField, string>>>({});
  const [opened, setOpened] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const { copied, copy } = useCopy();
  const { t, tr } = useI18n();
  const C = t.contact;
  const err = (code: string | undefined) => (code ? C.errors[code] ?? C.errors.invalid : undefined);
  const cv = safeUrl(profile.cv_url);
  const number = waNumber(profile.whatsapp);
  const pretty = number ? `+${number}` : null;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!number) return;
    const fd = new FormData(e.currentTarget);
    const parsed = whatsappSchema.safeParse({
      name: String(fd.get("name") ?? ""),
      subject: String(fd.get("subject") ?? ""),
      message: String(fd.get("message") ?? ""),
    });
    if (!parsed.success) {
      const next: Partial<Record<ContactField, string>> = {};
      for (const issue of parsed.error.issues) next[issue.path[0] as ContactField] ??= issue.message;
      setErrors(next);
      const first = FIELDS.find((f) => next[f.name])?.name;
      if (first) formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setErrors({});
    const { name, subject, message } = parsed.data;
    const text = C.waTemplate(name, subject, message);
    const url = whatsappUrl(number, text);
    // Se abre dentro del gesto del usuario (enlace temporal) para que el navegador no lo bloquee.
    const a = document.createElement("a");
    a.href = url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.click();
    setOpened(url);
    formRef.current?.reset();
  }

  return (
    <section id="contact" className="nn-section bg-ink">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 md:px-8 lg:grid-cols-12 lg:gap-12">
        <div className="flex flex-col gap-6 lg:col-span-5">
          <h2 className="nn-h2" data-reveal>
            {tr(section, "title")}
          </h2>
          {tr(section, "subtitle") && (
            <p className="text-base text-mist" data-reveal>
              {tr(section, "subtitle")}
            </p>
          )}

          {number && (
            <a
              href={whatsappUrl(number, C.waHello)}
              target="_blank"
              rel="noopener noreferrer"
              data-guide="whatsapp"
              className="group flex items-center gap-4 rounded-2xl border border-pink/40 bg-pink/[0.06] p-4 transition-colors hover:border-pink hover:bg-pink/[0.1]"
            >
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-pink text-on-pink shadow-[0_0_30px_-6px_rgb(244_182_204/0.8)]">
                <BrandIcon platform="whatsapp" className="size-6" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block font-display text-lg font-semibold">{C.waDirect}</span>
                <span className="nn-label block text-mist">{pretty}</span>
              </span>
              <ArrowUpRight className="size-5 text-pink transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          )}

          {(number || cv) && (
            <div className="flex flex-wrap gap-3">
              {number && (
                <Button variant="outline" size="sm" onClick={() => copy(pretty!)} aria-live="polite">
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  {copied ? C.copied : C.copy}
                </Button>
              )}
              {cv && (
                <LinkButton href={cv} external download variant="subtle" size="sm">
                  <Download className="size-4" /> {C.cv}
                </LinkButton>
              )}
            </div>
          )}

          <ul className="grid grid-cols-2 gap-3">
            {socials.map((s) => {
              const url = safeUrl(s.url);
              if (!url) return null;
              return (
                <li key={s.id}>
                  <a href={url} target="_blank" rel="noopener noreferrer" className="nn-card nn-card-hover flex items-center justify-between gap-2 px-4 py-4 text-sm font-semibold">
                    <span className="flex items-center gap-2">
                      <BrandIcon platform={s.platform} className="size-4 text-mist" />
                      {s.label}
                    </span>
                    <ArrowUpRight className="size-5 text-pink" />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="rounded-3xl border border-outline-variant bg-ink-2 p-6 md:p-8 lg:col-span-7" data-reveal>
          {!number ? (
            <div className="grid min-h-[20rem] place-items-center text-center text-mist" role="note">
              <p className="max-w-sm">{C.notConfigured}</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {opened ? (
                <motion.div key="sent" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} className="grid min-h-[22rem] place-items-center text-center" role="status">
                  <div>
                    <motion.div
                      initial={{ scale: 0, rotate: -90 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", damping: 12, delay: 0.1 }}
                      className="mx-auto grid size-20 place-items-center rounded-full bg-pink text-on-pink shadow-[0_0_60px_-5px_rgb(244_182_204/0.8)]"
                    >
                      <BrandIcon platform="whatsapp" className="size-9" />
                    </motion.div>
                    <h3 className="mt-6 font-display text-2xl font-semibold">{C.sentTitle}</h3>
                    <p className="mx-auto mt-2 max-w-sm text-mist">{C.sentText}</p>
                    <div className="mt-6 flex flex-wrap justify-center gap-3">
                      <LinkButton href={opened} external variant="outline">
                        {C.reopen} <ArrowUpRight className="size-4" />
                      </LinkButton>
                      <Button variant="ghost" onClick={() => setOpened(null)}>
                        {C.another}
                      </Button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.form key="form" ref={formRef} onSubmit={onSubmit} noValidate initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-5 md:grid-cols-2">
                  {FIELDS.map((f) => (
                    <div key={f.name} className={f.name === "name" ? "" : "md:col-span-2"}>
                      <label htmlFor={`c-${f.name}`} className="mb-2 block text-sm font-semibold">
                        {C.fields[f.name]}
                        {f.name === "subject" && <span className="ml-1 font-normal text-mist">{C.optional}</span>}
                      </label>
                      {f.textarea ? (
                        <textarea
                          id={`c-${f.name}`}
                          name={f.name}
                          rows={5}
                          maxLength={f.max}
                          placeholder={C.placeholders[f.name]}
                          className="nn-input resize-y"
                          aria-invalid={!!errors[f.name]}
                          aria-describedby={errors[f.name] ? `c-${f.name}-err` : undefined}
                          onChange={() => errors[f.name] && setErrors((e) => ({ ...e, [f.name]: undefined }))}
                        />
                      ) : (
                        <input
                          id={`c-${f.name}`}
                          name={f.name}
                          type="text"
                          autoComplete={f.autoComplete}
                          maxLength={f.max}
                          placeholder={C.placeholders[f.name]}
                          className="nn-input"
                          aria-invalid={!!errors[f.name]}
                          aria-describedby={errors[f.name] ? `c-${f.name}-err` : undefined}
                          onChange={() => errors[f.name] && setErrors((e) => ({ ...e, [f.name]: undefined }))}
                        />
                      )}
                      {errors[f.name] && (
                        <p id={`c-${f.name}-err`} className="mt-1.5 text-sm text-crimson">
                          {err(errors[f.name])}
                        </p>
                      )}
                    </div>
                  ))}

                  <div className="flex flex-col-reverse items-start justify-between gap-4 md:col-span-2 md:flex-row md:items-center">
                    <p className="text-sm text-mist">{C.privacy}</p>
                    <Button type="submit" size="lg" data-guide="send">
                      {C.send}
                      <BrandIcon platform="whatsapp" className="size-5" />
                    </Button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          )}
        </div>
      </div>
    </section>
  );
}
