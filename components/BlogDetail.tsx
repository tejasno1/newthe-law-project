"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { BlogPost } from "@/lib/blogs";
import { supabase } from "@/lib/supabaseClient";
import { useBlogTracking } from "@/lib/blogTracking";
import { Search, Link2, ChevronRight, Clock, CalendarDays, Reply, Share2, Mail } from "lucide-react";

function AuthorAvatar({ src, name, size = "w-9 h-9" }: { src: string; name: string; size?: string }) {
  if (src) return <img src={src} alt={name} className={`${size} rounded-full object-cover flex-shrink-0`} />;
  return (
    <div className={`${size} rounded-full bg-primary-100 flex items-center justify-center flex-shrink-0`}>
      <span className="text-primary-700 font-bold text-xs">{name[0]?.toUpperCase()}</span>
    </div>
  );
}

interface Comment {
  id: number;
  blog_slug: string;
  name: string;
  message: string;
  parent_id: number | null;
  created_at: string;
}

const covers = [
  "bg-gradient-to-br from-black via-primary-700 to-primary-400",
  "bg-gradient-to-tr from-primary-900 via-primary-600 to-black",
  "bg-gradient-to-bl from-black via-primary-500 to-primary-200",
  "bg-gradient-to-r from-primary-700 via-black to-primary-400",
];

