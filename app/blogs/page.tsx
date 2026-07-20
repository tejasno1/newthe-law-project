import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogCatalog from "@/components/BlogCatalog";
import PageHeroBanner from "@/components/PageHeroBanner";
import { getAllBlogPosts } from "@/lib/blogs";

export const revalidate = 300;

export default async function BlogsPage() {
  const posts = await getAllBlogPosts();

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <PageHeroBanner
        title="Legal Insights & Updates"
        subtitle="Expert articles, case analyses, and study tips from India's top legal minds."
        variant="blogs"
      />
      <BlogCatalog posts={posts} />
      <Footer />
    </main>
  );
}
