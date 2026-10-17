import { notFound } from "next/navigation";
import { GradeView } from "@/components/GradeView";
import { GRADES, getGrade } from "@/lib/curriculum";

export function generateStaticParams() {
  return GRADES.map((g) => ({ grade: String(g.grade) }));
}

export default async function GradePage({ params }: { params: Promise<{ grade: string }> }) {
  const { grade } = await params;
  if (!getGrade(Number(grade))) notFound();
  return <GradeView grade={Number(grade)} />;
}
