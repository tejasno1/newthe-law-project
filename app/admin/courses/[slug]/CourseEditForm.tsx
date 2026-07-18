"use client";

import { useState, useRef, useTransition } from "react";
import {
  updateCourse,
  uploadCourseImage,
  type CourseUpdateData,
  type CourseModule,
  type ModuleItem,
  type CourseFAQ,
} from "@/app/admin/actions";
import {
  Save,
  Upload,
  CheckCircle,
  AlertCircle,
  ImageIcon,
  Loader2,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Image from "next/image";

type CourseRow = {
  slug: string;
  title: string;
  desc: string;
  long_desc: string;
  category: string;
  price: number | null;
  old_price: number | null;
  duration: string;
  lessons: number | string | null;
  level: string;
  language: string;
  files: number | string | null;
  rating: number | null;
  students: number | null;
  img: string;
  access_type: string | null;
  delivery_type: string | null;
  modules: CourseModule[] | null;
  outcomes: string[] | null;
  ideal_for: string[] | null;
  faqs: CourseFAQ[] | null;
};

type Status = { type: "success" | "error"; message: string } | null;

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

const inputCls =
  "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4d65ff]/30 focus:border-[#4d65ff] transition-colors bg-white";

const selectCls =
  "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#4d65ff]/30 focus:border-[#4d65ff] transition-colors bg-white";

// ── String-list editor (outcomes / ideal_for) ────────────────────────────────

function StringListEditor({
  items,
  onChange,
  placeholder,
}: {
  items: string[];
  onChange: (items: string[]) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={idx} className="flex items-center gap-2">
          <span className="text-xs text-gray-400 w-5 text-right flex-shrink-0">{idx + 1}.</span>
          <input
            type="text"
            value={item}
            onChange={(e) => onChange(items.map((v, i) => (i === idx ? e.target.value : v)))}
            placeholder={placeholder}
            className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4d65ff]/30 focus:border-[#4d65ff] bg-white"
          />
          <button
            type="button"
            onClick={() => onChange(items.filter((_, i) => i !== idx))}
            className="p-1 text-gray-300 hover:text-red-500 flex-shrink-0"
          >
            <Trash2 size={13} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...items, ""])}
        className="flex items-center gap-1.5 text-xs text-[#4d65ff] hover:text-indigo-700 font-medium mt-1"
      >
        <Plus size={13} /> Add item
      </button>
    </div>
  );
}

// ── FAQ editor ────────────────────────────────────────────────────────────────

function FAQEditor({
  faqs,
  onChange,
}: {
  faqs: CourseFAQ[];
  onChange: (faqs: CourseFAQ[]) => void;
}) {
  function update(idx: number, field: keyof CourseFAQ, value: string) {
    onChange(faqs.map((f, i) => (i === idx ? { ...f, [field]: value } : f)));
  }

  function move(idx: number, dir: "up" | "down") {
    const target = dir === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= faqs.length) return;
    const next = [...faqs];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  }

  return (
    <div className="space-y-3">
      {faqs.map((faq, idx) => (
        <div key={idx} className="border border-gray-200 rounded-xl p-4 space-y-2 bg-gray-50">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-semibold text-[#4d65ff]">FAQ {idx + 1}</span>
            <div className="flex items-center gap-0.5">
              <button type="button" onClick={() => move(idx, "up")} disabled={idx === 0} className="p-1 text-gray-300 hover:text-gray-600 disabled:opacity-30 rounded">
                <ChevronUp size={13} />
              </button>
              <button type="button" onClick={() => move(idx, "down")} disabled={idx === faqs.length - 1} className="p-1 text-gray-300 hover:text-gray-600 disabled:opacity-30 rounded">
                <ChevronDown size={13} />
              </button>
              <button type="button" onClick={() => onChange(faqs.filter((_, i) => i !== idx))} className="p-1 text-gray-300 hover:text-red-500 rounded">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
          <input
            type="text"
            value={faq.question}
            onChange={(e) => update(idx, "question", e.target.value)}
            placeholder="Question"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4d65ff]/30 focus:border-[#4d65ff] bg-white font-medium"
          />
          <textarea
            value={faq.answer}
            onChange={(e) => update(idx, "answer", e.target.value)}
            placeholder="Answer"
            rows={2}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4d65ff]/30 focus:border-[#4d65ff] bg-white resize-none"
          />
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...faqs, { question: "", answer: "" }])}
        className="w-full py-2.5 border-2 border-dashed border-gray-200 hover:border-[#4d65ff]/40 rounded-xl text-sm text-gray-400 hover:text-[#4d65ff] transition-colors flex items-center justify-center gap-2"
      >
        <Plus size={14} /> Add FAQ
      </button>
    </div>
  );
}

