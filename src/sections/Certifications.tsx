"use client";
import { useDeferredValue, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Award, BadgeCheck, ExternalLink, Hash, Search } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { LinkButton } from "@/components/ui/Button";
import { cn, safeUrl } from "@/lib/utils";
import { useI18n } from "@/i18n/LocaleProvider";
import type { Certificate, SectionContent } from "@/types/content";

function isExpired(c: Certificate) {
  return !!c.expires_at && new Date(c.expires_at) < new Date();
}

export function Certifications({ certificates, section }: { certificates: Certificate[]; section: SectionContent }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [selected, setSelected] = useState<Certificate | null>(null);
  const deferred = useDeferredValue(query);
  const { t, tr } = useI18n();
  const C = t.certs;

  const categories = useMemo(() => [...new Set(certificates.map((c) => c.category))].sort(), [certificates]);
  const list = useMemo(() => {
    const q = deferred.trim().toLowerCase();
    return certificates.filter(
      (c) =>
        (category === "all" || c.category === category) &&
        (!q || [c.title, tr(c, "title"), c.issuer, tr(c, "category"), tr(c, "description") ?? ""].some((f) => f.toLowerCase().includes(q))),
    );
  }, [certificates, category, deferred, tr]);

  return (
    <section id="certifications" className="nn-section bg-ink">
      <div className="mx-auto max-w-7xl px-4 md:px-8">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <h2 className="nn-h2" data-reveal>
              {tr(section, "title")}
            </h2>
            {tr(section, "subtitle") && (
              <p className="mt-2 text-mist" data-reveal>
                {tr(section, "subtitle")}
              </p>
            )}
          </div>
          {certificates.length > 0 && (
            <label className="relative block w-full md:w-72">
              <span className="sr-only">{C.searchLabel}</span>
              <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-mist" />
              <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder={C.search} className="nn-input rounded-full !bg-surface pl-11" />
            </label>
          )}
        </div>

        {certificates.length === 0 ? (
          <div className="nn-card flex flex-col items-center px-6 py-16 text-center" data-reveal>
            <Award className="mb-3 size-9 text-cyan" />
            <p className="font-display text-xl font-semibold">{C.emptyTitle}</p>
            <p className="mt-1 max-w-md text-sm text-mist">{C.emptyText}</p>
          </div>
        ) : (
          <>
            {categories.length > 1 && (
              <div className="scrollbar-none -mx-4 mb-6 flex gap-2 overflow-x-auto px-4" role="tablist" aria-label={C.categories}>
                {["all", ...categories].map((c) => (
                  <button key={c} role="tab" aria-selected={category === c} onClick={() => setCategory(c)} data-guide="filter" className="nn-chip shrink-0">
                    {c === "all" ? C.all : tr(certificates.find((x) => x.category === c)!, "category")}
                  </button>
                ))}
              </div>
            )}
            <p className="sr-only" aria-live="polite">
              {C.found(list.length)}
            </p>
            <motion.ul layout className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {list.map((c) => (
                  <motion.li key={c.id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}>
                    <CertificateCard cert={c} index={certificates.indexOf(c)} onOpen={() => setSelected(c)} />
                  </motion.li>
                ))}
              </AnimatePresence>
            </motion.ul>
            {list.length === 0 && <p className="py-16 text-center text-mist">{C.noResults(query)}</p>}
          </>
        )}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected ? tr(selected, "title") : C.certificate} eyebrow={selected ? tr(selected, "category").toUpperCase() : undefined} size="xl">
        {selected && <CertificateViewer cert={selected} />}
      </Modal>
    </section>
  );
}