export default function BlogDetail({ post, allPosts = [] }: { post: BlogPost; allPosts?: BlogPost[] }) {
  useBlogTracking(post.slug);

  const coverIndex = allPosts.findIndex((p) => p.slug === post.slug);
  const coverClass = covers[Math.max(coverIndex, 0) % covers.length];

  const [search, setSearch] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentsLoading, setCommentsLoading] = useState(true);
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [replyForm, setReplyForm] = useState({ name: "", email: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitDone, setSubmitDone] = useState(false);
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) setShareOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sidebar derived data
  const latest = [...allPosts]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);
  const categories = allPosts.reduce<Record<string, number>>((acc, p) => {
    acc[p.category] = (acc[p.category] || 0) + 1;
    return acc;
  }, {});
  const allTags = Array.from(new Set(allPosts.flatMap((p) => p.tags ?? [])));

  const more = allPosts.filter((p) => p.category === post.category && p.slug !== post.slug).slice(0, 3);

  useEffect(() => { fetchComments(); }, [post.slug]);

  async function fetchComments() {
    setCommentsLoading(true);
    try {
      const { data } = await supabase
        .from("blog_comments")
        .select("id, blog_slug, name, message, parent_id, created_at")
        .eq("blog_slug", post.slug)
        .eq("approved", true)
        .order("created_at", { ascending: true });
      setComments((data as Comment[]) ?? []);
    } catch {
      setComments([]);
    }
    setCommentsLoading(false);
  }

  async function submitComment(e: React.FormEvent, parentId?: number) {
    e.preventDefault();
    const data = parentId != null ? replyForm : form;
    if (!data.name.trim() || !data.message.trim()) return;
    setSubmitting(true);
    try {
      await supabase.from("blog_comments").insert({
        blog_slug: post.slug,
        name: data.name.trim(),
        email: data.email.trim() || null,
        message: data.message.trim(),
        parent_id: parentId ?? null,
        approved: true,
      });
    } catch { /* silent */ }
    setSubmitting(false);
    if (parentId != null) {
      setReplyForm({ name: "", email: "", message: "" });
      setReplyTo(null);
    } else {
      setForm({ name: "", email: "", message: "" });
      setSubmitDone(true);
      setTimeout(() => setSubmitDone(false), 4000);
    }
    fetchComments();
  }

  function handleShare(platform: string) {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = encodeURIComponent(post.title);
    if (platform === "twitter") window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${text}`, "_blank");
    if (platform === "facebook") window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
    if (platform === "linkedin") window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
    if (platform === "whatsapp") window.open(`https://wa.me/?text=${encodeURIComponent(post.title + " " + url)}`, "_blank");
    if (platform === "email") window.location.href = `mailto:?subject=${text}&body=${encodeURIComponent(url)}`;
    if (platform === "copy") {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (search.trim()) window.location.href = `/blogs?search=${encodeURIComponent(search.trim())}`;
  }

  function fmtDate(d: string) {
    try { return new Date(d).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" }); }
    catch { return d; }
  }

  const topComments = comments.filter((c) => !c.parent_id);
  const getReplies = (parentId: number) => comments.filter((c) => c.parent_id === parentId);

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />

      <div className="pt-28 sm:pt-24 pb-12 sm:pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-[1fr_300px] gap-10 xl:gap-14 items-start">

            {/* ── LEFT: Article ────────────────────────────── */}
            <div className="min-w-0">

              {/* Cover image */}
              <div className="relative rounded-2xl overflow-hidden mb-6">
                {post.img ? (
                  <img src={post.img} alt={post.title} className="w-full h-[200px] sm:h-[360px] object-cover" />
                ) : (
                  <div className={`w-full h-[200px] sm:h-[360px] ${coverClass}`} />
                )}
                {/* Category badge — top right of image */}
                <div className="absolute top-3 right-3">
                  <Link
                    href={`/blogs?category=${encodeURIComponent(post.category)}`}
                    className="text-xs font-semibold text-white bg-primary-600/90 backdrop-blur-sm px-3 py-1.5 rounded-full hover:bg-primary-700 transition-colors shadow-sm"
                  >
                    {post.category}
                  </Link>
                </div>
              </div>

              {/* Meta row: read time, date, + share dropdown */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3 h-3" /> {post.readTime}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <CalendarDays className="w-3 h-3" /> {post.date}
                  </span>
                </div>

                {/* Share button + dropdown */}
                <div className="relative flex-shrink-0" ref={shareRef}>
                  <button
                    onClick={() => setShareOpen((v) => !v)}
                    className="flex items-center gap-1.5 text-xs font-semibold bg-primary-600 hover:bg-primary-700 text-white px-3 py-1.5 rounded-full transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </button>

                  {shareOpen && (
                    <div className="absolute right-0 top-9 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-1.5 min-w-[168px]">
                      {/* WhatsApp */}
                      <button onClick={() => { handleShare("whatsapp"); setShareOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <svg className="w-4 h-4 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.413A9.953 9.953 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" />
                        </svg>
                        WhatsApp
                      </button>
                      {/* X / Twitter */}
                      <button onClick={() => { handleShare("twitter"); setShareOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.629L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                        </svg>
                        X / Twitter
                      </button>
                      {/* LinkedIn */}
                      <button onClick={() => { handleShare("linkedin"); setShareOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <svg className="w-4 h-4 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                        LinkedIn
                      </button>
                      {/* Facebook */}
                      <button onClick={() => { handleShare("facebook"); setShareOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <svg className="w-4 h-4 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                        </svg>
                        Facebook
                      </button>
                      {/* Email */}
                      <button onClick={() => { handleShare("email"); setShareOpen(false); }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <Mail className="w-4 h-4 text-gray-400" />
                        Email
                      </button>
                      {/* Copy link */}
                      <button onClick={() => handleShare("copy")}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <Link2 className="w-4 h-4 text-gray-400" />
                        {copied ? "Copied!" : "Copy Link"}
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-3xl xl:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-4 sm:mb-5">
                {post.title}
              </h1>

              {/* Author row */}
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100 dark:border-gray-700">
                <AuthorAvatar src={post.authorImg} name={post.author} />
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{post.author}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{post.date}</p>
                </div>
              </div>

              {/* Article body */}
              <article className="prose-blog mb-10">
                {post.content.map((block, i) => {
                  if (block.type === "heading") {
                    const level = block.level ?? 2;
                    const Tag = `h${level}` as "h1" | "h2" | "h3" | "h4";
                    const cls =
                      level === 1 ? "text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mt-8 sm:mt-12 mb-3 sm:mb-4"
                      : level === 2 ? "text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-7 sm:mt-10 mb-3 sm:mb-4"
                      : level === 3 ? "text-lg sm:text-xl font-bold text-gray-900 dark:text-white mt-6 sm:mt-8 mb-2 sm:mb-3"
                      : "text-base sm:text-lg font-semibold text-gray-900 dark:text-white mt-5 sm:mt-6 mb-2";
                    return <Tag key={i} className={cls} dangerouslySetInnerHTML={{ __html: block.text ?? "" }} />;
                  }
                  if (block.type === "paragraph") {
                    return <p key={i} className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-4 sm:mb-5" dangerouslySetInnerHTML={{ __html: block.text ?? "" }} />;
                  }
                  if (block.type === "quote") {
                    return (
                      <blockquote key={i} className="my-8 pl-2">
                        <span className="text-5xl font-serif text-primary-600 leading-none select-none block mb-2">&ldquo;</span>
                        <p className="text-lg sm:text-xl font-medium italic text-gray-800 dark:text-gray-200 leading-snug"
                          dangerouslySetInnerHTML={{ __html: block.text ?? "" }} />
                      </blockquote>
                    );
                  }
                  if (block.type === "numbered") {
                    return (
                      <ol key={i} className="list-decimal list-inside space-y-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-5 sm:mb-6">
                        {block.items?.map((item, j) => <li key={j}>{item}</li>)}
                      </ol>
                    );
                  }
                  if (block.type === "bulleted") {
                    return (
                      <ul key={i} className="list-disc list-inside space-y-2 text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-5 sm:mb-6">
                        {block.items?.map((item, j) => <li key={j}>{item}</li>)}
                      </ul>
                    );
                  }
                  if (block.type === "image" && block.src) {
                    return (
                      <figure key={i} className="my-8">
                        <img src={block.src} alt={block.alt ?? ""} className="w-full rounded-xl object-cover" />
                        {block.alt && <figcaption className="text-center text-sm text-gray-400 mt-2">{block.alt}</figcaption>}
                      </figure>
                    );
                  }
                  if (block.type === "divider") {
                    return <hr key={i} className="border-gray-200 dark:border-gray-700 my-8" />;
                  }
                  if (block.type === "html" && block.html) {
                    return (
                      <div key={i} className="blog-html-content text-gray-600 dark:text-gray-400 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: block.html }} />
                    );
                  }
                  return null;
                })}
              </article>

              {/* Tags + Share */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 py-4 sm:py-5 border-t border-b border-gray-100 dark:border-gray-700 mb-6 sm:mb-8">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tags</span>
                  {(post.tags ?? []).map((tag) => (
                    <Link key={tag} href={`/blogs?tag=${encodeURIComponent(tag)}`}
                      className="text-xs text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-full px-3 py-1 hover:border-primary-400 hover:text-primary-600 transition-colors">
                      {tag}
                    </Link>
                  ))}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Share</span>
                  {/* WhatsApp */}
                  <button onClick={() => handleShare("whatsapp")} title="Share on WhatsApp"
                    className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-500 hover:text-[#25D366] hover:border-[#25D366] transition-colors">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.413A9.953 9.953 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
                    </svg>
                  </button>
                  {/* X / Twitter */}
                  <button onClick={() => handleShare("twitter")} title="Share on X"
                    className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-500 hover:text-[#1DA1F2] hover:border-[#1DA1F2] transition-colors">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.629L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                    </svg>
                  </button>
                  {/* LinkedIn */}
                  <button onClick={() => handleShare("linkedin")} title="Share on LinkedIn"
                    className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-500 hover:text-[#0A66C2] hover:border-[#0A66C2] transition-colors">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                    </svg>
                  </button>
                  {/* Facebook */}
                  <button onClick={() => handleShare("facebook")} title="Share on Facebook"
                    className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-500 hover:text-[#1877F2] hover:border-[#1877F2] transition-colors">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                  </button>
                  {/* Email */}
                  <button onClick={() => handleShare("email")} title="Share via Email"
                    className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-500 hover:text-primary-600 hover:border-primary-400 transition-colors">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
                    </svg>
                  </button>
                  {/* Copy link */}
                  <button onClick={() => handleShare("copy")} title={copied ? "Copied!" : "Copy link"}
                    className="w-8 h-8 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-500 hover:text-primary-600 hover:border-primary-400 transition-colors">
                    <Link2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Author card */}
              <div className="border border-gray-100 dark:border-gray-700 rounded-2xl p-4 sm:p-6 flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 mb-8 sm:mb-10 text-center sm:text-left">
                <AuthorAvatar src={post.authorImg} name={post.author} size="w-16 h-16" />
                <div>
                  <p className="text-lg font-bold text-gray-900 dark:text-white mb-0.5">{post.author}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Author &amp; Contributor</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    Expert contributor to The Law Project, providing in-depth analysis of legal concepts and current affairs relevant to law students and practitioners.
                  </p>
                </div>
              </div>

              {/* ── Comments ───────────────────────────────── */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">
                  Comment{topComments.length > 0 ? ` (${topComments.length})` : ""}
                </h2>

                {commentsLoading ? (
                  <div className="py-8 text-center text-gray-400 text-sm">Loading comments…</div>
                ) : topComments.length === 0 ? (
                  <div className="py-8 text-center text-gray-400 text-sm border border-dashed border-gray-200 dark:border-gray-700 rounded-xl mb-8">
                    No comments yet. Be the first to share your thoughts!
                  </div>
                ) : (
                  <div className="space-y-6 mb-8">
                    {topComments.map((comment) => (
                      <div key={comment.id}>
                        {/* Top-level comment */}
                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center flex-shrink-0">
                            <span className="text-primary-700 dark:text-primary-300 font-bold text-sm">
                              {comment.name[0]?.toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">{comment.name}</span>
                              <span className="text-xs text-gray-400">{fmtDate(comment.created_at)}</span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{comment.message}</p>
                            <button
                              onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                              className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
                            >
                              <Reply className="w-3.5 h-3.5" /> Reply
                            </button>

                            {/* Inline reply form */}
                            {replyTo === comment.id && (
                              <form onSubmit={(e) => submitComment(e, comment.id)} className="mt-4 space-y-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
                                <div className="grid sm:grid-cols-2 gap-3">
                                  <input
                                    value={replyForm.name}
                                    onChange={(e) => setReplyForm((f) => ({ ...f, name: e.target.value }))}
                                    placeholder="Your name *" required
                                    className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-400 bg-white dark:bg-gray-800 dark:text-white"
                                  />
                                  <input
                                    type="email"
                                    value={replyForm.email}
                                    onChange={(e) => setReplyForm((f) => ({ ...f, email: e.target.value }))}
                                    placeholder="Email (optional)"
                                    className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-400 bg-white dark:bg-gray-800 dark:text-white"
                                  />
                                </div>
                                <textarea
                                  value={replyForm.message}
                                  onChange={(e) => setReplyForm((f) => ({ ...f, message: e.target.value }))}
                                  placeholder="Write your reply…" rows={3} required
                                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-400 bg-white dark:bg-gray-800 dark:text-white resize-none"
                                />
                                <div className="flex gap-2">
                                  <button type="submit" disabled={submitting}
                                    className="px-4 py-2 bg-primary-600 text-white text-xs font-semibold rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50">
                                    {submitting ? "Posting…" : "Post Reply"}
                                  </button>
                                  <button type="button" onClick={() => setReplyTo(null)}
                                    className="px-4 py-2 border border-gray-200 dark:border-gray-600 text-xs font-semibold rounded-lg text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                    Cancel
                                  </button>
                                </div>
                              </form>
                            )}
                          </div>
                        </div>

                        {/* Nested replies */}
                        {getReplies(comment.id).length > 0 && (
                          <div className="ml-8 sm:ml-14 mt-4 space-y-4 border-l-2 border-gray-100 dark:border-gray-700 pl-3 sm:pl-4">
                            {getReplies(comment.id).map((reply) => (
                              <div key={reply.id} className="flex gap-3">
                                <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                  <span className="text-gray-600 dark:text-gray-300 font-bold text-xs">
                                    {reply.name[0]?.toUpperCase()}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{reply.name}</span>
                                    <span className="text-xs text-gray-400">{fmtDate(reply.created_at)}</span>
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{reply.message}</p>
                                  <button
                                    onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                                    className="mt-2 flex items-center gap-1.5 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
                                  >
                                    <Reply className="w-3.5 h-3.5" /> Reply
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Write comment form */}
                <div className="border border-gray-100 dark:border-gray-700 rounded-2xl p-4 sm:p-6 mt-6 sm:mt-8">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Write your comment</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
                    Your email address will not be published. Required fields are marked *
                  </p>
                  {submitDone ? (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-xl px-4 py-3 text-sm text-green-700 dark:text-green-400">
                      Comment posted successfully! Thank you.
                    </div>
                  ) : (
                    <form onSubmit={(e) => submitComment(e)} className="space-y-4">
                      <div className="grid sm:grid-cols-2 gap-4">
                        <input
                          value={form.name}
                          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                          placeholder="Full Name *" required
                          className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-400 bg-white dark:bg-gray-800 dark:text-white"
                        />
                        <input
                          type="email"
                          value={form.email}
                          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                          placeholder="Email (optional)"
                          className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-400 bg-white dark:bg-gray-800 dark:text-white"
                        />
                      </div>
                      <textarea
                        value={form.message}
                        onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                        placeholder="Write your message…" rows={5} required
                        className="w-full border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 text-sm outline-none focus:border-primary-400 bg-white dark:bg-gray-800 dark:text-white resize-none"
                      />
                      <button
                        type="submit" disabled={submitting}
                        className="px-7 py-3 bg-primary-600 text-white text-sm font-semibold rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50"
                      >
                        {submitting ? "Submitting…" : "Submit Now"}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            </div>

            {/* ── RIGHT: Sidebar ───────────────────────────── */}
            <aside className="hidden lg:block">
              <div className="sticky top-24 space-y-5">

                {/* Search */}
                <div className="border border-gray-100 dark:border-gray-700 rounded-2xl p-5">
                  <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Search</h3>
                  <form onSubmit={handleSearch} className="flex gap-2">
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Search here..."
                      className="flex-1 border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm outline-none focus:border-primary-400 bg-white dark:bg-gray-800 dark:text-white min-w-0"
                    />
                    <button type="submit"
                      className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center hover:bg-primary-700 transition-colors flex-shrink-0">
                      <Search className="w-4 h-4 text-white" />
                    </button>
                  </form>
                </div>

                {/* Latest */}
                {latest.length > 0 && (
                  <div className="border border-gray-100 dark:border-gray-700 rounded-2xl p-5">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Latest</h3>
                    <div className="space-y-4">
                      {latest.map((p) => {
                        const idx = allPosts.findIndex((ap) => ap.slug === p.slug);
                        return (
                          <Link key={p.slug} href={`/blogs/${p.slug}`} className="flex gap-3 group">
                            <div className="w-16 h-14 rounded-lg overflow-hidden flex-shrink-0">
                              {p.img ? (
                                <img src={p.img} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                              ) : (
                                <div className={`w-full h-full ${covers[idx % covers.length]}`} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                                <CalendarDays className="w-3 h-3" /> {p.date}
                              </p>
                              <p className="text-xs font-medium text-gray-800 dark:text-gray-200 group-hover:text-primary-600 line-clamp-2 leading-snug transition-colors">
                                {p.title}
                              </p>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Categories */}
                {Object.keys(categories).length > 0 && (
                  <div className="border border-gray-100 dark:border-gray-700 rounded-2xl p-5">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Categories</h3>
                    <div className="space-y-1">
                      {Object.entries(categories).map(([cat, count]) => (
                        <Link key={cat} href={`/blogs?category=${encodeURIComponent(cat)}`}
                          className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 hover:text-primary-600 py-1.5 border-b border-gray-50 dark:border-gray-700/50 last:border-0 transition-colors group">
                          <span className="flex items-center gap-1.5">
                            <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-primary-500 transition-colors" />
                            {cat}
                          </span>
                          <span className="text-xs text-gray-400 font-medium tabular-nums">
                            {String(count).padStart(2, "0")}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tags */}
                {allTags.length > 0 && (
                  <div className="border border-gray-100 dark:border-gray-700 rounded-2xl p-5">
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4">Tags</h3>
                    <div className="flex flex-wrap gap-2">
                      {allTags.map((tag) => (
                        <Link key={tag} href={`/blogs?tag=${encodeURIComponent(tag)}`}
                          className="text-xs text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-600 rounded-full px-3 py-1.5 hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-colors">
                          {tag}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>

      {/* More from category */}
      {more.length > 0 && (
        <section className="py-10 sm:py-14 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8">More from this category</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {more.map((mp) => {
                const idx = allPosts.findIndex((p) => p.slug === mp.slug);
                return (
                  <Link key={mp.slug} href={`/blogs/${mp.slug}`} className="group">
                    {mp.img ? (
                      <div className="rounded-xl h-40 mb-4 overflow-hidden">
                        <img src={mp.img} alt={mp.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    ) : (
                      <div className={`rounded-xl h-40 mb-4 ${covers[idx % covers.length]}`} />
                    )}
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 transition-colors leading-snug">{mp.title}</h3>
                    <div className="flex items-center gap-3">
                      <AuthorAvatar src={mp.authorImg} name={mp.author} size="w-7 h-7" />
                      <div>
                        <p className="text-xs font-medium text-gray-900 dark:text-white">{mp.author}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{mp.date}</p>
                      </div>
                    </div>
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
