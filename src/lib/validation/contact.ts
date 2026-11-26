import { z } from "zod";

/** Formulario de contacto por WhatsApp. Los errores son códigos que la interfaz traduce (en/es). */
export const whatsappSchema = z.object({
  name: z.string().trim().min(2, "name").max(100, "too_long"),
  subject: z.string().trim().max(150, "too_long").optional().default(""),
  message: z.string().trim().min(10, "message").max(1500, "too_long"),
});

export type WhatsappInput = z.infer<typeof whatsappSchema>;
export type ContactField = "name" | "subject" | "message";

/** Deja solo los dígitos de un número (wa.me exige el formato internacional sin "+" ni espacios). */
export function waNumber(raw: string | null | undefined) {
  const digits = (raw ?? "").replace(/[^0-9]/g, "");
  return /^[0-9]{8,15}$/.test(digits) ? digits : null;
}

export function whatsappUrl(number: string, text: string) {
  return `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
}
