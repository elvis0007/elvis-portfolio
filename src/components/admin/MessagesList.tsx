"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Mail, MailOpen, Reply, Trash2 } from "lucide-react";
import { deleteMessage, markMessage } from "@/app/admin/actions";
import { cn, formatDate } from "@/lib/utils";
import type { ContactMessage } from "@/types/content";

export function MessagesList({ messages }: { messages: ContactMessage[] }) {
  const router = useRouter();
  const [openId, setOpenId] = useState<string | null>(null);
  const [, start] = useTransition();

  const act = (fn: () => Promise<unknown>) => start(async () => {
    await fn();
    router.refresh();
  });

  return (
    <div>
      <header className="mb-8">
        <p className="eyebrow">Bandeja</p>
        <h1 className="mt-2 text-3xl font-semibold md:text-4xl">Mensajes</h1>
        <p className="mt-1 text-sm text-mist">Recibidos desde el formulario de contacto.</p>
      </header>
      {messages.length === 0 ? (
        <div className="glass rounded-2xl p-12 text-center text-mist">Aún no hay mensajes.</div>
      ) : (
        <ul className="space-y-2">
          {messages.map((m) => {
            const open = openId === m.id;
            return (
              <li key={m.id} className={cn("glass rounded-2xl", !m.is_read && "border-pink/30")}>
                <button
                  className="flex w-full items-center gap-3 p-4 text-left"
                  aria-expanded={open}
                  onClick={() => {
                    setOpenId(open ? null : m.id);
                    if (!m.is_read) act(() => markMessage(m.id, true));
                  }}
                >
                  {m.is_read ? <MailOpen className="size-4 shrink-0 text-mist" /> : <Mail className="size-4 shrink-0 text-pink" />}
                  <span className="min-w-0 flex-1">
                    <span className={cn("block truncate", !m.is_read && "font-semibold")}>{m.subject}</span>
                    <span className="block truncate text-xs text-mist">
                      {m.name} · {m.email}
                    </span>
                  </span>
                  <span className="shrink-0 text-xs text-mist">{formatDate(m.created_at, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
                </button>
                {open && (
                  <div className="border-t border-white/[0.06] p-4">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-snow/90">{m.message}</p>
                    <div className="mt-4 flex gap-2">
                      <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + m.subject)}`} className="inline-flex items-center gap-1.5 rounded-full bg-pink px-4 py-2 text-xs font-medium text-ink">
                        <Reply className="size-3.5" /> Responder
                      </a>
                      <button onClick={() => act(() => markMessage(m.id, false))} className="rounded-full bg-white/5 px-4 py-2 text-xs">
                        Marcar no leído
                      </button>
                      <button onClick={() => act(() => deleteMessage(m.id))} className="inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs text-mist hover:bg-red-400/10 hover:text-red-200">
                        <Trash2 className="size-3.5" /> Eliminar
                      </button>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
