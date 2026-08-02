"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight } from "lucide-react";
import dynamic from "next/dynamic";
import type { Resource, ResourceCategory } from "@/lib/resources";

const PdfViewer = dynamic(() => import("@/components/PdfViewer"), { ssr: false });

// Exact pastel colours provided by the user (RGB → hex)
// bg: card pastel area | tag: pill chip bg+text | text: title/description colour
const PASTEL_LIST = [
  { bg: "#DFF3FE", tag: { bg: "#BEE3F8", text: "#1A4A6B" }, text: "#1A4A6B" }, // sky blue
  { bg: "#F6CFB3", tag: { bg: "#F0B48A", text: "#6B3010" }, text: "#6B3010" }, // peach
  { bg: "#D6F5ED", tag: { bg: "#A8E6D8", text: "#0F4A39" }, text: "#0F4A39" }, // mint
  { bg: "#E2DBFA", tag: { bg: "#C8BEFF", text: "#3B2A7A" }, text: "#3B2A7A" }, // lavender
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

      <section id="resources" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">

        {/* Section header */}
        <div className="mb-8 sm:mb-10">
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-primary-600 dark:text-primary-400 mb-1">Study Materials</p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">All Resources</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {resources.length > 0
              ? `${resources.length} resource${resources.length !== 1 ? "s" : ""} available — read securely in your browser.`
              : "Resources are being uploaded. Check back soon."}
          </p>
        </div>

        {/* Search + filter bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search resources…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                activeCategory === "all"
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary-400 hover:text-primary-600"
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap ${
                  activeCategory === cat.id
                    ? "bg-primary-600 text-white shadow-sm"
                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-primary-400 hover:text-primary-600"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Pastel grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((r, i) => {
              const pal = getPalette(i);
              const catName = r.resource_categories?.name ?? "";
              const hasPdf = !!r.file_path;

              // Build tag chips: category + free/paid
              const tags = [
                catName || null,
                r.is_free ? "Free" : "Premium",
              ].filter(Boolean) as string[];

              return (
                <div
                  key={r.id}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col p-3"
                >
                  {/* Pastel inset area — white shows on all 4 sides */}
                  <div className="rounded-lg p-5 flex-1 flex flex-col" style={{ backgroundColor: pal.bg }}>
                    <h3 className="font-bold text-xl leading-snug mb-2" style={{ color: pal.text }}>
                      {r.title}
                    </h3>

                    {r.description && (
                      <p className="text-sm leading-relaxed mb-4 line-clamp-2" style={{ color: pal.text, opacity: 0.7 }}>
                        {r.description}
                      </p>
                    )}

                    {/* Pill tags */}
                    <div className="flex flex-wrap gap-2 mt-auto pt-2">
                      {tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs font-medium px-3 py-1.5 rounded-full"
                          style={{ backgroundColor: pal.tag.bg, color: pal.tag.text }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* White footer with generous spacing */}
                  <div className="px-3 pt-4 pb-2 flex items-center justify-between">
                    <button
                      onClick={() => openResource(r)}
                      disabled={!hasPdf}
                      className={`text-sm font-bold transition-colors ${
                        hasPdf ? "text-gray-900 hover:text-gray-600" : "text-gray-400 cursor-not-allowed"
                      }`}
                    >
                      {hasPdf ? "View Resource" : "Coming Soon"}
                    </button>
                    <button
                      onClick={() => openResource(r)}
                      disabled={!hasPdf}
                      style={{ backgroundColor: "#F5F5F5" }}
                      className={`w-8 h-8 rounded-md flex items-center justify-center transition-all ${
                        hasPdf
                          ? "text-gray-700 group-hover:translate-x-0.5"
                          : "text-gray-300 cursor-not-allowed"
                      }`}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-500 dark:text-gray-400 font-medium">No resources found</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Try a different search or category.</p>
          </div>
        )}

        <div className="mt-14 bg-primary-600 rounded-2xl px-6 py-8 sm:py-10 text-center">
          <h3 className="text-white font-bold text-xl sm:text-2xl mb-2">More resources coming soon</h3>
          <p className="text-primary-200 text-sm max-w-md mx-auto">
            We&apos;re adding new notes, bare acts and MCQ PDFs regularly. Bookmark this page and check back often.
          </p>
        </div>
      </section>
    </>
  );
}
