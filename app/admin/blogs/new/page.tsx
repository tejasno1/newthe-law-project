"use client";

import { useFormState, useFormStatus } from "react-dom";
import { createBlog } from "@/app/admin/actions";
import { FileText, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="px-6 py-2.5 bg-[#4d65ff] hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-colors disabled:opacity-60"
    >
      {pending ? "Creating…" : "Create Post"}
    </button>
  );
}

export default function NewBlogPage() {
  const [error, formAction] = useFormState(createBlog, null);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);

  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value);
    if (!slugEdited) setSlug(slugify(e.target.value));
  }

  return (
    <div className="max-w-lg">
      <Link
        href="/admin/blogs"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 mb-6 transition-colors"
      >
        <ChevronLeft size={15} />
        Back to Blog Posts
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-[#4d65ff]/10 rounded-xl flex items-center justify-center">
          <FileText className="w-5 h-5 text-[#4d65ff]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">New Blog Post</h1>
          <p className="text-sm text-gray-500">You can fill in all details after creation.</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <form action={formAction} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Post Title <span className="text-red-500">*</span>
            </label>
            <input
              name="title"
              type="text"
              required
              value={title}
              onChange={handleTitleChange}
              placeholder="e.g. How to Crack CLAT PG in 60 Days"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4d65ff]/30 focus:border-[#4d65ff] transition-colors"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              URL Slug
            </label>
            <input
              name="slug"
              type="text"
              value={slug}
              onChange={(e) => { setSlug(e.target.value); setSlugEdited(true); }}
              placeholder="auto-generated from title"
              className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 text-sm font-mono placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4d65ff]/30 focus:border-[#4d65ff] transition-colors"
            />
            {slug && (
              <p className="text-xs text-gray-400 mt-1">
                URL will be: <span className="font-mono">/blogs/{slugify(slug) || slug}</span>
              </p>
            )}
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <SubmitButton />
            <Link
              href="/admin/blogs"
              className="px-5 py-2.5 border border-gray-200 text-gray-600 hover:bg-gray-50 rounded-xl text-sm font-medium transition-colors"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
