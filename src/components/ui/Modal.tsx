"use client";
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  size?: "md" | "lg" | "xl" | "full";
  hideTitle?: boolean;
  eyebrow?: string;
}

const sizes = {
  md: "max-w-lg",
  lg: "max-w-3xl",
  xl: "max-w-5xl",
  full: "max-w-[min(1400px,96vw)]",
};

/** Diálogo accesible: foco atrapado, cierre con Escape, bloqueo de scroll y retorno de foco. */
export function Modal({ open, onClose, title, children, className, size = "lg", hideTitle, eyebrow }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!open) return;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    const t = window.setTimeout(() => panelRef.current?.querySelector<HTMLElement>("[data-autofocus], button, a, input")?.focus(), 30);

    const onKey = (e: KeyboardEvent) => {
      // Con diálogos anidados, solo responde el que está encima.
      const dialogs = document.querySelectorAll('[role="dialog"]');
      if (dialogs[dialogs.length - 1] !== panelRef.current) return;
      if (e.key === "Escape") onCloseRef.current();
      if (e.key !== "Tab" || !panelRef.current) return;
      const focusables = panelRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, iframe, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      window.clearTimeout(t);
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus?.();
    };
  }, [open]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-ink/80 backdrop-blur-md" onClick={onClose} aria-hidden />
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={cn(
              "relative z-10 flex max-h-[calc(100svh-1.5rem)] w-full flex-col overflow-hidden rounded-3xl border border-pink/40 bg-ink-2 shadow-[0_40px_120px_-40px_rgb(0_0_0/0.9)] sm:max-h-[92svh]",
              sizes[size],
              className,
            )}
            initial={{ y: 40, scale: 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 30, scale: 0.98, opacity: 0 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
          >
            <div className={cn("flex items-start justify-between gap-4 px-6 pb-2 pt-6 md:px-8", hideTitle && "sr-only")}>
              <div className="min-w-0 pr-10">
                {eyebrow && <p className="nn-label text-cyan">{eyebrow}</p>}
                <h2 className="truncate font-display text-2xl font-semibold">{title}</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute right-4 top-4 z-20 grid size-9 place-items-center rounded-full border border-outline-variant bg-surface text-snow transition hover:border-pink"
            >
              <X className="size-5" />
            </button>
            <div className="overflow-y-auto overscroll-contain">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
