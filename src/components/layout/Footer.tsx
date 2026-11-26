"use client";
import { useI18n } from "@/i18n/LocaleProvider";

export function Footer({ name, context }: { name: string; context?: string }) {
  const { t } = useI18n();
  return (
    <footer className="border-t border-outline-variant bg-ink-2 pb-28 pt-8 md:pb-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 md:flex-row md:items-center md:px-8">
        <p className="nn-label text-mist">
          © {new Date().getFullYear()} {name} — {context ?? t.footer.left}
        </p>
      </div>
    </footer>
  );
}
