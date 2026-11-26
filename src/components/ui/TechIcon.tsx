/* eslint-disable @next/next/no-img-element */
import { Braces, Sparkles, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Icono de tecnología. Por defecto se pinta como silueta monocroma (estilo Neon Noir) usando el SVG
 * oficial como máscara; con `color` se muestra el logotipo original.
 */
export function TechIcon({ name, src, className, color = false }: { name: string; src: string | null; className?: string; color?: boolean }) {
  const lower = name.toLowerCase();
  const Fallback = lower.includes("ia") || lower.includes("ai") ? Sparkles : lower.includes("api") ? Braces : Wrench;
  if (!src) return <Fallback className={cn("shrink-0", className)} aria-hidden />;
  if (color) return <img src={src} alt="" loading="lazy" decoding="async" className={cn("shrink-0 object-contain", className)} draggable={false} />;
  const luminance = /(nextjs|postman|typescript|intellij|photoshop|angular|javascript)\.svg$/.test(src);
  return (
    <span
      aria-hidden
      className={cn("tech-mask shrink-0", className)}
      style={{ "--icon": `url("${src}")`, maskMode: luminance ? "luminance" : undefined, WebkitMaskSourceType: luminance ? "luminance" : undefined } as React.CSSProperties}
    />
  );
}
