import { supabaseAdmin } from "@/lib/supabaseAdmin";
import Link from "next/link";
import { Pencil, Star, Plus } from "lucide-react";
import Image from "next/image";

export const dynamic = "force-dynamic";

export default async function AdminBlogsPage() {
  const { data: posts, error } = await supabaseAdmin
    .from("blogs")
    .select("slug, title, category, date, img, author, featured, read_time")
    .order("id", { ascending: false });

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
        Failed to load blog posts: {error.message}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Blog Posts</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {posts?.length ?? 0} post{(posts?.length ?? 0) !== 1 ? "s" : ""} total
          </p>
        </div>
        <Link
          href="/admin/blogs/new"
          className="flex items-center gap-1.5 px-4 py-2 bg-[#4d65ff] hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors"
        >
          <Plus size={15} />
          New Post
        </Link>
      </div>

      <div className="space-y-3">
        {(posts ?? []).map((post) => (
          <div
            key={post.slug}
            className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 transition-colors"
          >
            {/* Thumbnail */}
            <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
              {post.img ? (
                <Image
                  src={post.img}
                  alt={post.title}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[#4d65ff]/10 to-[#4d65ff]/5" />
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-gray-900 truncate">{post.title}</p>
                {post.featured && (
                  <Star size={12} className="text-amber-500 fill-amber-500 flex-shrink-0" />
                )}
              </div>
              <div className="flex items-center gap-2 mt-0.5 text-sm text-gray-500 flex-wrap">
                {post.category && <span>{post.category}</span>}
                {post.date && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span>{new Date(post.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
                  </>
                )}
                {post.read_time && (
                  <>
                    <span className="text-gray-300">·</span>
                    <span>{post.read_time}</span>
                  </>
                )}
              </div>
              {post.author && (
                <p className="text-xs text-gray-400 mt-0.5">by {post.author}</p>
              )}
            </div>

            {/* Slug badge */}
            <span className="hidden md:inline-flex flex-shrink-0 px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs font-mono">
              {post.slug}
            </span>

            {/* Edit button */}
            <Link
              href={`/admin/blogs/${post.slug}`}
              className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 bg-[#4d65ff] hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              <Pencil size={13} />
              Edit
            </Link>
          </div>
        ))}

        {(posts ?? []).length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg font-medium text-gray-500">No blog posts yet</p>
            <p className="text-sm mt-1">Click &ldquo;New Post&rdquo; to create your first one.</p>
          </div>
        )}
      </div>
    </div>
  );
}
