import { SITE_URL } from "@/lib/env";
import type { Profile, SocialLink } from "@/types/content";

export function JsonLd({ profile, socials }: { profile: Profile; socials: SocialLink[] }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.full_name,
    alternateName: profile.brand_name,
    jobTitle: profile.role,
    url: SITE_URL,
    image: profile.photo_url ?? undefined,
    sameAs: socials.map((s) => s.url),
  };
  // Escapamos "<" para que el JSON no pueda cerrar la etiqueta <script>.
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
