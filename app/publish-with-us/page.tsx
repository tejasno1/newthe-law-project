"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { CheckCircle, Upload, FileText, AlertCircle, ChevronRight, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const SUBJECTS = [
  "Constitutional Law & Governance",
  "Criminal Law & Procedure",
  "Corporate & Commercial Law",
  "Civil Law & Disputes",
  "International Law & Human Rights",
  "Intellectual Property Law",
  "Environmental Law",
  "Family & Personal Law",
  "Tax & Revenue Law",
  "Legal Current Affairs & Analysis",
  "Law School Preparation (CLAT / AILET)",
  "Career in Law",
  "Other",
];

const FONT_RULES = [
  { part: "Title", font: "Times New Roman", style: "Regular", size: "14", align: "Centre Align" },
  { part: "Author Name", font: "Times New Roman", style: "Regular", size: "12", align: "Centre Align" },
  { part: "Body", font: "Times New Roman", style: "Regular", size: "12", align: "Justified" },
  { part: "Foot Notes", font: "Times New Roman", style: "Regular", size: "10", align: "—" },
];

const GUIDELINES = [
  "Articles must illuminate legal problems or issues and deal with topics in the Article module.",
  "Articles should break new ground on legal issues or provide in-depth discussion of current developments.",
  "Minimum 2,000 words — Maximum 3,500 words.",
  "Your affiliation and details must be mentioned in the first footnote of the article.",
  "Citation / Source format: Harvard Bluebook 21st Edition is mandatory. Manu Citation mandatory for cases.",
  "References with Source / URLs wherever applicable in Oxford Bluebook format.",
  "Follow a uniform font case for all headings / titles as per the formatting table below.",
  "Maximum 15% plagiarism is acceptable.",
  "Turnaround time (TAT) for publishing: 35 to 45 days after acceptance.",
  "Please click 'I Agree' in the declaration before submitting the form.",
];

type FormState = {
  name: string;
  email: string;
  phone: string;
  institution: string;
  articleTitle: string;
  subject: string;
  wordCount: string;
  agreed: boolean;
};

const EMPTY: FormState = {
  name: "", email: "", phone: "", institution: "",
  articleTitle: "", subject: "", wordCount: "", agreed: false,
};

