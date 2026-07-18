import { supabase } from "@/lib/supabaseClient";

export interface ContentBlock {
  type: "heading" | "paragraph" | "quote" | "numbered" | "bulleted" | "html" | "image" | "divider";
  text?: string;
  items?: string[];
  html?: string;
  src?: string;
  alt?: string;
  level?: 1 | 2 | 3 | 4;
}

export interface BlogPost {
  slug: string;
  category: string;
  readTime: string;
  title: string;
  excerpt: string;
  author: string;
  authorImg: string;
  date: string;
  img: string;
  content: ContentBlock[];
  featured: boolean;
  tags: string[];
}

interface BlogRow {
  slug: string;
  category: string;
  read_time: string;
  title: string;
  excerpt: string;
  author: string;
  author_img: string;
  date: string;
  img: string;
  content: ContentBlock[] | null;
  featured: boolean | null;
  tags: string[] | null;
}

const mapRow = (row: BlogRow): BlogPost => ({
  slug: row.slug,
  category: row.category,
  readTime: row.read_time,
  title: row.title,
  excerpt: row.excerpt,
  author: row.author,
  authorImg: row.author_img,
  date: row.date,
  img: row.img,
  content: row.content ?? [],
  featured: row.featured ?? false,
  tags: row.tags ?? [],
});

export async function getAllBlogPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase.from("blogs").select("*").order("id", { ascending: true });

  if (error) {
    console.error("Failed to load blog posts from Supabase:", error.message);
    return [];
  }

  return (data as BlogRow[]).map(mapRow);
}

export async function getBlogSlugs(): Promise<string[]> {
  const { data, error } = await supabase.from("blogs").select("slug");

  if (error) {
    console.error("Failed to load blog slugs from Supabase:", error.message);
    return [];
  }

  return (data as { slug: string }[]).map((row) => row.slug);
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabase.from("blogs").select("*").eq("slug", slug).maybeSingle();

  if (error) {
    console.error("Failed to load blog post from Supabase:", error.message);
    return null;
  }

  if (!data) return null;

  return mapRow(data as BlogRow);
}
