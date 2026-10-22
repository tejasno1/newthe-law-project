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

  // Strip all video URLs from the course before sending to the client.
  // The client component fetches each lesson's URL on-demand via /api/lesson-video
  // (authenticated + enrollment-gated), so URLs never appear in __NEXT_DATA__.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const safeCourse = {
    ...course,
    modules: course.modules.map((mod) => ({
      ...mod,
      items: mod.items.map(({ video_url: _v, video_qualities: _q, parts, ...rest }) => ({
        ...rest,
        // Keep parts labels for part-tab UI, but drop their video URLs
        ...(parts?.length
          ? { parts: parts.map(({ label }: { label: string }) => ({ label })) }
          : {}),
      })),
    })),
  };

  return <CourseLearning course={safeCourse as typeof course} candidateName={candidateName} />;
}
