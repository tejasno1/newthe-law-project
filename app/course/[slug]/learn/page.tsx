import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCourseBySlug } from "@/lib/courses";
import CourseLearning from "@/components/CourseLearning";

export const dynamic = "force-dynamic";

export default async function LearnPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/auth/login?redirect=/course/${params.slug}/learn`);
  }

  const course = await getCourseBySlug(params.slug);
  if (!course) notFound();

  const candidateName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    (user.email?.split("@")[0] ?? "Student");

  return <CourseLearning course={course} candidateName={candidateName} />;
}
