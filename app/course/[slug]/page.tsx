import { notFound } from "next/navigation";
import { getCourseSlugs, getCourseBySlug, getAllCourses } from "@/lib/courses";
import CourseDetail from "@/components/CourseDetail";

export async function generateStaticParams() {
  const slugs = await getCourseSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const course = await getCourseBySlug(params.slug);

  if (!course) {
    notFound();
  }

  const allCourses = await getAllCourses();
  const related = allCourses.filter((c) => c.slug !== course.slug).slice(0, 3);

  return <CourseDetail course={course} related={related} />;
}
