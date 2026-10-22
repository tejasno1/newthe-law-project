import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/auth/",
          "/login",
          "/signup",
          "/forgot-password",
          "/reset-password",
          "/course/*/learn",
          "/mock-test/*/attempt",
          "/mock-test/*/instructions",
          "/mock-test/*/report/",
        ],
      },
    ],
    sitemap: "https://www.thelawproject.in/sitemap.xml",
  };
}
