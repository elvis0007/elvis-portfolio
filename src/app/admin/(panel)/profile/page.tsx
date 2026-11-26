import { adminList } from "@/services/admin";
import { ProfileForm } from "@/components/admin/ProfileForm";
import { AdminResource } from "@/components/admin/resources";
import type { Profile } from "@/types/content";

export default async function Page() {
  const [profiles, socials] = await Promise.all([adminList<Profile>("profile", [{ column: "id" }]), adminList<{ id: string }>("social_links")]);
  return (
    <div className="space-y-16">
      {profiles[0] ? <ProfileForm profile={profiles[0]} /> : <p className="text-mist">Ejecuta seed.sql para crear el perfil inicial.</p>}
      <AdminResource resource="social_links" rows={socials} />
    </div>
  );
}
