import { notFound } from "next/navigation";
import { getMockTestSlugs, getMockTestBySlug } from "@/lib/mockTests";
import MockTestInstructions from "@/components/MockTestInstructions";

export async function generateStaticParams() {
  const slugs = await getMockTestSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function InstructionsPage({ params }: { params: { slug: string } }) {
  const test = await getMockTestBySlug(params.slug);

  if (!test) {
    notFound();
  }

  return <MockTestInstructions test={test} />;
}
