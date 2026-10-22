"use client";

import { useState, useTransition, useRef } from "react";
import { Trash2, Eye, EyeOff, Plus, Pencil, Star, X, Check, Upload, Loader2 } from "lucide-react";
import {
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonialPublished,
  uploadTestimonialAvatar,
} from "@/app/admin/actions";
import type { Testimonial } from "@/lib/testimonials";

interface Props { testimonials: Testimonial[] }

const blank = (): Omit<Testimonial, "id" | "created_at"> => ({
  name: "",
  role: "",
  avatar_url: "",
  rating: 5,
  body: "",
  is_published: true,
  sort_order: 0,
});

export default function TestimonialsAdminClient({ testimonials: init }: Props) {
  const [items, setItems] = useState<Testimonial[]>(init);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(blank());
  const [err, setErr] = useState("");
  const [toast, setToast] = useState<{ msg: string; isError?: boolean } | null>(null);
  const [saving, startSave] = useTransition();
  const [deleting, startDelete] = useTransition();
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function flash(msg: string, isError = false) {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 3500);
  }

  function openNew() {
    setEditId(null);
    setForm(blank());
    setErr("");
    setShowForm(true);
  }

  function openEdit(t: Testimonial) {
    setEditId(t.id);
    setForm({
      name: t.name,
      role: t.role,
      avatar_url: t.avatar_url ?? "",
      rating: t.rating,
      body: t.body,
      is_published: t.is_published,
      sort_order: t.sort_order,
    });
    setErr("");
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditId(null);
    setForm(blank());
    setErr("");
  }

  async function handleAvatarFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadTestimonialAvatar(fd);
      if ("url" in res && res.url) {
        setForm(f => ({ ...f, avatar_url: res.url! }));
        flash("Photo uploaded.");
      } else {
        const msg = ("error" in res ? res.error : null) ?? "Upload failed";
        flash(msg, true);
        setErr(msg);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Upload failed";
      flash(msg, true);
      setErr(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  function handleSave() {
    if (!form.name.trim()) return setErr("Name is required.");
    if (!form.body.trim()) return setErr("Testimonial text is required.");
    setErr("");

    const payload = {
      name: form.name.trim(),
      role: form.role.trim(),
      avatarUrl: form.avatar_url?.trim() || null,
      rating: form.rating,
      body: form.body.trim(),
      isPublished: form.is_published,
      sortOrder: form.sort_order,
    };

    startSave(async () => {
      if (editId !== null) {
        const res = await updateTestimonial(editId, payload);
        if (res?.error) return setErr(res.error);
        setItems(prev => prev.map(t => t.id === editId ? { ...t, ...form } : t));
        flash("Testimonial updated.");
      } else {
        const res = await createTestimonial(payload);
        if (res?.error) return setErr(res.error);
        setItems(prev => [{ ...form, id: (res as { id: number }).id, created_at: new Date().toISOString() }, ...prev]);
        flash("Testimonial added.");
      }
      closeForm();
    });
  }

  function handleDelete(id: number) {
    if (!confirm("Delete this testimonial?")) return;
    startDelete(async () => {
      const res = await deleteTestimonial(id);
      if (res?.error) return flash(res.error, true);
      setItems(prev => prev.filter(t => t.id !== id));
      flash("Deleted.");
    });
  }

  function handleToggle(id: number, current: boolean) {
    startSave(async () => {
      const res = await toggleTestimonialPublished(id, !current);
      if (res?.error) return flash(res.error, true);
      setItems(prev => prev.map(t => t.id === id ? { ...t, is_published: !current } : t));
    });
  }

  return (
    <div className="space-y-4">
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 text-white text-sm px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 ${toast.isError ? "bg-red-600" : "bg-gray-900"}`}>
          {toast.isError
            ? <X size={15} className="text-red-200" />
            : <Check size={15} className="text-green-400" />}
          {toast.msg}
        </div>
      )}

      {/* Add button */}
      <div className="flex justify-end">
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors"
        >
          <Plus size={16} /> Add Testimonial
        </button>
      </div>

      {/* Inline form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">{editId ? "Edit Testimonial" : "New Testimonial"}</h2>
            <button onClick={closeForm} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
              <X size={16} className="text-gray-500" />
            </button>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Student Name *</label>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Akanksha"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Role / College</label>
              <input
                value={form.role}
                onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
                placeholder="e.g. 3rd Year, NALSAR | AIR 121, CLAT"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Avatar Photo <span className="text-gray-400">(optional)</span>
              </label>
              <div className="flex items-center gap-3">
                {/* Preview */}
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
                  {form.avatar_url ? (
                    <img src={form.avatar_url} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <Upload size={16} />
                    </div>
                  )}
                </div>
                {/* Upload button */}
                <div className="flex-1 flex flex-col gap-1.5">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarFile}
                  />
                  <button
                    type="button"
                    disabled={uploading}
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:opacity-50 transition-colors w-full"
                  >
                    {uploading
                      ? <><Loader2 size={14} className="animate-spin" /> Uploading…</>
                      : <><Upload size={14} /> {form.avatar_url ? "Change photo" : "Upload photo"}</>
                    }
                  </button>
                  {form.avatar_url && (
                    <button
                      type="button"
                      onClick={() => setForm(f => ({ ...f, avatar_url: "" }))}
                      className="text-[11px] text-red-400 hover:text-red-600 text-left"
                    >
                      Remove photo
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Rating (1–5)</label>
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, rating: n }))}
                    className="p-0.5"
                  >
                    <Star
                      size={20}
                      className={n <= form.rating ? "text-primary-500 fill-primary-500" : "text-gray-300 fill-gray-300"}
                    />
                  </button>
                ))}
                <span className="text-sm text-gray-500 ml-1">{form.rating}/5</span>
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-gray-700 mb-1">Testimonial Text *</label>
              <textarea
                value={form.body}
                onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                rows={4}
                placeholder="Student's testimonial..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 resize-none"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-xs font-medium text-gray-700">Sort Order</label>
              <input
                type="number"
                value={form.sort_order}
                onChange={e => setForm(f => ({ ...f, sort_order: parseInt(e.target.value) || 0 }))}
                className="w-20 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="is_published"
                checked={form.is_published}
                onChange={e => setForm(f => ({ ...f, is_published: e.target.checked }))}
                className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label htmlFor="is_published" className="text-sm text-gray-700">Published</label>
            </div>
          </div>

          {err && <p className="mt-3 text-sm text-red-600">{err}</p>}

          <div className="flex justify-end gap-2 mt-4">
            <button onClick={closeForm} className="px-4 py-2 rounded-xl text-sm text-gray-600 hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-700 disabled:opacity-50 transition-colors"
            >
              {saving ? "Saving…" : editId ? "Save Changes" : "Add Testimonial"}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {items.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-200">
          <p className="text-gray-400 text-sm">No testimonials yet. Add your first one above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(t => (
            <div key={t.id} className={`bg-white border rounded-2xl p-4 flex gap-4 items-start transition-opacity ${!t.is_published ? "opacity-60" : ""}`}>
              {/* Avatar */}
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
                {t.avatar_url ? (
                  <img src={t.avatar_url} alt={t.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm font-bold">
                    {t.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-gray-900">{t.name}</span>
                  {t.role && <span className="text-xs text-gray-500">{t.role}</span>}
                  <div className="flex items-center gap-0.5">
                    {[1,2,3,4,5].map(n => (
                      <Star key={n} size={11} className={n <= t.rating ? "text-primary-500 fill-primary-500" : "text-gray-200 fill-gray-200"} />
                    ))}
                  </div>
                  {!t.is_published && (
                    <span className="text-[10px] font-medium bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Draft</span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{t.body}</p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  onClick={() => handleToggle(t.id, t.is_published)}
                  title={t.is_published ? "Unpublish" : "Publish"}
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  {t.is_published
                    ? <Eye size={15} className="text-gray-500" />
                    : <EyeOff size={15} className="text-gray-400" />}
                </button>
                <button
                  onClick={() => openEdit(t)}
                  title="Edit"
                  className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <Pencil size={15} className="text-gray-500" />
                </button>
                <button
                  onClick={() => handleDelete(t.id)}
                  disabled={deleting}
                  title="Delete"
                  className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={15} className="text-red-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
