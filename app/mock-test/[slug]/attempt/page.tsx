import { notFound } from "next/navigation";
import { getMockTestSlugs, getMockTestBySlug, getAllMockTests } from "@/lib/mockTests";
import MockTestAttempt from "@/components/MockTestAttempt";

export async function generateStaticParams() {
  const slugs = await getMockTestSlugs();
  return slugs.map((slug) => ({ slug }));
}

// getMockTestBySlug and getAllMockTests now return MockTestSafe —
// correctIndex is stripped server-side and never reaches the client.
export default async function AttemptPage({ params }: { params: { slug: string } }) {
  const test = await getMockTestBySlug(params.slug);
  if (!test) notFound();

  const allTests = await getAllMockTests();
  return <MockTestAttempt test={test} allTests={allTests} />;
}
