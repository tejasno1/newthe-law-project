import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCatalog from "@/components/CourseCatalog";
import { getAllCourses } from "@/lib/courses";
import { getActiveCategories } from "@/lib/categories";

export const dynamic = "force-dynamic";

export default async function CoursePage() {
  const [courses, orderedCategories] = await Promise.all([
    getAllCourses(),
    getActiveCategories(),
  ]);

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <CourseCatalog courses={courses} orderedCategories={orderedCategories} />
      <Footer />
    </main>
  );
}
