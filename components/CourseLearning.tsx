"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import type { Course, CourseModuleItem } from "@/lib/courses";
import {
  GraduationCap, ChevronRight, ChevronLeft, Play, BookOpen,
  Clock, Bookmark, MoreHorizontal, CheckCircle2, Lock, Menu, X,
  FileText, Download, StickyNote, Maximize2,
} from "lucide-react";

interface Lesson {
  moduleIndex: number;
  lessonIndex: number;
  moduleTitle: string;
  item: CourseModuleItem;
  globalIndex: number;
  type: "video" | "reading";
}

function buildLessons(course: Course): Lesson[] {
  const lessons: Lesson[] = [];
  let global = 0;
  course.modules.forEach((mod, mi) => {
    mod.items.forEach((item, li) => {
      lessons.push({
        moduleIndex: mi,
        lessonIndex: li,
        moduleTitle: mod.title,
        item,
        globalIndex: global++,
        type: (item.content_type ?? (li % 2 === 0 ? "video" : "reading")) as "video" | "reading",
      });
    });
  });
  return lessons;
}

const LAW_THUMBNAILS = [
  "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=900&q=80&fit=crop",
  "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=900&q=80&fit=crop",
  "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=900&q=80&fit=crop",
];

const TABS = ["Overview", "Notes", "Resources"] as const;
type Tab = (typeof TABS)[number];

