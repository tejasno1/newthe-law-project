import { supabaseAdmin } from "@/lib/supabaseAdmin";
import Link from "next/link";
import { Pencil, BookOpen, IndianRupee, Plus } from "lucide-react";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function AdminCoursesPage() {
  const { data: courses, error } = await supabaseAdmin
    .from("courses")
    .select("slug, title, category, price, old_price, img, access_type, level")
    .order("id", { ascending: true });

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
        Failed to load courses: {error.message}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Courses</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {courses?.length ?? 0} course{(courses?.length ?? 0) !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          href="/admin/courses/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-[#4d65ff] hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus size={15} />
          New Course
        </Link>
      </div>

      <div className="space-y-3">
        {(courses ?? []).map((course) => (
          <div
            key={course.slug}
            className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
          >
            {/* Thumbnail */}
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
              {course.img ? (
                <Image
                  src={course.img}
                  alt={course.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <BookOpen size={20} className="text-gray-400" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 truncate">{course.title}</p>
              <div className="flex items-center gap-3 mt-0.5 text-sm text-gray-500">
                <span>{course.category}</span>
                {course.level && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span>{course.level}</span>
                  </>
                )}
                {course.access_type && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span className="capitalize">{course.access_type.replace(/_/g, " ")}</span>
                  </>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="flex-shrink-0 text-right hidden sm:block">
              <p className="font-semibold text-gray-900 flex items-center justify-end gap-0.5">
                <IndianRupee size={13} />
                {typeof course.price === "number"
                  ? course.price.toLocaleString("en-IN")
                  : course.price ?? "—"}
              </p>
              {course.old_price ? (
                <p className="text-xs text-gray-400 line-through flex items-center justify-end gap-0.5">
                  <IndianRupee size={10} />
                  {typeof course.old_price === "number"
                    ? course.old_price.toLocaleString("en-IN")
                    : course.old_price}
                </p>
              ) : null}
            </div>

            {/* Edit button */}
            <Link
              href={`/admin/courses/${course.slug}`}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-[#4d65ff] hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Pencil size={13} />
              Edit
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
