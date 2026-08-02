"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  updateMockTest,
  deleteMockTest,
  createPassage,
  updatePassage,
  deletePassage,
  type MockTestUpdateData,
  type PassageData,
} from "@/app/admin/actions";
import {
  Save, CheckCircle, AlertCircle, Loader2, ArrowLeft, Upload,
  Plus, Pencil, Trash2, X, BookOpen, FileText,
} from "lucide-react";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────────

interface TestRow {
  slug: string;
  title: string;
  section: string;
  category: string | null;
  duration_minutes: number | string;
  total_questions: number | string;
  total_marks: number | string;
  attempted_label: string;
  language: string;
  difficulty: string;
  recent_attempt_line: string;
  marks_per_correct: number | string;
  negative_mark: number | string;
  is_free: boolean | null;
  price: number | string | null;
  test_type: string | null;
}

interface PassageRow {
  id: number;
  passage_number: number;
  title: string | null;
  text: string;
  source: string | null;
}

type Status = { type: "success" | "error"; message: string } | null;

// ── Shared primitives ─────────────────────────────────────────────────────────

const inputCls =
  "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4d65ff]/30 focus:border-[#4d65ff] transition-colors bg-white";

const selectCls =
  "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#4d65ff]/30 focus:border-[#4d65ff] transition-colors bg-white";

function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

function SectionCard({ title, children, action }: { title: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
        <h2 className="font-semibold text-gray-800 text-sm">{title}</h2>
        {action}
      </div>
      <div className="p-5 space-y-4">{children}</div>
    </div>
  );
}

// ── Passage inline form ───────────────────────────────────────────────────────

