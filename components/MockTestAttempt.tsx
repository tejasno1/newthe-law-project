"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MockTestSafe } from "@/lib/mockTests";
import type { TestStats } from "@/lib/testResults";

async function fetchTestStats(testSlug: string): Promise<TestStats | null> {
  try {
    const res = await fetch(`/api/tests/${testSlug}/stats`);
    if (!res.ok) return null;
    const { stats } = await res.json();
    return stats;
  } catch {
    return null;
  }
}
import { saveQuestionReport } from "@/lib/questionReports";
import ExamInstructionsContent from "@/components/ExamInstructionsContent";
import { createClient } from "@/lib/supabase/client";
import SectionalSummary, { computeSectionalStats } from "@/components/SectionalSummary";
import TestResultView from "@/components/TestResultView";
import { trackMcqEvent } from "@/lib/mcqTracking";
import {
  GraduationCap,
  Flag,
  Star,
  Pause,
  Play,
  Maximize2,
  Trophy,
  Crown,
  Clock,
  Percent,
  X,
  Check,
  HelpCircle,
  ClipboardList,
  AlertTriangle,
  Smartphone,
  ChevronLeft,
  ChevronDown,
  LayoutGrid,
  List,
} from "lucide-react";

type Status = "unseen" | "unattempted" | "attempted" | "marked";

