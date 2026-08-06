"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";
import type { Resource, ResourceCategory } from "@/lib/resources";

const PdfViewer = dynamic(() => import("@/components/PdfViewer"), { ssr: false });

const PASTEL_LIST = [
  { bg: "#DFF3FE", tag: { bg: "#BEE3F8", text: "#1A4A6B" }, text: "#1A4A6B" },
  { bg: "#F6CFB3", tag: { bg: "#F0B48A", text: "#6B3010" }, text: "#6B3010" },
  { bg: "#D6F5ED", tag: { bg: "#A8E6D8", text: "#0F4A39" }, text: "#0F4A39" },
  { bg: "#E2DBFA", tag: { bg: "#C8BEFF", text: "#3B2A7A" }, text: "#3B2A7A" },
];

function getPalette(index: number) {
  return PASTEL_LIST[index % PASTEL_LIST.length];
}

interface Props {
  resources: Resource[];
  categories: ResourceCategory[];
  candidateName: string;
  isLoggedIn: boolean;
}

interface ViewerState { title: string; path: string }

export default function ResourcesCatalog({ resources, categories, candidateName, isLoggedIn }: Props) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<number | "all">("all");
  const [query, setQuery] = useState("");
  const [viewer, setViewer] = useState<ViewerState | null>(null);

  function openResource(r: Resource) {
    if (!r.file_path) return;
    if (!isLoggedIn) {
      router.push("/auth/login?redirect=/resources&reason=resource");
      return;
    }
    setViewer({ title: r.title, path: r.file_path });
  }

  const filtered = resources.filter((r) => {
    const matchCat = activeCategory === "all" || r.category_id === activeCategory;
    const q = query.toLowerCase();
    const matchQ = !q || r.title.toLowerCase().includes(q) || (r.description ?? "").toLowerCase().includes(q);
    return matchCat && matchQ;
  });

  return (
    <>
      {viewer && (
        <PdfViewer
          title={viewer.title}
          path={viewer.path}
          candidateName={candidateName}
          onClose={() => setViewer(null)}
          apiRoute="/api/resource"
        />
      )}

      <section id="resources" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 sm:pt-10 sm:pb-16 lg:pb-20">

        {/* Section header */}
        <div className="mb-5 sm:mb-8">
          <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-primary-600 dark:text-primary-400 mb-1">
            Study Materials
          </p>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            All Resources
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {resources.length > 0
              ? `${resources.length} resource${resources.length !== 1 ? "s" : ""} available — read securely in your browser.`
              : "Resources are being uploaded. Check back soon."}
          </p>
        </div>

        {/* Search — full width on mobile */}
        <div className="relative mb-4 sm:mb-5 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search resources…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-8 sm:pl-9 pr-4 py-2 sm:py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
          />
        </div>

        {/* Filter chips — horizontal scroll on mobile, wrap on desktop */}
        <div className="flex flex-nowrap sm:flex-wrap overflow-x-auto sm:overflow-visible scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0 gap-2 mb-6 sm:mb-8 pb-1 sm:pb-0">
          <button
            onClick={() => setActiveCategory("all")}
            className={`flex-shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
              activeCategory === "all"
                ? "bg-primary-600 text-white shadow-sm"
                : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`flex-shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                activeCategory === cat.id
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Grid — 2 cols on mobile, 2 on sm, 3 on lg, 4 on xl */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {filtered.map((r, i) => {
              const pal = getPalette(i);
              const catName = r.resource_categories?.name ?? "";
              const hasPdf = !!r.file_path;
              const tags = [catName || null, r.is_free ? "Free" : "Premium"].filter(Boolean) as string[];

              return (
                <div
                  key={r.id}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 sm:hover:-translate-y-1 transition-all duration-300 flex flex-col p-2 sm:p-3"
                >
                  {/* Pastel inset area */}
                  <div
                    className="rounded-lg p-3 sm:p-5 flex-1 flex flex-col"
                    style={{ backgroundColor: pal.bg }}
                  >
                    <h3
                      className="font-bold text-sm sm:text-base lg:text-xl leading-snug mb-1.5 sm:mb-2 line-clamp-2"
                      style={{ color: pal.text }}
                    >
                      {r.title}
                    </h3>

                    {r.description && (
                      <p
                        className="text-[11px] sm:text-xs lg:text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-2 hidden xs:block sm:block"
                        style={{ color: pal.text, opacity: 0.7 }}
                      >
                        {r.description}
                      </p>
                    )}

                    {/* Pill tags */}
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 mt-auto pt-1.5 sm:pt-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] sm:text-xs font-medium px-2 py-1 sm:px-3 sm:py-1.5 rounded-full"
                          style={{ backgroundColor: pal.tag.bg, color: pal.tag.text }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* White footer */}
                  <div className="px-1.5 sm:px-3 pt-3 sm:pt-4 pb-1.5 sm:pb-2 flex items-center justify-between">
                    <button
                      onClick={() => openResource(r)}
                      disabled={!hasPdf}
                      className={`text-xs sm:text-sm font-bold transition-colors ${
                        hasPdf ? "text-gray-900 hover:text-gray-600" : "text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {hasPdf ? "View Resource" : "Coming Soon"}
                    </button>
                    <button
                      onClick={() => openResource(r)}
                      disabled={!hasPdf}
                      style={{ backgroundColor: "#F5F5F5" }}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center transition-all flex-shrink-0 ${
                        hasPdf ? "text-gray-700 group-hover:translate-x-0.5" : "text-gray-300 cursor-not-allowed"
                      }`}
                    >
                      <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-14 sm:py-20">
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm sm:text-base">No resources found</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm mt-1">Try a different search or category.</p>
          </div>
        )}

        {/* CTA banner */}
        <div className="mt-10 sm:mt-14 bg-primary-600 rounded-2xl px-5 py-7 sm:px-6 sm:py-10 text-center">
          <h3 className="text-white font-bold text-lg sm:text-xl lg:text-2xl mb-2">More resources coming soon</h3>
          <p className="text-primary-200 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            We&apos;re adding new notes, bare acts and MCQ PDFs regularly. Bookmark this page and check back often.
          </p>
        </div>
      </section>
    </>
  );
}