function CertificateCard({ cert, index, onOpen }: { cert: Certificate; index: number; onOpen: () => void }) {
  const { t, tr, formatDate } = useI18n();
  const code = cert.credential_id ? cert.credential_id.slice(0, 14) : `CERT-${String(index + 1).padStart(3, "0")}`;
  return (
    <button onClick={onOpen} data-guide="cert" className="nn-card nn-card-hover group flex h-full w-full flex-col gap-2 p-6 text-left hover:-translate-y-0.5">
      <span className="flex items-center justify-between gap-2">
        <span className="nn-label text-cyan">{tr(cert, "category")}</span>
        <span className="nn-label text-mist">{code}</span>
      </span>
      <span className="font-display text-xl font-semibold leading-7">{tr(cert, "title")}</span>
      <span className="text-sm text-mist">{cert.issuer}</span>
      <span className="mt-auto flex items-center justify-between gap-2 border-t border-outline-variant pt-3">
        <span className="nn-label text-pink">{isExpired(cert) ? t.certs.expired : formatDate(cert.issued_at) ?? (cert.file_type === "pdf" ? "PDF" : "")}</span>
        <span className="nn-label text-snow transition-colors group-hover:text-pink">{t.certs.preview}</span>
      </span>
    </button>
  );
}

function CertificateViewer({ cert }: { cert: Certificate }) {
  const { t, tr, formatDate } = useI18n();
  const C = t.certs;
  const title = tr(cert, "title");
  const description = tr(cert, "description");
  const file = safeUrl(cert.file_url);
  const verify = safeUrl(cert.verify_url);
  return (
    <div className="grid lg:grid-cols-[1.5fr_1fr]">
      <motion.div
        className="relative mt-4 min-h-[50vh] bg-ink"
        initial={{ opacity: 0, scale: 0.96, rotateX: 8 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ type: "spring", damping: 22 }}
      >
        {file && cert.file_type === "pdf" ? (
          <iframe src={`${file}#view=FitH`} title={`PDF: ${title}`} className="h-[70vh] w-full" />
        ) : file ? (
          <a href={file} target="_blank" rel="noopener noreferrer" className="relative block h-[60vh] lg:h-[70vh]" aria-label={C.openFull}>
            <Image src={file} alt={`${C.certificate}: ${title}`} fill sizes="(max-width: 1024px) 100vw, 60vw" className="object-contain p-4" />
          </a>
        ) : (
          <div className="grid h-full min-h-[50vh] place-items-center text-mist">{C.unavailable}</div>
        )}
      </motion.div>
      <div className="space-y-5 p-6 md:p-8">
        <div>
          <p className="flex items-center gap-2 text-mist">
            <BadgeCheck className="size-4 text-pink" /> {cert.issuer}
          </p>
        </div>
        <dl className="grid gap-3 text-sm">
          {cert.issued_at && <Row label={C.issued} value={formatDate(cert.issued_at, { day: "numeric", month: "long", year: "numeric" })} />}
          {cert.expires_at && (
            <Row
              label={isExpired(cert) ? C.expiredOn : C.expires}
              value={formatDate(cert.expires_at, { day: "numeric", month: "long", year: "numeric" })}
            />
          )}
          {cert.credential_id && <Row label={C.credential} value={cert.credential_id} icon={<Hash className="size-3.5" />} mono />}
        </dl>
        {description && <p className="leading-relaxed text-snow/85">{description}</p>}
        <div className="flex flex-wrap gap-3 pt-2">
          {verify && (
            <LinkButton href={verify} external size="sm">
              {C.verify} <ExternalLink className="size-3.5" />
            </LinkButton>
          )}
          {file && (
            <LinkButton href={file} external variant="outline" size="sm">
              {C.open(cert.file_type === "pdf")} <ExternalLink className="size-3.5" />
            </LinkButton>
          )}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, icon, mono }: { label: string; value: string | null; icon?: React.ReactNode; mono?: boolean }) {
  if (!value) return null;
  return (
    <div className="flex items-center justify-between gap-4 border-b border-outline-variant pb-3">
      <dt className="text-mist">{label}</dt>
      <dd className={cn("flex items-center gap-1.5 text-right", mono && "font-mono text-xs")}>
        {icon}
        {value}
      </dd>
    </div>
  );
}
