"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, FileQuestion, Award, Globe, BarChart3, LogIn, X, Share2, ShoppingCart, Link2, Mail } from "lucide-react";
import type { MockTestSafe } from "@/lib/mockTests";
import { createClient } from "@/lib/supabase/client";
import { openRazorpayCheckout } from "@/lib/razorpay";

const difficultyConfig: Record<string, { emoji: string; label: string; color: string }> = {
  EASY:   { emoji: "🟢", label: "Easy",   color: "text-green-600 dark:text-green-400" },
  MEDIUM: { emoji: "🟡", label: "Medium", color: "text-amber-600 dark:text-amber-400" },
  HARD:   { emoji: "🔴", label: "Hard",   color: "text-red-600 dark:text-red-400"     },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1)   return "Just now";
  if (mins < 60)  return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

interface AttemptInfo { id: string; submittedAt: string; }

export default function MockTestCatalog({ tests }: { tests: MockTestSafe[] }) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [loginSlug, setLoginSlug] = useState<string | null>(null);
  const [userAttempts, setUserAttempts] = useState<Map<string, AttemptInfo>>(new Map());
  const [purchasedSlugs, setPurchasedSlugs] = useState<Set<string>>(new Set());
  const [buyingSlug, setBuyingSlug] = useState<string | null>(null);
  const [shareOpenSlug, setShareOpenSlug] = useState<string | null>(null);
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  useEffect(() => {
    const close = () => setShareOpenSlug(null);
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  function handleShare(platform: string, test: MockTestSafe) {
    const url = typeof window !== "undefined"
      ? `${window.location.origin}/mock-test`
      : "/mock-test";
    const text = encodeURIComponent(test.title);
    if (platform === "twitter")  window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${text}`, "_blank");
    if (platform === "facebook") window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
    if (platform === "linkedin") window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
    if (platform === "whatsapp") window.open(`https://wa.me/?text=${encodeURIComponent(test.title + " " + url)}`, "_blank");
    if (platform === "email")    window.location.href = `mailto:?subject=${text}&body=${encodeURIComponent(url)}`;
    if (platform === "copy") {
      navigator.clipboard.writeText(url);
      setCopiedSlug(test.slug);
      setTimeout(() => setCopiedSlug(null), 2000);
    }
  }

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsLoggedIn(!!user);
      setUserEmail(user?.email ?? "");
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsLoggedIn(!!session?.user);
      setUserEmail(session?.user?.email ?? "");
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isLoggedIn) { setUserAttempts(new Map()); setPurchasedSlugs(new Set()); return; }

    // Fetch attempts
    fetch("/api/user/attempts")
      .then((r) => r.json())
      .then(({ attempts }: { attempts: Array<{ id: string; test_slug: string; submitted_at: string }> }) => {
        const map = new Map<string, AttemptInfo>();
        for (const a of attempts) {
          if (!map.has(a.test_slug))
            map.set(a.test_slug, { id: a.id, submittedAt: a.submitted_at });
        }
        setUserAttempts(map);
      })
      .catch(() => {});

    // Fetch purchases
    fetch("/api/test-purchases")
      .then((r) => r.json())
      .then(({ purchases }: { purchases: Array<{ test_slug: string }> }) => {
        setPurchasedSlugs(new Set(purchases.map((p) => p.test_slug)));
      })
      .catch(() => {});
  }, [isLoggedIn]);

  const openPopup = (slug: string) => {
    const url = `/mock-test/${slug}/instructions?mode=exam`;
    const w = window.screen.availWidth;
    const h = window.screen.availHeight;
    const features = [
      `width=${w}`, `height=${h}`, `left=0`, `top=0`,
      "scrollbars=yes", "toolbar=no", "menubar=no",
      "location=no", "status=no", "resizable=yes",
    ].join(",");
    const popup = window.open(url, `exam-${slug}`, features);
    if (popup) popup.focus();
  };

  const handleStartTest = (slug: string) => {
    if (!isLoggedIn) { setLoginSlug(slug); return; }
    if (window.innerWidth < 768) {
      router.push(`/mock-test/${slug}/instructions`);
    } else {
      openPopup(slug);
    }
  };

  const handleBuyNow = (test: MockTestSafe) => {
    if (!isLoggedIn) { setLoginSlug(test.slug); return; }
    setBuyingSlug(test.slug);
    openRazorpayCheckout({
      amountRupees: test.price,
      name: "The Law Project",
      description: test.title,
      prefill: { email: userEmail },
      onSuccess: async (paymentId, orderId, signature) => {
        try {
          const res = await fetch("/api/test-purchases", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              testSlug: test.slug,
              amountRupees: test.price,
              razorpayPaymentId: paymentId,
              razorpayOrderId: orderId,
              razorpaySignature: signature,
            }),
          });
          if (res.ok) {
            setPurchasedSlugs((prev) => new Set(Array.from(prev).concat(test.slug)));
          }
        } catch {
          // payment recorded on Razorpay side; show success anyway
          setPurchasedSlugs((prev) => new Set(Array.from(prev).concat(test.slug)));
        } finally {
          setBuyingSlug(null);
        }
      },
      onFailure: () => setBuyingSlug(null),
    });
  };

  if (tests.length === 0)
    return <p className="text-center text-gray-400 py-16">No practice tests found yet.</p>;

  const categories = ["All", ...Array.from(new Set(tests.map((t) => t.category)))];
  const filteredTests = activeCategory === "All" ? tests : tests.filter((t) => t.category === activeCategory);

  return (
    <div>
      {/* Category filter */}
      <div className="flex flex-wrap justify-center gap-2.5 mb-8">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat
                ? "bg-primary-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredTests.length === 0 ? (
        <p className="text-center text-gray-400 py-16">No practice tests found in this category yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {filteredTests.map((test, i) => {
            const attempt   = userAttempts.get(test.slug);
            const hasAttempt  = !!attempt;
            const isPurchased = test.isFree || purchasedSlugs.has(test.slug);
            const canStart    = isPurchased;
            const diff        = difficultyConfig[test.difficulty] ?? difficultyConfig.MEDIUM;
            const isBuying    = buyingSlug === test.slug;

            return (
              <div
                key={test.slug}
                className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col overflow-hidden"
                style={{ animation: `tlpSlideUp 0.35s cubic-bezier(0.22,1,0.36,1) ${i * 0.04}s both` }}
              >
                {/* Top row: Free/Paid badge + price + action icons */}
                <div className="flex items-center justify-between px-3.5 pt-3.5 pb-2">
                  <div className="flex items-center gap-2">
                    {test.isFree ? (
                      <span className="inline-flex items-center bg-green-500 text-white text-[11px] font-bold px-2.5 py-1 rounded">
                        Free
                      </span>
                    ) : (
                      <span className="inline-flex items-center bg-amber-400 text-gray-900 text-[11px] font-bold px-2.5 py-1 rounded">
                        TLP+
                      </span>
                    )}
                    {!test.isFree && test.price > 0 && (
                      <span className="text-[11px] font-bold text-gray-900 dark:text-white">
                        ₹{test.price}
                      </span>
                    )}
                  </div>
                  {/* Share button + dropdown */}
                  <div className="relative" onMouseDown={(e) => e.stopPropagation()}>
                    <button
                      onClick={() => setShareOpenSlug(shareOpenSlug === test.slug ? null : test.slug)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                    >
                      <Share2 className="w-3.5 h-3.5" />
                    </button>
                    {shareOpenSlug === test.slug && (
                      <div className="absolute right-0 top-6 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-1.5 min-w-[160px]">
                        <button onClick={() => { handleShare("whatsapp", test); setShareOpenSlug(null); }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <svg className="w-3.5 h-3.5 text-[#25D366] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.978-1.413A9.953 9.953 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/></svg>
                          WhatsApp
                        </button>
                        <button onClick={() => { handleShare("twitter", test); setShareOpenSlug(null); }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.629L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
                          X / Twitter
                        </button>
                        <button onClick={() => { handleShare("linkedin", test); setShareOpenSlug(null); }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <svg className="w-3.5 h-3.5 text-[#0A66C2] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                          LinkedIn
                        </button>
                        <button onClick={() => { handleShare("facebook", test); setShareOpenSlug(null); }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <svg className="w-3.5 h-3.5 text-[#1877F2] flex-shrink-0" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                          Facebook
                        </button>
                        <button onClick={() => { handleShare("email", test); setShareOpenSlug(null); }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" /> Email
                        </button>
                        <button onClick={() => handleShare("copy", test)}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                          <Link2 className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                          {copiedSlug === test.slug ? "Copied!" : "Copy Link"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Title */}
                <div className="px-3.5 pb-3">
                  <h3 className="font-bold text-gray-900 dark:text-white text-sm leading-snug line-clamp-2">
                    {test.title}
                  </h3>
                </div>

                {/* Stats grid — 2 columns */}
                <div className="px-3.5 pb-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
                  <span className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                    {test.durationMinutes} Minutes
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                    <FileQuestion className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                    {test.totalQuestions} Questions
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                    <Award className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                    {test.totalMarks} Marks
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                    <Globe className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                    {test.language}
                  </span>
                  <span className="flex items-center gap-1.5 text-[11px] text-gray-500 dark:text-gray-400">
                    <BarChart3 className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                    {test.section}
                  </span>
                  <span className={`flex items-center gap-1 text-[11px] font-semibold ${diff.color}`}>
                    <span className="text-[10px] leading-none">{diff.emoji}</span>
                    {diff.label}
                  </span>
                </div>

                {/* Last attempted — real per-user data */}
                <div className="mx-3.5 border-t border-gray-100 dark:border-gray-700 pt-2 pb-2 min-h-[28px] flex items-center justify-center">
                  {hasAttempt ? (
                    <div className="flex items-center gap-2">
                      <p className="text-[10px] text-center text-primary-600 dark:text-primary-400 font-medium">
                        Last attempted {timeAgo(attempt.submittedAt)}
                      </p>
                      <Link
                        href={`/mock-test/${test.slug}/report/${attempt.id}`}
                        className="flex items-center gap-0.5 text-[10px] text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 font-medium hover:underline transition-colors"
                      >
                        <BarChart3 className="w-3 h-3" /> Result
                      </Link>
                    </div>
                  ) : (
                    <p className="text-[10px] text-gray-400">Not attempted yet</p>
                  )}
                </div>

                {/* CTA button */}
                <div className="px-3.5 pb-3.5 mt-auto">
                  {canStart ? (
                    <button
                      onClick={() => handleStartTest(test.slug)}
                      className="w-full py-2.5 text-sm font-bold rounded-md transition-colors bg-primary-600 hover:bg-primary-700 text-white"
                    >
                      {hasAttempt ? "Reattempt" : "Start Test"}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuyNow(test)}
                      disabled={isBuying}
                      className="w-full py-2.5 text-sm font-bold rounded-md transition-colors flex items-center justify-center gap-2 bg-gray-900 dark:bg-white hover:bg-gray-700 dark:hover:bg-gray-100 text-white dark:text-gray-900 disabled:opacity-60"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      {isBuying ? "Opening payment…" : `Buy Now · ₹${test.price}`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Login modal */}
      <AnimatePresence>
        {loginSlug && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={(e) => { if (e.target === e.currentTarget) setLoginSlug(null); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.18 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-7 relative"
            >
              <button
                onClick={() => setLoginSlug(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="w-12 h-12 bg-primary-600/10 rounded-full flex items-center justify-center mb-5">
                <LogIn className="w-6 h-6 text-primary-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Login required</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                Sign in to attempt or purchase practice tests.
              </p>
              <div className="space-y-3">
                <Link
                  href={`/auth/login?redirect=/mock-test`}
                  className="w-full bg-primary-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                  onClick={() => setLoginSlug(null)}
                >
                  <LogIn className="w-4 h-4" /> Sign in to continue
                </Link>
                <Link
                  href={`/auth/signup?redirect=/mock-test`}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center"
                  onClick={() => setLoginSlug(null)}
                >
                  Create a free account
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
