"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { BlogPost } from "@/lib/blogs";
import { ArrowRight } from "lucide-react";

const covers = [
  "bg-gradient-to-br from-black via-primary-700 to-primary-400",
  "bg-gradient-to-tr from-primary-900 via-primary-600 to-black",
  "bg-gradient-to-bl from-black via-primary-500 to-primary-200",
  "bg-gradient-to-r from-primary-700 via-black to-primary-400",
];

export default function BlogDetail({ post, allPosts = [] }: { post: BlogPost; allPosts?: BlogPost[] }) {
  const coverIndex = allPosts.findIndex((p) => p.slug === post.slug);
  const coverClass = covers[Math.max(coverIndex, 0) % covers.length];

  const more = allPosts.filter((p) => p.category === post.category && p.slug !== post.slug).slice(0, 3);

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />

      <section className="pt-28 sm:pt-32 pb-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`relative rounded-3xl overflow-hidden ${coverClass} min-h-[280px] sm:min-h-[360px] flex items-center justify-center p-6`}>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="relative bg-white rounded-2xl p-6 sm:p-8 max-w-lg w-full text-center"
            >
              <div className="flex items-center justify-center gap-2 mb-5">
                <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{post.category.toUpperCase()}</span>
                <span className="text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1 rounded-full">{post.readTime}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5">{post.title}</h1>
              <div className="flex items-center justify-center gap-3">
                <img src={post.authorImg} alt={post.author} className="w-9 h-9 rounded-full object-cover" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">{post.author}</p>
                  <p className="text-xs text-gray-500">{post.date}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="pb-16">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <article className="prose-blog">
            {post.content.map((block, i) => {
              if (block.type === "heading") {
                return (
                  <h2 key={i} className="text-2xl font-bold text-gray-900 dark:text-white mt-10 mb-4">
                    {block.text}
                  </h2>
                );
              }
              if (block.type === "paragraph") {
                return (
                  <p key={i} className="text-gray-600 dark:text-gray-400 leading-relaxed mb-5">
                    {block.text}
                  </p>
                );
              }
              if (block.type === "quote") {
                return (
                  <blockquote key={i} className="border-l-4 border-primary-600 bg-gray-50 dark:bg-gray-800 rounded-r-xl pl-5 pr-4 py-4 text-gray-700 dark:text-gray-300 italic mb-6">
                    {block.text}
                  </blockquote>
                );
              }
              if (block.type === "numbered") {
                return (
                  <ol key={i} className="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400 mb-6">
                    {block.items?.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ol>
                );
              }
              if (block.type === "bulleted") {
                return (
                  <ul key={i} className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400 mb-6">
                    {block.items?.map((item, j) => (
                      <li key={j}>{item}</li>
                    ))}
                  </ul>
                );
              }
              return null;
            })}
          </article>
        </div>
      </section>

      {more.length > 0 && (
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">More from that category</h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {more.map((mp) => {
                const idx = allPosts.findIndex((p) => p.slug === mp.slug);
                return (
                  <Link key={mp.slug} href={`/blogs/${mp.slug}`} className="group">
                    <div className={`rounded-2xl h-40 mb-4 ${covers[idx % covers.length]}`} />
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors">{mp.title}</h3>
                    <div className="flex items-center gap-3 mb-3">
                      <img src={mp.authorImg} alt={mp.author} className="w-7 h-7 rounded-full object-cover" />
                      <div>
                        <p className="text-xs font-medium text-gray-900 dark:text-white">{mp.author}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{mp.date}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600">
                      Read More <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </main>
  );
}
