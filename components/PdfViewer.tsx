"use client";

import { useEffect, useRef, useState } from "react";
import { X, ChevronUp, ChevronDown, Loader2 } from "lucide-react";

interface Props {
  title: string;
  path: string;
  candidateName: string;
  onClose: () => void;
}

export default function PdfViewer({ title, path, candidateName, onClose }: Props) {
  const [pages, setPages] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageRefs = useRef<(HTMLImageElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        // Fetch 1-hour signed URL from our auth-protected API route
        const res = await fetch(`/api/course-resource?path=${encodeURIComponent(path)}`);
        const { url, error: urlError } = await res.json();
        if (urlError || !url) throw new Error(urlError ?? "Failed to load resource");

        // Dynamically import pdfjs to keep it out of the main bundle
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

        const pdf = await pdfjs.getDocument({ url, withCredentials: false }).promise;
        if (cancelled) return;

        setTotal(pdf.numPages);
        setLoading(false);

        const wm = (candidateName || "The Law Project").toUpperCase();

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          if (cancelled) break;
          const page = await pdf.getPage(pageNum);
          const vp = page.getViewport({ scale: 1.8 });
          const canvas = document.createElement("canvas");
          canvas.width = vp.width;
          canvas.height = vp.height;
          const ctx = canvas.getContext("2d")!;

          await page.render({ canvasContext: ctx, viewport: vp, canvas }).promise;

          // Tiled diagonal watermark
          ctx.save();
          ctx.globalAlpha = 0.07;
          const fontSize = Math.max(14, Math.floor(vp.width / 20));
          ctx.font = `bold ${fontSize}px sans-serif`;
          ctx.fillStyle = "#cc0000";
          for (let y = 0; y < vp.height + 300; y += 160) {
            for (let x = -300; x < vp.width + 300; x += 320) {
              ctx.save();
              ctx.translate(x, y);
              ctx.rotate(-Math.PI / 6);
              ctx.fillText(wm, 0, 0);
              ctx.restore();
            }
          }
          ctx.restore();

          if (!cancelled) {
            setPages((prev) => {
              const next = [...prev];
              next[pageNum - 1] = canvas.toDataURL("image/jpeg", 0.92);
              return next;
            });
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Failed to load PDF");
          setLoading(false);
        }
      }
    }

    render();
    return () => { cancelled = true; };
  }, [path, candidateName]);

  // Track which page is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = pageRefs.current.findIndex((r) => r === entry.target);
            if (idx >= 0) setCurrentPage(idx + 1);
          }
        }
      },
      { root: containerRef.current, threshold: 0.5 }
    );
    pageRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [pages]);

  // Lock body scroll while viewer is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const scrollToPage = (n: number) => {
    const el = pageRefs.current[n - 1];
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/90 flex flex-col"
      onContextMenu={(e) => e.preventDefault()}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-900 border-b border-white/10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-white truncate max-w-[260px]">{title}</span>
          {total > 0 && (
            <span className="text-xs text-gray-400 whitespace-nowrap">
              Page {currentPage} / {total}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {total > 1 && (
            <>
              <button
                onClick={() => scrollToPage(Math.max(1, currentPage - 1))}
                disabled={currentPage <= 1}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded-lg disabled:opacity-30 transition-colors"
              >
                <ChevronUp className="w-4 h-4" />
              </button>
              <button
                onClick={() => scrollToPage(Math.min(total, currentPage + 1))}
                disabled={currentPage >= total}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded-lg disabled:opacity-30 transition-colors"
              >
                <ChevronDown className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-white rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto overscroll-contain select-none py-4 px-2"
        style={{ userSelect: "none", WebkitUserSelect: "none" }}
      >
        {loading && (
          <div className="flex flex-col items-center justify-center h-64 gap-3">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
            <p className="text-gray-400 text-sm">Loading pages…</p>
          </div>
        )}

        {error && (
          <div className="flex items-center justify-center h-64">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div className="max-w-3xl mx-auto space-y-2">
            {Array.from({ length: total }).map((_, i) => (
              <div key={i} className="relative bg-gray-800 rounded-lg overflow-hidden">
                {pages[i] ? (
                  <img
                    ref={(el) => { pageRefs.current[i] = el; }}
                    src={pages[i]}
                    alt={`Page ${i + 1}`}
                    draggable={false}
                    className="w-full block"
                    style={{ userSelect: "none", WebkitUserSelect: "none" }}
                  />
                ) : (
                  <div
                    ref={(el) => { if (el) pageRefs.current[i] = el as unknown as HTMLImageElement; }}
                    className="flex items-center justify-center bg-gray-800 rounded-lg"
                    style={{ aspectRatio: "0.707" }}
                  >
                    <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
                  </div>
                )}
                <span className="absolute bottom-2 right-3 text-[10px] text-white/30 select-none pointer-events-none">
                  {i + 1} / {total}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
