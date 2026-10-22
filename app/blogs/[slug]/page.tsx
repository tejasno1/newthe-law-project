import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getBlogSlugs, getPostBySlug, getAllBlogPosts } from "@/lib/blogs";
import BlogDetail from "@/components/BlogDetail";

const BASE = "https://www.thelawproject.in";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getBlogSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    return { title: "Post Not Found" };
  }

  const url = `${BASE}/blogs/${post.slug}`;
  const description = post.excerpt.slice(0, 160);
  const images = post.img ? [{ url: post.img, alt: post.title }] : [];

  return {
    title: post.title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: post.title,
      description,
      url,
      type: "article",
      images,
      publishedTime: post.date,
      authors: [post.author],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description,
      images: post.img ? [post.img] : [],
    },
  };
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  const allPosts = await getAllBlogPosts();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    ...(post.img && { image: post.img }),
    datePublished: post.date,
    author: {
      "@type": "Person",
      name: post.author,
    },
    publisher: {
      "@type": "Organization",
      name: "The Law Project",
      url: BASE,
    },
    url: `${BASE}/blogs/${post.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <BlogDetail post={post} allPosts={allPosts} />
    </>
  );
}