export default function PublishWithUsPage() {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  function set(field: keyof FormState, value: string | boolean) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    if (f && !f.name.match(/\.(docx?|pdf)$/i)) {
      setError("Only .doc, .docx or .pdf files are accepted.");
      return;
    }
    setError("");
    setFile(f);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!form.agreed) { setError("Please accept the terms and conditions to proceed."); return; }
    if (!file) { setError("Please upload your article file (.docx or .pdf)."); return; }

    setSubmitting(true);
    try {
      const supabase = createClient();

      // Upload file
      const ext = file.name.split(".").pop();
      const path = `${Date.now()}-${form.email.replace(/[^a-z0-9]/gi, "_")}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("article-submissions")
        .upload(path, file, { cacheControl: "3600", upsert: false });
      if (uploadErr) throw new Error(uploadErr.message);

      // Save submission
      const { error: dbErr } = await supabase.from("article_submissions").insert({
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        institution: form.institution,
        article_title: form.articleTitle,
        subject: form.subject,
        word_count: form.wordCount || null,
        agreed: true,
        file_path: path,
        file_name: file.name,
        status: "pending",
      });
      if (dbErr) throw new Error(dbErr.message);

      setSubmitted(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navbar />
        <main className="flex items-center justify-center px-4 pt-28 pb-16">
          <div className="max-w-md w-full text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-3">Submission Received!</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm leading-relaxed">
              Thank you for submitting your article. Our editorial team will review it and get back to you within <strong>35–45 days</strong>. We'll reach out to you at <strong>{form.email}</strong>.
            </p>
            <Link href="/blogs" className="inline-flex items-center gap-2 bg-primary-600 text-white px-6 py-3 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors">
              Back to Blogs <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
    <main className="pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto">

        {/* Hero */}
        <div className="text-center mb-12">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary-600 dark:text-primary-400 mb-3">The Law Project</span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-900 dark:text-white mb-4">
            Publish with Us
          </h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
            Share your legal insights with thousands of law students, aspirants, and practitioners across India. We welcome well-researched, original articles from contributors.
          </p>
        </div>

        {/* Guidelines */}
        <section className="bg-gray-50 dark:bg-gray-800 rounded-3xl p-6 sm:p-8 mb-8 border border-gray-100 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-600" />
            Submission Guidelines
          </h2>
          <ul className="space-y-3">
            {GUIDELINES.map((g, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                <span className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <CheckCircle className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                </span>
                {g}
              </li>
            ))}
          </ul>
        </section>

        {/* Formatting table */}
        <section className="mb-10">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Formatting Requirements</h2>
          <div className="overflow-x-auto rounded-2xl border border-gray-100 dark:border-gray-700">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800 text-left">
                  <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Particulars</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Font</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Style</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Size (pt)</th>
                  <th className="px-4 py-3 font-semibold text-gray-700 dark:text-gray-300">Alignment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {FONT_RULES.map((r) => (
                  <tr key={r.part} className="bg-white dark:bg-gray-900">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-white">{r.part}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{r.font}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{r.style}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{r.size}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{r.align}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Divider */}
        <div className="h-px bg-gray-100 dark:bg-gray-700 mb-10" />

        {/* Form */}
        <section>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Submit Your Article</h2>

          {error && (
            <div className="flex items-start gap-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6 text-sm text-red-700 dark:text-red-400">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Name + Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Full Name <span className="text-red-500">*</span></label>
                <input required value={form.name} onChange={(e) => set("name", e.target.value)}
                  placeholder="e.g. Rahul Sharma"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address <span className="text-red-500">*</span></label>
                <input required type="email" value={form.email} onChange={(e) => set("email", e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition" />
              </div>
            </div>

            {/* Phone + Institution */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Phone Number</label>
                <input value={form.phone} onChange={(e) => set("phone", e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">College / University Name <span className="text-red-500">*</span></label>
                <input required value={form.institution} onChange={(e) => set("institution", e.target.value)}
                  placeholder="e.g. Delhi University, Amity Law School, Independent"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition" />
              </div>
            </div>

            {/* Article title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Article Title <span className="text-red-500">*</span></label>
              <input required value={form.articleTitle} onChange={(e) => set("articleTitle", e.target.value)}
                placeholder="Enter the title of your article"
                className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition" />
            </div>

            {/* Subject + Word count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Subject / Topic <span className="text-red-500">*</span></label>
                <select required value={form.subject} onChange={(e) => set("subject", e.target.value)}
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition">
                  <option value="" disabled>Select a subject</option>
                  {SUBJECTS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Approximate Word Count</label>
                <input value={form.wordCount} onChange={(e) => set("wordCount", e.target.value)}
                  placeholder="e.g. 2500"
                  className="w-full rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition" />
                <p className="text-xs text-gray-400 mt-1">Between 2,000 and 3,500 words</p>
              </div>
            </div>

            {/* File upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Upload Article <span className="text-red-500">*</span></label>
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 dark:hover:bg-primary-900/10 transition-colors group"
              >
                {file ? (
                  <div className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <FileText className="w-5 h-5 text-primary-600" />
                    <span className="font-medium">{file.name}</span>
                    <button type="button" onClick={(e) => { e.stopPropagation(); setFile(null); if (fileRef.current) fileRef.current.value = ""; }}
                      className="text-gray-400 hover:text-red-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-7 h-7 text-gray-300 dark:text-gray-500 group-hover:text-primary-500 transition-colors" />
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Click to upload your article</p>
                    <p className="text-xs text-gray-400">.doc, .docx or .pdf — Harvard Bluebook formatted</p>
                  </>
                )}
              </div>
              <input ref={fileRef} type="file" accept=".doc,.docx,.pdf" onChange={handleFile} className="hidden" />
            </div>

            {/* Declaration */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-3">Declaration</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4">
                I declare that the article submitted is my original work and has not been published elsewhere. I confirm that the article adheres to the submission guidelines of The Law Project, including word limits, citation format (Harvard Bluebook 21st Edition), and formatting requirements. I understand that plagiarism beyond 15% will lead to rejection, and that The Law Project reserves the right to accept, reject, or request revisions before publication. The TAT for publishing is 35–45 days after acceptance.
              </p>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" checked={form.agreed} onChange={(e) => set("agreed", e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded border-gray-300 text-primary-600 focus:ring-primary-500 flex-shrink-0" />
                <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                  I Agree — I accept the terms and conditions stated above.
                </span>
              </label>
            </div>

            {/* Submit */}
            <button type="submit" disabled={submitting}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
              {submitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
                  </svg>
                  Submitting…
                </>
              ) : (
                <>Submit Article <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        </section>
      </div>
    </main>
      <Footer />
    </div>
  );
}
