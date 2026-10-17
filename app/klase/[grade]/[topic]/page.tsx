import { notFound } from "next/navigation";
import { TopicView } from "@/components/TopicView";
import { GRADES, getTopic } from "@/lib/curriculum";

export function generateStaticParams() {
  return GRADES.flatMap((g) => g.topics.map((t) => ({ grade: String(g.grade), topic: t.id })));
}

export default async function TopicPage({ params }: { params: Promise<{ grade: string; topic: string }> }) {
  const { grade, topic } = await params;
  if (!getTopic(Number(grade), topic)) notFound();
  return <TopicView grade={Number(grade)} topicId={topic} />;
}