function PassageForm({
  initial,
  onSave,
  onCancel,
  saving,
}: {
  initial?: PassageData;
  onSave: (data: PassageData) => void;
  onCancel: () => void;
  saving: boolean;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [text, setText] = useState(initial?.text ?? "");
  const [source, setSource] = useState(initial?.source ?? "");

  return (
    <div className="border border-[#4d65ff]/30 rounded-xl p-4 bg-[#4d65ff]/5 space-y-3">
      <input
        className={inputCls}
        placeholder="Passage title (optional)"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <textarea
        className={`${inputCls} resize-none`}
        rows={10}
        placeholder="Paste passage text here…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <input
        className={inputCls}
        placeholder="Source / attribution (optional, e.g. 'Extracted from India's Struggle for Independence')"
        value={source}
        onChange={(e) => setSource(e.target.value)}
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onSave({ title: title.trim() || undefined, text, source: source.trim() || undefined })}
          disabled={!text.trim() || saving}
          className="inline-flex items-center gap-2 bg-[#4d65ff] hover:bg-[#3a52e8] disabled:opacity-50 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors"
        >
          {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : <><Save size={14} /> Save Passage</>}
        </button>
        <button type="button" onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2 rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────

export default function MockTestEditForm({
  test,
  questionCount,
  passages: initialPassages = [],
}: {
  test: TestRow;
  questionCount: number;
  passages?: PassageRow[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [status, setStatus] = useState<Status>(null);

  // Basic info
  const [title, setTitle] = useState(test.title ?? "");
  const [section, setSection] = useState(test.section ?? "");
  const [category, setCategory] = useState(test.category ?? "General");
  const [language, setLanguage] = useState(test.language ?? "English");
  const [difficulty, setDifficulty] = useState(test.difficulty ?? "MEDIUM");
  const [testType, setTestType] = useState<"normal" | "passage_based">(
    test.test_type === "passage_based" ? "passage_based" : "normal"
  );

  // Test config
  const [durationMinutes, setDurationMinutes] = useState(String(test.duration_minutes ?? 60));
  const [totalMarks, setTotalMarks] = useState(String(test.total_marks ?? 0));
  const [marksPerCorrect, setMarksPerCorrect] = useState(String(test.marks_per_correct ?? 1));
  const [negativeMark, setNegativeMark] = useState(String(test.negative_mark ?? 0));

  // Display labels
  const [attemptedLabel, setAttemptedLabel] = useState(test.attempted_label ?? "");
  const [recentAttemptLine, setRecentAttemptLine] = useState(test.recent_attempt_line ?? "");

  // Pricing
  const [isFree, setIsFree] = useState(test.is_free ?? true);
  const [price, setPrice] = useState(String(test.price ?? 0));

  // Passages state
  const [passages, setPassages] = useState<PassageRow[]>(initialPassages);
  const [showAddPassage, setShowAddPassage] = useState(false);
  const [editingPassageId, setEditingPassageId] = useState<number | null>(null);
  const [passageSaving, setPassageSaving] = useState(false);
  const [passageStatus, setPassageStatus] = useState<Status>(null);

  const handleSave = () => {
    const payload: MockTestUpdateData = {
      title,
      section,
      category,
      language,
      difficulty,
      test_type: testType,
      duration_minutes: Number(durationMinutes) || 0,
      total_marks: Number(totalMarks) || 0,
      marks_per_correct: Number(marksPerCorrect) || 1,
      negative_mark: Number(negativeMark) || 0,
      attempted_label: attemptedLabel,
      recent_attempt_line: recentAttemptLine,
      is_free: isFree,
      price: isFree ? 0 : Number(price) || 0,
    };

    startTransition(async () => {
      const result = await updateMockTest(test.slug, payload);
      if (result?.error) {
        setStatus({ type: "error", message: result.error });
      } else {
        setStatus({ type: "success", message: "Test saved successfully." });
        setTimeout(() => setStatus(null), 3000);
      }
    });
  };

  const handleDelete = () => {
    if (!confirm(`Delete "${test.title}"? This cannot be undone.`)) return;
    startDeleteTransition(async () => {
      const result = await deleteMockTest(test.slug);
      if (result?.error) {
        setStatus({ type: "error", message: result.error });
      } else {
        router.push("/admin/mock-tests");
      }
    });
  };

  const handleAddPassage = async (data: PassageData) => {
    setPassageSaving(true);
    setPassageStatus(null);
    const result = await createPassage(test.slug, data);
    setPassageSaving(false);
    if (result.error) {
      setPassageStatus({ type: "error", message: result.error });
      return;
    }
    const newPassage: PassageRow = {
      id: result.id!,
      passage_number: result.passageNumber!,
      title: data.title ?? null,
      text: data.text,
      source: data.source ?? null,
    };
    setPassages((prev) => [...prev, newPassage]);
    setShowAddPassage(false);
    setPassageStatus({ type: "success", message: "Passage added." });
    setTimeout(() => setPassageStatus(null), 2000);
  };

  const handleUpdatePassage = async (id: number, data: PassageData) => {
    setPassageSaving(true);
    setPassageStatus(null);
    const result = await updatePassage(id, test.slug, data);
    setPassageSaving(false);
    if (result.error) {
      setPassageStatus({ type: "error", message: result.error });
      return;
    }
    setPassages((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, title: data.title ?? null, text: data.text, source: data.source ?? null }
          : p
      )
    );
    setEditingPassageId(null);
    setPassageStatus({ type: "success", message: "Passage updated." });
    setTimeout(() => setPassageStatus(null), 2000);
  };

  const handleDeletePassage = async (id: number) => {
    if (!confirm("Delete this passage? Questions linked to it will lose their passage association.")) return;
    const result = await deletePassage(id, test.slug);
    if (result.error) {
      setPassageStatus({ type: "error", message: result.error });
      return;
    }
    setPassages((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <div>
      {/* Top bar */}
      <div className="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/admin/mock-tests" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft size={14} /> Tests
          </Link>
          <span className="text-gray-300">/</span>
          <h1 className="text-base font-bold text-gray-900 truncate max-w-[260px]">{test.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl border border-red-200 transition-colors disabled:opacity-50"
          >
            {isDeleting ? "Deleting…" : "Delete"}
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="inline-flex items-center gap-2 bg-[#4d65ff] hover:bg-[#3a52e8] disabled:opacity-60 text-white font-semibold px-4 py-2 rounded-xl text-sm transition-colors"
          >
            {isPending ? (
              <><Loader2 size={15} className="animate-spin" /> Saving…</>
            ) : (
              <><Save size={15} /> Save Changes</>
            )}
          </button>
        </div>
      </div>

      {/* Status banner */}
      {status && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl mb-5 text-sm ${
          status.type === "success"
            ? "bg-green-50 text-green-700 border border-green-200"
            : "bg-red-50 text-red-700 border border-red-200"
        }`}>
          {status.type === "success" ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {status.message}
        </div>
      )}

      <div className="space-y-5">

        {/* ── Basic Info ──────────────────────────────────────────────────── */}
        <SectionCard title="Basic Info">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Test Title">
              <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Test title" />
            </Field>
            <Field label="Slug (read-only)">
              <input className={`${inputCls} bg-gray-50 text-gray-500 cursor-not-allowed`} value={test.slug} readOnly />
            </Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Field label="Section / Exam">
              <input className={inputCls} value={section} onChange={(e) => setSection(e.target.value)} placeholder="e.g. CLAT, AILET" />
            </Field>
            <Field label="Category">
              <input className={inputCls} value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Full Mock, Subject Test" />
            </Field>
            <Field label="Language">
              <select className={selectCls} value={language} onChange={(e) => setLanguage(e.target.value)}>
                <option>English</option>
                <option>Hindi</option>
                <option>Bilingual</option>
              </select>
            </Field>
          </div>
          <Field label="Difficulty">
            <div className="flex gap-3">
              {(["EASY", "MEDIUM", "HARD"] as const).map((d) => (
                <label key={d} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="difficulty" value={d} checked={difficulty === d} onChange={() => setDifficulty(d)} className="accent-[#4d65ff]" />
                  <span className="text-sm text-gray-700">{d}</span>
                </label>
              ))}
            </div>
          </Field>
        </SectionCard>

        {/* ── Test Type ───────────────────────────────────────────────────── */}
        <SectionCard title="Test Type">
          <p className="text-xs text-gray-500 -mt-2">
            Choose how questions are presented to students.
          </p>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setTestType("normal")}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold border-2 transition-colors flex-1 ${
                testType === "normal"
                  ? "bg-[#4d65ff]/10 text-[#4d65ff] border-[#4d65ff]"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              <FileText size={16} />
              <div className="text-left">
                <p className="font-semibold">Normal</p>
                <p className="text-xs font-normal text-gray-500">One question at a time, no passage</p>
              </div>
            </button>
            <button
              type="button"
              onClick={() => setTestType("passage_based")}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm font-semibold border-2 transition-colors flex-1 ${
                testType === "passage_based"
                  ? "bg-amber-50 text-amber-700 border-amber-400"
                  : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
              }`}
            >
              <BookOpen size={16} />
              <div className="text-left">
                <p className="font-semibold">Passage Based</p>
                <p className="text-xs font-normal text-gray-500">CLAT-style: passage + multiple questions</p>
              </div>
            </button>
          </div>
        </SectionCard>

        {/* ── Passages (only when passage_based) ──────────────────────────── */}
        {testType === "passage_based" && (
          <div className="bg-white border border-amber-200 rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-amber-100 bg-amber-50 flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-amber-800 text-sm flex items-center gap-2">
                  <BookOpen size={14} /> Passages
                </h2>
                <p className="text-xs text-amber-600 mt-0.5">
                  {passages.length > 0
                    ? `${passages.length} passage${passages.length !== 1 ? "s" : ""} — add passages before uploading questions`
                    : "No passages yet — add at least one before uploading questions"}
                </p>
              </div>
              {!showAddPassage && (
                <button
                  type="button"
                  onClick={() => { setShowAddPassage(true); setEditingPassageId(null); }}
                  className="inline-flex items-center gap-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                >
                  <Plus size={13} /> Add Passage
                </button>
              )}
            </div>

            <div className="p-5 space-y-3">
              {/* Passage status banner */}
              {passageStatus && (
                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${
                  passageStatus.type === "success"
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}>
                  {passageStatus.type === "success" ? <CheckCircle size={15} /> : <AlertCircle size={15} />}
                  {passageStatus.message}
                </div>
              )}

              {/* Existing passages */}
              {passages.map((passage) =>
                editingPassageId === passage.id ? (
                  <PassageForm
                    key={passage.id}
                    initial={{ title: passage.title ?? undefined, text: passage.text, source: passage.source ?? undefined }}
                    onSave={(data) => handleUpdatePassage(passage.id, data)}
                    onCancel={() => setEditingPassageId(null)}
                    saving={passageSaving}
                  />
                ) : (
                  <div key={passage.id} className="border border-gray-200 rounded-xl p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800">
                          Passage {passage.passage_number}
                          {passage.title ? ` — ${passage.title}` : ""}
                        </p>
                        {passage.source && (
                          <p className="text-xs text-gray-400 mt-0.5 italic">{passage.source}</p>
                        )}
                        <p className="text-sm text-gray-500 mt-1.5 line-clamp-3 whitespace-pre-wrap">
                          {passage.text}
                        </p>
                      </div>
                      <div className="flex gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => { setEditingPassageId(passage.id); setShowAddPassage(false); }}
                          className="p-2 rounded-lg text-gray-400 hover:text-[#4d65ff] hover:bg-[#4d65ff]/10 transition-colors"
                          title="Edit passage"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeletePassage(passage.id)}
                          className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete passage"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              )}

              {passages.length === 0 && !showAddPassage && (
                <div className="text-center py-8 text-gray-400">
                  <BookOpen size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No passages yet. Click &quot;Add Passage&quot; to get started.</p>
                </div>
              )}

              {/* Add passage form */}
              {showAddPassage && (
                <PassageForm
                  onSave={handleAddPassage}
                  onCancel={() => setShowAddPassage(false)}
                  saving={passageSaving}
                />
              )}

              {!showAddPassage && passages.length > 0 && (
                <button
                  type="button"
                  onClick={() => { setShowAddPassage(true); setEditingPassageId(null); }}
                  className="w-full border-2 border-dashed border-gray-200 hover:border-[#4d65ff]/40 hover:bg-[#4d65ff]/5 rounded-xl py-3 text-sm font-medium text-gray-400 hover:text-[#4d65ff] transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={15} /> Add Another Passage
                </button>
              )}

              {passages.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-700">
                  <strong>Tip:</strong> When uploading questions for this test, include a &quot;Passage Number&quot; column in your Excel file (e.g. 1, 2, 3) to link each question to the correct passage.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Test Configuration ──────────────────────────────────────────── */}
        <SectionCard title="Test Configuration">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Field label="Duration (min)">
              <input type="number" min="1" className={inputCls} value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} />
            </Field>
            <Field label="Total Marks">
              <input type="number" min="0" className={inputCls} value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} />
            </Field>
            <Field label="Marks per Correct">
              <input type="number" min="0" step="0.25" className={inputCls} value={marksPerCorrect} onChange={(e) => setMarksPerCorrect(e.target.value)} />
            </Field>
            <Field label="Negative Mark">
              <input type="number" min="0" step="0.25" className={inputCls} value={negativeMark} onChange={(e) => setNegativeMark(e.target.value)} />
            </Field>
          </div>
        </SectionCard>

        {/* ── Access & Pricing ────────────────────────────────────────────── */}
        <SectionCard title="Access & Pricing">
          <div className="flex items-center gap-3">
            <button type="button" onClick={() => setIsFree(true)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${isFree ? "bg-emerald-50 text-emerald-700 border-emerald-300" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
              Free
            </button>
            <button type="button" onClick={() => setIsFree(false)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${!isFree ? "bg-violet-50 text-violet-700 border-violet-300" : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"}`}>
              Paid (TLP+)
            </button>
          </div>
          {!isFree && (
            <Field label="Price (₹)">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">₹</span>
                <input type="number" min="0" className={`${inputCls} pl-8`} value={price} onChange={(e) => setPrice(e.target.value)} />
              </div>
            </Field>
          )}
        </SectionCard>

        {/* ── Display Labels ──────────────────────────────────────────────── */}
        <SectionCard title="Display Labels">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Attempted Label" hint={`Shown on card e.g. "4.2k Attempts"`}>
              <input className={inputCls} value={attemptedLabel} onChange={(e) => setAttemptedLabel(e.target.value)} placeholder="e.g. 4.2k Attempts" />
            </Field>
            <Field label="Recent Attempt Line" hint="General display only — per-student data is auto-computed">
              <input className={inputCls} value={recentAttemptLine} onChange={(e) => setRecentAttemptLine(e.target.value)} placeholder="e.g. Last attempted 2 hours ago" />
            </Field>
          </div>
        </SectionCard>

        {/* ── Questions ───────────────────────────────────────────────────── */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-800 text-sm">Questions</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                {questionCount > 0
                  ? `${questionCount} question${questionCount !== 1 ? "s" : ""} stored`
                  : "No questions yet"}
                {testType === "passage_based" && passages.length > 0 && (
                  <> — add a <strong>Passage Number</strong> column in your Excel to link questions to passages</>
                )}
              </p>
            </div>
            <Link
              href={`/admin/upload-questions?slug=${test.slug}`}
              className="inline-flex items-center gap-1.5 bg-[#4d65ff]/10 hover:bg-[#4d65ff]/20 text-[#4d65ff] font-semibold text-xs px-3 py-2 rounded-lg transition-colors"
            >
              <Upload size={13} /> Upload Questions (.xlsx)
            </Link>
          </div>
          <div className="px-5 py-4 text-sm text-gray-500">
            Questions are managed via the{" "}
            <Link href="/admin/upload-questions" className="text-[#4d65ff] hover:underline font-medium">
              Upload Questions
            </Link>{" "}
            tool. Upload an Excel file (.xlsx) to add questions to this test.
            {testType === "passage_based" && (
              <span className="block mt-2 text-amber-700">
                For passage-based tests: include a <strong>Passage Number</strong> column (values: 1, 2, 3…) to link each row to the correct passage.
              </span>
            )}
          </div>
        </div>

        {/* ── Save footer ─────────────────────────────────────────────────── */}
        <div className="flex justify-end gap-3 pt-2 pb-8">
          <button type="button" onClick={handleDelete} disabled={isDeleting}
            className="px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl border border-red-200 transition-colors disabled:opacity-50">
            {isDeleting ? "Deleting…" : "Delete Test"}
          </button>
          <button type="button" onClick={handleSave} disabled={isPending}
            className="inline-flex items-center gap-2 bg-[#4d65ff] hover:bg-[#3a52e8] disabled:opacity-60 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
            {isPending ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : <><Save size={15} /> Save Changes</>}
          </button>
        </div>

      </div>
    </div>
  );
}
