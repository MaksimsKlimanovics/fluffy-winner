import { notFound } from "next/navigation";
import { DuelRoom } from "@/components/duel/DuelRoom";
import { cleanCode } from "@/lib/duel";

export default async function DuelRoomPage({ params }: { params: Promise<{ code: string }> }) {
  const code = cleanCode((await params).code);
  if (!code) notFound();
  return <DuelRoom code={code} />;
}
