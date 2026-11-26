import { NextResponse } from "next/server";
import { getPublicClient } from "@/lib/supabase/public";

export const dynamic = "force-dynamic";

/**
 * Consulta mínima diaria para que el plan gratuito de Supabase no pause el proyecto
 * por inactividad. La ejecuta Vercel Cron (ver vercel.json).
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }
  const supabase = getPublicClient();
  if (!supabase) return NextResponse.json({ ok: false, reason: "not_configured" });
  const { error } = await supabase.from("sections").select("key").limit(1);
  return NextResponse.json({ ok: !error, at: new Date().toISOString() });
}
