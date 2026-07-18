import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import BlogEditForm from "./BlogEditForm";

export const dynamic = "force-dynamic";

export default async function AdminBlogEditPage({
  params,
}: {
  params: { slug: string };
}) {
  const { data: post, error } = await supabaseAdmin
    .from("blogs")
    .select("*")
    .eq("slug", params.slug)
    .maybeSingle();

  if (error || !post) notFound();

  return (
    <div>
      <Link
        href="/admin/blogs"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ChevronLeft size={15} />
        Back to Blog Posts
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Post</h1>
        <p className="text-sm text-gray-500 mt-0.5 font-mono">{post.slug}</p>
      </div>

      <BlogEditForm post={post} />
    </div>
  );
}
