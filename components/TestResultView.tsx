"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GraduationCap, Check, X, ArrowLeft } from "lucide-react";
import { trackMcqEvent } from "@/lib/mcqTracking";
import type { MockTestSafe } from "@/lib/mockTests";
import SectionalSummary, { computeSectionalStats } from "@/components/SectionalSummary";

interface ReviewQuestion {
  id: number;
  text: string;
  options: string[];
  correctIndex?: number;
  subject?: string;
}

interface Props {
  test: MockTestSafe;
  results: {
    score: number; maxScore: number; correct: number; incorrect: number;
    unattempted: number; accuracy: number; timeTaken: number; percentile: number;
    totalParticipants: number; rank: number; averageScore: number;
    bestScore: number; topPerformerName: string; topPerformerScore: number;
  };
  answers: Record<number, number>;
  questionTimes: Record<number, number>;
  reviewQuestions?: ReviewQuestion[]; // pre-loaded server-side OR fetched client-side
  attemptId: string;
  candidateName: string;
  marksPerCorrect: number;
  negativeMark: number;
  onReattempt?: () => void; // present when reached via Test Analysis button
}

const fmtTime = (s: number) => {
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0 ? `${h}h ${m}m ${sec}s` : `${m}m ${sec}s`;
};

export default function TestResultView({
  test, results, answers, questionTimes, reviewQuestions: reviewQuestionsInitial,
  attemptId, candidateName, marksPerCorrect, negativeMark, onReattempt,
}: Props) {
  const [showSolutions, setShowSolutions] = useState(false);
  const [reviewQuestions, setReviewQuestions] = useState<ReviewQuestion[]>(reviewQuestionsInitial ?? []);

  // If reviewQuestions weren't pre-loaded (client-side path), fetch on mount
  useEffect(() => {
    if (reviewQuestions.length > 0 || !attemptId) return;
    fetch(`/api/attempts/${attemptId}/review`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.questions) setReviewQuestions(data.questions); })
      .catch(() => {});
  }, [attemptId]);

  useEffect(() => {
    trackMcqEvent(test.slug, "result_view");
  }, [test.slug]);

  const isFirstParticipant = results.totalParticipants <= 1;
  const donutPct = Math.max(0, Math.min(100, (results.score / results.maxScore) * 100));

  const sectionalStats = computeSectionalStats(
    reviewQuestions, answers, questionTimes, marksPerCorrect, negativeMark
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-900 dark:text-white">The Law Project</span>
            </div>
            <h1 className="text-lg font-bold text-gray-900 dark:text-white">{test.title}</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {test.totalQuestions} Questions · {test.totalMarks} Marks · {test.durationMinutes} mins
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            {onReattempt ? (
              <button
                onClick={() => { trackMcqEvent(test.slug, "test_reattempt"); onReattempt(); }}
                className="bg-primary-600 text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                Reattempt Test
              </button>
            ) : (
              <Link href="/mock-test"
                className="flex items-center gap-1.5 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back to Tests
              </Link>
            )}
            <button
              onClick={() => setShowSolutions((v) => !v)}
              className={`rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
                showSolutions
                  ? "bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 border border-primary-200 dark:border-primary-800"
                  : "border border-gray-200 dark:border-gray-600 text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20"
              }`}
            >
              {showSolutions ? "Hide Solutions" : "View Solutions"}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {showSolutions ? (
          /* ── Solutions ─────────────────────── */
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">Solutions</h2>
            <div className="space-y-5">
              {reviewQuestions.map((q, i) => {
                const userAnswer = answers[q.id] ?? answers[String(q.id) as unknown as number];
                return (
                  <div key={q.id} className="rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2">Question {i + 1}</h3>
                    {q.subject && (
                      <span className="inline-block text-[10px] font-semibold text-primary-600 bg-primary-50 border border-primary-100 rounded-full px-2 py-0.5 mb-3">
                        {q.subject}
                      </span>
                    )}
                    <p className="text-gray-800 dark:text-gray-300 mb-4 text-sm">{q.text}</p>
                    <div className="space-y-2">
                      {q.options.map((option, j) => {
                        const isCorrect = j === q.correctIndex;
                        const isWrongPick = userAnswer === j && !isCorrect;
                        return (
                          <div key={j}
                            className={`flex items-center justify-between gap-3 px-4 py-2.5 rounded-xl border text-sm ${
                              isCorrect ? "border-green-300 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-400 font-medium"
                                : isWrongPick ? "border-rose-300 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 font-medium"
                                : "border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            <span>{String.fromCharCode(65 + j)}) {option}</span>
                            {isCorrect && (
                              <span className="flex items-center gap-1 text-xs font-semibold text-green-700 flex-shrink-0">
                                <Check className="w-3.5 h-3.5" /> Correct
                              </span>
                            )}
                            {isWrongPick && (
                              <span className="flex items-center gap-1 text-xs font-semibold text-rose-600 flex-shrink-0">
                                <X className="w-3.5 h-3.5" /> Your Answer
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {userAnswer === undefined && <p className="text-xs text-gray-400 mt-3">Not attempted.</p>}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          /* ── Performance Summary ───────────── */
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Overall performance summary</h2>

            <div className="grid lg:grid-cols-3 gap-5 mb-6">
              {/* Score card */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Score Achieved</p>
                <div className="flex items-center gap-5">
                  <div
                    className="relative w-28 h-28 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: `conic-gradient(#4d65ff ${donutPct}%, #e5e7eb ${donutPct}%)` }}
                  >
                    <div className="absolute inset-2 bg-white dark:bg-gray-800 rounded-full flex flex-col items-center justify-center">
                      <span className="text-xl font-bold text-gray-900 dark:text-white">
                        {results.score}<span className="text-sm font-normal text-gray-400">/{results.maxScore}</span>
                      </span>
                      <span className="text-xs text-gray-400">Total</span>
                    </div>
                  </div>
                  <div className="space-y-2 flex-1">
                    {[
                      { label: "Correct", val: results.correct, color: "bg-emerald-400" },
                      { label: "Incorrect", val: results.incorrect, color: "bg-rose-400" },
                      { label: "Unattempted", val: results.unattempted, color: "bg-gray-300" },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center gap-2 text-sm">
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${row.color}`} />
                        <span className="text-gray-600 dark:text-gray-400 flex-1">{row.label}</span>
                        <span className="font-semibold text-gray-900 dark:text-white">{row.val}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700 space-y-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {isFirstParticipant ? "Current Average Score" : "Average Score"}:{" "}
                        <strong className="text-gray-700 dark:text-gray-300">{results.averageScore}</strong>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {isFirstParticipant ? "Current Best Score" : "Best Score"}:{" "}
                        <strong className="text-gray-700 dark:text-gray-300">{results.bestScore}</strong>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top performer */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6">
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
                  {isFirstParticipant ? "Current Top Performer" : "Top Performer"}
                </p>
                <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4 flex items-center gap-3 mb-3">
                  <span className="w-10 h-10 rounded-full bg-amber-200 text-amber-800 font-bold flex items-center justify-center text-sm flex-shrink-0">
                    {results.topPerformerName.charAt(0).toUpperCase()}
                  </span>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white text-sm">{results.topPerformerName}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Rank #1</p>
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {results.topPerformerScore}<span className="text-sm font-normal text-gray-400"> / {results.maxScore}</span>
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {isFirstParticipant ? "You're the only attempt so far — nice work." : "Can you beat this on your next attempt?"}
                </p>
              </div>

              {/* Stats */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-6 space-y-4">
                {[
                  { label: "Questions Attempted", val: results.correct + results.incorrect, total: test.totalQuestions, pct: Math.round(((results.correct + results.incorrect) / test.totalQuestions) * 100), color: "bg-primary-600" },
                  { label: "Time Taken", val: fmtTime(results.timeTaken), total: `${test.durationMinutes}m`, pct: Math.min(100, Math.round((results.timeTaken / (test.durationMinutes * 60)) * 100)), color: "bg-amber-500" },
                  { label: "Attempt Accuracy", val: `${results.accuracy}%`, total: "100%", pct: results.accuracy, color: "bg-emerald-500" },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-gray-500 dark:text-gray-400">{s.label}</span>
                      <span className="font-semibold text-gray-900 dark:text-white">{s.val} <span className="font-normal text-gray-400">/ {s.total}</span></span>
                    </div>
                    <div className="h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sectional Summary */}
            {sectionalStats.length > 0 && <SectionalSummary sections={sectionalStats} />}

          </div>
        )}
      </div>
    </div>
  );
}