export default function CourseLearning({
  course,
  candidateName,
}: {
  course: Course;
  candidateName: string;
}) {
  const lessons = useMemo(() => buildLessons(course), [course]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [allNotes, setAllNotes] = useState<Record<string, string>>({});
  const [noteSaving, setNoteSaving] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // When the native fullscreen button fullscreens the <video> element alone,
  // the watermark div gets left behind. This listener detects that, exits,
  // and re-enters fullscreen on the container div instead (which contains
  // the watermark). We listen on the VIDEO element, not the document, so
  // the callback never fires when the CONTAINER goes fullscreen — no loop.
  useEffect(() => {
    const video = videoRef.current;
    const container = videoContainerRef.current;
    if (!video || !container) return;

    let redirecting = false;

    const onVideoFsChange = () => {
      if (redirecting || document.fullscreenElement !== video) return;
      redirecting = true;
      document.exitFullscreen()
        .then(() => container.requestFullscreen())
        .catch(() => {})
        .finally(() => setTimeout(() => { redirecting = false; }, 300));
    };

    video.addEventListener("fullscreenchange", onVideoFsChange);
    return () => video.removeEventListener("fullscreenchange", onVideoFsChange);
  }, []);

  const [saved, setSaved] = useState<Set<number>>(new Set());

  // Watermark: random position that shifts every 5 s, only on video lessons
  const [wmPos, setWmPos] = useState({ top: 15, left: 15 });
  useEffect(() => {
    if (lessons[currentIndex]?.type !== "video") return;
    const rand = () => ({
      top: Math.floor(Math.random() * 65) + 10,   // 10 – 75 %
      left: Math.floor(Math.random() * 55) + 10,  // 10 – 65 %
    });
    setWmPos(rand());
    const id = setInterval(() => setWmPos(rand()), 5000);
    return () => clearInterval(id);
  }, [currentIndex, lessons]);

  const lessonId = `m${lessons[currentIndex]?.moduleIndex ?? 0}-l${lessons[currentIndex]?.lessonIndex ?? 0}`;
  const notes = allNotes[lessonId] ?? "";

  // Load all notes for this course on mount
  useEffect(() => {
    fetch(`/api/notes?courseSlug=${course.slug}`)
      .then((r) => r.json())
      .then(({ notes }) => { if (notes) setAllNotes(notes); })
      .catch(() => {});
  }, [course.slug]);

  const handleNotesChange = useCallback((value: string) => {
    setAllNotes((prev) => ({ ...prev, [lessonId]: value }));
    setNoteSaving("saving");
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      try {
        await fetch("/api/notes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ courseSlug: course.slug, lessonId, notes: value }),
        });
        setNoteSaving("saved");
        setTimeout(() => setNoteSaving("idle"), 2000);
      } catch {
        setNoteSaving("idle");
      }
    }, 800); // debounce 800ms
  }, [lessonId, course.slug]);

  const current = lessons[currentIndex];
  const thumb = LAW_THUMBNAILS[currentIndex % LAW_THUMBNAILS.length];
  const canPrev = currentIndex > 0;
  const canNext = currentIndex < lessons.length - 1;

  const toggleSave = () =>
    setSaved((prev) => {
      const next = new Set(prev);
      if (next.has(currentIndex)) next.delete(currentIndex);
      else next.add(currentIndex);
      return next;
    });

  if (!current) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">No lessons available yet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Top bar ───────────────────────────────────────── */}
      <header className="h-14 border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 bg-white sticky top-0 z-30 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/course" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="hidden sm:block text-sm font-bold text-gray-900">The Law Project</span>
          </Link>

          <span className="text-gray-300 hidden sm:block">/</span>

          {/* Breadcrumb */}
          <nav className="hidden sm:flex items-center gap-1 text-xs text-gray-500 min-w-0">
            <Link href={`/course/${course.slug}`} className="hover:text-primary-600 truncate max-w-[140px]">
              {course.title}
            </Link>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate max-w-[120px] text-gray-400">Module {current.moduleIndex + 1}</span>
            <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate max-w-[160px] font-medium text-gray-700">{current.item.title}</span>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={!canPrev}
            className="hidden sm:flex items-center gap-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" /> Prev
          </button>
          <button
            onClick={() => setCurrentIndex((i) => Math.min(lessons.length - 1, i + 1))}
            disabled={!canNext}
            className="flex items-center gap-1 bg-primary-600 text-white rounded-lg px-3 py-1.5 text-xs font-medium hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next <ChevronRight className="w-3.5 h-3.5" />
          </button>
          <button className="sm:hidden p-2 text-gray-600" onClick={() => setSidebarOpen(true)}>
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 relative">
        {/* ── Mobile sidebar overlay ────────────────────────── */}
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-40 sm:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* ── Sidebar ───────────────────────────────────────── */}
        <aside
          className={`fixed sm:relative inset-y-0 left-0 z-50 sm:z-auto w-72 sm:w-64 lg:w-72 bg-white border-r border-gray-100 flex flex-col transition-transform duration-200 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full sm:translate-x-0"
          }`}
        >
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 flex-shrink-0">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Course Content</p>
            <button className="sm:hidden" onClick={() => setSidebarOpen(false)}>
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Progress pill */}
          <div className="px-4 py-3 border-b border-gray-50 flex-shrink-0">
            <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
              <span>{currentIndex + 1} / {lessons.length} lessons</span>
              <span className="font-medium text-primary-600">
                {Math.round(((currentIndex + 1) / lessons.length) * 100)}%
              </span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-primary-600 rounded-full transition-all duration-300"
                style={{ width: `${((currentIndex + 1) / lessons.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Lesson list */}
          <div className="flex-1 overflow-y-auto py-2">
            {course.modules.map((mod, mi) => {
              const moduleLessons = lessons.filter((l) => l.moduleIndex === mi);
              return (
                <div key={mi} className="mb-1">
                  <p className="px-4 pt-3 pb-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Module {mi + 1} · {mod.title}
                  </p>
                  {moduleLessons.map((lesson) => {
                    const isActive = lesson.globalIndex === currentIndex;
                    const isDone = lesson.globalIndex < currentIndex;
                    return (
                      <button
                        key={lesson.globalIndex}
                        onClick={() => { setCurrentIndex(lesson.globalIndex); setSidebarOpen(false); }}
                        className={`w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors ${
                          isActive
                            ? "bg-primary-50 border-r-2 border-primary-600"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isDone
                            ? "bg-emerald-100"
                            : isActive
                            ? "bg-primary-100"
                            : "bg-gray-100"
                        }`}>
                          {isDone ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          ) : lesson.type === "video" ? (
                            <Play className={`w-2.5 h-2.5 ${isActive ? "text-primary-600" : "text-gray-400"}`} />
                          ) : (
                            <BookOpen className={`w-2.5 h-2.5 ${isActive ? "text-primary-600" : "text-gray-400"}`} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-medium leading-snug truncate ${
                            isActive ? "text-primary-700" : isDone ? "text-gray-500" : "text-gray-800"
                          }`}>
                            {lesson.item.title}
                          </p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] text-gray-400 capitalize">{lesson.type}</span>
                            {lesson.item.duration && (
                              <>
                                <span className="text-[10px] text-gray-300">·</span>
                                <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                                  <Clock className="w-2.5 h-2.5" /> {lesson.item.duration}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </aside>

        {/* ── Main content ──────────────────────────────────── */}
        <main className="flex-1 overflow-y-auto min-w-0">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6">

            {/* Video player or placeholder */}
            {current.item.video_url ? (
              /* ── Real HTML5 video ── */
              <div
                ref={videoContainerRef}
                className="tlp-video-wrapper rounded-2xl overflow-hidden bg-black mb-5 w-full relative"
              >
                <video
                  ref={videoRef}
                  key={current.item.video_url}
                  src={current.item.video_url}
                  controls
                  autoPlay={false}
                  className="w-full block"
                  style={
                    isFullscreen
                      ? { width: "100vw", height: "100vh", objectFit: "contain", maxHeight: "none" }
                      : { maxHeight: "60vh" }
                  }
                  controlsList="nodownload nofullscreen"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  Your browser does not support the video element.
                </video>

                {/* Custom fullscreen button — replaces the native one removed via controlsList */}
                <button
                  onClick={() => {
                    const el = videoContainerRef.current as HTMLDivElement & {
                      webkitRequestFullscreen?: () => Promise<void>;
                    };
                    if (!el) return;
                    if (document.fullscreenElement) {
                      document.exitFullscreen().catch(() => {});
                    } else {
                      (el.requestFullscreen?.() ?? el.webkitRequestFullscreen?.())?.catch(() => {});
                    }
                  }}
                  title="Fullscreen"
                  className="absolute top-2 right-2 z-20 w-8 h-8 bg-black/40 hover:bg-black/70 rounded-lg flex items-center justify-center text-white transition-colors"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>

                {/* Dynamic watermark — inside container so it stays in fullscreen */}
                <div
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    top: `${wmPos.top}%`,
                    left: `${wmPos.left}%`,
                    opacity: 0.45,
                    pointerEvents: "none",
                    userSelect: "none",
                    transition: "top 1.2s ease, left 1.2s ease",
                    zIndex: 10,
                    whiteSpace: "nowrap",
                    color: "#ff0000",
                  }}
                  className="text-sm font-semibold"
                >
                  {candidateName || "The Law Project"}
                </div>
              </div>
            ) : (
              /* ── Placeholder (no video_url yet) ── */
              <div className="rounded-2xl overflow-hidden bg-gray-950 mb-5 relative aspect-video">
                <img src={thumb} alt={current.item.title}
                  className="w-full h-full object-cover opacity-70" />

                {current.type === "video" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/40 mx-auto mb-3">
                        <Play className="w-7 h-7 text-white fill-white ml-1" />
                      </div>
                      <p className="text-white/70 text-xs">Video coming soon</p>
                    </div>
                  </div>
                )}

                {current.type === "reading" && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-8 py-6 text-center border border-white/20">
                      <BookOpen className="w-10 h-10 text-white mx-auto mb-2" />
                      <p className="text-white font-semibold text-sm">Reading Material</p>
                      <p className="text-white/70 text-xs mt-1">Scroll down to read</p>
                    </div>
                  </div>
                )}

                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-4 py-3 flex items-center gap-3">
                  <span className="text-xs text-white/80 font-medium">
                    Lesson {current.globalIndex + 1} of {lessons.length}
                  </span>
                  <div className="flex-1 h-1 bg-white/20 rounded-full">
                    <div className="h-full bg-white rounded-full w-0" />
                  </div>
                  <span className="text-xs text-white/70">{current.item.duration ?? "--"}</span>
                </div>
                {/* Dynamic watermark on placeholder video too */}
                {current.type === "video" && (
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      top: `${wmPos.top}%`,
                      left: `${wmPos.left}%`,
                      opacity: 0.45,
                      pointerEvents: "none",
                      userSelect: "none",
                      transition: "top 1.2s ease, left 1.2s ease",
                      zIndex: 10,
                      whiteSpace: "nowrap",
                      textShadow: "0 1px 4px rgba(0,0,0,0.8)",
                    }}
                    className="text-red-500 text-sm font-semibold"
                  >
                    {candidateName || "The Law Project"}
                  </div>
                )}
              </div>
            )}

            {/* Lesson title + actions */}
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <h1 className="text-xl font-bold text-gray-900 mb-1">{current.item.title}</h1>
                <p className="text-sm text-gray-500">
                  Module {current.moduleIndex + 1}: {current.moduleTitle}
                </p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={toggleSave}
                  className={`flex items-center gap-1.5 border rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                    saved.has(currentIndex)
                      ? "border-primary-200 bg-primary-50 text-primary-600"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${saved.has(currentIndex) ? "fill-primary-600" : ""}`} />
                  {saved.has(currentIndex) ? "Saved" : "Save"}
                </button>
                <button className="w-9 h-9 border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-100 mb-5">
              <div className="flex gap-0">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab
                        ? "border-primary-600 text-primary-600"
                        : "border-transparent text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab content */}
            {activeTab === "Overview" && (
              <div className="prose prose-sm prose-gray max-w-none">
                <p className="text-gray-700 leading-relaxed mb-4">{course.longDesc}</p>
                {course.outcomes.length > 0 && (
                  <>
                    <h3 className="font-bold text-gray-900 text-base mb-3">What you'll learn</h3>
                    <ul className="space-y-2 mb-4">
                      {course.outcomes.map((o) => (
                        <li key={o} className="flex items-start gap-2 text-gray-700 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          {o}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
                <div className="bg-primary-50 border border-primary-100 rounded-xl p-4">
                  <p className="text-sm text-primary-700 font-medium mb-1">About this module</p>
                  <p className="text-sm text-primary-600">{current.moduleTitle}</p>
                </div>
              </div>
            )}

            {activeTab === "Notes" && (
              <div>
                <p className="text-sm text-gray-500 mb-3">
                  Your notes for <span className="font-medium text-gray-700">{current.item.title}</span>
                </p>
                <textarea
                  value={notes}
                  onChange={(e) => handleNotesChange(e.target.value)}
                  rows={12}
                  placeholder="Write your notes here… (e.g. key case laws, important sections, mnemonics)"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-600/20 focus:border-primary-600 resize-none leading-relaxed"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">{notes.length} characters</span>
                  <span className={`text-xs font-medium flex items-center gap-1 transition-colors ${
                    noteSaving === "saving" ? "text-amber-500"
                    : noteSaving === "saved" ? "text-emerald-600"
                    : "text-gray-400"
                  }`}>
                    <StickyNote className="w-3.5 h-3.5" />
                    {noteSaving === "saving" ? "Saving…" : noteSaving === "saved" ? "Saved ✓" : "Auto-saved"}
                  </span>
                </div>
              </div>
            )}

            {activeTab === "Resources" && (
              <div className="space-y-3">
                <p className="text-sm text-gray-500 mb-4">Study materials for this lesson</p>
                {[
                  { icon: FileText, label: "Lecture Notes PDF", size: "2.4 MB", type: "PDF" },
                  { icon: FileText, label: "Bare Act Reference Sheet", size: "1.1 MB", type: "PDF" },
                  { icon: FileText, label: "Case Law Summary", size: "890 KB", type: "PDF" },
                  { icon: Download, label: "Practice Questions", size: "540 KB", type: "DOCX" },
                ].map((file) => (
                  <div
                    key={file.label}
                    className="flex items-center justify-between gap-3 border border-gray-100 rounded-xl px-4 py-3 hover:border-primary-200 hover:bg-primary-50/30 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100">
                        <file.icon className="w-4 h-4 text-gray-500 group-hover:text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{file.label}</p>
                        <p className="text-xs text-gray-400">{file.type} · {file.size}</p>
                      </div>
                    </div>
                    <button className="flex items-center gap-1.5 text-xs font-medium text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Download className="w-3.5 h-3.5" /> Download
                    </button>
                  </div>
                ))}

                <div className="mt-4 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                  <p className="text-xs text-amber-700 font-medium">
                    Resources are added as the course progresses. Check back after each module.
                  </p>
                </div>
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
