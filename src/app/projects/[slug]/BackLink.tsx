"use client";
import Link from "next/link";
import { ArrowLeft, Languages } from "lucide-react";
import { useI18n } from "@/i18n/LocaleProvider";

export function BackLink({ slug }: { slug: string }) {
  const { t, locale, toggle } = useI18n();
  return (
    <div className="fixed inset-x-4 top-4 z-50 flex items-center justify-between">
      <Link href={`/?project=${slug}#projects`} className="inline-flex items-center gap-2 rounded-full border border-outline-variant bg-ink/85 px-4 py-2 text-sm font-semibold backdrop-blur hover:text-pink">
        <ArrowLeft className="size-4" /> {t.projects.back}
      </Link>
      <button onClick={toggle} aria-label={t.langLabel} className="nn-label inline-flex items-center gap-1 rounded-full border border-outline-variant bg-ink/85 px-3.5 py-2 backdrop-blur hover:border-pink">
        <Languages className="size-4 text-pink" aria-hidden />
        <span className={locale === "en" ? "text-snow" : "text-mist"}>EN</span>/<span className={locale === "es" ? "text-snow" : "text-mist"}>ES</span>
      </button>
    </div>
  );
}
