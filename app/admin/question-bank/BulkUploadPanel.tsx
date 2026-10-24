"use client";

import { useState, useRef } from "react";
import { Upload, Loader2, X, FileText, CheckCircle, AlertCircle, Files } from "lucide-react";
import { uploadQuestionBankFile, createQuestionBankItem } from "@/app/admin/actions";
import type { QuestionBankCategory } from "@/lib/questionBank";
import type { ExamCategory } from "@/lib/resources";

interface Props {
  categories: QuestionBankCategory[];
  examCategories: ExamCategory[];
  onDone: (msg: string) => void;
}

type Status = "pending" | "uploading" | "done" | "error";

interface Entry {
  key: string;
  file: File;
  title: string;
  status: Status;
  error?: string;
  path?: string; // set once the PDF is in storage, so a retry doesn't re-upload it
}

const MAX_BYTES = 50 * 1024 * 1024;

const inp = "w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-[#4d65ff] focus:border-[#4d65ff] outline-none transition";

/** "IPC_Chapter-1 MCQs.pdf" → "IPC Chapter 1 MCQs" */
function titleFromFile(name: string) {
  return name.replace(/\.pdf$/i, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

export default function BulkUploadPanel({ categories, examCategories, onDone }: Props) {
  const [subject, setSubject] = useState("");
  const [examCategory, setExamCategory] = useState("");
  const [isFree, setIsFree] = useState(true);
  const [price, setPrice] = useState("");
  const [isPublished, setIsPublished] = useState(true);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [running, setRunning] = useState(false);
  const [err, setErr] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function patch(key: string, p: Partial<Entry>) {
    setEntries((prev) => prev.map((x) => (x.key === key ? { ...x, ...p } : x)));
  }

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    setErr("");
    const skipped: string[] = [];
    const added: Entry[] = [];
    for (const f of files) {
      if (!/\.pdf$/i.test(f.name) && f.type !== "application/pdf") { skipped.push(`${f.name} (not a PDF)`); continue; }
      if (f.size > MAX_BYTES) { skipped.push(`${f.name} (over 50 MB)`); continue; }
      added.push({
        key: `${f.name}_${f.size}_${f.lastModified}_${Math.random().toString(36).slice(2)}`,
        file: f,
        title: titleFromFile(f.name),
        status: "pending",
      });
    }
    setEntries((prev) => [...prev, ...added]);
    if (skipped.length) setErr(`Skipped: ${skipped.join(", ")}`);
    if (fileRef.current) fileRef.current.value = "";
  }

  async function handleUploadAll() {
    setErr("");
    const queue = entries.filter((x) => x.status !== "done");
    if (queue.length === 0) { setErr("Add at least one PDF."); return; }
    if (queue.some((x) => !x.title.trim())) { setErr("Every PDF needs a title."); return; }
    if (!isFree && !(Number(price) > 0)) { setErr("Enter a price above ₹0 for paid question sets."); return; }

    setRunning(true);
    let ok = 0;
    for (const entry of queue) {
      patch(entry.key, { status: "uploading", error: undefined });
      let path = entry.path;
      if (!path) {
        const fd = new FormData();
        fd.append("file", entry.file);
        const up = await uploadQuestionBankFile(fd);
        if (up.error || !up.path) {
          patch(entry.key, { status: "error", error: up.error ?? "Upload failed" });
          continue;
        }
        path = up.path;
        patch(entry.key, { path });
      }
      const res = await createQuestionBankItem({
        title: entry.title.trim(),
        subject: subject || null,
        examCategory: examCategory || null,
        filePath: path,
        isFree,
        price: isFree ? 0 : Number(price),
        isPublished,
      });
      if (res.error) {
        patch(entry.key, { status: "error", error: res.error });
        continue;
      }
      patch(entry.key, { status: "done" });
      ok++;
    }
    setRunning(false);

    const failed = queue.length - ok;
    if (failed === 0) {
      onDone(`${ok} question set${ok === 1 ? "" : "s"} created.`);
      window.location.reload();
    } else {
      setErr(`${ok} uploaded, ${failed} failed. Fix the errors below and click Upload again to retry.`);
    }
  }

  const pendingCount = entries.filter((x) => x.status !== "done").length;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/60">
        <h2 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
          <span className="w-6 h-6 rounded-md bg-[#4d65ff]/10 flex items-center justify-center">
            <Files className="w-3.5 h-3.5 text-[#4d65ff]" />
          </span>
          Bulk Upload PDFs
          <span className="text-gray-400 font-normal text-xs">— one question set per PDF, all in the same subject</span>
        </h2>
      </div>

      <div className="p-6">
        {err && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {err}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT — shared settings */}
          <div className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Subject / Category
              </label>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className={inp} disabled={running}>
                <option value="">— No subject —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                Exam Category
              </label>
              <select value={examCategory} onChange={(e) => setExamCategory(e.target.value)} className={inp} disabled={running}>
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
                    disabled={running}
                    onClick={() => setIsFree(opt.v)}
                    className={`flex-1 py-2.5 rounded-lg text-sm font-semibold border transition-colors ${
                      isFree === opt.v
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
              {!isFree && (
                <div className="mt-3">
                  <label className="block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">
                    Price per set (₹) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min={1}
                    step="1"
                    value={price}
                    disabled={running}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 199"
                    className={inp}
                  />
                  <p className="text-[11px] text-gray-400 mt-1">
                    Applied to every PDF in this batch. You can change individual prices later with Edit.
                  </p>
                </div>
              )}
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none pt-1">
              <input
                type="checkbox"
                checked={isPublished}
                disabled={running}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 rounded accent-[#4d65ff]"
              />
              <span className="text-sm text-gray-700">Published (visible on website)</span>
            </label>
          </div>

          {/* RIGHT — files */}
          <div className="flex flex-col gap-4">
            <label className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed p-8 text-center transition-colors ${
              running ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
            } border-gray-200 bg-gray-50 hover:border-[#4d65ff]/40 hover:bg-[#4d65ff]/5`}>
              <div className="w-12 h-12 rounded-2xl bg-[#4d65ff]/10 flex items-center justify-center">
                <Upload className="w-6 h-6 text-[#4d65ff]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Click to select multiple PDFs</p>
                <p className="text-xs text-gray-400 mt-0.5">Hold Ctrl / Shift to pick several · PDF only · max 50 MB each</p>
              </div>
              <input
                ref={fileRef}
                type="file"
                multiple
                accept=".pdf,application/pdf"
                className="hidden"
                disabled={running}
                onChange={handleFiles}
              />
            </label>

            {entries.length > 0 && (
              <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                {entries.map((x) => (
                  <div key={x.key} className={`rounded-lg border px-3 py-2 ${
                    x.status === "error" ? "border-red-200 bg-red-50/50"
                      : x.status === "done" ? "border-green-200 bg-green-50/50"
                      : "border-gray-200 bg-white"
                  }`}>
                    <div className="flex items-center gap-2">
                      {x.status === "uploading" ? <Loader2 className="w-4 h-4 text-[#4d65ff] animate-spin flex-shrink-0" />
                        : x.status === "done" ? <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        : x.status === "error" ? <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        : <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />}
                      <input
                        value={x.title}
                        disabled={running || x.status === "done"}
                        onChange={(e) => patch(x.key, { title: e.target.value })}
                        placeholder="Title"
                        className="flex-1 min-w-0 text-sm text-gray-900 bg-transparent border-0 border-b border-transparent focus:border-[#4d65ff] outline-none py-0.5 disabled:text-gray-500"
                      />
                      {!running && x.status !== "done" && (
                        <button
                          type="button"
                          onClick={() => setEntries((p) => p.filter((y) => y.key !== x.key))}
                          className="text-gray-400 hover:text-red-500 flex-shrink-0 transition-colors"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400 truncate mt-0.5 pl-6">
                      {x.file.name} · {(x.file.size / 1024 / 1024).toFixed(1)} MB
                      {x.error && <span className="text-red-600"> · {x.error}</span>}
                    </p>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-auto space-y-2">
              <button
                type="button"
                onClick={handleUploadAll}
                disabled={running || pendingCount === 0}
                className="w-full flex items-center justify-center gap-2 bg-[#4d65ff] hover:bg-[#3d55ef] disabled:opacity-60 text-white font-semibold text-sm py-3 rounded-xl transition-colors"
              >
                {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {running ? "Uploading…" : pendingCount === 1 ? "Upload 1 PDF" : `Upload ${pendingCount} PDFs`}
              </button>
              {entries.length > 0 && !running && (
                <button
                  type="button"
                  onClick={() => { setEntries([]); setErr(""); }}
                  className="w-full py-2.5 rounded-xl border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
                >
                  Clear list
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
