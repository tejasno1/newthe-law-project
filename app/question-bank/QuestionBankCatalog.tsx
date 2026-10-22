"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, ChevronDown, Lock, Loader2 } from "lucide-react";
import { openRazorpayCheckout, parseRupees, recoverPendingOrders, verifyOrder } from "@/lib/razorpay";
import dynamic from "next/dynamic";
import type { QuestionBankItem, QuestionBankCategory } from "@/lib/questionBank";
import type { ExamCategory } from "@/lib/resources";

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
  items: QuestionBankItem[];
  categories: QuestionBankCategory[];
  examCategories: ExamCategory[];
  candidateName: string;
  isLoggedIn: boolean;
  hasPass: boolean;
  purchasedIds: number[];
  userEmail: string;
}

interface ViewerState { title: string; path: string }

export default function QuestionBankCatalog({ items, categories, examCategories, candidateName, isLoggedIn, hasPass, purchasedIds, userEmail }: Props) {
  const router = useRouter();
  const [activeSubject, setActiveSubject] = useState<string>("all");
  const [activeExam, setActiveExam] = useState<string>("all");
  const [examDropdownOpen, setExamDropdownOpen] = useState(false);
  const examDropdownRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [viewer, setViewer] = useState<ViewerState | null>(null);
  const [owned, setOwned] = useState<Set<number>>(() => new Set(purchasedIds));
  const [payingId, setPayingId] = useState<number | null>(null);

  // Grant access for any checkout that never reported back (tab closed mid-payment).
  useEffect(() => {
    if (!isLoggedIn) return;
    recoverPendingOrders().then((granted) => { if (granted) router.refresh(); });
  }, [isLoggedIn, router]);

  useEffect(() => { setOwned(new Set(purchasedIds)); }, [purchasedIds]);

  function hasAccess(item: QuestionBankItem) {
    return item.is_free || hasPass || owned.has(item.id);
  }

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (examDropdownRef.current && !examDropdownRef.current.contains(e.target as Node)) {
        setExamDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function openItem(item: QuestionBankItem) {
    if (!item.file_path) return;
    if (!isLoggedIn) {
      router.push("/auth/login?redirect=/question-bank&reason=resource");
      return;
    }
    if (!hasAccess(item)) {
      buyItem(item);
      return;
    }
    setViewer({ title: item.title, path: item.file_path });
  }

  async function buyItem(item: QuestionBankItem) {
    if (payingId) return;
    setPayingId(item.id);
    await openRazorpayCheckout({
      amountRupees: parseRupees(item.price),
      name: "The Law Project",
      description: `Question Bank: ${item.title}`,
      purchase: { kind: "question_bank", itemId: item.id },
      prefill: { name: candidateName, email: userEmail },
      onSuccess: async (_paymentId, orderId) => {
        const granted = await verifyOrder(orderId);
        if (!granted) {
          alert("Payment received — access is being confirmed. Please refresh in a minute.");
          return;
        }
        setOwned((prev) => new Set(prev).add(item.id));
        if (item.file_path) setViewer({ title: item.title, path: item.file_path });
      },
    });
    // Resolves once the Razorpay modal is open (or checkout failed to start).
    setPayingId(null);
  }

  const filtered = items.filter((item) => {
    const matchSubject = activeSubject === "all" || item.subject === activeSubject;
    const matchExam = activeExam === "all" || item.exam_category === activeExam;
    const q = query.toLowerCase();
    const matchQ = !q || item.title.toLowerCase().includes(q) || (item.description ?? "").toLowerCase().includes(q);
    return matchSubject && matchExam && matchQ;
  });

  return (
    <>
      {viewer && (
        <PdfViewer
          title={viewer.title}
          path={viewer.path}
          candidateName={candidateName}
          onClose={() => setViewer(null)}
          apiRoute="/api/question-bank-resource"
        />
      )}

      <section id="question-bank" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12 sm:pt-10 sm:pb-16 lg:pb-20">

        {/* Section header */}
        <div className="mb-5 sm:mb-8">
          <p className="text-[10px] sm:text-[11px] font-bold tracking-[0.2em] uppercase text-primary-600 dark:text-primary-400 mb-1">
            Practice Materials
          </p>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            All Question Sets
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            {items.length > 0
              ? `${items.length} question set${items.length !== 1 ? "s" : ""} available — read securely in your browser.`
              : "Question sets are being uploaded. Check back soon."}
          </p>
        </div>

        {/* Search */}
        <div className="relative mb-4 sm:mb-5 sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search question sets…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-8 sm:pl-9 pr-4 py-2 sm:py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500 transition-colors"
          />
        </div>

        {/* Filters: subject chips + exam dropdown */}
        <div className="flex flex-wrap items-center gap-2 mb-6 sm:mb-8">
          <div className="flex flex-nowrap overflow-x-auto scrollbar-hide gap-2 pb-0.5">
            <button
              onClick={() => setActiveSubject("all")}
              className={`flex-shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                activeSubject === "all"
                  ? "bg-primary-600 text-white shadow-sm"
                  : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
              }`}
            >
              All Subjects
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveSubject(cat.name)}
                className={`flex-shrink-0 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap ${
                  activeSubject === cat.name
                    ? "bg-primary-600 text-white shadow-sm"
                    : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {examCategories.length > 0 && (
            <div ref={examDropdownRef} className="relative ml-auto flex-shrink-0">
              <button
                onClick={() => setExamDropdownOpen((v) => !v)}
                className="flex items-center gap-2 px-4 py-2 rounded-lg border border-orange-300 bg-white dark:bg-gray-800 text-sm font-semibold text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors whitespace-nowrap"
              >
                <span className="max-w-[140px] truncate">{activeExam === "all" ? "All Exams" : activeExam}</span>
                <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform ${examDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {examDropdownOpen && (
                <div className="absolute right-0 top-full mt-1 z-30 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-1 min-w-[180px]">
                  <button
                    onClick={() => { setActiveExam("all"); setExamDropdownOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                      activeExam === "all"
                        ? "bg-orange-50 text-orange-600 font-semibold"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    All Exams
                  </button>
                  {examCategories.map((ec) => (
                    <button
                      key={ec.id}
                      onClick={() => { setActiveExam(ec.name); setExamDropdownOpen(false); }}
                      className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                        activeExam === ec.name
                          ? "bg-orange-50 text-orange-600 font-semibold"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                      }`}
                    >
                      {ec.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {filtered.map((item, i) => {
              const pal = getPalette(i);
              const hasPdf = !!item.file_path;
              const unlocked = hasAccess(item);
              const paying = payingId === item.id;
              const actionLabel = !hasPdf
                ? "Coming Soon"
                : unlocked
                  ? "View Questions"
                  : `Buy for ₹${parseRupees(item.price).toLocaleString("en-IN")}`;
              const tags = [item.subject || null, item.exam_category || null].filter(Boolean) as string[];

              return (
                <div
                  key={item.id}
                  className="group bg-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-0.5 sm:hover:-translate-y-1 transition-all duration-300 flex flex-col p-2 sm:p-3"
                >
                  <div
                    className="rounded-lg p-3 sm:p-5 flex-1 flex flex-col"
                    style={{ backgroundColor: pal.bg }}
                  >
                    <span
                      className={`self-start inline-flex items-center gap-1 text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-full mb-2 ${
                        item.is_free
                          ? "bg-emerald-500 text-white"
                          : unlocked
                            ? "bg-gray-900 text-white"
                            : "bg-amber-500 text-white"
                      }`}
                    >
                      {item.is_free ? "Free" : unlocked ? "Unlocked" : (<><Lock className="w-2.5 h-2.5" />₹{parseRupees(item.price).toLocaleString("en-IN")}</>)}
                    </span>
                    <h3
                      className="font-bold text-sm sm:text-base lg:text-xl leading-snug mb-1.5 sm:mb-2 line-clamp-2"
                      style={{ color: pal.text }}
                    >
                      {item.title}
                    </h3>

                    {item.description && (
                      <p
                        className="text-[11px] sm:text-xs lg:text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-2 hidden xs:block sm:block"
                        style={{ color: pal.text, opacity: 0.7 }}
                      >
                        {item.description}
                      </p>
                    )}

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

                  <div className="px-1.5 sm:px-3 pt-3 sm:pt-4 pb-1.5 sm:pb-2 flex items-center justify-between">
                    <button
                      onClick={() => openItem(item)}
                      disabled={!hasPdf || paying}
                      className={`text-xs sm:text-sm font-bold transition-colors text-left ${
                        !hasPdf
                          ? "text-gray-400 cursor-not-allowed"
                          : unlocked
                            ? "text-gray-900 hover:text-gray-600"
                            : "text-amber-600 hover:text-amber-700"
                      }`}
                    >
                      {paying ? "Opening payment…" : actionLabel}
                    </button>
                    <button
                      onClick={() => openItem(item)}
                      disabled={!hasPdf || paying}
                      style={{ backgroundColor: "#F5F5F5" }}
                      className={`w-7 h-7 sm:w-8 sm:h-8 rounded-md flex items-center justify-center transition-all flex-shrink-0 ${
                        hasPdf ? "text-gray-700 group-hover:translate-x-0.5" : "text-gray-300 cursor-not-allowed"
                      }`}
                    >
                      {paying
                        ? <Loader2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 animate-spin" />
                        : unlocked
                          ? <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          : <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-14 sm:py-20">
            <p className="text-gray-500 dark:text-gray-400 font-medium text-sm sm:text-base">No question sets found</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs sm:text-sm mt-1">Try a different search or filter.</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-10 sm:mt-14 bg-primary-600 rounded-2xl px-5 py-7 sm:px-6 sm:py-10 text-center">
          <h3 className="text-white font-bold text-lg sm:text-xl lg:text-2xl mb-2">New question sets added every week</h3>
          <p className="text-primary-200 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            We continuously add subject-wise and exam-wise MCQ sets crafted by practising lawyers. Bookmark this page and check back often.
          </p>
        </div>
      </section>
    </>
  );
}
