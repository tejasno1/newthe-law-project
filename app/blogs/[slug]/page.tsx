import { notFound } from "next/navigation";
import { getBlogSlugs, getPostBySlug, getAllBlogPosts } from "@/lib/blogs";
import BlogDetail from "@/components/BlogDetail";

export async function generateStaticParams() {
  const slugs = await getBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const allPosts = await getAllBlogPosts();

  return <BlogDetail post={post} allPosts={allPosts} />;
}
