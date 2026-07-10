import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CourseCatalog from "@/components/CourseCatalog";
import { getAllCourses } from "@/lib/courses";

export default async function CoursePage() {
  const courses = await getAllCourses();

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <CourseCatalog courses={courses} />
      <Footer />
    </main>
  );
}
