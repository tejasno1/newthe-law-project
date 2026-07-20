"use client";

import { useState, useRef, useTransition } from "react";
import * as XLSX from "xlsx";
import { appendQuestionsToTest, type ExcelQuestionRow } from "@/app/admin/actions";
import {
  Upload, CheckCircle, AlertCircle, Loader2, FileSpreadsheet,
  Trash2, Save, RefreshCw, ChevronDown, Download,
} from "lucide-react";
import Link from "next/link";

// ── Types ─────────────────────────────────────────────────────────────────────

interface TestOption {
  slug: string;
  title: string;
}

type Status = { type: "success" | "error"; message: string } | null;

type ParsedRow = {
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: "A" | "B" | "C" | "D";
  subject: string;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

const VALID_ANSWERS = ["A", "B", "C", "D"] as const;

function normaliseAnswer(v: unknown): "A" | "B" | "C" | "D" {
  const s = String(v ?? "").trim().toUpperCase();
  if (VALID_ANSWERS.includes(s as "A")) return s as "A" | "B" | "C" | "D";
  // Accept numeric 1/2/3/4 as well
  if (s === "1") return "A";
  if (s === "2") return "B";
  if (s === "3") return "C";
  if (s === "4") return "D";
  return "A";
}

function str(v: unknown) {
  return String(v ?? "").trim();
}

function parseSheet(workbook: XLSX.WorkBook): ParsedRow[] {
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  // header: true makes first row the key names (case-insensitive matching handled below)
  const raw = XLSX.utils.sheet_to_json(sheet, { defval: "" }) as Record<string, unknown>[];

  // Normalise column headers — accept various spellings
  const normalise = (row: Record<string, unknown>): ParsedRow | null => {
    const keys = Object.keys(row);
    const find = (...names: string[]) => {
      const key = keys.find((k) => names.includes(k.toLowerCase().replace(/[^a-z0-9]/g, "")));
      return key ? str(row[key]) : "";
    };

    const question = find("question", "questiontext", "q", "questionno", "questions");
    const option_a  = find("optiona", "a", "opt_a", "option1", "optiona");
    const option_b  = find("optionb", "b", "opt_b", "option2", "optionb");
    const option_c  = find("optionc", "c", "opt_c", "option3", "optionc");
    const option_d  = find("optiond", "d", "opt_d", "option4", "optiond");
    const ans_raw   = find("correctanswer", "answer", "correct", "ans", "correctoption", "key");
    const subject   = find("subject", "section", "topic", "sub");

    if (!question) return null; // skip empty rows

    return {
      question,
      option_a,
      option_b,
      option_c,
      option_d,
      correct_answer: normaliseAnswer(ans_raw),
      subject,
    };
  };

  return raw.map(normalise).filter((r): r is ParsedRow => r !== null);
}

// ── Download template ─────────────────────────────────────────────────────────

function downloadTemplate() {
  const ws = XLSX.utils.aoa_to_sheet([
    ["Question", "Option A", "Option B", "Option C", "Option D", "Correct Answer", "Subject"],
    [
      "Which Article of the Constitution deals with Right to Equality?",
      "Article 12", "Article 14", "Article 19", "Article 21",
      "B", "Constitutional Law",
    ],
    [
      "The Basic Structure doctrine was propounded in which case?",
      "Golaknath v State of Punjab", "Kesavananda Bharati v State of Kerala",
      "Minerva Mills v Union of India", "Maneka Gandhi v Union of India",
      "B", "Constitutional Law",
    ],
  ]);

  // Column widths
  ws["!cols"] = [{ wch: 60 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 30 }, { wch: 14 }, { wch: 20 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Questions");
  XLSX.writeFile(wb, "TLP_Questions_Template.xlsx");
}

// ── Shared UI ─────────────────────────────────────────────────────────────────

const inputCls =
  "w-full px-3 py-1.5 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4d65ff]/30 focus:border-[#4d65ff]";

const selectCls =
  "w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#4d65ff]/30 focus:border-[#4d65ff] transition-colors bg-white";

// ── Main component ────────────────────────────────────────────────────────────

export default function UploadQuestionsClient({ tests, preselectedSlug }: { tests: TestOption[]; preselectedSlug?: string }) {
  const [selectedSlug, setSelectedSlug] = useState(preselectedSlug ?? tests[0]?.slug ?? "");
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>(null);
  const [isPending, startTransition] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);

  // ── File handling ──────────────────────────────────────────────────────────

  const handleFile = (file: File) => {
    setParseError(null);
    setRows([]);
    setFileName(file.name);
    setParsing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array" });
        const parsed = parseSheet(wb);
        if (parsed.length === 0) {
          setParseError(
            "No rows found. Make sure your Excel file has a header row with columns:\nQuestion | Option A | Option B | Option C | Option D | Correct Answer | Subject"
          );
        } else {
          setRows(parsed);
        }
      } catch (err) {
        setParseError(err instanceof Error ? err.message : "Failed to parse file.");
      } finally {
        setParsing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  // ── Row editing ────────────────────────────────────────────────────────────

  const updateRow = (i: number, patch: Partial<ParsedRow>) =>
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));

  const deleteRow = (i: number) => setRows((prev) => prev.filter((_, idx) => idx !== i));

  // ── Save ───────────────────────────────────────────────────────────────────

  const handleSave = () => {
    if (!selectedSlug) { setStatus({ type: "error", message: "Select a test first." }); return; }
    if (rows.length === 0) { setStatus({ type: "error", message: "No questions to save." }); return; }

    const payload: ExcelQuestionRow[] = rows.map((r) => ({
      question: r.question,
      option_a: r.option_a,
      option_b: r.option_b,
      option_c: r.option_c,
      option_d: r.option_d,
      correct_answer: r.correct_answer,
      subject: r.subject || undefined,
    }));

    startTransition(async () => {
      const result = await appendQuestionsToTest(selectedSlug, payload);
      if (result?.error) {
        setStatus({ type: "error", message: result.error });
      } else {
        setStatus({
          type: "success",
          message: `${result.added} question${result.added !== 1 ? "s" : ""} added successfully to "${tests.find((t) => t.slug === selectedSlug)?.title ?? selectedSlug}".`,
        });
        setRows([]);
        setFileName(null);
        if (fileRef.current) fileRef.current.value = "";
      }
    });
  };

  const reset = () => {
    setRows([]);
    setFileName(null);
    setParseError(null);
    setStatus(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {status && (
        <div className={`flex items-start gap-2.5 px-4 py-3 rounded-xl text-sm border ${
          status.type === "success" ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"
        }`}>
          {status.type === "success" ? <CheckCircle size={16} className="mt-0.5 flex-shrink-0" /> : <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />}
          <span className="whitespace-pre-wrap">{status.message}</span>
        </div>
      )}

      {/* Step 1 — Select test */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-[#4d65ff] text-white text-[10px] font-bold flex items-center justify-center">1</span>
          <h2 className="font-semibold text-gray-800 text-sm">Select Mock Test</h2>
        </div>
        <div className="p-5">
          {tests.length === 0 ? (
            <p className="text-sm text-gray-500">
              No mock tests found.{" "}
              <Link href="/admin/mock-tests/new" className="text-[#4d65ff] hover:underline">Create one first.</Link>
            </p>
          ) : (
            <div className="relative">
              <select value={selectedSlug} onChange={(e) => setSelectedSlug(e.target.value)} className={selectCls}>
                {tests.map((t) => (
                  <option key={t.slug} value={t.slug}>{t.title}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
          )}
          <p className="text-xs text-gray-400 mt-2">
            Questions will be <strong>appended</strong> to the selected test. Existing questions are not affected.
          </p>
        </div>
      </div>

      {/* Step 2 — Download template + upload */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#4d65ff] text-white text-[10px] font-bold flex items-center justify-center">2</span>
            <h2 className="font-semibold text-gray-800 text-sm">Upload Excel File (.xlsx)</h2>
          </div>
          <button
            type="button"
            onClick={downloadTemplate}
            className="inline-flex items-center gap-1.5 text-xs text-[#4d65ff] hover:text-[#3a52e8] font-medium border border-[#4d65ff]/30 hover:border-[#4d65ff] px-3 py-1.5 rounded-lg transition-colors"
          >
            <Download size={12} /> Download Template
          </button>
        </div>
        <div className="p-5">
          <div
            className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-[#4d65ff]/40 transition-colors cursor-pointer"
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
          >
            {parsing ? (
              <div className="flex flex-col items-center gap-2 text-[#4d65ff]">
                <Loader2 size={28} className="animate-spin" />
                <p className="text-sm font-medium">Parsing Excel file…</p>
              </div>
            ) : fileName ? (
              <div className="flex flex-col items-center gap-2">
                <FileSpreadsheet size={28} className="text-emerald-500" />
                <p className="text-sm font-medium text-gray-700">{fileName}</p>
                <p className="text-xs text-gray-400">Click to replace</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <Upload size={28} />
                <p className="text-sm font-medium text-gray-600">Drop your .xlsx file here or click to browse</p>
                <p className="text-xs">First row must be the header row</p>
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={onFileChange} />

          {parseError && (
            <div className="mt-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm whitespace-pre-wrap">
              <AlertCircle size={14} className="inline mr-1.5 mb-0.5" />
              {parseError}
            </div>
          )}

          {/* Column guide */}
          <div className="mt-4 bg-gray-50 rounded-xl p-4 overflow-x-auto">
            <p className="text-xs font-semibold text-gray-600 mb-2">Required column headers (exact or close spelling):</p>
            <table className="text-xs text-gray-500 w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left pb-1.5 pr-4 font-semibold text-gray-600">Column</th>
                  <th className="text-left pb-1.5 pr-4 font-semibold text-gray-600">Accepted header names</th>
                  <th className="text-left pb-1.5 font-semibold text-gray-600">Example</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  ["A", "Question, Question Text, Q", "Which Article deals with…"],
                  ["B", "Option A, A, Opt A, Option 1", "Article 14"],
                  ["C", "Option B, B, Opt B, Option 2", "Article 19"],
                  ["D", "Option C, C, Opt C, Option 3", "Article 21"],
                  ["E", "Option D, D, Opt D, Option 4", "Article 32"],
                  ["F", "Correct Answer, Answer, Ans, Key", "A / B / C / D"],
                  ["G", "Subject, Section, Topic (optional)", "Constitutional Law"],
                ].map(([col, names, ex]) => (
                  <tr key={col}>
                    <td className="py-1 pr-4 font-mono font-semibold text-gray-700">{col}</td>
                    <td className="py-1 pr-4">{names}</td>
                    <td className="py-1 text-gray-400 italic">{ex}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Step 3 — Preview & Edit */}
      {rows.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-[#4d65ff] text-white text-[10px] font-bold flex items-center justify-center">3</span>
              <h2 className="font-semibold text-gray-800 text-sm">
                Preview & Edit
                <span className="ml-2 text-xs font-normal text-gray-400">({rows.length} questions parsed)</span>
              </h2>
            </div>
            <button type="button" onClick={reset}
              className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors">
              <RefreshCw size={12} /> Reset
            </button>
          </div>

          {/* Bulk subject */}
          <div className="px-5 pt-4 pb-2 border-b border-gray-50 flex items-center gap-3">
            <label className="text-xs font-medium text-gray-600 whitespace-nowrap flex-shrink-0">Set subject for all:</label>
            <input
              type="text"
              placeholder="e.g. Constitutional Law"
              className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#4d65ff]/30 focus:border-[#4d65ff]"
              onChange={(e) => {
                const val = e.target.value;
                if (val) setRows((prev) => prev.map((r) => ({ ...r, subject: val })));
              }}
            />
          </div>

          <div className="divide-y divide-gray-50">
            {rows.map((row, i) => (
              <div key={i} className="px-5 py-4">
                <div className="flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <div className="flex-1 space-y-2">
                    {/* Question */}
                    <textarea
                      rows={2}
                      value={row.question}
                      onChange={(e) => updateRow(i, { question: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#4d65ff]/30 focus:border-[#4d65ff] resize-none"
                    />
                    {/* Options grid */}
                    <div className="grid grid-cols-2 gap-1.5">
                      {(["A", "B", "C", "D"] as const).map((letter) => {
                        const key = `option_${letter.toLowerCase()}` as keyof ParsedRow;
                        return (
                          <div key={letter} className="flex items-center gap-1.5">
                            <input
                              type="radio"
                              name={`ans-${i}`}
                              checked={row.correct_answer === letter}
                              onChange={() => updateRow(i, { correct_answer: letter })}
                              className="accent-[#4d65ff] flex-shrink-0"
                            />
                            <span className="text-xs font-bold text-gray-400 w-4 flex-shrink-0">{letter}</span>
                            <input
                              type="text"
                              value={row[key] as string}
                              onChange={(e) => updateRow(i, { [key]: e.target.value } as Partial<ParsedRow>)}
                              placeholder={`Option ${letter}`}
                              className={inputCls}
                            />
                          </div>
                        );
                      })}
                    </div>
                    <p className="text-[10px] text-gray-400">
                      Radio = correct answer · currently: <strong>{row.correct_answer}</strong>
                    </p>
                    {/* Subject */}
                    <input
                      type="text"
                      value={row.subject}
                      onChange={(e) => updateRow(i, { subject: e.target.value })}
                      placeholder="Subject / Section (optional)"
                      className={`${inputCls} text-xs`}
                    />
                  </div>
                  <button type="button" onClick={() => deleteRow(i)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Save footer */}
          <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-4 flex-wrap">
            <p className="text-xs text-gray-500">
              <strong>{rows.length}</strong> question{rows.length !== 1 ? "s" : ""} will be appended to{" "}
              <strong>{tests.find((t) => t.slug === selectedSlug)?.title ?? selectedSlug}</strong>
            </p>
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending || rows.length === 0}
              className="inline-flex items-center gap-2 bg-[#4d65ff] hover:bg-[#3a52e8] disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors flex-shrink-0"
            >
              {isPending ? <><Loader2 size={15} className="animate-spin" /> Saving…</> : <><Save size={15} /> Save {rows.length} Questions</>}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
