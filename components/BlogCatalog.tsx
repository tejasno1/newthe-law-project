"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { BlogPost } from "@/lib/blogs";
import { LayoutGrid, BookOpen, Scale, FileText, ClipboardList, Clock } from "lucide-react";

const covers = [
  "bg-gradient-to-br from-black via-primary-700 to-primary-400",
  "bg-gradient-to-tr from-primary-900 via-primary-600 to-black",
  "bg-gradient-to-bl from-black via-primary-500 to-primary-200",
  "bg-gradient-to-r from-primary-700 via-black to-primary-400",
];

const CAT_ICONS: Record<string, React.ElementType> = {
  "All":            LayoutGrid,
  "Constitutional": Scale,
  "Criminal":       FileText,
  "Civil":          ClipboardList,
  "Corporate":      BookOpen,
};
function catIcon(name: string): React.ElementType {
  for (const key of Object.keys(CAT_ICONS)) {
    if (name.toLowerCase().includes(key.toLowerCase())) return CAT_ICONS[key];
  }
  return BookOpen;
}

export default function BlogCatalog({ posts }: { posts: BlogPost[] }) {
  const [activeCategory, setActiveCategory] = useState("All");

  if (posts.length === 0) {
    return (
      <section className="pt-28 sm:pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">
          No blog posts found yet.
        </div>
      </section>
    );
  }

  const categories = ["All", ...Array.from(new Set(posts.map((p) => p.category)))];

  const filtered = activeCategory === "All"
    ? posts
    : posts.filter((p) => p.category === activeCategory);

  return (
    <section className="bg-white dark:bg-gray-900 pt-28 sm:pt-32 pb-14 sm:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="text-center max-w-2xl mx-auto mt-6 sm:mt-4 mb-6 sm:mb-10">
          <p className="text-[10px] sm:text-xs font-bold tracking-widest text-primary-600 uppercase mb-2 sm:mb-3">
            News, Analysis &amp; Career Roadmaps
          </p>
          <h1 className="text-[22px] sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-3 sm:mb-4 leading-tight">
            Your guide to become a{" "}
            <span className="text-gradient">complete lawyer</span>
          </h1>
          <p className="text-xs sm:text-base text-gray-500 dark:text-gray-400">
            Staying ahead in the legal field — one article at a time.
          </p>
        </div>

        {/* Category filter chips */}
        <div className="flex flex-nowrap sm:flex-wrap overflow-x-auto sm:overflow-visible scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0 justify-start sm:justify-center gap-2.5 mb-10 pb-1 sm:pb-0">
          {categories.map((cat) => {
            const Icon = cat === "All" ? LayoutGrid : catIcon(cat);
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-200 ${
                  active
                    ? "border-2 border-primary-600 text-primary-600 bg-white dark:bg-gray-900"
                    : "border border-transparent text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${active ? "text-primary-600" : "text-gray-500"}`} />
                {cat}
              </button>
            );
          })}
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-16">No posts found for this category.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filtered.map((post, i) => {
              const coverIdx = posts.findIndex((p) => p.slug === post.slug);
              return (
                <motion.div
                  key={post.slug}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 6) * 0.06, duration: 0.4 }}
                >
                  <Link
                    href={`/blogs/${post.slug}`}
                    className="group block rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 hover:shadow-lg hover:shadow-black/8 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300"
                  >
                    {/* Thumbnail */}
                    <div className="relative overflow-hidden">
                      {post.img ? (
                        <img
                          src={post.img}
                          alt={post.title}
                          className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        <div className={`w-full h-44 transition-transform duration-500 group-hover:scale-105 ${covers[coverIdx % covers.length]}`} />
                      )}
                      {/* Badges on image */}
                      <div className="absolute top-3 right-3 flex items-center gap-1.5">
                        <span className="bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm">
                          {post.category}
                        </span>
                      </div>
                    </div>

                    {/* Body */}
                    <div className="p-3.5 sm:p-4">
                      <h3 className="font-bold text-gray-900 dark:text-white text-sm sm:text-[15px] leading-snug mb-2 line-clamp-2">
                        {post.title}
                      </h3>

                      <p className="text-[11px] sm:text-xs text-gray-400 dark:text-gray-500 mb-2 sm:mb-3 flex items-center gap-1">
                        <Clock className="w-3 h-3 flex-shrink-0" /> {post.readTime} &middot; {post.date}
                      </p>

                      <p className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-3 sm:mb-4 leading-relaxed">
                        {post.excerpt}
                      </p>

                      <div className="pt-2.5 sm:pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                        <span className="text-[11px] sm:text-xs text-gray-500 dark:text-gray-400">{post.date}</span>
                        <span className="bg-gray-900 dark:bg-gray-700 group-hover:bg-primary-600 dark:group-hover:bg-primary-600 text-white text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors duration-200 whitespace-nowrap">
                          Read article
                        </span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
