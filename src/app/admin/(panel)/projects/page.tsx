import { adminList } from "@/services/admin";
import { AdminResource } from "@/components/admin/resources";

export default async function Page() {
  const rows = await adminList<{ id: string }>("projects");
  return <AdminResource resource="projects" rows={rows} />;
}