// ── Module / Submodule Editor ─────────────────────────────────────────────────

function ModuleEditor({
  modules,
  onChange,
}: {
  modules: CourseModule[];
  onChange: (modules: CourseModule[]) => void;
}) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  function addModule() {
    const next = [...modules, { title: "", items: [{ title: "" }] }];
    onChange(next);
    setExpandedIdx(next.length - 1);
  }

  function removeModule(idx: number) {
    if (!confirm("Remove this module and all its lessons?")) return;
    const next = modules.filter((_, i) => i !== idx);
    onChange(next);
    setExpandedIdx(null);
  }

  function moveModule(idx: number, dir: "up" | "down") {
    const target = dir === "up" ? idx - 1 : idx + 1;
    if (target < 0 || target >= modules.length) return;
    const next = [...modules];
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
    setExpandedIdx(target);
  }

  function updateModuleField(
    idx: number,
    field: keyof Omit<CourseModule, "items">,
    value: string
  ) {
    onChange(modules.map((m, i) => (i === idx ? { ...m, [field]: value } : m)));
  }

  function addItem(modIdx: number) {
    onChange(
      modules.map((m, i) =>
        i === modIdx ? { ...m, items: [...m.items, { title: "" }] } : m
      )
    );
  }

  function removeItem(modIdx: number, itemIdx: number) {
    onChange(
      modules.map((m, i) =>
        i === modIdx
          ? { ...m, items: m.items.filter((_, ii) => ii !== itemIdx) }
          : m
      )
    );
  }

  function moveItem(modIdx: number, itemIdx: number, dir: "up" | "down") {
    const target = dir === "up" ? itemIdx - 1 : itemIdx + 1;
    const items = modules[modIdx].items;
    if (target < 0 || target >= items.length) return;
    const next = [...items];
    [next[itemIdx], next[target]] = [next[target], next[itemIdx]];
    onChange(modules.map((m, i) => (i === modIdx ? { ...m, items: next } : m)));
  }

  function updateItemField(
    modIdx: number,
    itemIdx: number,
    field: keyof ModuleItem,
    value: string
  ) {
    onChange(
      modules.map((m, i) => {
        if (i !== modIdx) return m;
        const items = m.items.map((it, ii) =>
          ii === itemIdx ? { ...it, [field]: value } : it
        );
        return { ...m, items };
      })
    );
  }

  return (
    <div className="space-y-3">
      {modules.map((mod, modIdx) => {
        const isOpen = expandedIdx === modIdx;
        return (
          <div
            key={modIdx}
            className="border border-gray-200 rounded-xl overflow-hidden"
          >
            {/* ── Module header ── */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gray-50">
              <button
                type="button"
                onClick={() => setExpandedIdx(isOpen ? null : modIdx)}
                className="flex items-center gap-2 flex-1 min-w-0 text-left"
              >
                <ChevronRight
                  size={14}
                  className={`text-gray-400 flex-shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`}
                />
                <span className="text-xs font-semibold text-[#4d65ff] flex-shrink-0">
                  M{modIdx + 1}
                </span>
                {mod.title ? (
                  <span className="text-sm font-medium text-gray-800 truncate">{mod.title}</span>
                ) : (
                  <span className="text-sm text-gray-400 italic">Untitled module</span>
                )}
                <span className="ml-auto text-xs text-gray-400 flex-shrink-0">
                  {mod.items.length} lesson{mod.items.length !== 1 ? "s" : ""}
                </span>
              </button>

              <div className="flex items-center gap-0.5 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => moveModule(modIdx, "up")}
                  disabled={modIdx === 0}
                  className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => moveModule(modIdx, "down")}
                  disabled={modIdx === modules.length - 1}
                  className="p-1 text-gray-400 hover:text-gray-700 disabled:opacity-30 rounded"
                >
                  <ChevronDown size={14} />
                </button>
                <button
                  type="button"
                  onClick={() => removeModule(modIdx)}
                  className="p-1 text-gray-400 hover:text-red-500 rounded"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>

            {/* ── Module body (expanded) ── */}
            {isOpen && (
              <div className="p-4 space-y-4 border-t border-gray-100">
                {/* Module title */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Module Title</label>
                  <input
                    type="text"
                    value={mod.title}
                    onChange={(e) => updateModuleField(modIdx, "title", e.target.value)}
                    placeholder="e.g. Module 1 – Introduction to Legal Reasoning"
                    className={inputCls}
                  />
                </div>

                {/* Optional module meta */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Duration <span className="font-normal text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="text"
                      value={mod.module_duration ?? ""}
                      onChange={(e) => updateModuleField(modIdx, "module_duration", e.target.value)}
                      placeholder="e.g. 3 hours"
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Lesson count <span className="font-normal text-gray-400">(optional)</span>
                    </label>
                    <input
                      type="number"
                      value={mod.lessons_count ?? ""}
                      onChange={(e) =>
                        onChange(
                          modules.map((m, i) =>
                            i === modIdx
                              ? { ...m, lessons_count: e.target.value ? Number(e.target.value) : undefined }
                              : m
                          )
                        )
                      }
                      placeholder="8"
                      min={0}
                      className={inputCls}
                    />
                  </div>
                </div>

                {/* Items / submodules */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">
                    Lessons / Topics
                  </label>
                  <div className="space-y-2">
                    {mod.items.map((item, itemIdx) => (
                      <div key={itemIdx} className="flex items-center gap-2">
                        <span className="text-xs text-gray-400 w-5 text-right flex-shrink-0">
                          {itemIdx + 1}.
                        </span>
                        <input
                          type="text"
                          value={item.title}
                          onChange={(e) => updateItemField(modIdx, itemIdx, "title", e.target.value)}
                          placeholder={`Lesson ${itemIdx + 1} title`}
                          className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4d65ff]/30 focus:border-[#4d65ff] bg-white"
                        />
                        <div className="flex gap-0.5 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => moveItem(modIdx, itemIdx, "up")}
                            disabled={itemIdx === 0}
                            className="p-1 text-gray-300 hover:text-gray-600 disabled:opacity-30 rounded"
                          >
                            <ChevronUp size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveItem(modIdx, itemIdx, "down")}
                            disabled={itemIdx === mod.items.length - 1}
                            className="p-1 text-gray-300 hover:text-gray-600 disabled:opacity-30 rounded"
                          >
                            <ChevronDown size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeItem(modIdx, itemIdx)}
                            className="p-1 text-gray-300 hover:text-red-500 rounded"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => addItem(modIdx)}
                    className="flex items-center gap-1.5 mt-3 text-xs text-[#4d65ff] hover:text-indigo-700 font-medium"
                  >
                    <Plus size={13} /> Add Lesson
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <button
        type="button"
        onClick={addModule}
        className="w-full py-3 border-2 border-dashed border-gray-200 hover:border-[#4d65ff]/40 rounded-xl text-sm text-gray-400 hover:text-[#4d65ff] transition-colors flex items-center justify-center gap-2"
      >
        <Plus size={15} /> Add Module
      </button>
    </div>
  );
}

// ── Main Form ──────────────────────────────────────────────────────────────────

export default function CourseEditForm({ course }: { course: CourseRow }) {
  const [form, setForm] = useState({
    title: course.title ?? "",
    desc: course.desc ?? "",
    long_desc: course.long_desc ?? "",
    category: course.category ?? "",
    price: course.price != null ? String(course.price) : "",
    old_price: course.old_price != null ? String(course.old_price) : "",
    duration: course.duration ?? "",
    lessons: course.lessons != null ? String(course.lessons) : "",
    level: course.level ?? "",
    language: course.language ?? "",
    files: course.files != null ? String(course.files) : "",
    rating: course.rating != null ? String(course.rating) : "",
    students: course.students != null ? String(course.students) : "",
    access_type: course.access_type ?? "",
    delivery_type: course.delivery_type ?? "",
  });

  const [modules, setModules] = useState<CourseModule[]>(
    (course.modules ?? []).map((m) => ({
      ...m,
      items: (m.items ?? []).map((it) =>
        typeof it === "string" ? { title: it } : it
      ),
    }))
  );

  const [outcomes, setOutcomes] = useState<string[]>(course.outcomes ?? []);
  const [idealFor, setIdealFor] = useState<string[]>(course.ideal_for ?? []);
  const [faqs, setFaqs] = useState<CourseFAQ[]>(course.faqs ?? []);

  const [imgPreview, setImgPreview] = useState(course.img ?? "");
  const [saveStatus, setSaveStatus] = useState<Status>(null);
  const [uploadStatus, setUploadStatus] = useState<Status>(null);
  const [isSaving, startSave] = useTransition();
  const [isUploading, startUpload] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  function set(field: string) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }

  function handleSave() {
    setSaveStatus(null);
    startSave(async () => {
      const data: CourseUpdateData = {
        title: form.title || undefined,
        desc: form.desc || undefined,
        long_desc: form.long_desc || undefined,
        category: form.category || undefined,
        price: form.price !== "" ? Number(form.price) : null,
        old_price: form.old_price !== "" ? Number(form.old_price) : null,
        duration: form.duration || undefined,
        lessons: form.lessons !== "" ? Number(form.lessons) : null,
        level: form.level || undefined,
        language: form.language || undefined,
        files: form.files !== "" ? Number(form.files) : null,
        rating: form.rating !== "" ? Number(form.rating) : null,
        students: form.students !== "" ? Number(form.students) : null,
        access_type: form.access_type || null,
        delivery_type: form.delivery_type || null,
        modules,
        outcomes,
        ideal_for: idealFor,
        faqs,
      };

      const result = await updateCourse(course.slug, data);
      if (result.error) {
        setSaveStatus({ type: "error", message: result.error });
      } else {
        setSaveStatus({ type: "success", message: "Course saved successfully!" });
        setTimeout(() => setSaveStatus(null), 4000);
      }
    });
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) setImgPreview(URL.createObjectURL(file));
  }

  function handleUpload() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setUploadStatus({ type: "error", message: "Please select an image file first." });
      return;
    }
    setUploadStatus(null);
    startUpload(async () => {
      const fd = new FormData();
      fd.append("file", file);
      const result = await uploadCourseImage(course.slug, fd);
      if (result.error) {
        setUploadStatus({ type: "error", message: result.error });
      } else {
        setImgPreview(result.url!);
        setUploadStatus({ type: "success", message: "Image uploaded successfully!" });
        if (fileInputRef.current) fileInputRef.current.value = "";
        setTimeout(() => setUploadStatus(null), 4000);
      }
    });
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

  return (
    <div className="space-y-6">
      {/* ── Basic Info ─────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5">Basic Info</h2>
        <div className="space-y-4">
          <Field label="Course Title">
            <input type="text" className={inputCls} value={form.title} onChange={set("title")} placeholder="e.g. CLAT PG Complete Course" />
          </Field>
          <Field label="Category">
            <input type="text" className={inputCls} value={form.category} onChange={set("category")} placeholder="e.g. CLAT PG" />
          </Field>
          <Field label="Short Description" hint="Shown on the course card (keep under 120 characters)">
            <textarea className={inputCls + " resize-none"} rows={2} value={form.desc} onChange={set("desc")} placeholder="Brief description of the course…" />
          </Field>
          <Field label="Long Description" hint="Full course description shown on the course page">
            <textarea className={inputCls + " resize-y"} rows={5} value={form.long_desc} onChange={set("long_desc")} placeholder="Detailed course description…" />
          </Field>
        </div>
      </section>

      {/* ── Course Details ─────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5">Course Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Duration" hint='e.g. "3 Months", "40 Hours"'>
            <input type="text" className={inputCls} value={form.duration} onChange={set("duration")} placeholder="3 Months" />
          </Field>
          <Field label="Number of Lessons">
            <input type="number" className={inputCls} value={form.lessons} onChange={set("lessons")} placeholder="120" min={0} />
          </Field>
          <Field label="Level">
            <select className={selectCls} value={form.level} onChange={set("level")}>
              <option value="">— Select Level —</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
              <option value="All Levels">All Levels</option>
            </select>
          </Field>
          <Field label="Language">
            <input type="text" className={inputCls} value={form.language} onChange={set("language")} placeholder="English" />
          </Field>
          <Field label="Downloadable Files">
            <input type="number" className={inputCls} value={form.files} onChange={set("files")} placeholder="15" min={0} />
          </Field>
        </div>
      </section>

      {/* ── Pricing ────────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5">Pricing</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Price (₹)" hint="Current selling price">
            <input type="number" className={inputCls} value={form.price} onChange={set("price")} placeholder="4999" min={0} />
          </Field>
          <Field label="Original Price (₹)" hint="Crossed-out price shown as 'was ₹…'">
            <input type="number" className={inputCls} value={form.old_price} onChange={set("old_price")} placeholder="8999" min={0} />
          </Field>
        </div>
      </section>

      {/* ── Stats ──────────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5">Stats</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Rating" hint="Out of 5, e.g. 4.8">
            <input type="number" className={inputCls} value={form.rating} onChange={set("rating")} placeholder="4.8" min={0} max={5} step={0.1} />
          </Field>
          <Field label="Students Enrolled">
            <input type="number" className={inputCls} value={form.students} onChange={set("students")} placeholder="1200" min={0} />
          </Field>
        </div>
      </section>

      {/* ── Settings ───────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5">Settings</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Access Type">
            <select className={selectCls} value={form.access_type} onChange={set("access_type")}>
              <option value="">— Select —</option>
              <option value="free">Free</option>
              <option value="one_time_purchase">One-Time Purchase</option>
              <option value="tlp_plus">TLP Plus (Subscription)</option>
            </select>
          </Field>
          <Field label="Delivery Type">
            <select className={selectCls} value={form.delivery_type} onChange={set("delivery_type")}>
              <option value="">— Select —</option>
              <option value="online">Online (Live)</option>
              <option value="recorded">Recorded</option>
            </select>
          </Field>
        </div>
      </section>

      {/* ── Outcomes, Ideal For & FAQs ────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-6">Outcomes, Audience & FAQs</h2>
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">
              What students will learn
              <span className="text-xs text-gray-400 font-normal ml-1.5">(shown as bullet points on the course page)</span>
            </p>
            <StringListEditor
              items={outcomes}
              onChange={setOutcomes}
              placeholder="e.g. Master passage-based legal reasoning"
            />
          </div>

          <div className="border-t border-gray-100 pt-6">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Who this course is for
              <span className="text-xs text-gray-400 font-normal ml-1.5">("Ideal For" section)</span>
            </p>
            <StringListEditor
              items={idealFor}
              onChange={setIdealFor}
              placeholder="e.g. CLAT UG aspirants targeting top NLUs"
            />
          </div>

          <div className="border-t border-gray-100 pt-6">
            <p className="text-sm font-medium text-gray-700 mb-3">
              Frequently Asked Questions
            </p>
            <FAQEditor faqs={faqs} onChange={setFaqs} />
          </div>
        </div>
      </section>

      {/* ── Modules & Curriculum ───────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900">Modules & Curriculum</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {modules.length} module{modules.length !== 1 ? "s" : ""} ·{" "}
              {modules.reduce((s, m) => s + m.items.length, 0)} lessons total
            </p>
          </div>
        </div>
        <ModuleEditor modules={modules} onChange={setModules} />
      </section>

      {/* ── Course Image ───────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-5">Course Image</h2>
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="relative w-full sm:w-48 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
            {imgPreview ? (
              <Image src={imgPreview} alt="Course thumbnail" fill className="object-cover" unoptimized />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                <ImageIcon size={28} />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Upload a new image</p>
              <div className="flex gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handleFileChange}
                  className="flex-1 text-sm text-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#4d65ff]/10 file:text-[#4d65ff] hover:file:bg-[#4d65ff]/20 file:cursor-pointer"
                />
                <button
                  type="button"
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#4d65ff] hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60 whitespace-nowrap"
                >
                  {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                  {isUploading ? "Uploading…" : "Upload"}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-1.5">JPG, PNG, WEBP or GIF · Max 5 MB</p>
            </div>
            <StatusBadge status={uploadStatus} />
          </div>
        </div>
      </section>

      {/* ── Save ───────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 flex-wrap">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center gap-2 px-6 py-2.5 bg-[#4d65ff] hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm transition-colors disabled:opacity-60"
        >
          {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {isSaving ? "Saving…" : "Save Changes"}
        </button>
        <StatusBadge status={saveStatus} />
      </div>
    </div>
  );
}
