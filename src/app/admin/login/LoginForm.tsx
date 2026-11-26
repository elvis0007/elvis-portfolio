"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, LogIn } from "lucide-react";
import { getBrowserClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/Button";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [show, setShow] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    if (!email || !password) return setError("Introduce tu correo y contraseña.");
    setLoading(true);
    setError(null);
    const { error } = await getBrowserClient().auth.signInWithPassword({ email, password });
    if (error) {
      setLoading(false);
      setError(error.message === "Invalid login credentials" ? "Credenciales incorrectas." : "No se pudo iniciar sesión. Inténtalo de nuevo.");
      return;
    }
    const next = params.get("next");
    router.replace(next && next.startsWith("/admin") ? next : "/admin");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
      <label className="block">
        <span className="mb-1.5 block text-sm text-mist">Correo</span>
        <input name="email" type="email" autoComplete="email" required className="field" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm text-mist">Contraseña</span>
        <span className="relative block">
          <input name="password" type={show ? "text" : "password"} autoComplete="current-password" required className="field pr-12" />
          <button type="button" onClick={() => setShow((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-mist hover:text-snow" aria-label={show ? "Ocultar contraseña" : "Mostrar contraseña"}>
            {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </span>
      </label>
      {error && (
        <p role="alert" className="rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-200">
          {error}
        </p>
      )}
      <Button type="submit" className="w-full" size="lg" disabled={loading}>
        {loading ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />} Entrar
      </Button>
    </form>
  );
}
