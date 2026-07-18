"use client";

import { useState, useRef, useTransition } from "react";
import {
  updateBlog,
  uploadBlogImage,
  uploadBlogContentImage,
  deleteBlog,
  type BlogUpdateData,
} from "@/app/admin/actions";
import type { ContentBlock } from "@/lib/blogs";
import {
  Save,
  Upload,
  CheckCircle,
  AlertCircle,
  ImageIcon,
  Loader2,
  Trash2,
  ExternalLink,
} from "lucide-react";
import RichTextEditor from "@/components/admin/RichTextEditor";
import Image from "next/image";
import { useRouter } from "next/navigation";

type BlogRow = {
  slug: string;
  title: string;
  category: string;
  read_time: string;
  excerpt: string;
  author: string;
  author_img: string;
  date: string;
  img: string;
  content: ContentBlock[] | null;
  featured: boolean | null;
  tags: string[] | null;
};

type Status = { type: "success" | "error"; message: string } | null;

const inputCls =
  "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4d65ff]/30 focus:border-[#4d65ff] transition-colors bg-white";
const selectCls =
  "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#4d65ff]/30 focus:border-[#4d65ff] transition-colors bg-white";

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function StatusBadge({ status }: { status: Status }) {
  if (!status) return null;
  return (
    <div
      className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${
        status.type === "success"
          ? "bg-green-50 text-green-700 border border-green-200"
          : "bg-red-50 text-red-700 border border-red-200"
      }`}
    >
      {status.type === "success" ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
      {status.message}
    </div>
  );
}

// ── Image uploader sub-component ────────────────────────────────────────────

function ImageUploader({
  slug,
  field,
  label,
  currentUrl,
  onUploaded,
}: {
  slug: string;
  field: "img" | "author_img";
  label: string;
  currentUrl: string;
  onUploaded: (url: string) => void;
}) {
  const [preview, setPreview] = useState(currentUrl);
  const [status, setStatus] = useState<Status>(null);
  const [isUploading, startUpload] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) setPreview(URL.createObjectURL(f));
  }

  function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) { setStatus({ type: "error", message: "Select a file first." }); return; }
    setStatus(null);
    startUpload(async () => {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadBlogImage(slug, field, fd);
      if (result.error) {
        setStatus({ type: "error", message: result.error });
      } else {
        setPreview(result.url!);
        onUploaded(result.url!);
        setStatus({ type: "success", message: "Uploaded!" });
        if (fileRef.current) fileRef.current.value = "";
        setTimeout(() => setStatus(null), 3000);
      }
    });
  }

  const isAvatar = field === "author_img";

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div
        className={`relative flex-shrink-0 ${isAvatar ? "w-16 h-16 rounded-full" : "w-full sm:w-32 h-24 rounded-xl"} overflow-hidden bg-gray-100 border border-gray-200`}
      >
        {preview ? (
          <Image src={preview} alt={label} fill className="object-cover" unoptimized />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ImageIcon size={20} />
          </div>
        )}
      </div>

      <div className="flex-1 space-y-3">
        <div className="flex gap-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="flex-1 text-sm text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#4d65ff]/10 file:text-[#4d65ff] hover:file:bg-[#4d65ff]/20 file:cursor-pointer"
          />
          <button
            type="button"
            onClick={handleUpload}
            disabled={isUploading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#4d65ff] hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60 whitespace-nowrap"
          >
            {isUploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
            {isUploading ? "…" : "Upload"}
          </button>
        </div>
        {status && <StatusBadge status={status} />}
      </div>
    </div>
  );
}

// ── Main form ───────────────────────────────────────────────────────────────

export default function BlogEditForm({ post }: { post: BlogRow }) {
  const router = useRouter();

  const [form, setForm] = useState({
    title: post.title ?? "",
    category: post.category ?? "",
    excerpt: post.excerpt ?? "",
    author: post.author ?? "",
    date: post.date ?? "",
    read_time: post.read_time ?? "",
    featured: post.featured ?? false,
    tags: (post.tags ?? []).join(", "),
  });

  const [coverImg, setCoverImg] = useState(post.img ?? "");
  const [authorImg, setAuthorImg] = useState(post.author_img ?? "");
  const [blocks, setBlocks] = useState<ContentBlock[]>(post.content ?? []);

  const [saveStatus, setSaveStatus] = useState<Status>(null);
  const [isSaving, startSave] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
  }

  function handleSave() {
    setSaveStatus(null);
    startSave(async () => {
      const data: BlogUpdateData = {
        title: form.title || undefined,
        category: form.category || undefined,
        excerpt: form.excerpt || undefined,
        author: form.author || undefined,
        author_img: authorImg || undefined,
        date: form.date || undefined,
        read_time: form.read_time || undefined,
        img: coverImg || undefined,
        featured: form.featured,
        tags: form.tags
          ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
        content: blocks,
      };

      const result = await updateBlog(post.slug, data);
      if (result.error) {
        setSaveStatus({ type: "error", message: result.error });
      } else {
        setSaveStatus({ type: "success", message: "Post saved successfully!" });
        setTimeout(() => setSaveStatus(null), 4000);
      }
    });
  }

  function handleDelete() {
    if (!confirm(`Delete "${post.title}"? This cannot be undone.`)) return;
    startDelete(async () => {
      const result = await deleteBlog(post.slug);
      if (result.error) {
        setSaveStatus({ type: "error", message: result.error });
      } else {
        router.push("/admin/blogs");
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-6">
      {/* ── Basic Info ────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5">Basic Info</h2>
        <div className="space-y-4">
          <Field label="Title">
            <input
              type="text"
              className={inputCls}
              value={form.title}
              onChange={set("title")}
              placeholder="Post title"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Category">
              <input
                type="text"
                className={inputCls}
                value={form.category}
                onChange={set("category")}
                placeholder="e.g. CLAT Tips"
              />
            </Field>

            <Field label="Read Time">
              <input
                type="text"
                className={inputCls}
                value={form.read_time}
                onChange={set("read_time")}
                placeholder="e.g. 5 min read"
              />
            </Field>
          </div>

          <Field label="Excerpt" hint="Short summary shown on the blog listing page">
            <textarea
              className={inputCls + " resize-none"}
              rows={3}
              value={form.excerpt}
              onChange={set("excerpt")}
              placeholder="Brief summary of the post…"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Publish Date">
              <input
                type="date"
                className={inputCls}
                value={form.date}
                onChange={set("date")}
              />
            </Field>

            <Field label="Tags" hint="Comma separated, e.g. CLAT, Tips, 2025">
              <input
                type="text"
                className={inputCls}
                value={form.tags}
                onChange={set("tags")}
                placeholder="CLAT, PG, Law"
              />
            </Field>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              role="switch"
              aria-checked={form.featured}
              onClick={() => setForm((f) => ({ ...f, featured: !f.featured }))}
              className={`relative w-10 h-5.5 rounded-full transition-colors ${
                form.featured ? "bg-[#4d65ff]" : "bg-gray-300"
              }`}
              style={{ minWidth: "40px", height: "22px" }}
            >
              <span
                className={`absolute top-0.5 w-4.5 h-4.5 bg-white rounded-full shadow transition-transform ${
                  form.featured ? "translate-x-5" : "translate-x-0.5"
                }`}
                style={{ width: "18px", height: "18px" }}
              />
            </button>
            <label className="text-sm font-medium text-gray-700">
              Featured post
              <span className="text-xs text-gray-400 ml-1.5">(highlighted in home page blog section)</span>
            </label>
          </div>
        </div>
      </section>

      {/* ── Author ───────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5">Author</h2>
        <div className="space-y-4">
          <Field label="Author Name">
            <input
              type="text"
              className={inputCls}
              value={form.author}
              onChange={set("author")}
              placeholder="e.g. Rahul Sharma"
            />
          </Field>
          <Field label="Author Profile Photo">
            <ImageUploader
              slug={post.slug}
              field="author_img"
              label="Author photo"
              currentUrl={authorImg}
              onUploaded={setAuthorImg}
            />
          </Field>
        </div>
      </section>

      {/* ── Cover Image ───────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5">Cover Image</h2>
        <div className="space-y-4">
          <Field label="Image URL" hint="Or upload a file below">
            <div className="flex gap-2">
              <input
                type="url"
                className={inputCls}
                value={coverImg}
                onChange={(e) => setCoverImg(e.target.value)}
                placeholder="https://…"
              />
              {coverImg && (
                <a
                  href={coverImg}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-shrink-0 p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <ExternalLink size={15} />
                </a>
              )}
            </div>
          </Field>
          <ImageUploader
            slug={post.slug}
            field="img"
            label="Cover image"
            currentUrl={coverImg}
            onUploaded={setCoverImg}
          />
        </div>
      </section>

      {/* ── Content ───────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5">Content</h2>
        <RichTextEditor
          content={blocks}
          onChange={setBlocks}
          onImageUpload={async (file) => {
            const fd = new FormData();
            fd.append("file", file);
            const result = await uploadBlogContentImage(post.slug, fd);
            if (result.error) throw new Error(result.error);
            return result.url!;
          }}
        />
      </section>

      {/* ── Actions ───────────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4 flex-wrap">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#4d65ff] hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-60"
          >
            {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isSaving ? "Saving…" : "Save Post"}
          </button>

          {saveStatus && <StatusBadge status={saveStatus} />}
        </div>

        <button
          type="button"
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center gap-2 px-4 py-2.5 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium transition-colors disabled:opacity-60 border border-red-200"
        >
          {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
          {isDeleting ? "Deleting…" : "Delete Post"}
        </button>
      </div>
    </div>
  );
}
