import { notFound } from "next/navigation";
import { getMockTestBySlug, getAllMockTests } from "@/lib/mockTests";
import MockTestAttempt from "@/components/MockTestAttempt";

// Never pre-render at build time — questions come from DB at request time
export const dynamic = "force-dynamic";

export default async function AttemptPage({ params }: { params: { slug: string } }) {
  const test = await getMockTestBySlug(params.slug);
  if (!test) notFound();

  const allTests = await getAllMockTests();
  return <MockTestAttempt test={test} allTests={allTests} />;
}
