"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Clock, FileQuestion, Award, Globe, BarChart3, LogIn, X } from "lucide-react";
import type { MockTestSafe } from "@/lib/mockTests";
import { createClient } from "@/lib/supabase/client";

const difficultyStyles: Record<string, string> = {
  EASY: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400",
  MEDIUM: "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400",
  HARD: "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300",
};

export default function MockTestCatalog({ tests }: { tests: MockTestSafe[] }) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginSlug, setLoginSlug] = useState<string | null>(null);
  // slug → most-recent submitted attemptId
  const [userAttempts, setUserAttempts] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setIsLoggedIn(!!user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsLoggedIn(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Fetch the user's submitted attempts once they are confirmed logged in
  useEffect(() => {
    if (!isLoggedIn) { setUserAttempts(new Map()); return; }
    fetch("/api/user/attempts")
      .then((r) => r.json())
      .then(({ attempts }: { attempts: Array<{ id: string; test_slug: string }> }) => {
        const map = new Map<string, string>();
        for (const a of attempts) {
          if (!map.has(a.test_slug)) map.set(a.test_slug, a.id); // first = most recent
        }
        setUserAttempts(map);
      })
      .catch(() => {});
  }, [isLoggedIn]);

  const openPopup = (slug: string) => {
    const url = `/mock-test/${slug}/instructions?mode=exam`;
    const w = window.screen.availWidth;
    const h = window.screen.availHeight;
    const features = [
      `width=${w}`, `height=${h}`,
      `left=0`, `top=0`,
      "scrollbars=yes", "toolbar=no", "menubar=no",
      "location=no", "status=no", "resizable=yes",
    ].join(",");
    const popup = window.open(url, `exam-${slug}`, features);
    if (popup) popup.focus();
  };

  const handleStartTest = (slug: string) => {
    if (!isLoggedIn) {
      setLoginSlug(slug);
      return;
    }
    // Mobile: navigate in same tab. Desktop: open secure popup.
    if (window.innerWidth < 768) {
      router.push(`/mock-test/${slug}/instructions`);
    } else {
      openPopup(slug);
    }
  };

  if (tests.length === 0) {
    return <p className="text-center text-gray-400">No practice tests found yet.</p>;
  }

  const categories = ["All", ...Array.from(new Set(tests.map((t) => t.category)))];
  const filteredTests = activeCategory === "All" ? tests : tests.filter((t) => t.category === activeCategory);

  return (
    <div>
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        {categories.map((cat) => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {filteredTests.length === 0 ? (
        <p className="text-center text-gray-400">No practice tests found in this category yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTests.map((test, i) => {
            const previousAttemptId = userAttempts.get(test.slug);
            const hasAttempt = !!previousAttemptId;

            return (
              <motion.div key={test.slug}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.35 }}
                className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-primary-200 dark:hover:border-primary-700 hover:shadow-md transition-all duration-300 flex flex-col relative"
              >
                {/* Trophy / results icon — top right, only if attempted */}
                {hasAttempt && (
                  <Link
                    href={`/mock-test/${test.slug}/report/${previousAttemptId}`}
                    title="View your previous result"
                    className="absolute top-3 right-3 w-7 h-7 bg-primary-100 dark:bg-primary-900/40 hover:bg-primary-200 dark:hover:bg-primary-800/60 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center transition-colors z-10"
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                  </Link>
                )}

<div className="p-4 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${difficultyStyles[test.difficulty] ?? "bg-gray-100 text-gray-600"}`}>
                      {test.difficulty}
                    </span>
                  </div>
                  <h2 className="font-semibold text-gray-900 dark:text-white text-sm mt-2.5 mb-3 leading-snug pr-6">{test.title}</h2>

                  <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-400" /> {test.durationMinutes} Mins</span>
                    <span className="flex items-center gap-1.5"><FileQuestion className="w-3.5 h-3.5 text-gray-400" /> {test.totalQuestions} Qs</span>
                    <span className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-gray-400" /> {test.totalMarks} Marks</span>
                    <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5 text-gray-400" /> {test.language}</span>
                    <span className="flex items-center gap-1.5 col-span-2"><BarChart3 className="w-3.5 h-3.5 text-gray-400" /> {test.section}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleStartTest(test.slug)}
                  className={`block w-full text-center py-2.5 text-sm font-medium transition-colors rounded-b-xl ${
                    hasAttempt
                      ? "bg-gray-800 dark:bg-gray-600 text-white hover:bg-gray-900 dark:hover:bg-gray-500"
                      : "bg-primary-600 text-white hover:bg-primary-700"
                  }`}
                >
                  {hasAttempt ? "Reattempt" : "Start Test"}
                </button>
              </motion.div>
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
              <button onClick={() => setLoginSlug(null)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 bg-primary-600/10 rounded-full flex items-center justify-center mb-5">
                <LogIn className="w-6 h-6 text-primary-600" />
              </div>

              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Login to start test</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                You need to be signed in to attempt a practice test. It only takes a moment.
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
