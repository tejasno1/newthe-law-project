import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogCatalog from "@/components/BlogCatalog";
import { getAllBlogPosts } from "@/lib/blogs";

export default async function BlogsPage() {
  const posts = await getAllBlogPosts();

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <BlogCatalog posts={posts} />
      <Footer />
    </main>
  );
}
