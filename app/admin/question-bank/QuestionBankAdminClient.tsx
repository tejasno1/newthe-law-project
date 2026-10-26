"use client";

import { useState, useTransition, useRef } from "react";
import {
  Trash2, Eye, EyeOff, Plus, Upload, Loader2, X,
  FileText, CheckCircle, FolderPlus, AlertCircle, ChevronUp, ChevronDown,
} from "lucide-react";
import {
  uploadQuestionBankFile,
  discardQuestionBankUploads,
  createQuestionBankItem,
  updateQuestionBankItem,
  deleteQuestionBankItem,
  toggleQuestionBankPublished,
  createQuestionBankCategory,
  deleteQuestionBankCategory,
} from "@/app/admin/actions";
import type { QuestionBankItem, QuestionBankCategory } from "@/lib/questionBank";
import type { ExamCategory } from "@/lib/resources";

interface Props {
  items: QuestionBankItem[];
  categories: QuestionBankCategory[];
  examCategories: ExamCategory[];
}

/** One PDF inside the set being edited. `path` is set once it's in storage. */
interface FileRow {
  key: string;
  title: string;
  path?: string;
  fileName?: string;
  sizeMb?: number;
  status: "uploading" | "ready" | "error";
  error?: string;
}

const blank = () => ({
  title: "",
  description: "",
  subject: "",
  examCategory: "",
  isFree: true,
  price: "",
  isPublished: true,
});

const MAX_BYTES = 50 * 1024 * 1024;

const inp = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#4d65ff] focus:border-[#4d65ff] outline-none transition";

