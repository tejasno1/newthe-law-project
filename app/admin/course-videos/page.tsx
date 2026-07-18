import { getAdminCourseList } from "@/app/admin/actions";
import CourseVideoManager from "@/components/admin/CourseVideoManager";

export default async function CourseVideosPage() {
  const courses = await getAdminCourseList();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Course Videos</h1>
        <p className="text-sm text-gray-500 mt-1">
          Add and manage video parts for each lesson. Each lesson can have multiple parts (Part 1, Part 2, …).
        </p>
      </div>
      <CourseVideoManager courses={courses} />
    </div>
  );
}
