"use client";

import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import type { Course, CourseModuleItem } from "@/lib/courses";
import {
  ChevronRight, ChevronLeft, Play, Pause, BookOpen,
  Clock, Bookmark, MoreHorizontal, CheckCircle2,
  FileText, StickyNote, Maximize2, Minimize2,
  Check, Settings, Volume2, VolumeX, Eye, RotateCcw, RotateCw,
} from "lucide-react";
import dynamic from "next/dynamic";

const PdfViewer = dynamic(() => import("@/components/PdfViewer"), { ssr: false });

// Lectures are recorded in Hindi: YouTube's auto-generated Hindi captions are the source
// track, machine-translated by YouTube into the other languages. Translation only works
// when this matches the video's spoken language.
const CAPTION_SOURCE_LANG = "hi";
const CAPTION_LANGUAGES = [
  { code: "hi", label: "Hindi", native: "हिन्दी" },
  { code: "en", label: "English", native: "English" },
  { code: "bn", label: "Bengali", native: "বাংলা" },
  { code: "ta", label: "Tamil", native: "தமிழ்" },
  { code: "te", label: "Telugu", native: "తెలుగు" },
  { code: "mr", label: "Marathi", native: "मराठी" },
  { code: "gu", label: "Gujarati", native: "ગુજરાતી" },
  { code: "kn", label: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml", label: "Malayalam", native: "മലയാളം" },
  { code: "pa", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "or", label: "Odia", native: "ଓଡ଼ିଆ" },
  { code: "ur", label: "Urdu", native: "اردو" },
  { code: "as", label: "Assamese", native: "অসমীয়া" },
];
const CAPTION_LANG_KEY = "tlp-caption-lang";

const SKIP_SECONDS = 10;

/** Back/forward 10s control: a circular arrow with "10" inside. */
function SkipButton({ dir, onClick, small }: { dir: -1 | 1; onClick: () => void; small?: boolean }) {
  const Icon = dir < 0 ? RotateCcw : RotateCw;
  return (
    <button
      onClick={onClick}
      title={dir < 0 ? `Back ${SKIP_SECONDS} seconds (←)` : `Forward ${SKIP_SECONDS} seconds (→)`}
      aria-label={dir < 0 ? `Back ${SKIP_SECONDS} seconds` : `Forward ${SKIP_SECONDS} seconds`}
      className={`relative flex items-center justify-center text-white hover:text-gray-300 transition-colors ${small ? "w-5 h-5 sm:w-8 sm:h-8" : "w-8 h-8"}`}
    >
      <Icon className={small ? "w-3.5 h-3.5 sm:w-5 sm:h-5" : "w-5 h-5"} strokeWidth={1.75} />
      <span className={`absolute font-bold leading-none select-none ${small ? "text-[5px] sm:text-[7px]" : "text-[7px]"}`}>{SKIP_SECONDS}</span>
    </button>
  );
}

/**
 * While paused, the iframe is 3x the visible height: YouTube letterboxes the video in the
 * middle third (the part we show) and its pause overlays — title bar at the top, "More
 * videos" shelf and logo at the bottom — land in the cropped-off thirds, so the paused frame
 * stays readable for note-taking. While playing it's normal size, because captions are also
 * drawn at the bottom of the iframe and would otherwise be cropped away. With captions on,
 * the iframe stops short of our always-visible controls bar so captions sit above it.
 * pointer-events:none so hover never triggers YouTube UI.
 */
function setYtCrop(iframe: HTMLIFrameElement | undefined, cropped: boolean, captionsOn = false) {
  if (!iframe) return;
  iframe.style.cssText = "position:absolute;left:0;width:100%;border:0;pointer-events:none;" +
    (cropped ? "top:-100%;height:300%;" : captionsOn ? "top:0;height:88%;" : "top:0;height:100%;");
}

/** Shows captions in `code` (translated from the source track when needed), or hides them for null. */
function applyYtCaptions(p: any, code: string | null) {
  try {
    if (!code) {
      p.setOption?.("captions", "track", {});
      p.unloadModule?.("captions");
      return;
    }
    const track = code === CAPTION_SOURCE_LANG
      ? { languageCode: code }
      : { languageCode: CAPTION_SOURCE_LANG, translationLanguage: { languageCode: code } };
    p.loadModule?.("captions");
    p.setOption?.("captions", "track", track);
    // The captions module loads asynchronously; set the track again once it's ready.
    setTimeout(() => { try { p.setOption?.("captions", "track", track); } catch { /* player gone */ } }, 1000);
  } catch { /* ignore */ }
}

const formatTime = (s: number) => {
  if (!isFinite(s) || isNaN(s)) return "0:00";
  const m = Math.floor(s / 60);
  return `${m}:${Math.floor(s % 60).toString().padStart(2, "0")}`;
};

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
type Tab = "Overview" | "Notes" | "Resources" | "Content";

export default function CourseLearning({
  course,
  candidateName,
}: {
  course: Course;
  candidateName: string;
}) {
  const lessons = useMemo(() => buildLessons(course), [course]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPart, setCurrentPart] = useState(0);
  const [viewingResource, setViewingResource] = useState<{ title: string; path: string } | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [allNotes, setAllNotes] = useState<Record<string, string>>({});
  const [noteSaving, setNoteSaving] = useState<"idle" | "saving" | "saved">("idle");
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [videoQuality, setVideoQuality] = useState("Auto");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settingsView, setSettingsView] = useState<"main" | "speed" | "quality" | "captions">("main");
  const settingsBtnRef = useRef<HTMLButtonElement>(null);
  const settingsPanelRef = useRef<HTMLDivElement>(null);
  const [ytStarted, setYtStarted] = useState(false); // tracks if YT video has been played at least once
  // YouTube shows its own branded title/share/watch-later overlay (with logo) for a few
  // seconds the first time a video starts — unremovable via player params. We keep our
  // own opaque cover up for a moment after first play to hide it.
  const [ytBrandingGuard, setYtBrandingGuard] = useState(false);
  // The end screen (suggested videos) fills the whole player, so it stays hidden.
  const [ytEnded, setYtEnded] = useState(false);
  const ytBrandingGuardTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Selected caption language (null = off); kept across lessons and remembered per browser.
  const [captionLang, setCaptionLang] = useState<string | null>(null);
  const captionLangRef = useRef<string | null>(null); // mirrors captionLang for use inside stable player-event closures
  // Fetched on-demand from /api/lesson-video — never stored in the course prop
  const [fetchedVideoUrl, setFetchedVideoUrl] = useState<string | null>(null);
  const [fetchedQualities, setFetchedQualities] = useState<Record<string, string> | null>(null);

  // YouTube IFrame API refs
  interface YTPlayer {
    playVideo(): void; pauseVideo(): void;
    seekTo(s: number, allowSeekAhead: boolean): void;
    getCurrentTime(): number; getDuration(): number;
    mute(): void; unMute(): void; isMuted(): boolean;
    setPlaybackRate(r: number): void; destroy(): void;
    getIframe(): HTMLIFrameElement;
  }
  const ytRef = useRef<YTPlayer | null>(null);
  const ytDivRef = useRef<HTMLDivElement>(null);
  const ytTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const currentLesson = lessons[currentIndex];

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

  // Reset quality, playback state, and close settings when switching lessons; speed persists
  useEffect(() => {
    setVideoQuality("Auto");
    setSettingsOpen(false);
    setIsPlaying(false);
    setCurrentTime(0);
    setDuration(0);
    setCurrentPart(0);
  }, [currentIndex]);

  // Re-apply playback speed and capture duration when video metadata loads
  const handleVideoLoaded = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.playbackRate = playbackSpeed;
    setDuration(v.duration || 0);
  }, [playbackSpeed]);

  // Close settings panel on outside click
  useEffect(() => {
    const close = (e: MouseEvent) => {
      const inBtn = settingsBtnRef.current?.contains(e.target as Node);
      const inPanel = settingsPanelRef.current?.contains(e.target as Node);
      if (!inBtn && !inPanel) setSettingsOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

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

  // Resolve active video source — supports multi-part lessons
  // Parts array is kept (labels only, no URLs) to render part-tab buttons
  const activeParts = current?.item?.parts?.length ? current.item.parts : null;

  const [videoFetching, setVideoFetching] = useState(false);

  // Fetch the actual video URL securely from the server on each lesson/part change.
  // Fetch for ALL lessons regardless of content_type — if the DB has a video URL for
  // a lesson marked "reading", it should still play (admin may have added URL later).
  useEffect(() => {
    if (!current) {
      setFetchedVideoUrl(null);
      setFetchedQualities(null);
      setVideoFetching(false);
      return;
    }
    setFetchedVideoUrl(null);
    setFetchedQualities(null);
    setVideoFetching(true);
    const params = new URLSearchParams({
      courseSlug: course.slug,
      moduleIndex: String(current.moduleIndex),
      lessonIndex: String(current.lessonIndex),
      partIndex: String(currentPart),
    });
    fetch(`/api/lesson-video?${params}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        setFetchedVideoUrl(data?.video_url ?? null);
        setFetchedQualities(data?.video_qualities ?? null);
        setVideoFetching(false);
      })
      .catch(() => { setVideoFetching(false); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current?.moduleIndex, current?.lessonIndex, currentPart]);

  const activeVideoUrl = fetchedVideoUrl;
  const activeQualities = fetchedQualities;

  // Detect YouTube links and build embed URL
  function getYouTubeEmbedUrl(url: string): string | null {
    const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/);
    return m ? `https://www.youtube.com/embed/${m[1]}?rel=0&modestbranding=1` : null;
  }
  const isYouTube = !!activeVideoUrl && /youtube\.com|youtu\.be/.test(activeVideoUrl);
  const youtubeEmbedUrl = isYouTube && activeVideoUrl ? getYouTubeEmbedUrl(activeVideoUrl) : null;

  // Load the YouTube IFrame API script once
  useEffect(() => {
    if (typeof window === "undefined" || (window as any).YT?.Player) return;
    if (document.querySelector('script[src*="youtube.com/iframe_api"]')) return;
    const tag = document.createElement("script");
    tag.src = "https://www.youtube.com/iframe_api";
    document.head.appendChild(tag);
  }, []);

  // Initialize / destroy YT.Player whenever the active video changes to/from YouTube
  useEffect(() => {
    if (!isYouTube || !ytDivRef.current) return;
    const videoId = activeVideoUrl?.match(
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/
    )?.[1];
    if (!videoId) return;

    setYtStarted(false); // reset on every new video
    setYtEnded(false);
    setYtBrandingGuard(false);
    if (ytBrandingGuardTimerRef.current) { clearTimeout(ytBrandingGuardTimerRef.current); ytBrandingGuardTimerRef.current = null; }
    let hasStartedOnce = false;

    const container = ytDivRef.current;
    let player: YTPlayer | null = null;

    const init = () => {
      if (!container) return;
      // Always start with a fresh mount element (YT replaces the element it receives)
      container.innerHTML = "";
      const mountEl = document.createElement("div");
      mountEl.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;";
      container.appendChild(mountEl);

      player = new (window as any).YT.Player(mountEl, {
        videoId,
        playerVars: {
          controls: 0, rel: 0, modestbranding: 1,
          iv_load_policy: 3, showinfo: 0, disablekb: 1,
          fs: 0, playsinline: 1, cc_load_policy: 0,
          origin: typeof window !== "undefined" ? window.location.origin : "",
        },
        events: {
          onReady: (e: any) => {
            ytRef.current = e.target as YTPlayer;
            setYtCrop(e.target.getIframe?.(), true);
            // Apply the viewer's chosen caption language, or force captions off:
            // cc_load_policy:0 can still be overridden by a browser/OS-level
            // "always show captions" preference.
            applyYtCaptions(e.target, captionLangRef.current);
            const d = e.target.getDuration?.() || 0;
            if (d > 0) setDuration(d);
          },
          // The captions module can finish loading asynchronously (after onReady) and
          // silently re-enable a track from the viewer's saved YouTube preference.
          // Force it off every time modules change, unless the user turned it on via our toggle.
          onApiChange: (e: any) => {
            if (!captionLangRef.current) {
              try { e.target.setOption?.("captions", "track", {}); } catch { /* ignore */ }
            }
          },
          onStateChange: (e: any) => {
            const S = { PLAYING: 1, PAUSED: 2, ENDED: 0 };
            setYtCrop(e.target.getIframe?.(), e.data !== S.PLAYING, !!captionLangRef.current);
            if (e.data === S.PLAYING) {
              setIsPlaying(true);
              setYtStarted(true);
              setYtEnded(false);
              if (!hasStartedOnce) {
                hasStartedOnce = true;
                // A track set before playback starts is ignored; set the chosen language again.
                if (captionLangRef.current) applyYtCaptions(e.target, captionLangRef.current);
                setYtBrandingGuard(true);
                if (ytBrandingGuardTimerRef.current) clearTimeout(ytBrandingGuardTimerRef.current);
                ytBrandingGuardTimerRef.current = setTimeout(() => setYtBrandingGuard(false), 3500);
              }
              if (ytTimerRef.current) clearInterval(ytTimerRef.current);
              ytTimerRef.current = setInterval(() => {
                if (!ytRef.current) return;
                setCurrentTime(ytRef.current.getCurrentTime?.() || 0);
                const d = ytRef.current.getDuration?.() || 0;
                if (d > 0) setDuration(d);
              }, 250);
            } else {
              setIsPlaying(false);
              if (ytTimerRef.current) { clearInterval(ytTimerRef.current); ytTimerRef.current = null; }
              if (e.data === S.PAUSED || e.data === S.ENDED) {
                setCurrentTime(ytRef.current?.getCurrentTime?.() || 0);
              }
              if (e.data === S.ENDED) setYtEnded(true);
            }
          },
        },
      });
    };

    if ((window as any).YT?.Player) { init(); }
    else { (window as any).onYouTubeIframeAPIReady = init; }

    return () => {
      if (ytTimerRef.current) { clearInterval(ytTimerRef.current); ytTimerRef.current = null; }
      if (ytBrandingGuardTimerRef.current) { clearTimeout(ytBrandingGuardTimerRef.current); ytBrandingGuardTimerRef.current = null; }
      ytRef.current = null;
      try { player?.destroy(); } catch { /* ignore */ }
      player = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isYouTube, activeVideoUrl]);

  // Restore the viewer's last caption language (browser storage can be unavailable).
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CAPTION_LANG_KEY);
      if (saved && CAPTION_LANGUAGES.some((l) => l.code === saved)) {
        captionLangRef.current = saved;
        setCaptionLang(saved);
        if (ytRef.current) applyYtCaptions(ytRef.current, saved);
      }
    } catch { /* ignore */ }
  }, []);

  const selectYtCaptions = (code: string | null) => {
    captionLangRef.current = code;
    setCaptionLang(code);
    setSettingsOpen(false);
    try {
      if (code) localStorage.setItem(CAPTION_LANG_KEY, code);
      else localStorage.removeItem(CAPTION_LANG_KEY);
    } catch { /* ignore */ }
    if (ytRef.current) {
      applyYtCaptions(ytRef.current, code);
      setYtCrop(ytRef.current.getIframe?.(), !isPlaying, !!code);
    }
  };

  const captionLabel = CAPTION_LANGUAGES.find((l) => l.code === captionLang)?.label ?? "Off";

  // ── Skip back / forward ─────────────────────────────────
  const [skipFlash, setSkipFlash] = useState<{ delta: number; id: number } | null>(null);
  const skipFlashTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const skipBy = useCallback((delta: number) => {
    let t: number | null = null;
    if (isYouTube) {
      const p = ytRef.current;
      // Seeking an unstarted YouTube player starts it, so only skip once it has played.
      if (!p || !ytStarted) return;
      const d = p.getDuration?.() || duration;
      t = Math.max(0, Math.min((p.getCurrentTime?.() || 0) + delta, d > 1 ? d - 1 : d));
      p.seekTo(t, true);
    } else if (videoRef.current) {
      const v = videoRef.current;
      t = Math.max(0, Math.min(v.currentTime + delta, v.duration || v.currentTime + delta));
      v.currentTime = t;
    }
    if (t === null) return;
    setCurrentTime(t);
    setSkipFlash({ delta, id: Date.now() });
    if (skipFlashTimerRef.current) clearTimeout(skipFlashTimerRef.current);
    skipFlashTimerRef.current = setTimeout(() => setSkipFlash(null), 700);
  }, [isYouTube, ytStarted, duration]);

  // ← / → skip 10s, unless the viewer is typing (e.g. in Notes).
  useEffect(() => {
    if (!activeVideoUrl) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "ArrowLeft" && e.key !== "ArrowRight") return;
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
      const el = e.target as HTMLElement | null;
      if (el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName))) return;
      e.preventDefault();
      skipBy(e.key === "ArrowLeft" ? -SKIP_SECONDS : SKIP_SECONDS);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [activeVideoUrl, skipBy]);

  useEffect(() => () => { if (skipFlashTimerRef.current) clearTimeout(skipFlashTimerRef.current); }, []);

  const skipFlashBadge = skipFlash && (
    <div key={skipFlash.id} className="absolute inset-0 z-[16] flex items-center justify-center pointer-events-none">
      <span className="bg-black/60 text-white text-sm font-semibold px-3 py-1.5 rounded-full animate-in fade-in zoom-in-95">
        {skipFlash.delta < 0 ? `−${SKIP_SECONDS}s` : `+${SKIP_SECONDS}s`}
      </span>
    </div>
  );

  // Build sorted quality options: [["360p", "url"], ["720p", "url"], ...]
  // Guard against malformed JSONB values (e.g. a plain string instead of an object)
  const qualityOptions = useMemo(() => {
    const q = activeQualities;
    if (!q || typeof q !== "object" || Array.isArray(q) || Object.keys(q).length === 0) return null;
    return Object.entries(q).sort(([a], [b]) => parseInt(a) - parseInt(b));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current, currentPart]);

  // Switch video to a different quality URL without losing playback position
  const switchQuality = useCallback((label: string, url: string) => {
    setVideoQuality(label);
    setSettingsOpen(false);
    const video = videoRef.current;
    if (!video) return;
    const t = video.currentTime;
    const playing = !video.paused;
    video.src = url;
    video.load();
    video.addEventListener("loadedmetadata", () => {
      video.currentTime = t;
      video.playbackRate = playbackSpeed;
      if (playing) video.play().catch(() => {});
    }, { once: true });
  }, [playbackSpeed]);

  // YouTube frame is shown while playing and while paused (for note-taking); hidden before
  // first play, during the start-up branding overlay, and on the end screen.
  const ytFrameVisible = ytStarted && !ytEnded && !ytBrandingGuard;

  if (!current) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">No lessons available yet.</p>
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Top bar ───────────────────────────────────────── */}
      <header className="h-14 border-b border-gray-100 flex items-center justify-between px-4 sm:px-6 bg-white sticky top-0 z-30 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/course" className="flex items-center gap-1.5 flex-shrink-0">
            <img src="/lightmodelogotlp.png" alt="The Law Project" className="h-7 w-auto object-contain" />
            <span className="text-sm font-bold text-gray-900">The Law Project</span>
          </Link>

          <span className="text-gray-300 hidden sm:block">/</span>

          {/* Breadcrumb — desktop only */}
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

        {/* Desktop prev/next */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
            disabled={!canPrev}
            className="flex items-center gap-1 border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
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
        </div>
      </header>

      <div className="flex flex-1 min-h-0 relative">
        {/* ── Sidebar ───────────────────────────────────────── */}
        <aside
          // Pinned under the 3.5rem header at viewport height, so the lesson list scrolls on its own.
          className="hidden sm:flex sm:sticky sm:top-14 sm:self-start sm:h-[calc(100dvh-3.5rem)] sm:w-64 lg:w-72 flex-shrink-0 bg-white border-r border-gray-100 flex-col"
        >
          {/* Sidebar header */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 flex-shrink-0">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Course Content</p>
          </div>

          {/* Lesson list */}
          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain py-2">
            {course.modules.map((mod, mi) => {
              const moduleLessons = lessons.filter((l) => l.moduleIndex === mi);
              return (
                <div key={mi} className="mb-1">
                  <p className="px-4 pt-3 pb-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                    Module {mi + 1} · {mod.title}
                  </p>
                  {moduleLessons.map((lesson) => {
                    const isActive = lesson.globalIndex === currentIndex;
                    return (
                      <button
                        key={lesson.globalIndex}
                        onClick={() => { setCurrentIndex(lesson.globalIndex); setActiveTab("Overview"); }}
                        className={`w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors ${
                          isActive
                            ? "bg-primary-50 border-r-2 border-primary-600"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isActive ? "bg-primary-100" : "bg-gray-100"
                        }`}>
                          {lesson.type === "video" ? (
                            <Play className={`w-2.5 h-2.5 ${isActive ? "text-primary-600" : "text-gray-400"}`} />
                          ) : (
                            <BookOpen className={`w-2.5 h-2.5 ${isActive ? "text-primary-600" : "text-gray-400"}`} />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className={`text-xs font-medium leading-snug truncate ${
                            isActive ? "text-primary-700" : "text-gray-800"
                          }`}>
                            {lesson.item.title}
                          </p>
                          {lesson.item.duration && (
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                                <Clock className="w-2.5 h-2.5" /> {lesson.item.duration}
                              </span>
                            </div>
                          )}
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
          <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 pb-24 sm:pb-6">

            {/* Part tabs — shown when lesson has multiple video parts */}
            {activeParts && activeParts.length > 1 && (
              <div className="flex gap-2 mb-3 flex-wrap">
                {activeParts.map((part, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrentPart(i); setIsPlaying(false); setCurrentTime(0); setDuration(0); setVideoQuality("Auto"); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      currentPart === i
                        ? "bg-primary-600 text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {part.label || `Part ${i + 1}`}
                  </button>
                ))}
              </div>
            )}

            {/* Video player or placeholder */}
            {activeVideoUrl ? (
              youtubeEmbedUrl ? (
                /* ── YouTube custom player (IFrame API, controls=0) ── */
                <div
                  ref={videoContainerRef}
                  className="tlp-video-wrapper rounded-2xl overflow-hidden bg-black mb-5 w-full relative group/player"
                  onContextMenu={(e) => e.preventDefault()}
                >
                  {/* padding-bottom trick gives reliable 16:9 height; opacity hides YT UI when not playing */}
                  <div
                    ref={ytDivRef}
                    className="w-full"
                    style={isFullscreen
                      // Largest 16:9 box that fits the screen, centred — the iframe crop needs a 16:9 window.
                      ? { position: "relative", overflow: "hidden", width: "min(100vw, 177.78vh)", height: "min(56.25vw, 100vh)", margin: "0 auto", top: "calc((100vh - min(56.25vw, 100vh)) / 2)", opacity: ytFrameVisible ? 1 : 0, transition: "opacity 0.15s" }
                      : { position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", opacity: ytFrameVisible ? 1 : 0, transition: "opacity 0.15s" }
                    }
                  />

                  {/* Before first play: solid black so YouTube thumbnail+branding are invisible */}
                  {!isPlaying && !ytStarted && (
                    <div
                      className="absolute inset-0 flex items-center justify-center cursor-pointer"
                      style={{ background: "#000", zIndex: 15 }}
                      onClick={() => ytRef.current?.playVideo()}
                    >
                      <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center border-2 border-white/50 hover:bg-white/30 transition-colors">
                        <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                  )}

                  {/* After first play, when paused: no dim, so the paused frame stays readable for notes.
                      Stops above the controls bar so its buttons stay clickable. */}
                  {!isPlaying && ytStarted && (
                    <div
                      className="absolute inset-0 flex items-center justify-center cursor-pointer group/resume"
                      style={{ background: ytEnded ? "#000" : "transparent", bottom: ytEnded ? 0 : "52px", zIndex: 15 }}
                      onClick={() => ytRef.current?.playVideo()}
                    >
                      <div className="w-14 h-14 bg-black/40 rounded-full flex items-center justify-center border-2 border-white/50 opacity-60 group-hover/resume:opacity-100 transition-opacity">
                        <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                      </div>
                    </div>
                  )}

                  {/* Click-to-pause during playback (iframe has pointer-events:none so we need this) */}
                  {isPlaying && (
                    <div
                      className="absolute inset-0 cursor-pointer"
                      style={{ bottom: "52px", zIndex: 5 }}
                      onClick={() => ytRef.current?.pauseVideo()}
                    />
                  )}

                  {skipFlashBadge}

                  {/* Dynamic watermark */}
                  {/* Watermark — shown whenever the video frame is visible, paused included */}
                  {ytFrameVisible && (
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
                      The Law Project
                    </div>
                  )}

                  {/* Settings panel — speed only for YouTube */}
                  {settingsOpen && (
                    <div
                      ref={settingsPanelRef}
                      className="absolute bottom-14 right-2 z-30 bg-gray-900/95 backdrop-blur-sm rounded-xl overflow-hidden min-w-[220px] shadow-xl text-white"
                    >
                      {settingsView === "main" && (
                        <>
                          <button onClick={() => setSettingsView("captions")} className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/10 transition-colors border-b border-white/10">
                            <span className="text-xs text-gray-400 font-medium">Captions</span>
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-medium ${captionLang ? "text-white" : "text-gray-500"}`}>{captionLabel}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                            </div>
                          </button>
                          <button onClick={() => setSettingsView("speed")} className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/10 transition-colors">
                            <span className="text-xs text-gray-400 font-medium">Speed</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-white">{playbackSpeed === 1 ? "Normal" : `${playbackSpeed}×`}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                            </div>
                          </button>
                        </>
                      )}
                      {settingsView === "speed" && (
                        <>
                          <button onClick={() => setSettingsView("main")} className="w-full flex items-center gap-2 px-4 py-2 hover:bg-white/10 transition-colors border-b border-white/10">
                            <ChevronLeft className="w-4 h-4 text-gray-400" /><span className="text-sm font-medium">Speed</span>
                          </button>
                          {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((s) => (
                            <button key={s} onClick={() => {
                              setPlaybackSpeed(s);
                              ytRef.current?.setPlaybackRate(s);
                              setSettingsOpen(false);
                            }} className="w-full flex items-center gap-3 px-4 py-1.5 hover:bg-white/10 transition-colors">
                              <Check className={`w-3.5 h-3.5 flex-shrink-0 ${playbackSpeed === s ? "text-white" : "text-transparent"}`} />
                              <span className={`text-sm ${playbackSpeed === s ? "text-white font-medium" : "text-gray-300"}`}>{s === 1 ? "Normal" : `${s}×`}</span>
                            </button>
                          ))}
                        </>
                      )}
                      {settingsView === "captions" && (
                        <>
                          <button onClick={() => setSettingsView("main")} className="w-full flex items-center gap-2 px-4 py-2 hover:bg-white/10 transition-colors border-b border-white/10">
                            <ChevronLeft className="w-4 h-4 text-gray-400" /><span className="text-sm font-medium">Captions</span>
                          </button>
                          <div className="max-h-56 overflow-y-auto overscroll-contain py-1">
                            {[{ code: null, label: "Off", native: "" }, ...CAPTION_LANGUAGES].map((l) => (
                              <button key={l.code ?? "off"} onClick={() => selectYtCaptions(l.code)} className="w-full flex items-center gap-3 px-4 py-1.5 hover:bg-white/10 transition-colors">
                                <Check className={`w-3.5 h-3.5 flex-shrink-0 ${captionLang === l.code ? "text-white" : "text-transparent"}`} />
                                <span className={`text-sm ${captionLang === l.code ? "text-white font-medium" : "text-gray-300"}`}>{l.label}</span>
                                {l.native && l.native !== l.label && <span className="text-xs text-gray-500 ml-auto">{l.native}</span>}
                              </button>
                            ))}
                          </div>
                          <p className="px-4 py-2 text-[10px] text-gray-500 border-t border-white/10">Auto-generated · other languages are auto-translated</p>
                        </>
                      )}
                    </div>
                  )}

                  {/* Custom controls bar — thin mobile, half tablet, full desktop; always full in fullscreen */}
                  <div className={`absolute bottom-0 left-0 right-0 z-20 px-2 sm:px-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent ${isFullscreen ? "pt-8 pb-2" : "pt-2 pb-1 md:pt-2 md:pb-1 lg:pt-8 lg:pb-2"}`}>
                    <input
                      type="range" min={0} max={duration || 100} step={0.1} value={currentTime}
                      onChange={(e) => { const t = Number(e.target.value); ytRef.current?.seekTo(t, true); setCurrentTime(t); }}
                      className="w-full h-0.5 mb-1 sm:h-1 sm:mb-2 cursor-pointer accent-primary-500"
                    />
                    <div className="flex items-center gap-0.5 sm:gap-1">
                      <button onClick={() => { if (isPlaying) ytRef.current?.pauseVideo(); else ytRef.current?.playVideo(); }}
                        className="w-5 h-5 sm:w-8 sm:h-8 flex items-center justify-center text-white hover:text-gray-300 transition-colors">
                        {isPlaying ? <Pause className="w-3 h-3 sm:w-4 sm:h-4 fill-white" /> : <Play className="w-3 h-3 sm:w-4 sm:h-4 fill-white ml-0.5" />}
                      </button>
                      <SkipButton dir={-1} small onClick={() => skipBy(-SKIP_SECONDS)} />
                      <SkipButton dir={1} small onClick={() => skipBy(SKIP_SECONDS)} />
                      <span className="text-[9px] sm:text-[11px] text-white/80 font-mono select-none whitespace-nowrap px-1">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                      <div className="flex-1" />
                      <button onClick={() => { if (isMuted) { ytRef.current?.unMute(); setIsMuted(false); } else { ytRef.current?.mute(); setIsMuted(true); } }}
                        className="w-5 h-5 sm:w-8 sm:h-8 flex items-center justify-center text-white hover:text-gray-300 transition-colors">
                        {isMuted ? <VolumeX className="w-3 h-3 sm:w-4 sm:h-4" /> : <Volume2 className="w-3 h-3 sm:w-4 sm:h-4" />}
                      </button>
                      <button ref={settingsBtnRef} onClick={() => { setSettingsOpen((v) => !v); setSettingsView("main"); }}
                        className="w-5 h-5 sm:w-8 sm:h-8 flex items-center justify-center text-white hover:text-gray-300 transition-colors">
                        <Settings className="w-3 h-3 sm:w-4 sm:h-4" />
                      </button>
                      <button onClick={() => { const el = videoContainerRef.current as HTMLDivElement & { webkitRequestFullscreen?: () => Promise<void> }; if (!el) return; if (document.fullscreenElement) document.exitFullscreen().catch(() => {}); else (el.requestFullscreen?.() ?? el.webkitRequestFullscreen?.())?.catch(() => {}); }}
                        className="w-5 h-5 sm:w-8 sm:h-8 flex items-center justify-center text-white hover:text-gray-300 transition-colors">
                        {isFullscreen ? <Minimize2 className="w-3 h-3 sm:w-4 sm:h-4" /> : <Maximize2 className="w-3 h-3 sm:w-4 sm:h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
              /* ── Real HTML5 video — custom controls ── */
              <div
                ref={videoContainerRef}
                className="tlp-video-wrapper rounded-2xl overflow-hidden bg-black mb-5 w-full relative group/player"
                onContextMenu={(e) => e.preventDefault()}
              >
                <video
                  ref={videoRef}
                  key={activeVideoUrl}
                  src={activeVideoUrl}
                  autoPlay={false}
                  className="w-full block"
                  style={
                    isFullscreen
                      ? { width: "100vw", height: "100vh", objectFit: "contain", maxHeight: "none" }
                      : { maxHeight: "60vh" }
                  }
                  disablePictureInPicture
                  onContextMenu={(e) => e.preventDefault()}
                  onLoadedMetadata={handleVideoLoaded}
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                  onEnded={() => setIsPlaying(false)}
                  onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime ?? 0)}
                  onVolumeChange={() => setIsMuted(videoRef.current?.muted ?? false)}
                  onClick={() => {
                    if (!videoRef.current) return;
                    if (videoRef.current.paused) videoRef.current.play().catch(() => {});
                    else videoRef.current.pause();
                  }}
                />

                {skipFlashBadge}

                  {/* Dynamic watermark */}
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
                  The Law Project
                </div>

                {/* Settings panel — anchored above controls bar, inside container */}
                {settingsOpen && (
                  <div
                    ref={settingsPanelRef}
                    className="absolute bottom-14 right-2 z-30 bg-gray-900/95 backdrop-blur-sm rounded-xl overflow-hidden min-w-[220px] shadow-xl text-white"
                  >
                    {settingsView === "main" && (
                      <>
                        {qualityOptions && (
                          <button onClick={() => setSettingsView("quality")} className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/10 transition-colors border-b border-white/10">
                            <span className="text-xs text-gray-400 font-medium">Video Quality</span>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-white">{videoQuality}</span>
                              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                            </div>
                          </button>
                        )}
                        <button onClick={() => setSettingsView("speed")} className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/10 transition-colors">
                          <span className="text-xs text-gray-400 font-medium">Speed</span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-white">{playbackSpeed === 1 ? "Normal" : `${playbackSpeed}×`}</span>
                            <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
                          </div>
                        </button>
                      </>
                    )}
                    {settingsView === "speed" && (
                      <>
                        <button onClick={() => setSettingsView("main")} className="w-full flex items-center gap-2 px-4 py-2 hover:bg-white/10 transition-colors border-b border-white/10">
                          <ChevronLeft className="w-4 h-4 text-gray-400" /><span className="text-sm font-medium">Speed</span>
                        </button>
                        {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.5, 3].map((s) => (
                          <button key={s} onClick={() => { setPlaybackSpeed(s); if (videoRef.current) videoRef.current.playbackRate = s; setSettingsOpen(false); }} className="w-full flex items-center gap-3 px-4 py-1.5 hover:bg-white/10 transition-colors">
                            <Check className={`w-3.5 h-3.5 flex-shrink-0 ${playbackSpeed === s ? "text-white" : "text-transparent"}`} />
                            <span className={`text-sm ${playbackSpeed === s ? "text-white font-medium" : "text-gray-300"}`}>{s === 1 ? "Normal" : `${s}×`}</span>
                          </button>
                        ))}
                      </>
                    )}
                    {settingsView === "quality" && qualityOptions && (
                      <>
                        <button onClick={() => setSettingsView("main")} className="w-full flex items-center gap-2 px-4 py-2 hover:bg-white/10 transition-colors border-b border-white/10">
                          <ChevronLeft className="w-4 h-4 text-gray-400" /><span className="text-sm font-medium">Quality</span>
                        </button>
                        <button onClick={() => activeVideoUrl && switchQuality("Auto", activeVideoUrl)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 transition-colors">
                          <Check className={`w-3.5 h-3.5 flex-shrink-0 ${videoQuality === "Auto" ? "text-white" : "text-transparent"}`} />
                          <span className={`text-sm ${videoQuality === "Auto" ? "text-white font-medium" : "text-gray-300"}`}>Auto</span>
                        </button>
                        {qualityOptions.map(([label, url]) => (
                          <button key={label} onClick={() => switchQuality(label, url)} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/10 transition-colors">
                            <Check className={`w-3.5 h-3.5 flex-shrink-0 ${videoQuality === label ? "text-white" : "text-transparent"}`} />
                            <span className={`text-sm ${videoQuality === label ? "text-white font-medium" : "text-gray-300"}`}>{label}</span>
                          </button>
                        ))}
                      </>
                    )}
                  </div>
                )}

                {/* Custom controls bar */}
                <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/90 via-black/50 to-transparent pt-8 pb-2 px-3">
                  {/* Progress / seek bar */}
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    step={0.1}
                    value={currentTime}
                    onChange={(e) => {
                      const t = Number(e.target.value);
                      if (videoRef.current) videoRef.current.currentTime = t;
                      setCurrentTime(t);
                    }}
                    className="w-full h-1 mb-2 cursor-pointer accent-primary-500"
                  />
                  {/* Buttons row */}
                  <div className="flex items-center gap-1">
                    {/* Play / Pause */}
                    <button
                      onClick={() => {
                        if (!videoRef.current) return;
                        if (videoRef.current.paused) videoRef.current.play().catch(() => {});
                        else videoRef.current.pause();
                      }}
                      className="w-8 h-8 flex items-center justify-center text-white hover:text-gray-300 transition-colors"
                    >
                      {isPlaying
                        ? <Pause className="w-4 h-4 fill-white" />
                        : <Play className="w-4 h-4 fill-white ml-0.5" />}
                    </button>
                    <SkipButton dir={-1} onClick={() => skipBy(-SKIP_SECONDS)} />
                    <SkipButton dir={1} onClick={() => skipBy(SKIP_SECONDS)} />

                    {/* Time */}
                    <span className="text-[11px] text-white/80 font-mono select-none whitespace-nowrap px-1">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>

                    <div className="flex-1" />

                    {/* Mute */}
                    <button
                      onClick={() => {
                        if (!videoRef.current) return;
                        videoRef.current.muted = !videoRef.current.muted;
                        setIsMuted(videoRef.current.muted);
                      }}
                      className="w-8 h-8 flex items-center justify-center text-white hover:text-gray-300 transition-colors"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    {/* Settings gear */}
                    <button
                      ref={settingsBtnRef}
                      onClick={() => { setSettingsOpen((v) => !v); setSettingsView("main"); }}
                      title="Settings"
                      className="w-8 h-8 flex items-center justify-center text-white hover:text-gray-300 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                    </button>

                    {/* Fullscreen */}
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
                      className="w-8 h-8 flex items-center justify-center text-white hover:text-gray-300 transition-colors"
                    >
                      {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
              )
            ) : videoFetching ? (
              /* ── Loading: plain black screen while API fetch is in-flight ── */
              <div className="rounded-2xl overflow-hidden bg-black mb-5 relative aspect-video" />
            ) : (
              /* ── Placeholder (confirmed no video_url) ── */
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
                    The Law Project
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
                {/* Content tab — mobile only */}
                <button
                  onClick={() => setActiveTab("Content")}
                  className={`sm:hidden px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === "Content"
                      ? "border-primary-600 text-primary-600"
                      : "border-transparent text-gray-500 hover:text-gray-800"
                  }`}
                >
                  Content
                </button>
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

                {(!current.item.resources || current.item.resources.length === 0) && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
                    <p className="text-xs text-amber-700 font-medium">
                      No resources for this lesson yet. Check back after each module.
                    </p>
                  </div>
                )}

                {current.item.resources?.map((res) => (
                  <div
                    key={res.path}
                    className="flex items-center justify-between gap-3 border border-gray-100 rounded-xl px-4 py-3 hover:border-primary-200 hover:bg-primary-50/30 transition-colors group"
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100">
                        <FileText className="w-4 h-4 text-gray-500 group-hover:text-primary-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-800 select-none">{res.title}</p>
                        <p className="text-xs text-gray-400 select-none">PDF · View only</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setViewingResource(res)}
                      className="flex items-center gap-1.5 text-xs font-medium text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Eye className="w-3.5 h-3.5" /> View
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Content tab — mobile only: inline lesson list */}
            {activeTab === "Content" && (
              <div className="sm:hidden">
                {/* Progress */}
                <div className="mb-4 px-1">
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
                {course.modules.map((mod, mi) => {
                  const moduleLessons = lessons.filter((l) => l.moduleIndex === mi);
                  return (
                    <div key={mi} className="mb-1">
                      <p className="px-1 pt-3 pb-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        Module {mi + 1} · {mod.title}
                      </p>
                      {moduleLessons.map((lesson) => {
                        const isActive = lesson.globalIndex === currentIndex;
                        const isDone = lesson.globalIndex < currentIndex;
                        return (
                          <button
                            key={lesson.globalIndex}
                            onClick={() => { setCurrentIndex(lesson.globalIndex); setActiveTab("Overview"); }}
                            className={`w-full flex items-start gap-3 px-2 py-2.5 rounded-xl text-left transition-colors ${
                              isActive ? "bg-primary-50 border border-primary-100" : "hover:bg-gray-50"
                            }`}
                          >
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              isDone ? "bg-emerald-100" : isActive ? "bg-primary-100" : "bg-gray-100"
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
                              {lesson.item.duration && (
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="flex items-center gap-0.5 text-[10px] text-gray-400">
                                    <Clock className="w-2.5 h-2.5" /> {lesson.item.duration}
                                  </span>
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </main>
      </div>

      {/* ── Fixed bottom nav — mobile only ─────────────────── */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-3 flex gap-2 z-30">
        <button
          onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={!canPrev}
          className="flex items-center justify-center gap-1.5 border border-gray-200 rounded-xl py-2.5 px-4 text-sm font-medium text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => setCurrentIndex((i) => Math.min(lessons.length - 1, i + 1))}
          disabled={!canNext}
          className="flex-1 flex items-center justify-center gap-1.5 bg-primary-600 text-white rounded-xl py-2.5 text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>

    {viewingResource && (
      <PdfViewer
        title={viewingResource.title}
        path={viewingResource.path}
        candidateName={candidateName}
        onClose={() => setViewingResource(null)}
      />
    )}
    </>
  );
}
