import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import CourseEditForm from "./CourseEditForm";

export const dynamic = "force-dynamic";

export default async function AdminCourseEditPage({
  params,
}: {
  params: { slug: string };
}) {
  const { data: course, error } = await supabaseAdmin
    .from("courses")
    .select(
      "slug, title, desc, long_desc, category, price, old_price, duration, lessons, level, language, files, rating, students, img, access_type, delivery_type, modules, outcomes, ideal_for, faqs"
    )
    .eq("slug", params.slug)
    .maybeSingle();

  if (error || !course) notFound();

  return (
    <div>
      <Link
        href="/admin/courses"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ChevronLeft size={15} />
        Back to Courses
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Course</h1>
        <p className="text-sm text-gray-500 mt-0.5 font-mono">{course.slug}</p>
      </div>

      <CourseEditForm course={course} />
    </div>
  );
}
