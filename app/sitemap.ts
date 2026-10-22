import type { MetadataRoute } from "next";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getBlogSlugs } from "@/lib/blogs";
import { getMockTestSlugs } from "@/lib/mockTests";

const BASE = "https://www.thelawproject.in";

const staticRoutes: MetadataRoute.Sitemap = [
  { url: `${BASE}/`,               lastModified: new Date(), changeFrequency: "daily",   priority: 1.0 },
  { url: `${BASE}/course`,         lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
  { url: `${BASE}/blogs`,          lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
  { url: `${BASE}/mock-test`,      lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
  { url: `${BASE}/skill-training`, lastModified: new Date(), changeFrequency: "weekly",  priority: 0.8 },
  { url: `${BASE}/resources`,      lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
  { url: `${BASE}/about`,          lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
  { url: `${BASE}/contact`,        lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  { url: `${BASE}/careers`,        lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  { url: `${BASE}/publish-with-us`,lastModified: new Date(), changeFrequency: "monthly", priority: 0.5 },
  { url: `${BASE}/terms`,          lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
  { url: `${BASE}/privacy`,        lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
  { url: `${BASE}/refund`,         lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [courseSlugs, blogSlugs, testSlugs, programmeSlugs] = await Promise.all([
    supabaseAdmin.from("courses").select("slug").then(({ data }) =>
      (data ?? []).map((r) => r.slug as string)
    ),
    getBlogSlugs(),
    getMockTestSlugs(),
    supabaseAdmin.from("programmes").select("slug").then(({ data }) =>
      (data ?? []).map((r) => r.slug as string)
    ),
  ]);

  const courseUrls: MetadataRoute.Sitemap = courseSlugs.map((slug) => ({
    url: `${BASE}/course/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const blogUrls: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
    url: `${BASE}/blogs/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  const testUrls: MetadataRoute.Sitemap = testSlugs.map((slug) => ({
    url: `${BASE}/mock-test/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const programmeUrls: MetadataRoute.Sitemap = programmeSlugs.map((slug) => ({
    url: `${BASE}/skill-training/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...courseUrls, ...blogUrls, ...testUrls, ...programmeUrls];
}
