import { adminList } from "@/services/admin";
import { AdminResource } from "@/components/admin/resources";

export default async function Page() {
  const rows = await adminList<{ id: string }>("timeline_entries");
  return <AdminResource resource="timeline_entries" rows={rows} />;
}
