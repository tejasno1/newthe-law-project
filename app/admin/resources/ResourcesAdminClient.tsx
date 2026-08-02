"use client";

import { useState, useTransition, useRef } from "react";
import {
  Trash2, Eye, EyeOff, Plus, Upload, Loader2, X,
  FolderPlus, FileText, CheckCircle,
} from "lucide-react";
import {
  createResource,
  updateResource,
  deleteResource,
  toggleResourcePublished,
  uploadResourceFile,
  createResourceCategory,
  deleteResourceCategory,
} from "@/app/admin/actions";
import type { Resource, ResourceCategory } from "@/lib/resources";

interface Props {
  resources: Resource[];
  categories: ResourceCategory[];
}

const blank = () => ({
  title: "",
  description: "",
  categoryId: "",
  isFree: true,
  isPublished: true,
});

export default function ResourcesAdminClient({ resources: init, categories: initCats }: Props) {
  const [resources, setResources] = useState<Resource[]>(init);
  const [categories, setCategories] = useState<ResourceCategory[]>(initCats);

  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ReturnType<typeof blank>>(blank());
  const [existingPath, setExistingPath] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadDone, setUploadDone] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [saving, startSave] = useTransition();
  const [err, setErr] = useState("");
  const [toast, setToast] = useState("");

  const [newCat, setNewCat] = useState("");
  const [catSaving, startCat] = useTransition();

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  }

  function resetForm() {
    setEditId(null);
    setForm(blank());
    setExistingPath(null);
    setUploadDone(false);
    setErr("");
    if (fileRef.current) fileRef.current.value = "";
  }

  function startEdit(r: Resource) {
    setEditId(r.id);
    setForm({
      title: r.title,
      description: r.description ?? "",
      categoryId: r.category_id ? String(r.category_id) : "",
      isFree: r.is_free,
      isPublished: r.is_published,
    });
    setExistingPath(r.file_path);
    setUploadDone(!!r.file_path);
    setErr("");
    if (fileRef.current) fileRef.current.value = "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setUploadDone(false);
    setErr("");
    setUploading(true);
    const fd = new FormData();
    fd.append("file", f);
    const res = await uploadResourceFile(fd);
    setUploading(false);
    if (res.error) {
      setErr(`Upload failed: ${res.error}`);
      if (fileRef.current) fileRef.current.value = "";
      return;
    }
    setExistingPath(res.path ?? null);
    setUploadDone(true);
    flash("PDF uploaded ✓");
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!form.title.trim()) { setErr("Title is required."); return; }
    startSave(async () => {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        categoryId: form.categoryId ? Number(form.categoryId) : null,
        filePath: existingPath,
        isFree: form.isFree,
        isPublished: form.isPublished,
      };
      const res = editId ? await updateResource(editId, payload) : await createResource(payload);
      if (res.error) { setErr(res.error); return; }
      flash(editId ? "Resource updated." : "Resource created and published.");
      resetForm();
      window.location.reload();
    });
  }

  async function handleDelete(r: Resource) {
    if (!confirm(`Delete "${r.title}"? This cannot be undone.`)) return;
    const res = await deleteResource(r.id, r.file_path);
    if (res.error) { flash(`Error: ${res.error}`); return; }
    setResources((p) => p.filter((x) => x.id !== r.id));
    flash("Deleted.");
  }

  async function handleToggle(r: Resource) {
    const res = await toggleResourcePublished(r.id, !r.is_published);
    if (res.error) { flash(`Error: ${res.error}`); return; }
    setResources((p) => p.map((x) => x.id === r.id ? { ...x, is_published: !x.is_published } : x));
    flash(r.is_published ? "Unpublished." : "Published — now live on /resources.");
  }

  function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCat.trim()) return;
    startCat(async () => {
      const res = await createResourceCategory(newCat.trim());
      if (res.error) { flash(`Error: ${res.error}`); return; }
      if (res.category) {
        setCategories((p) => [...p, { ...res.category!, sort_order: 0 }]);
        setNewCat("");
        flash("Category added.");
      }
    });
  }

  async function handleDeleteCat(id: number) {
    if (!confirm("Delete this category? Resources in it will become uncategorised.")) return;
    const res = await deleteResourceCategory(id);
    if (res.error) { flash(`Error: ${res.error}`); return; }
    setCategories((p) => p.filter((c) => c.id !== id));
    flash("Category deleted.");
  }

  const inp = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#4d65ff] focus:border-[#4d65ff] outline-none transition";

  return (
    <div className="space-y-6">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[#4d65ff] text-white text-sm font-medium px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {toast}
        </div>
      )}

      {/* ─── ADD / EDIT FORM ───────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/60">
          <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-[#4d65ff]/10 flex items-center justify-center">
              <Plus className="w-3.5 h-3.5 text-[#4d65ff]" />
            </span>
            {editId ? "Edit Resource" : "Add New Resource"}
          </h2>
          {editId && (
            <button onClick={resetForm} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
              <X className="w-3 h-3" /> Cancel
            </button>
          )}
        </div>

        <form onSubmit={handleSave} className="p-6">
          {err && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {err}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* LEFT — text fields */}
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Constitutional Law Notes"
                  className={inp}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Short description shown on the resources page…"
                  className={`${inp} resize-none`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Category
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                  className={inp}
                >
                  <option value="">— No category —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

<div className="flex items-center gap-5 pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={form.isFree} onChange={(e) => setForm({ ...form, isFree: e.target.checked })} className="w-4 h-4 rounded accent-[#4d65ff]" />
                  <span className="text-sm text-gray-700">Free resource</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input type="checkbox" checked={form.isPublished} onChange={(e) => setForm({ ...form, isPublished: e.target.checked })} className="w-4 h-4 rounded accent-[#4d65ff]" />
                  <span className="text-sm text-gray-700">Published (visible on website)</span>
                </label>
              </div>
            </div>

            {/* RIGHT — PDF upload + submit */}
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Upload PDF
                </label>

                <label className={`flex flex-col items-center justify-center gap-3 cursor-pointer rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
                  uploadDone
                    ? "border-green-300 bg-green-50"
                    : "border-gray-200 bg-gray-50 hover:border-[#4d65ff]/40 hover:bg-[#4d65ff]/5"
                }`}>
                  {uploading ? (
                    <>
                      <Loader2 className="w-8 h-8 text-[#4d65ff] animate-spin" />
                      <p className="text-sm text-gray-500">Uploading PDF…</p>
                    </>
                  ) : uploadDone ? (
                    <>
                      <CheckCircle className="w-9 h-9 text-green-500" />
                      <p className="text-sm font-semibold text-green-700">PDF uploaded successfully</p>
                      <p className="text-xs text-green-500">Click to replace with a different file</p>
                    </>
                  ) : (
                    <>
                      <div className="w-14 h-14 rounded-2xl bg-[#4d65ff]/10 flex items-center justify-center">
                        <Upload className="w-7 h-7 text-[#4d65ff]" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-700">Click to upload PDF</p>
                        <p className="text-xs text-gray-400 mt-0.5">PDF only · max 50 MB</p>
                      </div>
                    </>
                  )}
                  <input ref={fileRef} type="file" accept=".pdf,application/pdf" className="hidden" onChange={handleFileChange} />
                </label>

                {existingPath && (
                  <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 bg-gray-100 rounded-lg px-3 py-2">
                    <FileText className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                    <span className="truncate font-mono text-gray-600">{existingPath}</span>
                    <button
                      type="button"
                      onClick={() => { setExistingPath(null); setUploadDone(false); if (fileRef.current) fileRef.current.value = ""; }}
                      className="ml-auto text-gray-400 hover:text-red-500 flex-shrink-0 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
              </div>

              <div className="mt-auto space-y-2">
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="w-full flex items-center justify-center gap-2 bg-[#4d65ff] hover:bg-[#3d55ef] disabled:opacity-60 text-white font-semibold text-sm py-3 rounded-xl transition-colors"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {saving ? "Saving…" : editId ? "Save Changes" : "Create Resource"}
                </button>
                {editId && (
                  <button type="button" onClick={resetForm} className="w-full py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* ─── CATEGORIES ──────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-md bg-[#4d65ff]/10 flex items-center justify-center">
            <FolderPlus className="w-3.5 h-3.5 text-[#4d65ff]" />
          </span>
          Categories
        </h2>

        <div className="flex flex-wrap gap-2 mb-4">
          {categories.length === 0 && <p className="text-sm text-gray-400">No categories yet.</p>}
          {categories.map((c) => (
            <span key={c.id} className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg border border-gray-200">
              {c.name}
              <button onClick={() => handleDeleteCat(c.id)} className="text-gray-400 hover:text-red-400 transition-colors">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        <form onSubmit={handleAddCategory} className="flex gap-2 max-w-sm">
          <input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="New category name…" className={inp} />
          <button
            type="submit"
            disabled={catSaving || !newCat.trim()}
            className="flex-shrink-0 inline-flex items-center gap-1.5 bg-gray-900 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 transition-colors"
          >
            {catSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
            Add
          </button>
        </form>
      </div>

      {/* ─── RESOURCES LIST ──────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
          <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-[#4d65ff]/10 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-[#4d65ff]" />
            </span>
            All Resources
            <span className="text-gray-400 font-normal text-xs">({resources.length})</span>
          </h2>
        </div>

        {resources.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium text-sm">No resources yet</p>
            <p className="text-gray-400 text-xs mt-1">Use the form above to add your first resource.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {resources.map((r) => {
              const cat = categories.find((c) => c.id === r.category_id);
              return (
                <div key={r.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors">
                  {/* publish dot */}
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${r.is_published ? "bg-green-400" : "bg-gray-300"}`} />

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 leading-tight">{r.title}</p>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      {cat && (
                        <span className="text-[11px] bg-[#4d65ff]/10 text-[#4d65ff] px-2 py-0.5 rounded-full font-medium">{cat.name}</span>
                      )}
                      {r.is_free
                        ? <span className="text-[11px] bg-green-50 text-green-600 border border-green-200 px-2 py-0.5 rounded-full">Free</span>
                        : <span className="text-[11px] bg-amber-50 text-amber-600 border border-amber-200 px-2 py-0.5 rounded-full">Paid</span>
                      }
                      {r.file_path
                        ? <span className="text-[11px] text-green-600 flex items-center gap-0.5"><CheckCircle className="w-3 h-3" />PDF</span>
                        : <span className="text-[11px] text-gray-400">No PDF</span>
                      }
                      <span className={`text-[11px] font-semibold ${r.is_published ? "text-green-500" : "text-gray-400"}`}>
                        · {r.is_published ? "Live" : "Draft"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button
                      onClick={() => handleToggle(r)}
                      title={r.is_published ? "Unpublish" : "Publish"}
                      className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                        r.is_published ? "text-green-500 hover:text-gray-400" : "text-gray-300 hover:text-green-500"
                      }`}
                    >
                      {r.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => startEdit(r)}
                      className="h-8 px-3 text-xs font-semibold text-[#4d65ff] hover:bg-[#4d65ff]/5 rounded-lg transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(r)}
                      className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-400 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
