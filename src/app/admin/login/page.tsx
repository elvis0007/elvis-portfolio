import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";
import { isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Acceso administrativo", robots: { index: false, follow: false } };

export default function LoginPage() {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden px-5">
      <div className="grid-bg pointer-events-none absolute inset-0" aria-hidden />
      <div className="pointer-events-none absolute left-1/2 top-1/2 size-[40rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-pink/10 blur-3xl" aria-hidden />
      <div className="glass-strong relative w-full max-w-md rounded-3xl p-8">
        <p className="eyebrow">Elvis Flores · Panel de control</p>
        <h1 className="mt-3 text-3xl font-semibold">Iniciar sesión</h1>
        {isSupabaseConfigured ? (
          <Suspense>
            <LoginForm />
          </Suspense>
        ) : (
          <div className="mt-6 space-y-3 text-sm text-mist">
            <p className="text-snow">Supabase aún no está configurado.</p>
            <ol className="list-decimal space-y-1.5 pl-5">
              <li>Crea un proyecto en supabase.com.</li>
              <li>Ejecuta <code className="text-pink">supabase/schema.sql</code> y <code className="text-pink">supabase/seed.sql</code> en el SQL Editor.</li>
              <li>Copia <code className="text-pink">.env.example</code> a <code className="text-pink">.env.local</code> con tu URL y anon key.</li>
              <li>Crea tu usuario y regístralo en la tabla <code className="text-pink">admins</code> (ver README).</li>
            </ol>
          </div>
        )}
      </div>
    </main>
  );
}