/** "IPC_Chapter-1 MCQs.pdf" → "IPC Chapter 1 MCQs" */
function titleFromFile(name: string) {
  return name.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

function newKey() {
  return `${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export default function QuestionBankAdminClient({ items: init, categories: initCats, examCategories }: Props) {
  const [items, setItems] = useState<QuestionBankItem[]>(init);
  const [categories, setCategories] = useState<QuestionBankCategory[]>(initCats);

  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState<ReturnType<typeof blank>>(blank());
  const [files, setFiles] = useState<FileRow[]>([]);
  // Paths uploaded in this form session — discarded from storage if the form is cancelled.
  const freshUploads = useRef<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const [saving, startSave] = useTransition();
  const [err, setErr] = useState("");
  const [toast, setToast] = useState("");

  const [newCat, setNewCat] = useState("");
  const [catSaving, startCat] = useTransition();

  const uploading = files.some((f) => f.status === "uploading");

  function flash(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3500);
  }

  function patchFile(key: string, p: Partial<FileRow>) {
    setFiles((prev) => prev.map((f) => (f.key === key ? { ...f, ...p } : f)));
  }

  function resetForm(discard = true) {
    if (discard && freshUploads.current.length) discardQuestionBankUploads(freshUploads.current);
    freshUploads.current = [];
    setEditId(null);
    setForm(blank());
    setFiles([]);
    setErr("");
    if (fileRef.current) fileRef.current.value = "";
  }

  function startEdit(item: QuestionBankItem) {
    resetForm();
    setEditId(item.id);
    setForm({
      title: item.title,
      description: item.description ?? "",
      subject: item.subject ?? "",
      examCategory: item.exam_category ?? "",
      isFree: item.is_free,
      price: item.is_free ? "" : String(item.price),
      isPublished: item.is_published,
    });
    setFiles(item.files.map((f) => ({ key: newKey(), title: f.title, path: f.file_path, status: "ready" })));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleFilesChosen(e: React.ChangeEvent<HTMLInputElement>) {
    const chosen = Array.from(e.target.files ?? []);
    if (fileRef.current) fileRef.current.value = "";
    setErr("");

    const skipped: string[] = [];
    const rows: { row: FileRow; file: File }[] = [];
    for (const f of chosen) {
      if (!/\.pdf$/i.test(f.name) && f.type !== "application/pdf") { skipped.push(`${f.name} (not a PDF)`); continue; }
      if (f.size > MAX_BYTES) { skipped.push(`${f.name} (over 50 MB)`); continue; }
      rows.push({
        file: f,
        row: { key: newKey(), title: titleFromFile(f.name), fileName: f.name, sizeMb: f.size / 1024 / 1024, status: "uploading" },
      });
    }
    if (skipped.length) setErr(`Skipped: ${skipped.join(", ")}`);
    setFiles((prev) => [...prev, ...rows.map((r) => r.row)]);

    // Upload one at a time to stay within server-action body limits.
    for (const { row, file } of rows) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await uploadQuestionBankFile(fd);
      if (res.error || !res.path) {
        patchFile(row.key, { status: "error", error: res.error ?? "Upload failed" });
        continue;
      }
      freshUploads.current.push(res.path);
      patchFile(row.key, { status: "ready", path: res.path });
    }
  }

  function moveFile(index: number, dir: -1 | 1) {
    setFiles((prev) => {
      const next = [...prev];
      const j = index + dir;
      if (j < 0 || j >= next.length) return prev;
      [next[index], next[j]] = [next[j], next[index]];
      return next;
    });
  }

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    if (!form.title.trim()) { setErr("Title is required."); return; }
    if (!form.isFree && !(Number(form.price) > 0)) { setErr("Enter a price above ₹0 for a paid question set."); return; }
    if (uploading) { setErr("Wait for the PDFs to finish uploading."); return; }
    if (files.some((f) => f.status === "error")) { setErr("Some PDFs failed to upload — remove them (×) and try again."); return; }
    const ready = files.filter((f) => f.status === "ready" && f.path);
    if (ready.some((f) => !f.title.trim())) { setErr("Every PDF needs a name."); return; }

    startSave(async () => {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || undefined,
        subject: form.subject || null,
        examCategory: form.examCategory || null,
        files: ready.map((f) => ({ title: f.title.trim(), filePath: f.path as string })),
        isFree: form.isFree,
        price: form.isFree ? 0 : Number(form.price),
        isPublished: form.isPublished,
      };
      const res = editId
        ? await updateQuestionBankItem(editId, payload)
        : await createQuestionBankItem(payload);
      if (res.error) { setErr(res.error); return; }
      flash(editId ? "Updated." : "Question set created.");
      resetForm(false);
      window.location.reload();
    });
  }

  async function handleDelete(item: QuestionBankItem) {
    const n = item.files.length;
    if (!confirm(`Delete "${item.title}" and its ${n} PDF${n === 1 ? "" : "s"}? This cannot be undone.`)) return;
    const res = await deleteQuestionBankItem(item.id);
    if (res.error) { flash(`Error: ${res.error}`); return; }
    setItems((p) => p.filter((x) => x.id !== item.id));
    if (editId === item.id) resetForm(false);
    flash("Deleted.");
  }

  async function handleToggle(item: QuestionBankItem) {
    const res = await toggleQuestionBankPublished(item.id, !item.is_published);
    if (res.error) { flash(`Error: ${res.error}`); return; }
    setItems((p) => p.map((x) => x.id === item.id ? { ...x, is_published: !x.is_published } : x));
    flash(item.is_published ? "Unpublished." : "Published — now live on /question-bank.");
  }

  function handleAddCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCat.trim()) return;
    startCat(async () => {
      const res = await createQuestionBankCategory(newCat.trim());
      if (res.error) { flash(`Error: ${res.error}`); return; }
      if (res.category) {
        setCategories((p) => [...p, res.category as QuestionBankCategory]);
        setNewCat("");
        flash("Category added.");
      }
    });
  }

  async function handleDeleteCat(id: number) {
    if (!confirm("Delete this category? Items assigned to it will show no subject.")) return;
    const res = await deleteQuestionBankCategory(id);
    if (res.error) { flash(`Error: ${res.error}`); return; }
    setCategories((p) => p.filter((c) => c.id !== id));
    flash("Category deleted.");
  }

  const readyCount = files.filter((f) => f.status === "ready").length;

  return (
    <div className="space-y-6">

      {/* Toast */}
      {toast && (
        <div className="fixed top-4 right-4 z-50 bg-[#4d65ff] text-white text-sm font-medium px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {toast}
        </div>
      )}

      {/* ADD / EDIT FORM */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/60">
          <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-[#4d65ff]/10 flex items-center justify-center">
              <Plus className="w-3.5 h-3.5 text-[#4d65ff]" />
            </span>
            {editId ? "Edit Question Set" : "Add New Question Set"}
          </h2>
          {editId && (
            <button onClick={() => resetForm()} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
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

            {/* LEFT */}
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Title <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Current Affairs Test — CLAT"
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
                  placeholder="Short description shown on the question bank page…"
                  className={`${inp} resize-none`}
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Subject / Category
                </label>
                <select
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  className={inp}
                >
                  <option value="">— No subject —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
                {categories.length === 0 && (
                  <p className="text-[11px] text-amber-600 mt-1">No categories yet — add one in the Categories section below.</p>
                )}
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Exam Category
                </label>
                <select
                  value={form.examCategory}
                  onChange={(e) => setForm({ ...form, examCategory: e.target.value })}
                  className={inp}
                >
                  <option value="">— No exam category —</option>
                  {examCategories.map((ec) => (
                    <option key={ec.id} value={ec.name}>{ec.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  Access
                </label>
                <div className="flex gap-2">
                  {[{ v: true, label: "Free" }, { v: false, label: "Paid" }].map((opt) => (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => setForm({ ...form, isFree: opt.v })}
                      className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                        form.isFree === opt.v
                          ? opt.v
                            ? "bg-emerald-500 border-emerald-500 text-white"
                            : "bg-amber-500 border-amber-500 text-white"
                          : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                {!form.isFree && (
                  <div className="mt-3">
                    <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                      Price for the whole set (₹) <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      step="1"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                      placeholder="e.g. 799"
                      className={inp}
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      One payment unlocks every PDF in this set. Sold separately — courses and the All-Access Plan don&apos;t include it.
                    </p>
                  </div>
                )}
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
                <input
                  type="checkbox"
                  checked={form.isPublished}
                  onChange={(e) => setForm({ ...form, isPublished: e.target.checked })}
                  className="w-4 h-4 rounded accent-[#4d65ff]"
                />
                <span className="text-sm text-gray-700">Published (visible on website)</span>
              </label>
            </div>

            {/* RIGHT — PDFs in this set */}
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                  PDFs in this set {files.length > 0 && <span className="normal-case text-gray-500">({readyCount})</span>}
                </label>

                <label className="flex flex-col items-center justify-center gap-3 cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-colors border-gray-200 bg-gray-50 hover:border-[#4d65ff]/40 hover:bg-[#4d65ff]/5">
                  <div className="w-12 h-12 rounded-2xl bg-[#4d65ff]/10 flex items-center justify-center">
                    <Upload className="w-6 h-6 text-[#4d65ff]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">
                      {files.length ? "Add more PDFs" : "Click to upload PDFs"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">Select one or many (Ctrl / Shift) · PDF only · max 50 MB each</p>
                  </div>
                  <input ref={fileRef} type="file" multiple accept=".pdf,application/pdf" className="hidden" onChange={handleFilesChosen} />
                </label>

                {files.length > 0 && (
                  <div className="mt-3 space-y-2 max-h-96 overflow-y-auto pr-1">
                    {files.map((f, i) => (
                      <div key={f.key} className={`rounded-lg border px-3 py-2 ${
                        f.status === "error" ? "border-red-200 bg-red-50/50" : "border-gray-200 bg-white"
                      }`}>
                        <div className="flex items-center gap-2">
                          {f.status === "uploading" ? <Loader2 className="w-4 h-4 text-[#4d65ff] animate-spin flex-shrink-0" />
                            : f.status === "error" ? <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                            : <FileText className="w-4 h-4 text-green-500 flex-shrink-0" />}
                          <input
                            value={f.title}
                            onChange={(e) => patchFile(f.key, { title: e.target.value })}
                            placeholder="PDF name shown to students"
                            className="flex-1 min-w-0 text-sm text-gray-900 bg-transparent border-0 border-b border-transparent focus:border-[#4d65ff] outline-none py-0.5"
                          />
                          <div className="flex items-center flex-shrink-0">
                            <button type="button" onClick={() => moveFile(i, -1)} disabled={i === 0} title="Move up"
                              className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-30">
                              <ChevronUp className="w-3.5 h-3.5" />
                            </button>
                            <button type="button" onClick={() => moveFile(i, 1)} disabled={i === files.length - 1} title="Move down"
                              className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-700 disabled:opacity-30">
                              <ChevronDown className="w-3.5 h-3.5" />
                            </button>
                            <button type="button" onClick={() => setFiles((p) => p.filter((x) => x.key !== f.key))} title="Remove from set"
                              disabled={f.status === "uploading"}
                              className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-red-500 disabled:opacity-30">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        {(f.fileName || f.error) && (
                          <p className="text-[11px] text-gray-400 truncate mt-0.5 pl-6">
                            {f.fileName}{f.sizeMb !== undefined && ` · ${f.sizeMb.toFixed(1)} MB`}
                            {f.status === "uploading" && " · uploading…"}
                            {f.error && <span className="text-red-600"> · {f.error}</span>}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-auto space-y-2">
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="w-full flex items-center justify-center gap-2 bg-[#4d65ff] hover:bg-[#3d55ef] disabled:opacity-60 text-white font-semibold text-sm py-3 rounded-xl transition-colors"
                >
                  {saving || uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {saving ? "Saving…" : uploading ? "Uploading PDFs…" : editId ? "Save Changes" : "Create Question Set"}
                </button>
                {editId && (
                  <button type="button" onClick={() => resetForm()} className="w-full py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* CATEGORIES */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-md bg-[#4d65ff]/10 flex items-center justify-center">
            <FolderPlus className="w-3.5 h-3.5 text-[#4d65ff]" />
          </span>
          Subject Categories
        </h2>

        <div className="flex flex-wrap gap-2 mb-4">
          {categories.length === 0 && (
            <p className="text-sm text-gray-400">No categories yet. Add one below to populate the Subject dropdown.</p>
          )}
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
          <input
            value={newCat}
            onChange={(e) => setNewCat(e.target.value)}
            placeholder="e.g. Constitutional Law"
            className={inp}
          />
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

      {/* LIST */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
          <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-[#4d65ff]/10 flex items-center justify-center">
              <FileText className="w-3.5 h-3.5 text-[#4d65ff]" />
            </span>
            All Question Sets
            <span className="text-gray-400 font-normal text-xs">({items.length})</span>
          </h2>
        </div>

        {items.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <FileText className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium text-sm">No question sets yet</p>
            <p className="text-gray-400 text-xs mt-1">Use the form above to add your first question set.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50/60 transition-colors">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.is_published ? "bg-green-400" : "bg-gray-300"}`} />

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 leading-tight">{item.title}</p>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1">
                    {item.subject && (
                      <span className="text-[11px] bg-[#4d65ff]/10 text-[#4d65ff] px-2 py-0.5 rounded-full font-medium">{item.subject}</span>
                    )}
                    {item.exam_category && (
                      <span className="text-[11px] bg-orange-50 text-orange-600 border border-orange-200 px-2 py-0.5 rounded-full font-medium">{item.exam_category}</span>
                    )}
                    {item.is_free
                      ? <span className="text-[11px] bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full font-medium">Free</span>
                      : <span className="text-[11px] bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium">Paid · ₹{Number(item.price).toLocaleString("en-IN")}</span>
                    }
                    {item.files.length > 0
                      ? <span className="text-[11px] text-green-600 flex items-center gap-0.5"><CheckCircle className="w-3 h-3" />{item.files.length} PDF{item.files.length === 1 ? "" : "s"}</span>
                      : <span className="text-[11px] text-gray-400">No PDFs</span>
                    }
                    <span className={`text-[11px] font-semibold ${item.is_published ? "text-green-500" : "text-gray-400"}`}>
                      · {item.is_published ? "Live" : "Draft"}
                    </span>
                  </div>
                  {item.files.length > 0 && (
                    <p className="text-[11px] text-gray-400 mt-1 truncate">
                      {item.files.map((f) => f.title).join(" · ")}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handleToggle(item)}
                    title={item.is_published ? "Unpublish" : "Publish"}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                      item.is_published ? "text-green-500 hover:text-gray-400" : "text-gray-300 hover:text-green-500"
                    }`}
                  >
                    {item.is_published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => startEdit(item)}
                    className="h-8 px-3 text-xs font-semibold text-[#4d65ff] hover:bg-[#4d65ff]/5 rounded-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item)}
                    className="w-8 h-8 flex items-center justify-center text-gray-300 hover:text-red-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
