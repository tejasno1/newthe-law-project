"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import type { BlogPost } from "@/lib/blogs";
import { ArrowLeft, ArrowRight, Instagram, Linkedin, Mail, Twitter } from "lucide-react";

const covers = [
  "bg-gradient-to-br from-black via-primary-700 to-primary-400",
  "bg-gradient-to-tr from-primary-900 via-primary-600 to-black",
  "bg-gradient-to-bl from-black via-primary-500 to-primary-200",
  "bg-gradient-to-r from-primary-700 via-black to-primary-400",
];

const coverClass = (i: number) => covers[i % covers.length];

export default function BlogCatalog({ posts }: { posts: BlogPost[] }) {
  const [heroIndex, setHeroIndex] = useState(0);
  const heroPosts = posts.slice(0, 3);
  const heroPost = heroPosts[heroIndex];

  const textRowPosts = posts.slice(3, 6);
  const gridPosts = posts.slice(6);

  const categories = Array.from(new Set(posts.map((p) => p.category)));

  const featuredMentors = Array.from(new Map(posts.map((p) => [p.author, { name: p.author, img: p.authorImg }])).values()).slice(0, 5);

  const tags = Array.from(new Set(posts.flatMap((p) => p.tags)));

  if (posts.length === 0) {
    return (
      <section className="pt-28 sm:pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-400">
          No blog posts found yet.
        </div>
      </section>
    );
  }

  return (
    <>
      <section className="pt-28 sm:pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {categories.map((cat) => (
              <span key={cat} className="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                {cat}
              </span>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className={`relative rounded-3xl overflow-hidden ${coverClass(heroIndex)} min-h-[420px] flex items-end p-6 sm:p-10`}
          >
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 max-w-md">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">{heroPost.category.toUpperCase()}</span>
                <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">{heroPost.readTime}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">{heroPost.title}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">{heroPost.excerpt}</p>
              <div className="flex items-center gap-3 mb-6">
                <img src={heroPost.authorImg} alt={heroPost.author} className="w-9 h-9 rounded-full object-cover" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{heroPost.author}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{heroPost.date}</p>
                </div>
              </div>
              <Link
                href={`/blogs/${heroPost.slug}`}
                className="inline-flex items-center gap-2 border border-gray-200 dark:border-gray-600 rounded-full px-5 py-2.5 text-sm font-medium text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Read more <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {heroPosts.length > 1 && (
              <div className="absolute bottom-6 right-6 flex gap-2">
                <button
                  onClick={() => setHeroIndex((heroIndex - 1 + heroPosts.length) % heroPosts.length)}
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors"
                  aria-label="Previous featured post"
                >
                  <ArrowLeft className="w-4 h-4 text-gray-900" />
                </button>
                <button
                  onClick={() => setHeroIndex((heroIndex + 1) % heroPosts.length)}
                  className="w-10 h-10 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors"
                  aria-label="Next featured post"
                >
                  <ArrowRight className="w-4 h-4 text-gray-900" />
                </button>
              </div>
            )}
          </motion.div>

          {textRowPosts.length > 0 && (
            <div className="grid sm:grid-cols-3 gap-8 mt-14">
              {textRowPosts.map((post) => (
                <div key={post.slug}>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{post.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{post.excerpt}</p>
                  <div className="flex items-center gap-3 mb-3">
                    <img src={post.authorImg} alt={post.author} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{post.author}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{post.date}</p>
                    </div>
                  </div>
                  <Link href={`/blogs/${post.slug}`} className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                    Read More <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}

          <div className="grid lg:grid-cols-3 gap-10 mt-16">
            <div className="lg:col-span-2 grid sm:grid-cols-2 gap-8">
              {gridPosts.map((post, i) => (
                <motion.div
                  key={post.slug}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: (i % 6) * 0.06, duration: 0.4 }}
                >
                  <div className={`rounded-2xl h-44 mb-4 ${coverClass(i + 1)}`} />
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">{post.category.toUpperCase()}</span>
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">{post.readTime}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{post.title}</h3>
                  <Link href={`/blogs/${post.slug}`} className="inline-flex items-center gap-2 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                    Read More <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </motion.div>
              ))}
            </div>

            <div className="lg:col-span-1 space-y-10">
              <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-4">Featured mentors</h4>
                <ul className="space-y-3">
                  {featuredMentors.map((mentor) => (
                    <li key={mentor.name} className="flex items-center gap-3">
                      <img src={mentor.img} alt={mentor.name} className="w-8 h-8 rounded-full object-cover" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{mentor.name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-4">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span key={tag} className="text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-4">Our social media</h4>
                <div className="flex gap-3">
                  {[Instagram, Twitter, Mail, Linkedin].map((Icon, i) => (
                    <a key={i} href="#" className="w-9 h-9 rounded-full border border-gray-200 dark:border-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-primary-600 hover:border-primary-200 transition-colors">
                      <Icon className="w-4 h-4" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary-600 via-black to-primary-900 min-h-[260px] flex items-center justify-center p-8">
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full text-center">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-3">Be in touch with us</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                Get mentor tips, exam alerts, and new blog posts delivered straight to your inbox.
              </p>
              <form className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email"
                  className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 dark:text-white dark:placeholder-gray-400 rounded-full px-4 py-2.5 text-sm focus:outline-none focus:border-primary-400"
                />
                <button type="submit" className="bg-primary-600 text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-primary-700 transition-colors whitespace-nowrap">
                  Submit
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
