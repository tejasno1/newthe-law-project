"use client";

import { useEffect, useRef, useState } from "react";
import { X, ChevronUp, ChevronDown, Loader2 } from "lucide-react";

interface Props {
  title: string;
  path: string;
  candidateName: string;
  onClose: () => void;
  apiRoute?: string; // defaults to /api/course-resource
}

export default function PdfViewer({ title, path, candidateName, onClose, apiRoute = "/api/course-resource" }: Props) {
  // Pages are kept as live <canvas> elements, never as <img src="..."> or a CSS
  // background-image — bulk "image downloader" extensions scan the DOM for those
  // two patterns specifically; a canvas has no URL for them to find or fetch.
  const [pagesCanvases, setPagesCanvases] = useState<(HTMLCanvasElement | null)[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageWrapperRefs = useRef<(HTMLDivElement | null)[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;

    async function render() {
      try {
        // Fetch 1-hour signed URL from our auth-protected API route
        const res = await fetch(`${apiRoute}?path=${encodeURIComponent(path)}`);
        const { url, error: urlError } = await res.json();
        if (urlError || !url) throw new Error(urlError ?? "Failed to load resource");

        // Dynamically import pdfjs to keep it out of the main bundle
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

        const pdf = await pdfjs.getDocument({ url, withCredentials: false }).promise;
        if (cancelled) return;

        setTotal(pdf.numPages);
        setLoading(false);

        const wm = "THE LAW PROJECT";

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          if (cancelled) break;
          const page = await pdf.getPage(pageNum);
          const vp = page.getViewport({ scale: 1.8 });
          const canvas = document.createElement("canvas");
          canvas.width = vp.width;
          canvas.height = vp.height;
          const ctx = canvas.getContext("2d")!;

          await page.render({ canvasContext: ctx, viewport: vp, canvas }).promise;

          // Tiled diagonal watermark — spaced based on actual text size to prevent overlap
          ctx.save();
          ctx.globalAlpha = 0.10;
          const fontSize = Math.max(11, Math.floor(vp.width / 30));
          ctx.font = `bold ${fontSize}px sans-serif`;
          ctx.fillStyle = "#cc0000";

          const tw = ctx.measureText(wm).width;
          const angle = -Math.PI / 6;
          const cosA = Math.abs(Math.cos(angle));
          const sinA = Math.abs(Math.sin(angle));
          // rotated bounding box + 70px gap on each axis
          const stepX = tw * cosA + fontSize * sinA + 70;
          const stepY = tw * sinA + fontSize * cosA + 70;

          for (let row = 0, y = -stepY; y < vp.height + stepY; y += stepY, row++) {
            const offsetX = (row % 2) * (stepX / 2); // stagger alternate rows
            for (let x = -stepX + offsetX; x < vp.width + stepX; x += stepX) {
              ctx.save();
              ctx.translate(x, y);
              ctx.rotate(angle);
              ctx.fillText(wm, 0, 0);
              ctx.restore();
            }
          }
          ctx.restore();

          if (!cancelled) {
            setPagesCanvases((prev) => {
              const next = [...prev];
              next[pageNum - 1] = canvas;
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
  }, [path]);

  // Track which page is visible (wrapper divs exist as soon as `total` is known,
  // independent of whether that page's canvas has finished rendering yet)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = pageWrapperRefs.current.findIndex((r) => r === entry.target);
            if (idx >= 0) setCurrentPage(idx + 1);
          }
        }
      },
      { root: containerRef.current, threshold: 0.5 }
    );
    pageWrapperRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [total]);

  // Attach each rendered canvas into its wrapper div once both exist
  useEffect(() => {
    pagesCanvases.forEach((canvas, i) => {
      const wrapper = pageWrapperRefs.current[i];
      if (!canvas || !wrapper || wrapper.firstChild === canvas) return;
      wrapper.innerHTML = "";
      canvas.style.width = "100%";
      canvas.style.height = "auto";
      canvas.style.display = "block";
      wrapper.appendChild(canvas);
    });
  }, [pagesCanvases]);

  // Lock body scroll while viewer is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  // Block all print/save paths while viewer is open
  useEffect(() => {
    // 1. Block keyboard shortcuts (works for most browsers)
    const blockKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (["p", "s", "u", "a"].includes(e.key.toLowerCase())) {
          e.preventDefault();
          e.stopPropagation();
        }
      }
    };
    document.addEventListener("keydown", blockKey, true);

    // 2. Override window.print() (blocks programmatic print calls)
    const origPrint = window.print.bind(window);
    window.print = () => {};

    // 3. beforeprint fires just before Chrome renders the print preview.
    //    Hiding <html> (not just body) at this moment makes the output blank
    //    regardless of whether print was triggered by shortcut or browser menu.
    const onBeforePrint = () => {
      document.documentElement.style.setProperty("display", "none", "important");
      document.documentElement.style.setProperty("visibility", "hidden", "important");
    };
    const onAfterPrint = () => {
      document.documentElement.style.removeProperty("display");
      document.documentElement.style.removeProperty("visibility");
    };
    window.addEventListener("beforeprint", onBeforePrint);
    window.addEventListener("afterprint", onAfterPrint);

    // 4. CSS fallback injected into <head> — catches any path that fires
    //    @media print without a JS beforeprint event (e.g. some PDF plugins)
    const style = document.createElement("style");
    style.id = "tlp-print-guard";
    style.textContent = [
      "@media print {",
      "  html { display: none !important; visibility: hidden !important; }",
      "  * { display: none !important; visibility: hidden !important; }",
      "}",
    ].join("\n");
    document.head.appendChild(style);

    return () => {
      document.removeEventListener("keydown", blockKey, true);
      window.print = origPrint;
      window.removeEventListener("beforeprint", onBeforePrint);
      window.removeEventListener("afterprint", onAfterPrint);
      document.getElementById("tlp-print-guard")?.remove();
    };
  }, []);

  const scrollToPage = (n: number) => {
    const el = pageWrapperRefs.current[n - 1];
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
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
                <div
                  ref={(el) => { pageWrapperRefs.current[i] = el; }}
                  className="w-full"
                  style={{
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    ...(pagesCanvases[i] ? {} : { aspectRatio: "0.707", display: "flex", alignItems: "center", justifyContent: "center" }),
                  }}
                >
                  {!pagesCanvases[i] && <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />}
                </div>
                <span className="absolute bottom-2 right-3 text-[10px] text-white/30 select-none pointer-events-none">
                  {i + 1} / {total}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
