"use client";

import { useState, useTransition } from "react";
import { updateProgramme, uploadProgrammeCoverImage, deleteProgramme } from "@/app/admin/actions";
import type { ProgrammeRow } from "@/lib/programmes";
import { Check, Loader2, Plus, Trash2, Upload, ExternalLink } from "lucide-react";
import Link from "next/link";

// ── Simple field wrapper ────────────────────────────────────────────────────
function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">{label}</label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  );
}

const inputCls = "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4d65ff]/30 focus:border-[#4d65ff] transition-colors";
const textareaCls = `${inputCls} resize-none`;

// ── String list editor (one per line) ──────────────────────────────────────
function StringListEditor({ value, onChange, placeholder, rows = 5 }: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <textarea
      rows={rows}
      value={value.join("\n")}
      onChange={(e) => onChange(e.target.value.split("\n"))}
      placeholder={placeholder}
      className={textareaCls}
    />
  );
}

// ── Key-value pair editor ──────────────────────────────────────────────────
// Uses a neutral {key, desc} shape internally; callers map on init and save.
type PairItem = { key: string; desc: string };

function PairEditor({ value, onChange, keyLabel = "Label", valLabel = "Description" }: {
  value: PairItem[];
  onChange: (v: PairItem[]) => void;
  keyLabel?: string;
  valLabel?: string;
}) {
  const add = () => onChange([...value, { key: "", desc: "" }]);
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const updateKey = (i: number, v: string) => onChange(value.map((item, idx) => idx === i ? { ...item, key: v } : item));
  const updateDesc = (i: number, v: string) => onChange(value.map((item, idx) => idx === i ? { ...item, desc: v } : item));

  return (
    <div className="space-y-2">
      {value.map((item, i) => (
        <div key={i} className="flex gap-2 items-start">
          <div className="flex-1 grid grid-cols-2 gap-2">
            <input
              value={item.key}
              onChange={(e) => updateKey(i, e.target.value)}
              placeholder={keyLabel}
              className={inputCls}
            />
            <input
              value={item.desc}
              onChange={(e) => updateDesc(i, e.target.value)}
              placeholder={valLabel}
              className={inputCls}
            />
          </div>
          <button type="button" onClick={() => remove(i)} className="mt-2.5 text-gray-400 hover:text-red-500 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-1 text-xs text-[#4d65ff] hover:underline">
        <Plus size={12} /> Add item
      </button>
    </div>
  );
}

// ── Section editor ({title, items[]}) ──────────────────────────────────────
function SectionEditor({ value, onChange }: {
  value: { title: string; items: string[] }[];
  onChange: (v: { title: string; items: string[] }[]) => void;
}) {
  const add = () => onChange([...value, { title: "", items: [] }]);
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const updateTitle = (i: number, t: string) => onChange(value.map((s, idx) => idx === i ? { ...s, title: t } : s));
  const updateItems = (i: number, raw: string) => onChange(value.map((s, idx) => idx === i ? { ...s, items: raw.split("\n").filter(Boolean) } : s));

  return (
    <div className="space-y-3">
      {value.map((section, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-3 space-y-2">
          <div className="flex gap-2 items-center">
            <input
              value={section.title}
              onChange={(e) => updateTitle(i, e.target.value)}
              placeholder="Section title"
              className={`${inputCls} flex-1`}
            />
            <button type="button" onClick={() => remove(i)} className="text-gray-400 hover:text-red-500 transition-colors">
              <Trash2 size={14} />
            </button>
          </div>
          <textarea
            rows={4}
            value={section.items.join("\n")}
            onChange={(e) => updateItems(i, e.target.value)}
            placeholder="One item per line"
            className={textareaCls}
          />
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-1 text-xs text-[#4d65ff] hover:underline">
        <Plus size={12} /> Add section
      </button>
    </div>
  );
}

// ── Faculty editor ───────────────────────────────────────────────────────────
function FacultyEditor({ value, onChange }: {
  value: { name: string; role: string; bio: string; img: string }[];
  onChange: (v: { name: string; role: string; bio: string; img: string }[]) => void;
}) {
  const add = () => onChange([...value, { name: "", role: "", bio: "", img: "" }]);
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const update = (i: number, field: string, v: string) => onChange(value.map((item, idx) => idx === i ? { ...item, [field]: v } : item));

  return (
    <div className="space-y-3">
      {value.map((f, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-500">Faculty #{i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <input value={f.name} onChange={(e) => update(i, "name", e.target.value)} placeholder="Name" className={inputCls} />
            <input value={f.role} onChange={(e) => update(i, "role", e.target.value)} placeholder="Role / Experience" className={inputCls} />
          </div>
          <textarea rows={2} value={f.bio} onChange={(e) => update(i, "bio", e.target.value)} placeholder="Short bio" className={textareaCls} />
          <input value={f.img} onChange={(e) => update(i, "img", e.target.value)} placeholder="Image URL" className={inputCls} />
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-1 text-xs text-[#4d65ff] hover:underline">
        <Plus size={12} /> Add faculty
      </button>
    </div>
  );
}

// ── FAQ editor ───────────────────────────────────────────────────────────────
function FAQEditor({ value, onChange }: {
  value: { q: string; a: string }[];
  onChange: (v: { q: string; a: string }[]) => void;
}) {
  const add = () => onChange([...value, { q: "", a: "" }]);
  const remove = (i: number) => onChange(value.filter((_, idx) => idx !== i));
  const update = (i: number, field: "q" | "a", v: string) => onChange(value.map((item, idx) => idx === i ? { ...item, [field]: v } : item));

  return (
    <div className="space-y-3">
      {value.map((faq, i) => (
        <div key={i} className="border border-gray-200 rounded-xl p-3 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-gray-500">FAQ #{i + 1}</span>
            <button type="button" onClick={() => remove(i)} className="text-gray-400 hover:text-red-500"><Trash2 size={13} /></button>
          </div>
          <input value={faq.q} onChange={(e) => update(i, "q", e.target.value)} placeholder="Question" className={inputCls} />
          <textarea rows={3} value={faq.a} onChange={(e) => update(i, "a", e.target.value)} placeholder="Answer" className={textareaCls} />
        </div>
      ))}
      <button type="button" onClick={add} className="flex items-center gap-1 text-xs text-[#4d65ff] hover:underline">
        <Plus size={12} /> Add FAQ
      </button>
    </div>
  );
}

// ── Section wrapper ───────────────────────────────────────────────────────────
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-5">
      <h2 className="text-base font-bold text-gray-900 border-b border-gray-100 pb-3">{title}</h2>
      {children}
    </div>
  );
}

// ── Main form ─────────────────────────────────────────────────────────────────
export default function ProgrammeEditForm({ programme }: { programme: ProgrammeRow }) {
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Basic fields
  const [title, setTitle] = useState(programme.title ?? "");
  const [shortTitle, setShortTitle] = useState(programme.short_title ?? "");
  const [tagline, setTagline] = useState(programme.tagline ?? "");
  const [badge, setBadge] = useState(programme.badge ?? "");
  const [isNew, setIsNew] = useState(programme.is_new ?? false);
  const [category, setCategory] = useState(programme.category ?? "");
  const [duration, setDuration] = useState(programme.duration ?? "");
  const [hoursPerWeek, setHoursPerWeek] = useState(programme.hours_per_week ?? "");
  const [price, setPrice] = useState(String(programme.price ?? 0));
  const [enrollment, setEnrollment] = useState(programme.enrollment ?? "closed");
  const [coverImg, setCoverImg] = useState(programme.cover_img ?? "");
  const [description, setDescription] = useState(programme.description ?? "");

  // Arrays
  const [highlights, setHighlights] = useState<string[]>(programme.highlights ?? []);
  const [learnings, setLearnings] = useState<string[]>(programme.learnings ?? []);
  const [features, setFeatures] = useState<string[]>(programme.features ?? []);
  const [whoFor, setWhoFor] = useState<PairItem[]>(
    ((programme.who_for as { label: string; desc: string }[]) ?? []).map((x) => ({ key: x.label ?? "", desc: x.desc ?? "" }))
  );
  const [methodology, setMethodology] = useState<PairItem[]>(
    ((programme.methodology as { title: string; desc: string }[]) ?? []).map((x) => ({ key: x.title ?? "", desc: x.desc ?? "" }))
  );
  const [objectivesGroups, setObjectivesGroups] = useState<{ title: string; items: string[] }[]>(
    (programme.objectives_groups as { title: string; items: string[] }[]) ?? []
  );
  const [syllabus, setSyllabus] = useState<{ title: string; items: string[] }[]>(
    (programme.syllabus as { title: string; items: string[] }[]) ?? []
  );
  const [faculty, setFaculty] = useState<{ name: string; role: string; bio: string; img: string }[]>(
    (programme.faculty as { name: string; role: string; bio: string; img: string }[]) ?? []
  );
  const [faqs, setFaqs] = useState<{ q: string; a: string }[]>(
    (programme.faqs as { q: string; a: string }[]) ?? []
  );
  const [isComingSoon, setIsComingSoon] = useState(programme.is_coming_soon ?? false);
  const [enrollmentEmail, setEnrollmentEmail] = useState(programme.enrollment_email ?? "");

  function handleSave() {
    setSaved(false);
    setSaveError(null);
    startTransition(async () => {
      const result = await updateProgramme(programme.slug, {
        title: title.trim(),
        short_title: shortTitle.trim(),
        tagline: tagline.trim(),
        badge: badge.trim(),
        is_new: isNew,
        category: category.trim(),
        duration: duration.trim(),
        hours_per_week: hoursPerWeek.trim(),
        price: parseFloat(price) || 0,
        enrollment,
        cover_img: coverImg.trim(),
        description: description.trim(),
        highlights: highlights.filter(Boolean),
        learnings: learnings.filter(Boolean),
        features: features.filter(Boolean),
        who_for: whoFor.map((m) => ({ label: m.key, desc: m.desc })),
        methodology: methodology.map((m) => ({ title: m.key, desc: m.desc })),
        objectives_groups: objectivesGroups,
        syllabus,
        faculty,
        faqs,
        is_coming_soon: isComingSoon,
        enrollment_email: enrollmentEmail.trim() || null,
      });
      if (result.error) setSaveError(result.error);
      else { setSaved(true); setTimeout(() => setSaved(false), 2500); }
    });
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImg(true);
    const fd = new FormData();
    fd.append("file", file);
    const result = await uploadProgrammeCoverImage(programme.slug, fd);
    if (result.url) setCoverImg(result.url);
    setUploadingImg(false);
  }

  async function handleDelete() {
    if (!confirm("Delete this programme? This cannot be undone.")) return;
    setDeleting(true);
    const result = await deleteProgramme(programme.slug);
    if (result.error) { alert(result.error); setDeleting(false); }
    else window.location.href = "/admin/quick-skills";
  }

  return (
    <div className="space-y-6">

      {/* Save bar */}
      <div className="bg-white border border-gray-200 rounded-2xl px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href={`/skill-training/${programme.slug}`}
            target="_blank"
            className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-[#4d65ff] transition-colors"
          >
            <ExternalLink size={12} /> Preview
          </Link>
        </div>
        <div className="flex items-center gap-3">
          {saveError && <p className="text-xs text-red-600">{saveError}</p>}
          {saved && (
            <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
              <Check size={13} /> Saved
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-1.5 bg-[#4d65ff] hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-60"
          >
            {isPending ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : "Save Changes"}
          </button>
        </div>
      </div>

      {/* Basic Info */}
      <Section title="Basic Information">
        <Field label="Title">
          <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="Full programme title" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Short Title">
            <input value={shortTitle} onChange={(e) => setShortTitle(e.target.value)} className={inputCls} placeholder="Card display title" />
          </Field>
          <Field label="Badge">
            <input value={badge} onChange={(e) => setBadge(e.target.value)} className={inputCls} placeholder="e.g. Certificate Programme" />
          </Field>
        </div>
        <Field label="Tagline">
          <input value={tagline} onChange={(e) => setTagline(e.target.value)} className={inputCls} placeholder="One-line hook" />
        </Field>
        <Field label="Description">
          <textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} className={textareaCls} placeholder="Programme overview..." />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Category">
            <input value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls} placeholder="e.g. Criminal Law" />
          </Field>
          <Field label="Duration">
            <input value={duration} onChange={(e) => setDuration(e.target.value)} className={inputCls} placeholder="e.g. 6 Months" />
          </Field>
          <Field label="Hours / Week">
            <input value={hoursPerWeek} onChange={(e) => setHoursPerWeek(e.target.value)} className={inputCls} placeholder="e.g. 8–10 hrs / week" />
          </Field>
          <Field label="Price (₹)">
            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className={inputCls} placeholder="60000" min={0} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Enrollment">
            <select value={enrollment} onChange={(e) => setEnrollment(e.target.value)} className={inputCls}>
              <option value="open">Open</option>
              <option value="closed">Closed</option>
            </select>
          </Field>
          <Field label="Mark as New">
            <label className="flex items-center gap-3 cursor-pointer mt-1">
              <div className="relative w-10 h-6">
                <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} className="sr-only" />
                <div className={`w-10 h-6 rounded-full transition-colors ${isNew ? "bg-[#4d65ff]" : "bg-gray-200"}`} />
                <div className={`pointer-events-none absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${isNew ? "translate-x-4" : "translate-x-0"}`} />
              </div>
              <span className="text-sm text-gray-600">Show "New" badge</span>
            </label>
          </Field>
        </div>
      </Section>

      {/* Cover Image */}
      <Section title="Cover Image">
        {coverImg && (
          <img src={coverImg} alt="Cover" className="w-full h-44 object-cover rounded-xl mb-3" />
        )}
        <Field label="Image URL">
          <input value={coverImg} onChange={(e) => setCoverImg(e.target.value)} className={inputCls} placeholder="https://..." />
        </Field>
        <div className="flex items-center gap-3 mt-2">
          <label className="inline-flex items-center gap-1.5 text-xs font-medium text-[#4d65ff] cursor-pointer hover:underline">
            {uploadingImg ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
            {uploadingImg ? "Uploading…" : "Upload image"}
            <input type="file" accept="image/*" onChange={handleImageUpload} className="sr-only" disabled={uploadingImg} />
          </label>
        </div>
      </Section>

      {/* Content arrays */}
      <Section title="Highlights">
        <StringListEditor value={highlights} onChange={setHighlights} placeholder="One highlight per line" rows={6} />
      </Section>

      <Section title="Who Is This For">
        <PairEditor value={whoFor} onChange={setWhoFor} keyLabel="Label" valLabel="Description" />
      </Section>

      <Section title="What You Will Learn">
        <StringListEditor value={learnings} onChange={setLearnings} placeholder="One learning per line" rows={8} />
      </Section>

      <Section title="Methodology">
        <PairEditor value={methodology} onChange={setMethodology} keyLabel="Title" valLabel="Description" />
      </Section>

      <Section title="Objectives / Curriculum Groups">
        <SectionEditor value={objectivesGroups} onChange={setObjectivesGroups} />
      </Section>

      <Section title="Syllabus (Modules)">
        <SectionEditor value={syllabus} onChange={setSyllabus} />
      </Section>

      <Section title="Faculty">
        <FacultyEditor value={faculty} onChange={setFaculty} />
      </Section>

      <Section title="Features / What's Included">
        <StringListEditor value={features} onChange={setFeatures} placeholder="One feature per line" rows={8} />
      </Section>

      <Section title="FAQs">
        <FAQEditor value={faqs} onChange={setFaqs} />
      </Section>

      {/* Status + Email */}
      <Section title="Settings">
        <Field label="Programme Status">
          <label className="flex items-center gap-3 cursor-pointer mt-1">
            <div className="relative w-10 h-6" onClick={() => setIsComingSoon((v) => !v)}>
              <div className={`w-10 h-6 rounded-full transition-colors duration-200 ${isComingSoon ? "bg-amber-500" : "bg-green-500"}`} />
              <div className={`pointer-events-none absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${isComingSoon ? "translate-x-4" : "translate-x-0"}`} />
            </div>
            <div>
              <span className={`text-sm font-semibold ${isComingSoon ? "text-amber-600" : "text-green-600"}`}>
                {isComingSoon ? "Coming Soon" : "Live"}
              </span>
              <p className="text-xs text-gray-400 mt-0.5">
                {isComingSoon ? "Enroll button disabled on programme page" : "Enroll button is active"}
              </p>
            </div>
          </label>
        </Field>
        <Field label="Enrollment Confirmation Email" hint="Sent automatically after a successful payment. Leave blank to send no email. Line breaks are preserved.">
          <textarea
            rows={10}
            value={enrollmentEmail}
            onChange={(e) => setEnrollmentEmail(e.target.value)}
            placeholder={`Example:\n\nCongratulations! 🎉\n\nYour enrollment in ${programme.title} is confirmed.\n\nWe'll be in touch with next steps.\n\n— Team TLP`}
            className={`${inputCls} resize-y font-mono text-xs`}
          />
          <p className="text-xs text-gray-400 mt-1">
            {enrollmentEmail.length > 0 ? `${enrollmentEmail.length} characters` : "No email set."}
          </p>
        </Field>
      </Section>

      {/* Danger zone */}
      <div className="bg-white border border-red-100 rounded-2xl p-6">
        <h2 className="text-base font-bold text-gray-900 mb-1">Danger Zone</h2>
        <p className="text-sm text-gray-500 mb-4">Permanently delete this programme and all its data.</p>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors disabled:opacity-60"
        >
          <Trash2 size={13} /> {deleting ? "Deleting…" : "Delete Programme"}
        </button>
      </div>

    </div>
  );
}
