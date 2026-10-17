import { Suspense } from "react";
import { ChatView } from "@/components/ChatView";

export default function ChatPage() {
  return (
    <Suspense>
      <ChatView />
    </Suspense>
  );
}
