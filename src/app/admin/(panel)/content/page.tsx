import { adminList } from "@/services/admin";
import { SectionsEditor } from "@/components/admin/SectionsEditor";
import type { SectionContent } from "@/types/content";

export default async function Page() {
  const sections = await adminList<SectionContent>("sections");
  return <SectionsEditor sections={sections} />;
}