const STATUS_STYLES: Record<Status, { dot: string; bg: string; text: string; border: string }> = {
  unseen: { dot: "bg-gray-300", bg: "bg-gray-100 dark:bg-gray-700", text: "text-gray-500 dark:text-gray-400", border: "border-gray-200 dark:border-gray-600" },
  unattempted: { dot: "bg-amber-400", bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-700 dark:text-amber-400", border: "border-amber-200 dark:border-amber-800" },
  attempted: { dot: "bg-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400", border: "border-emerald-200 dark:border-emerald-800" },
  marked: { dot: "bg-rose-400", bg: "bg-rose-50 dark:bg-rose-900/20", text: "text-rose-700 dark:text-rose-400", border: "border-rose-200 dark:border-rose-800" },
};

const REPORT_TYPE_OPTIONS = [
  "Error in Question",
  "Incorrect Answer",
  "No Explanation/Instructions",
  "Quiz not loading",
  "Graphs/Images not loading",
  "Other",
];

const fmtTime = (totalSeconds: number) => {
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

const fmtMinSec = (totalSeconds: number) => {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
};

function getDisplayName(email: string, metadata: Record<string, string>): string {
  if (metadata?.full_name) return metadata.full_name;
  if (metadata?.name) return metadata.name;
  return email.split("@")[0];
}

interface ServerResult {
  score: number;
  maxScore: number;
  correct: number;
  incorrect: number;
  unattempted: number;
  accuracy: number;
  timeTaken: number;
  status: string;
}

export default function MockTestAttempt({ test, allTests = [] }: { test: MockTestSafe; allTests?: MockTestSafe[] }) {
  const [candidateName, setCandidateName] = useState("Student");
  const router = useRouter();
  const totalSeconds = test.durationMinutes * 60;
  const [timeLeft, setTimeLeft] = useState(totalSeconds);
  const [paused, setPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [marked, setMarked] = useState<Set<number>>(new Set());
  const [visited, setVisited] = useState<Set<number>>(new Set([test.questions[0].id]));
  const [gridView, setGridView] = useState(true);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [hasOpenedSubmitModal, setHasOpenedSubmitModal] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [showAllQuestions, setShowAllQuestions] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [questionStart, setQuestionStart] = useState(Date.now());
  const [questionElapsed, setQuestionElapsed] = useState(0);
  const [questionTimes, setQuestionTimes] = useState<Record<number, number>>({});
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [liveStats, setLiveStats] = useState<TestStats | null>(null);

  // Server-side attempt tracking
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [serverResult, setServerResult] = useState<ServerResult | null>(null);
  const [questionTextSize, setQuestionTextSize] = useState("text-base");
  const [showReportModal, setShowReportModal] = useState(false);
  const [selectedReportTypes, setSelectedReportTypes] = useState<Set<string>>(new Set());
  const [reportNote, setReportNote] = useState("");
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportError, setReportError] = useState("");
  const [reportedQuestions, setReportedQuestions] = useState<Set<number>>(new Set());
  const hasSavedRef = useRef(false);

  // Exam-mode security
  const [isExamMode, setIsExamMode] = useState(false);
  const [violations, setViolations] = useState(0);
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const violationsRef = useRef(0);
  const MAX_VIOLATIONS = 3;
  // Fullscreen (only relevant on mobile — desktop uses the popup window)
  const [isMobileView, setIsMobileView] = useState(false);
  // Mobile palette drawer
  const [showMobilePalette, setShowMobilePalette] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const current = test.questions[currentIndex];

  // Auth guard + server attempt start
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.replace(`/mock-test/${test.slug}/instructions`);
        return;
      }
      setCandidateName(getDisplayName(user.email ?? "", user.user_metadata ?? {}));
      trackMcqEvent(test.slug, "test_start");

      // Start or resume server-side attempt
      try {
        const res = await fetch("/api/attempts/start", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ testSlug: test.slug }),
        });
        if (res.ok) {
          const data = await res.json();
          setAttemptId(data.attemptId);
          setExpiresAt(data.expiresAt);
          // Sync timer to server's expires_at (authoritative)
          const remaining = Math.max(0, Math.floor((new Date(data.expiresAt).getTime() - Date.now()) / 1000));
          setTimeLeft(remaining);
          if (data.resumed) {
            // Restore violation count display from server
            violationsRef.current = data.violationCount ?? 0;
            setViolations(data.violationCount ?? 0);
          }
        }
      } catch (err) {
        console.error("Failed to start attempt:", err);
      }
    });
  }, [test.slug]);

  useEffect(() => {
    const saved = localStorage.getItem("mockTestTextSize");
    const sizeClass = saved === "Small" ? "text-sm" : saved === "Large" ? "text-lg" : "text-base";
    setQuestionTextSize(sizeClass);
  }, []);

  // ── Exam-mode setup ─────────────────────────────────────────────
  const TIMER_KEY = `tlp-exam-end-${test.slug}`;
  const VIOLATIONS_KEY = `tlp-exam-violations-${test.slug}`;

  // Detect exam mode: desktop sets ?mode=exam via popup; mobile is always exam mode
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const mobile = window.innerWidth < 768;
    setIsMobileView(mobile);
    setIsExamMode(params.get("mode") === "exam" || mobile);
  }, []);


  // Restore / initialise sessionStorage timer in exam mode
  useEffect(() => {
    if (!isExamMode) return;

    const stored = sessionStorage.getItem(TIMER_KEY);
    if (stored) {
      const remaining = Math.max(0, Math.floor((parseInt(stored) - Date.now()) / 1000));
      setTimeLeft(remaining);
    } else {
      const endTime = Date.now() + totalSeconds * 1000;
      sessionStorage.setItem(TIMER_KEY, endTime.toString());
    }

    const savedViolations = parseInt(sessionStorage.getItem(VIOLATIONS_KEY) ?? "0");
    violationsRef.current = savedViolations;
    setViolations(savedViolations);
  }, [isExamMode]);

  // Clean up sessionStorage on submit
  useEffect(() => {
    if (submitted && isExamMode) {
      sessionStorage.removeItem(TIMER_KEY);
      sessionStorage.removeItem(VIOLATIONS_KEY);
    }
  }, [submitted, isExamMode]);

  // Violation detection: tab switch / window blur — tracked server-side
  useEffect(() => {
    if (!isExamMode || submitted) return;

    const addViolation = async () => {
      // Optimistic UI update
      violationsRef.current += 1;
      const localCount = violationsRef.current;
      sessionStorage.setItem(VIOLATIONS_KEY, localCount.toString());
      setViolations(localCount);
      setShowViolationWarning(true);

      // Report to server (server is authoritative for auto-submit decision)
      if (attemptId) {
        try {
          const res = await fetch(`/api/attempts/${attemptId}/violation`, { method: "POST" });
          if (res.ok) {
            const data = await res.json();
            setViolations(data.violationCount);
            violationsRef.current = data.violationCount;
            if (data.autoSubmitted) {
              recordTimeForCurrentQuestion();
              setSubmitted(true);
            }
          }
        } catch {
          // Network error — use local count as fallback, still auto-submit at limit
          if (localCount >= MAX_VIOLATIONS) {
            recordTimeForCurrentQuestion();
            setSubmitted(true);
          }
        }
      } else if (localCount >= MAX_VIOLATIONS) {
        recordTimeForCurrentQuestion();
        setSubmitted(true);
      }
    };

    const onBlur = () => { addViolation(); };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") addViolation();
    };

    window.addEventListener("blur", onBlur);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [isExamMode, submitted, attemptId]);

  // Warn before closing / refreshing
  useEffect(() => {
    if (!isExamMode || submitted) return;
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isExamMode, submitted]);

  // Block right-click, F12, Ctrl+C, Ctrl+U, Ctrl+Shift+I/J
  useEffect(() => {
    if (!isExamMode) return;
    const onContextMenu = (e: MouseEvent) => e.preventDefault();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F12") { e.preventDefault(); return; }
      if (e.ctrlKey && ["u", "U"].includes(e.key)) { e.preventDefault(); return; }
      if (e.ctrlKey && e.shiftKey && ["i", "I", "j", "J", "c", "C"].includes(e.key)) { e.preventDefault(); return; }
    };
    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [isExamMode]);
  // ────────────────────────────────────────────────────────────────

  const toggleReportType = (type: string) => {
    setSelectedReportTypes((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  };

  const canSubmitReport = selectedReportTypes.size > 0;

  const handleSubmitReport = async () => {
    if (!canSubmitReport) return;
    setReportSubmitting(true);
    setReportError("");
    const res = await saveQuestionReport({
      testSlug: test.slug,
      questionId: current.id,
      candidateName,
      reportTypes: Array.from(selectedReportTypes),
      additionalNote: reportNote.trim(),
    });
    setReportSubmitting(false);

    if (!res.success) {
      setReportError("Couldn't submit your report. Please try again.");
      return;
    }

    setReportedQuestions((prev) => new Set(prev).add(current.id));
    setShowReportModal(false);
    setSelectedReportTypes(new Set());
    setReportNote("");
  };

  const currentIdRef = useRef(current.id);
  const questionStartRef = useRef(questionStart);

  useEffect(() => {
    currentIdRef.current = current.id;
    questionStartRef.current = questionStart;
  }, [current.id, questionStart]);

  const recordTimeForCurrentQuestion = () => {
    const id = currentIdRef.current;
    const elapsedSeconds = Math.floor((Date.now() - questionStartRef.current) / 1000);
    setQuestionTimes((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + elapsedSeconds }));
  };

  useEffect(() => {
    if (paused || submitted) return;
    const interval = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(interval);
          recordTimeForCurrentQuestion();
          setSubmitted(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [paused, submitted]);

  useEffect(() => {
    setQuestionStart(Date.now());
    setQuestionElapsed(0);
    setShowReportModal(false);
    setSelectedReportTypes(new Set());
    setReportNote("");
    setReportError("");
  }, [currentIndex]);

  useEffect(() => {
    if (paused || submitted) return;
    const interval = setInterval(() => {
      setQuestionElapsed(Math.floor((Date.now() - questionStart) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [questionStart, paused, submitted]);

  const getStatus = (id: number): Status => {
    if (marked.has(id)) return "marked";
    if (answers[id] !== undefined) return "attempted";
    if (visited.has(id)) return "unattempted";
    return "unseen";
  };

  const counts = useMemo(() => {
    const c = { unseen: 0, unattempted: 0, attempted: 0, marked: 0 };
    test.questions.forEach((q) => c[getStatus(q.id)]++);
    return c;
  }, [test.questions, marked, answers, visited]);

  const goTo = (index: number) => {
    if (index !== currentIndex) {
      recordTimeForCurrentQuestion();
    }
    setCurrentIndex(index);
    setVisited((prev) => new Set(prev).add(test.questions[index].id));
  };

  const selectOptionForQuestion = (questionId: number, optionIndex: number) => {
    setAnswers((prev) => {
      const next = { ...prev };
      if (next[questionId] === optionIndex) {
        delete next[questionId];
      } else {
        next[questionId] = optionIndex;
      }
      return next;
    });
  };

  const selectOption = (optionIndex: number) => selectOptionForQuestion(current.id, optionIndex);

  const clearResponse = () => {
    setAnswers((prev) => {
      const next = { ...prev };
      delete next[current.id];
      return next;
    });
  };

  const toggleMarkCurrent = () => {
    setMarked((prev) => {
      const next = new Set(prev);
      if (next.has(current.id)) next.delete(current.id);
      else next.add(current.id);
      return next;
    });
  };

  const goNext = () => {
    if (currentIndex < test.questions.length - 1) goTo(currentIndex + 1);
  };

  const goPrevious = () => {
    if (currentIndex > 0) goTo(currentIndex - 1);
  };

  const markForReviewAndNext = () => {
    setMarked((prev) => new Set(prev).add(current.id));
    goNext();
  };

  const toggleFullscreen = () => {
    if (typeof document === "undefined") return;
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen?.();
    }
  };

  // Track fullscreen state for the desktop button label
  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Derived report results (from server scoring + live stats)
  const reportResults = useMemo(() => {
    if (!serverResult) return null;
    const maxScore = serverResult.maxScore;
    const score = serverResult.score;
    const percentile = maxScore > 0 ? Math.min(99, Math.max(1, Math.round((score / maxScore) * 95))) : 1;
    const base = {
      ...serverResult,
      percentile,
      totalParticipants: liveStats?.count ?? 1,
      rank: liveStats
        ? Math.max(1, Math.round((liveStats.count) * (1 - percentile / 100)))
        : 1,
      averageScore: liveStats?.average ?? score,
      bestScore: liveStats?.best ?? score,
      topPerformerName: liveStats?.topPerformerName ?? candidateName,
      topPerformerScore: liveStats?.topPerformerScore ?? score,
    };
    return base;
  }, [serverResult, liveStats, candidateName]);

  // Submit to server — server scores, we display the result
  useEffect(() => {
    if (!submitted || hasSavedRef.current) return;
    hasSavedRef.current = true;
    setSaveStatus("saving");

    // Remove beforeunload before programmatic submit
    const noop = (e: BeforeUnloadEvent) => { e.preventDefault(); e.returnValue = ""; };
    window.removeEventListener("beforeunload", noop);

    const submitStatus =
      violations >= MAX_VIOLATIONS ? "auto_submitted_violations"
      : timeLeft <= 0 ? "auto_submitted_timer"
      : "submitted";

    const doSubmit = async () => {
      // If attemptId is null (start API was slow or failed), try once more before giving up
      let id = attemptId;
      if (!id) {
        try {
          const startRes = await fetch("/api/attempts/start", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ testSlug: test.slug }),
          });
          if (startRes.ok) {
            const startData = await startRes.json();
            id = startData.attemptId;
            setAttemptId(id);
          }
        } catch {
          // fallthrough to error state below
        }
      }

      if (!id) {
        setSaveStatus("error");
        return;
      }

      try {
        const res = await fetch(`/api/attempts/${id}/submit`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers, questionTimes, status: submitStatus, testSlug: test.slug }),
        });

        if (res.ok) {
          const data = await res.json();
          setServerResult(data.result); // show report immediately
          setSaveStatus("saved");
        } else {
          setSaveStatus("error");
        }
      } catch {
        setSaveStatus("error");
      }

      // Fetch live stats in the background — does NOT block report display.
      fetchTestStats(test.slug).then((stats) => {
        if (stats) setLiveStats(stats);
      });
    };

    doSubmit();
  }, [submitted]);

  const handleReattempt = () => {
    // Reset every piece of attempt state; do NOT touch Supabase
    setAnswers({});
    setMarked(new Set());
    setVisited(new Set([test.questions[0].id]));
    setCurrentIndex(0);
    setTimeLeft(totalSeconds);
    setPaused(false);
    setSubmitted(false);
    setSaveStatus("idle");
    setLiveStats(null);
    setQuestionTimes({});
    setQuestionStart(Date.now());
    setQuestionElapsed(0);
    setShowSubmitModal(false);
    setShowInstructionsModal(false);
    setShowAllQuestions(false);
    setShowReportModal(false);
    setSelectedReportTypes(new Set());
    setReportNote("");
    setReportedQuestions(new Set());
    setHasOpenedSubmitModal(false);
    // Allow next submit to save to Supabase again
    hasSavedRef.current = false;
    setServerResult(null);
    setAttemptId(null);
    setExpiresAt(null);

    // Reset exam-mode security state + sessionStorage
    violationsRef.current = 0;
    setViolations(0);
    setShowViolationWarning(false);
    setIsFullscreen(false);
    if (isExamMode) {
      sessionStorage.removeItem(TIMER_KEY);
      sessionStorage.removeItem(VIOLATIONS_KEY);
      // Re-seed the timer for the new attempt
      const endTime = Date.now() + totalSeconds * 1000;
      sessionStorage.setItem(TIMER_KEY, endTime.toString());
    }
  };

  if (submitted) {
    if (!reportResults) {
      // Show error state if submit failed — prevents infinite spinner
      if (saveStatus === "error") {
        return (
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
            <div className="text-center max-w-sm">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <X className="w-6 h-6 text-red-500" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Could not submit your test</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-5">
                There was a problem connecting to the server. Your answers are saved locally.
                Please check your internet connection and try again.
              </p>
              <button
                onClick={() => {
                  hasSavedRef.current = false;
                  setSaveStatus("saving");
                  setSubmitted(false);
                  setTimeout(() => setSubmitted(true), 50);
                }}
                className="bg-primary-600 text-white rounded-xl px-6 py-2.5 text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                Retry submission
              </button>
            </div>
          </div>
        );
      }

      return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="w-10 h-10 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-300 font-medium">Scoring your test…</p>
          </div>
        </div>
      );
    }
    return (
      <TestResultView
        test={test}
        results={reportResults}
        answers={answers}
        questionTimes={questionTimes}
        attemptId={attemptId ?? ""}
        candidateName={candidateName}
        marksPerCorrect={test.marksPerCorrect}
        negativeMark={test.negativeMark}
        onReattempt={handleReattempt}
      />
    );
  }

  return (
    <div className="min-h-screen lg:h-screen lg:overflow-hidden bg-gray-50 dark:bg-gray-900 flex flex-col">
      {/* Violation warning banner */}
      {showViolationWarning && !submitted && (
        <div className="bg-red-600 text-white px-4 py-2 flex items-center justify-between gap-4 text-sm flex-shrink-0">
          <span className="font-semibold">
            ⚠ Focus violation detected! ({violations}/{MAX_VIOLATIONS}) —
            {violations >= MAX_VIOLATIONS
              ? " Test auto-submitted due to too many tab switches."
              : ` ${MAX_VIOLATIONS - violations} more will auto-submit your test.`}
          </span>
          <button onClick={() => setShowViolationWarning(false)} className="text-white/80 hover:text-white text-xs underline flex-shrink-0">
            Dismiss
          </button>
        </div>
      )}

      <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
        {/* Mobile compact header */}
        <div className="lg:hidden flex items-center gap-2.5 px-3 py-2.5">
          <button onClick={() => setPaused((p) => !p)} className="w-9 h-9 rounded-full border-2 border-primary-600 flex items-center justify-center text-primary-600 flex-shrink-0">
            {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">Time {fmtTime(timeLeft)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{test.title}</p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowReportModal(true)} className={reportedQuestions.has(current.id) ? "text-primary-600" : "text-gray-400"} aria-label="Report question">
              <Flag className={`w-5 h-5 ${reportedQuestions.has(current.id) ? "fill-primary-600" : ""}`} />
            </button>
            <button onClick={toggleMarkCurrent} aria-label="Mark for review">
              <Star className={`w-5 h-5 ${marked.has(current.id) ? "text-rose-500 fill-rose-500" : "text-gray-400"}`} />
            </button>
          </div>
        </div>
        {/* Desktop header */}
        <div className="hidden lg:flex items-center gap-3 px-4 sm:px-6 py-3 justify-between flex-wrap">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white truncate max-w-[160px] sm:max-w-xs">{test.title}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <span>Viewing in:</span>
            <select className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-2 py-1 text-sm">
              <option>English</option>
            </select>
          </div>
          <button onClick={toggleFullscreen} className="flex items-center gap-2 border border-gray-200 dark:border-gray-600 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Maximize2 className="w-4 h-4" />
            <span className="hidden md:inline">{isFullscreen ? "Exit" : "Fullscreen"}</span>
          </button>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button onClick={() => setPaused((p) => !p)} className="w-9 h-9 rounded-full border-2 border-primary-600 flex items-center justify-center text-primary-600">
              {paused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
            </button>
            <div>
              <p className="text-sm font-bold text-gray-900 dark:text-white tabular-nums">{fmtTime(timeLeft)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Time left</p>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile: section subject tabs */}
      <div className="lg:hidden bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 overflow-x-auto flex-shrink-0">
        <div className="flex">
          <button className="px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 border-primary-600 text-primary-600 dark:text-primary-400">
            {test.section}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row lg:min-h-0 lg:overflow-hidden">
        {showAllQuestions ? (
          <div className="p-4 sm:p-6 lg:flex-1 lg:min-h-0 lg:overflow-y-auto pb-28 lg:pb-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-900 dark:text-white">All questions</h2>
              <button
                onClick={() => setShowAllQuestions(false)}
                className="bg-primary-600 text-white rounded-xl px-5 py-2 text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                Attempt Mode
              </button>
            </div>

            <div className="space-y-8">
              {test.questions.map((q, i) => (
                <div key={q.id} className="pb-8 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-3">Question {i + 1}</h3>
                  <p className={`text-gray-800 dark:text-gray-300 mb-4 ${questionTextSize}`}>{q.text}</p>
                  <div className="space-y-1.5">
                    {q.options.map((option, j) => (
                      <p key={j} className="text-sm text-gray-600 dark:text-gray-400">
                        {String.fromCharCode(65 + j)}) {option}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowAllQuestions(false)}
              className="w-full sm:w-auto bg-primary-600 text-white rounded-xl px-8 py-3 text-sm font-medium hover:bg-primary-700 transition-colors mt-2"
            >
              Back to Attempt Mode
            </button>
          </div>
        ) : (
        <div className="p-4 sm:p-6 lg:flex-1 lg:min-h-0 lg:overflow-y-auto pb-28 lg:pb-6">
          <div className="max-w-3xl">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <h2 className="font-bold text-gray-900 dark:text-white">
                <span className="lg:hidden">Ques </span>
                <span className="hidden lg:inline">Question </span>
                {currentIndex + 1}
              </h2>
              <span className="flex items-center gap-0.5 text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full border border-green-200 dark:border-green-800">
                <Check className="w-3 h-3" />+{test.marksPerCorrect}
              </span>
              <span className="flex items-center gap-0.5 text-xs font-medium text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded-full border border-red-200 dark:border-red-800">
                <X className="w-3 h-3" />-{test.negativeMark}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400"><Clock className="w-4 h-4" /> {fmtMinSec(questionElapsed)}</span>
              {/* Desktop-only icons — mobile has them in header */}
              <button onClick={() => setShowReportModal(true)} className={`hidden lg:block ${reportedQuestions.has(current.id) ? "text-primary-600" : "text-gray-400 hover:text-gray-600"}`} aria-label="Report question">
                <Flag className={`w-4 h-4 ${reportedQuestions.has(current.id) ? "fill-primary-600" : ""}`} />
              </button>
              <button onClick={toggleMarkCurrent} className="hidden lg:block" aria-label="Mark for review">
                <Star className={`w-4 h-4 ${marked.has(current.id) ? "text-rose-500 fill-rose-500" : "text-gray-400"}`} />
              </button>
            </div>
          </div>

          {reportedQuestions.has(current.id) && (
            <p className="text-xs text-primary-600 mb-3">Thanks — this question has been reported.</p>
          )}

          <p className={`text-gray-800 dark:text-gray-200 mb-6 ${questionTextSize}`}>{current.text}</p>

          <div className="space-y-3 mb-4">
            {current.options.map((option, i) => (
              <button
                key={i}
                onClick={() => selectOption(i)}
                className={`w-full text-left px-4 py-4 rounded-xl border transition-colors flex items-center justify-between gap-4 ${
                  answers[current.id] === i
                    ? "border-primary-600 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400 font-medium"
                    : "border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                <span className={questionTextSize}>{option}</span>
                <span className={`w-5 h-5 rounded-full border-2 flex-shrink-0 transition-colors ${answers[current.id] === i ? "border-primary-600 bg-primary-600" : "border-gray-300 dark:border-gray-500"}`} />
              </button>
            ))}
          </div>

          {/* Mobile-only inline actions */}
          <div className="flex gap-2 lg:hidden mb-4">
            <button onClick={clearResponse} className="flex-1 border border-gray-200 dark:border-gray-600 rounded-xl py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Clear
            </button>
            <button onClick={markForReviewAndNext} className="flex-1 border border-gray-200 dark:border-gray-600 rounded-xl py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Mark &amp; Next
            </button>
          </div>

          {/* Desktop-only action buttons */}
          <div className="hidden lg:flex flex-wrap gap-2 sm:gap-3">
            <button onClick={goPrevious} disabled={currentIndex === 0} className="border border-gray-200 dark:border-gray-600 rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
              Previous
            </button>
            <button onClick={clearResponse} className="border border-gray-200 dark:border-gray-600 rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              Clear
            </button>
            <button onClick={markForReviewAndNext} className="border border-gray-200 dark:border-gray-600 rounded-xl px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <span className="hidden sm:inline">Mark for Review &amp; </span>Next
            </button>
            <button onClick={goNext} className="bg-primary-600 rounded-xl px-6 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-medium text-white hover:bg-primary-700 transition-colors ml-auto">
              Next
            </button>
          </div>
          </div>{/* end max-w-3xl */}
        </div>
        )}

        {/* Desktop-only right sidebar */}
        <div className="hidden lg:flex lg:flex-col bg-white dark:bg-gray-800 border-l border-gray-100 dark:border-gray-700 p-5 overflow-y-auto lg:w-[340px] lg:flex-shrink-0 lg:min-h-0">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-600" />
            <span className="font-semibold text-gray-900 dark:text-white">{candidateName}</span>
          </div>

          <h3 className="font-bold text-gray-900 dark:text-white mb-3">Question palette</h3>

          <div className="flex gap-2 mb-4">
            <button onClick={() => setGridView(true)} className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${gridView ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}>Grid View</button>
            <button onClick={() => setGridView(false)} className={`flex-1 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${!gridView ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"}`}>List View</button>
          </div>

          <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400 mb-4">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Attempted ({counts.attempted})</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-800 dark:bg-gray-300" /> Unattempted ({counts.unattempted})</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-gray-300" /> Unseen ({counts.unseen})</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-yellow-400" /> Marked ({counts.marked})</span>
          </div>

          {gridView ? (
            <div className="grid grid-cols-5 gap-2 mb-6 max-h-[340px] overflow-y-auto p-1">
              {test.questions.map((q, i) => {
                const status = getStatus(q.id);
                const isCurrent = i === currentIndex;
                return (
                  <button
                    key={q.id}
                    onClick={() => goTo(i)}
                    className={`h-8 rounded-lg text-xs font-semibold flex items-center justify-center border-2 transition-colors ${
                      isCurrent ? "bg-gray-900 dark:bg-gray-100 border-gray-900 dark:border-gray-100 text-white dark:text-gray-900"
                      : status === "attempted" ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                      : status === "marked" ? "bg-rose-50 dark:bg-rose-900/20 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400"
                      : status === "unattempted" ? "bg-amber-50 dark:bg-amber-900/20 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-400"
                      : "bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {(i + 1).toString().padStart(2, "0")}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2 mb-6 max-h-[340px] overflow-y-auto p-1">
              {test.questions.map((q, i) => {
                const status = getStatus(q.id);
                return (
                  <button
                    key={q.id}
                    onClick={() => goTo(i)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm border-2 transition-colors ${
                      i === currentIndex ? "bg-gray-900 dark:bg-gray-100 border-gray-900 dark:border-gray-100 text-white dark:text-gray-900"
                      : status === "attempted" ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                      : status === "marked" ? "bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-400"
                      : status === "unattempted" ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400"
                      : "bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    <span>Question {i + 1}</span>
                    <span className="capitalize text-xs font-medium">{status}</span>
                  </button>
                );
              })}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 mb-4">
            <button onClick={() => setShowInstructionsModal(true)} className="border border-gray-200 dark:border-gray-600 rounded-xl py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">Instructions</button>
            <button
              onClick={() => { if (!showAllQuestions) setVisited((prev) => new Set([...Array.from(prev), ...test.questions.map((q) => q.id)])); setShowAllQuestions((v) => !v); }}
              className="border border-gray-200 dark:border-gray-600 rounded-xl py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              {showAllQuestions ? "Attempt Mode" : "Questions"}
            </button>
          </div>

          <button
            onClick={() => { setShowSubmitModal(true); setHasOpenedSubmitModal(true); }}
            className="w-full bg-primary-600 rounded-xl py-3.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
          >
            {hasOpenedSubmitModal ? "Test Summary" : "Submit Test"}
          </button>
        </div>
      </div>

      {/* Mobile: fixed bottom Previous / Next nav */}
      <div className="fixed bottom-0 left-0 right-0 lg:hidden bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex z-20">
        <button onClick={goPrevious} disabled={currentIndex === 0} className="flex-1 py-4 text-sm font-medium text-gray-700 dark:text-gray-300 disabled:opacity-40 disabled:cursor-not-allowed">
          Previous
        </button>
        <div className="w-px bg-gray-200 dark:bg-gray-700 my-2.5" />
        <button onClick={goNext} className="flex-1 py-4 text-sm font-semibold bg-primary-600 text-white">
          Next
        </button>
      </div>

      {/* Mobile: floating palette FAB (above bottom nav) */}
      <button
        onClick={() => setShowMobilePalette(true)}
        className="fixed bottom-[72px] right-4 w-12 h-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-full shadow-lg flex items-center justify-center text-gray-700 dark:text-gray-300 lg:hidden z-20"
        aria-label="Open question palette"
      >
        <ClipboardList className="w-5 h-5" />
      </button>

      {/* Mobile: full-screen palette overlay */}
      {showMobilePalette && (
        <div className="fixed inset-0 bg-white dark:bg-gray-900 z-50 flex flex-col lg:hidden">
          {/* Palette header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
            <button onClick={() => setShowMobilePalette(false)} className="p-1 text-gray-600 dark:text-gray-400">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="flex-1 font-bold text-gray-900 dark:text-white">Filters</span>
            <button onClick={() => setGridView(true)} className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${gridView ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600" : "text-gray-400"}`}>
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button onClick={() => setGridView(false)} className={`w-8 h-8 rounded flex items-center justify-center transition-colors ${!gridView ? "bg-primary-100 dark:bg-primary-900/30 text-primary-600" : "text-gray-400"}`}>
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 px-4 py-2.5 border-b border-gray-100 dark:border-gray-800 overflow-x-auto flex-shrink-0">
            <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400 flex-shrink-0" /> Attempted</span>
            <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap"><span className="w-2.5 h-2.5 rounded-full bg-amber-400 flex-shrink-0" /> Unattempted</span>
            <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap"><span className="w-2.5 h-2.5 rounded-full bg-gray-300 flex-shrink-0" /> Unseen</span>
            <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400 whitespace-nowrap"><span className="w-2.5 h-2.5 rounded-full bg-rose-400 flex-shrink-0" /> Marked</span>
          </div>

          {/* Scrollable section content */}
          <div className="flex-1 overflow-y-auto">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <span className="text-sm font-medium text-gray-900 dark:text-white">{test.section}</span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </div>
            <div className="flex items-center gap-5 px-4 py-2.5 border-b border-gray-100 dark:border-gray-800">
              <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400"><span className="w-2 h-2 rounded-full bg-emerald-400" /> {counts.attempted}</span>
              <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400"><span className="w-2 h-2 rounded-full bg-amber-400" /> {counts.unattempted}</span>
              <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400"><span className="w-2 h-2 rounded-full bg-gray-300" /> {counts.unseen}</span>
              <span className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-400"><span className="w-2 h-2 rounded-full bg-rose-400" /> {counts.marked}</span>
            </div>

            {gridView ? (
              <div className="grid grid-cols-6 gap-2.5 p-4">
                {test.questions.map((q, i) => {
                  const status = getStatus(q.id);
                  const isCurrent = i === currentIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => { goTo(i); setShowMobilePalette(false); }}
                      className={`w-full aspect-square rounded-full text-xs font-semibold flex items-center justify-center border-2 transition-colors ${
                        isCurrent ? "bg-gray-900 border-gray-900 text-white dark:bg-gray-100 dark:border-gray-100 dark:text-gray-900"
                        : status === "attempted" ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                        : status === "marked" ? "bg-rose-50 dark:bg-rose-900/20 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400"
                        : status === "unattempted" ? "bg-white dark:bg-gray-800 border-gray-700 dark:border-gray-400 text-gray-700 dark:text-gray-300"
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {(i + 1).toString().padStart(2, "0")}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-1.5 p-4">
                {test.questions.map((q, i) => {
                  const status = getStatus(q.id);
                  const isCurrent = i === currentIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => { goTo(i); setShowMobilePalette(false); }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm border-2 transition-colors ${
                        isCurrent ? "bg-gray-900 border-gray-900 text-white dark:bg-gray-100 dark:border-gray-100 dark:text-gray-900"
                        : status === "attempted" ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400"
                        : status === "marked" ? "bg-rose-50 dark:bg-rose-900/20 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-400"
                        : status === "unattempted" ? "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400"
                        : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      <span>Question {i + 1}</span>
                      <span className="capitalize text-xs font-medium">{status}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Bottom actions */}
          <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex-shrink-0">
            <div className="grid grid-cols-2 gap-3 p-4 pb-3">
              <button onClick={() => { setShowMobilePalette(false); setShowInstructionsModal(true); }} className="border border-gray-200 dark:border-gray-600 rounded-xl py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                Instructions
              </button>
              <button
                onClick={() => { if (!showAllQuestions) setVisited((prev) => new Set([...Array.from(prev), ...test.questions.map((q) => q.id)])); setShowAllQuestions(true); setShowMobilePalette(false); }}
                className="border border-gray-200 dark:border-gray-600 rounded-xl py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Questions
              </button>
            </div>
            <div className="px-4 pb-4">
              <button
                onClick={() => { setShowSubmitModal(true); setHasOpenedSubmitModal(true); setShowMobilePalette(false); }}
                className="w-full bg-primary-600 rounded-xl py-3.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
              >
                Submit Test
              </button>
            </div>
            <div className="flex justify-center pb-3">
              <div className="w-10 h-1 bg-gray-300 dark:bg-gray-600 rounded-full" />
            </div>
          </div>
        </div>
      )}

      {showInstructionsModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 sm:p-8">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Instructions</h3>
                <button onClick={() => setShowInstructionsModal(false)} aria-label="Close">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <p className="text-sm text-red-600 mb-5">
                Note: the timer is still running. Close this panel to continue attempting questions.
              </p>
              <ExamInstructionsContent durationMinutes={test.durationMinutes} />
              <button
                onClick={() => setShowInstructionsModal(false)}
                className="w-full bg-primary-600 text-white rounded-xl py-3 text-sm font-medium hover:bg-primary-700 transition-colors mt-2"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showSubmitModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 w-full max-w-3xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Test summary</h3>
              <button onClick={() => setShowSubmitModal(false)} aria-label="Close">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            <div className="mb-6 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-primary-50 dark:bg-primary-900/20 text-left text-gray-700 dark:text-gray-300">
                    <th className="px-5 py-3 font-semibold">Section</th>
                    <th className="px-5 py-3 font-semibold text-center">Total Qs</th>
                    <th className="px-5 py-3 font-semibold text-center">Attempted</th>
                    <th className="px-5 py-3 font-semibold text-center">Unattempted</th>
                    <th className="px-5 py-3 font-semibold text-center">Marked</th>
                    <th className="px-5 py-3 font-semibold text-center">Unseen</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-gray-100 dark:border-gray-700">
                    <td className="px-5 py-4 font-semibold text-gray-900 dark:text-white">{test.section}</td>
                    <td className="px-5 py-4 text-center dark:text-gray-300">{test.questions.length}</td>
                    <td className="px-5 py-4 text-center text-emerald-600 font-medium">{counts.attempted}</td>
                    <td className="px-5 py-4 text-center text-amber-600 font-medium">{counts.unattempted}</td>
                    <td className="px-5 py-4 text-center text-rose-600 font-medium">{counts.marked}</td>
                    <td className="px-5 py-4 text-center text-gray-500 font-medium">{counts.unseen}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 border border-gray-200 dark:border-gray-600 rounded-xl py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { recordTimeForCurrentQuestion(); setSubmitted(true); }}
                className="flex-1 bg-primary-600 rounded-xl py-3 text-sm font-medium text-white hover:bg-primary-700 transition-colors"
              >
                Test Analysis
              </button>
            </div>
          </div>
        </div>
      )}

      {showReportModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Report an error with this quiz</h3>
              <button onClick={() => { setShowReportModal(false); setReportError(""); }} aria-label="Close">
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            <div className="space-y-2.5 mb-5">
              {REPORT_TYPE_OPTIONS.map((type) => (
                <label key={type} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedReportTypes.has(type)}
                    onChange={() => toggleReportType(type)}
                    className="w-4 h-4 accent-primary-600 flex-shrink-0"
                  />
                  {type}
                </label>
              ))}
            </div>

            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Enter your doubt here <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={reportNote}
              onChange={(e) => setReportNote(e.target.value)}
              placeholder="Add any extra detail that might help us fix this"
              rows={4}
              className="w-full border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-primary-400 resize-none mb-5"
            />

            {reportError && <p className="text-sm text-red-600 mb-4">{reportError}</p>}

            <div className="flex gap-3">
              <button
                onClick={() => { setShowReportModal(false); setReportError(""); }}
                className="flex-1 border border-gray-200 dark:border-gray-600 rounded-xl py-3 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitReport}
                disabled={!canSubmitReport || reportSubmitting}
                className={`flex-1 rounded-xl py-3 text-sm font-medium transition-colors ${
                  canSubmitReport && !reportSubmitting
                    ? "bg-primary-600 text-white hover:bg-primary-700"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                }`}
              >
                {reportSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface ReviewQuestion {
  id: number;
  text: string;
  options: string[];
  correctIndex: number;
}

function MockTestReport({
  test,
  results,
  answers,
  questionTimes,
  allTests,
  saveStatus,
  attemptId,
  onReattempt,
}: {
  test: MockTestSafe;
  results: {
    correct: number;
    incorrect: number;
    unattempted: number;
    score: number;
    maxScore: number;
    accuracy: number;
    timeTaken: number;
    totalParticipants: number;
    percentile: number;
    rank: number;
    averageScore: number;
    bestScore: number;
    topPerformerName: string;
    topPerformerScore: number;
  };
  answers: Record<number, number>;
  questionTimes: Record<number, number>;
  allTests: MockTestSafe[];
  saveStatus: "idle" | "saving" | "saved" | "error";
  attemptId: string | null;
  onReattempt: () => void;
}) {
  const [showSolutions, setShowSolutions] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewQuestions, setReviewQuestions] = useState<ReviewQuestion[] | null>(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [attemptedDate, setAttemptedDate] = useState("");
  const [attemptedTime, setAttemptedTime] = useState("");
  const isFirstParticipant = results.totalParticipants <= 1;

  // Auto-fetch review data on mount for sectional summary (attempt already submitted)
  useEffect(() => {
    if (!attemptId || reviewQuestions) return;
    fetch(`/api/attempts/${attemptId}/review`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data?.questions) setReviewQuestions(data.questions); })
      .catch(() => {});
  }, [attemptId]);

  useEffect(() => {
    setAttemptedDate(new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }));
    setAttemptedTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
  }, []);

  const handleToggleSolutions = async () => {
    const next = !showSolutions;
    setShowSolutions(next);
    if (next && !reviewQuestions && attemptId) {
      setReviewLoading(true);
      try {
        const res = await fetch(`/api/attempts/${attemptId}/review`);
        if (res.ok) {
          const data = await res.json();
          setReviewQuestions(data.questions);
        }
      } finally {
        setReviewLoading(false);
      }
    }
  };

  const sectionalStats = reviewQuestions
    ? computeSectionalStats(reviewQuestions, answers, questionTimes, test.marksPerCorrect, test.negativeMark)
    : [];

  const leaderboard = [
    { name: "Anuj Bhagat", factor: 0.93 },
    { name: "Sujal Parmar", factor: 0.83 },
    { name: "Sangeeta Sharma", factor: 0.72 },
    { name: "Mansi Verma", factor: 0.67 },
    { name: "Aryan Vatsa", factor: 0.18 },
  ];

  const donutPercent = Math.max(0, Math.min(100, (results.score / results.maxScore) * 100));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-gray-900">The Law Project</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">{test.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Attempted on {attemptedDate} | {attemptedTime}
              <span className="mx-2 text-gray-300">|</span>
              Total Questions : {test.questions.length}
              <span className="mx-2 text-gray-300">|</span>
              Marks : {results.maxScore}
              <span className="mx-2 text-gray-300">|</span>
              Time : {test.durationMinutes} mins
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={onReattempt} className="bg-primary-600 rounded-xl px-5 py-2.5 text-sm font-medium text-white hover:bg-primary-700 transition-colors">
              Reattempt Test
            </button>
            <Link href="/mock-test" className="border border-gray-200 rounded-xl px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
              Go To Test Series
            </Link>
            <button
              onClick={handleToggleSolutions}
              className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-colors ${
                showSolutions ? "bg-primary-50 text-primary-700 border border-primary-200" : "border border-gray-200 text-primary-600 hover:bg-primary-50"
              }`}
            >
              Solutions
            </button>
          </div>
        </div>
      </header>


      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {showSolutions ? (
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-5">Solutions</h2>
          {reviewLoading && (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
            </div>
          )}
          {!reviewLoading && reviewQuestions && (
            <div className="space-y-6">
              {reviewQuestions.map((q, i) => {
                const userAnswer = answers[q.id];
                return (
                  <div key={q.id} className="rounded-2xl border border-gray-100 bg-white p-6">
                    <h3 className="font-bold text-gray-900 mb-3">Question {i + 1}</h3>
                    <p className="text-gray-800 mb-4">{q.text}</p>
                    <div className="space-y-2">
                      {q.options.map((option, j) => {
                        const isCorrect = j === q.correctIndex;
                        const isWrongPick = userAnswer === j && !isCorrect;
                        return (
                          <div key={j}
                            className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-sm ${
                              isCorrect
                                ? "border-green-300 bg-green-50 text-green-800 font-medium"
                                : isWrongPick
                                ? "border-rose-300 bg-rose-50 text-rose-700 font-medium"
                                : "border-gray-200 text-gray-700"
                            }`}
                          >
                            <span>{String.fromCharCode(65 + j)}) {option}</span>
                            {isCorrect && (
                              <span className="flex items-center gap-1 text-xs font-semibold text-green-700 flex-shrink-0">
                                <Check className="w-4 h-4" /> Correct Answer
                              </span>
                            )}
                            {isWrongPick && (
                              <span className="flex items-center gap-1 text-xs font-semibold text-rose-600 flex-shrink-0">
                                <X className="w-4 h-4" /> Your Answer
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    {userAnswer === undefined && (
                      <p className="text-xs text-gray-400 mt-3">You did not attempt this question.</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {!reviewLoading && !reviewQuestions && (
            <p className="text-center text-gray-400 py-8">Could not load solutions. Please try again.</p>
          )}
        </div>
        ) : (
        <div>
        <h2 className="text-xl font-bold text-gray-900 mb-5">Overall performance summary</h2>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 rounded-2xl border border-gray-100 bg-white p-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center flex-shrink-0"><Trophy className="w-4 h-4 text-green-600" /></span>
              <h3 className="font-bold text-gray-900">Score achieved</h3>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div
                className="relative w-32 h-32 rounded-full flex items-center justify-center flex-shrink-0"
                style={{ background: `conic-gradient(#4d65ff ${donutPercent}%, #e5e7eb ${donutPercent}%)` }}
              >
                <div className="absolute inset-2 bg-white rounded-full flex flex-col items-center justify-center text-center">
                  <span className="text-xl font-bold text-gray-900">
                    {results.score}<span className="text-gray-400 text-sm font-medium">/{results.maxScore}</span>
                  </span>
                  <span className="text-xs text-gray-500">Total</span>
                </div>
              </div>

              <div className="flex-1 w-full space-y-2">
                <div className="flex items-center justify-between bg-green-50 rounded-lg px-4 py-2.5">
                  <span className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"><Check className="w-3.5 h-3.5 text-white" /></span>
                    Correct
                  </span>
                  <span className="font-semibold text-gray-900">{results.correct}</span>
                </div>
                <div className="flex items-center justify-between bg-rose-50 rounded-lg px-4 py-2.5">
                  <span className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center flex-shrink-0"><X className="w-3.5 h-3.5 text-white" /></span>
                    Incorrect
                  </span>
                  <span className="font-semibold text-gray-900">{results.incorrect}</span>
                </div>
                <div className="flex items-center justify-between bg-gray-100 rounded-lg px-4 py-2.5">
                  <span className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center flex-shrink-0"><HelpCircle className="w-3.5 h-3.5 text-white" /></span>
                    Unattempted
                  </span>
                  <span className="font-semibold text-gray-900">{results.unattempted}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between bg-primary-50 rounded-lg px-4 py-3 mt-5 text-sm text-gray-700">
              <span>{isFirstParticipant ? "Current Average Score" : "Average Score"}: <strong className="text-gray-900">{results.averageScore}</strong></span>
              <span>{isFirstParticipant ? "Current Best Score" : "Best Score"}: <strong className="text-gray-900">{results.bestScore}</strong></span>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6 flex flex-col">
            <div className="flex items-center gap-2 mb-5">
              <span className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0"><Crown className="w-4 h-4 text-amber-600" /></span>
              <h3 className="font-bold text-gray-900">{isFirstParticipant ? "Current top performer" : "Top performer"}</h3>
            </div>
            <div className="flex items-center gap-3 bg-amber-50 rounded-xl p-4 mb-4">
              <span className="w-11 h-11 rounded-full bg-amber-200 text-amber-800 font-bold flex items-center justify-center text-lg flex-shrink-0">
                {results.topPerformerName.charAt(0).toUpperCase()}
              </span>
              <div>
                <p className="font-semibold text-gray-900">{results.topPerformerName}</p>
                <p className="text-xs text-gray-500">Rank #1</p>
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">
              {results.topPerformerScore}<span className="text-gray-400 text-base font-medium"> / {results.maxScore}</span>
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {isFirstParticipant ? "You're the only attempt so far — nice work." : "Can you beat this score on your next attempt?"}
            </p>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 mb-6">
          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-9 h-9 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0"><ClipboardList className="w-4 h-4 text-primary-600" /></span>
              <h3 className="font-bold text-gray-900">Questions attempted</h3>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden mb-3">
              <div className="h-full bg-primary-600 rounded-full" style={{ width: `${((results.correct + results.incorrect) / test.questions.length) * 100}%` }} />
            </div>
            <p className="text-sm text-gray-700">
              <strong className="text-gray-900">{results.correct + results.incorrect}</strong> out of {test.questions.length} Question
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0"><Clock className="w-4 h-4 text-gray-700" /></span>
              <h3 className="font-bold text-gray-900">Time taken</h3>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden mb-3">
              <div className="h-full bg-gray-900 rounded-full" style={{ width: `${Math.min((results.timeTaken / (test.durationMinutes * 60)) * 100, 100)}%` }} />
            </div>
            <p className="text-sm text-gray-700">
              <strong className="text-gray-900">{fmtMinSec(results.timeTaken)}</strong> out of {test.durationMinutes} mins
            </p>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0"><Percent className="w-4 h-4 text-purple-600" /></span>
              <h3 className="font-bold text-gray-900">Attempt accuracy</h3>
            </div>
            <div className="h-2 rounded-full bg-gray-100 overflow-hidden mb-3">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${results.accuracy}%` }} />
            </div>
            <p className="text-sm text-gray-700">
              <strong className="text-gray-900">{results.accuracy}%</strong> out of 100%
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {sectionalStats.length > 0 && (
            <div className="lg:col-span-3 mt-2">
              <SectionalSummary sections={sectionalStats} />
            </div>
          )}

          <div className="rounded-2xl border border-gray-100 bg-white p-6 text-center">
            <div className="w-16 h-16 rounded-2xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
              <Smartphone className="w-7 h-7 text-primary-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-1">Rate this test</h3>
            <p className="text-sm text-gray-500 mb-4">We would love to know how was your experience with this test?</p>
            <div className="flex justify-center gap-1.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  aria-label={`Rate ${star} star`}
                >
                  <Star
                    className={`w-6 h-6 transition-colors ${
                      star <= (hoverRating || rating) ? "text-primary-500 fill-primary-500" : "text-gray-200"
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-6">
            <h3 className="font-bold text-gray-900 mb-4">Leaderboard</h3>
            <ul className="space-y-1.5">
              {leaderboard.map((entry, i) => (
                <li key={entry.name} className="flex items-center justify-between px-2 py-2.5 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-sm text-gray-400">{i + 1}</span>
                    <span className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold flex items-center justify-center">
                      {entry.name.charAt(0)}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{entry.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                    {Math.round(results.maxScore * entry.factor)}/{results.maxScore}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 bg-primary-50 rounded-xl px-3 py-3">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary-600 text-white text-sm font-semibold flex items-center justify-center">T</span>
                <div>
                  <p className="text-sm font-semibold text-primary-700">Well done! Keep practicing.</p>
                  <p className="text-xs text-primary-500">Rank : {results.rank}</p>
                </div>
              </div>
              <span className="text-xs font-semibold text-primary-700 bg-white px-2.5 py-1 rounded-full whitespace-nowrap">
                {results.score}/{results.maxScore}
              </span>
            </div>
          </div>
        </div>
        </div>
        )}
      </div>
    </div>
  );
}
