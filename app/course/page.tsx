import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCatalog from "@/components/CourseCatalog";
import PageHeroBanner from "@/components/PageHeroBanner";
import { getAllCourses } from "@/lib/courses";
import { getActiveCategories } from "@/lib/categories";

export const revalidate = 300; // revalidate every 5 minutes

export default async function CoursePage() {
  const [courses, orderedCategories] = await Promise.all([
    getAllCourses(),
    getActiveCategories(),
  ]);

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <PageHeroBanner
        title="Explore Our Legal Courses"
        subtitle="Practical, career-focused courses built to help you crack exams, land internships, and build real legal skills."
        variant="courses"
      />
      <CourseCatalog courses={courses} orderedCategories={orderedCategories} />
      <Footer />
    </main>
  );
}
