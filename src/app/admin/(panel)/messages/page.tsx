import { adminList } from "@/services/admin";
import { MessagesList } from "@/components/admin/MessagesList";
import type { ContactMessage } from "@/types/content";

export default async function Page() {
  const messages = await adminList<ContactMessage>("contact_messages", [{ column: "created_at", ascending: false }]);
  return <MessagesList messages={messages} />;
}
