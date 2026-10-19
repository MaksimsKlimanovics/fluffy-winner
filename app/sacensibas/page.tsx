import { Suspense } from "react";
import { DuelHome } from "@/components/duel/DuelHome";

export default function DuelPage() {
  return (
    <Suspense>
      <DuelHome />
    </Suspense>
  );
}
