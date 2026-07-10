"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Clock, FileQuestion, Award, LogIn, X } from "lucide-react";
import type { MockTestSafe } from "@/lib/mockTests";
import ExamInstructionsContent from "@/components/ExamInstructionsContent";
import { createClient } from "@/lib/supabase/client";

function getDisplayName(email: string, metadata: Record<string, string>): string {
  if (metadata?.full_name) return metadata.full_name;
  if (metadata?.name) return metadata.name;
  return email.split("@")[0];
}

export default function MockTestInstructions({ test }: { test: MockTestSafe }) {
  const [agreed, setAgreed] = useState(false);
  const [language, setLanguage] = useState("English");
  const [textSize, setTextSize] = useState("Large");
  const [candidateName, setCandidateName] = useState("");
  const [authReady, setAuthReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isExamMode, setIsExamMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setIsExamMode(params.get("mode") === "exam");
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem("mockTestTextSize");
    if (saved === "Small" || saved === "Medium" || saved === "Large") setTextSize(saved);
  }, []);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setIsLoggedIn(true);
        setCandidateName(getDisplayName(user.email ?? "", user.user_metadata ?? {}));
      }
      setAuthReady(true);
    });
  }, []);

  const handleTextSizeChange = (value: string) => {
    setTextSize(value);
    localStorage.setItem("mockTestTextSize", value);
  };

  const canBegin = agreed;

  const handleBegin = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    if (isExamMode) {
      // Already inside the desktop popup — navigate within it
      router.push(`/mock-test/${test.slug}/attempt?mode=exam`);
      return;
    }

    if (window.innerWidth < 768) {
      // Mobile: navigate in the same tab
      router.push(`/mock-test/${test.slug}/attempt`);
    } else {
      // Desktop: open secure full-screen popup
      const url = `/mock-test/${test.slug}/instructions?mode=exam`;
      const w = window.screen.availWidth;
      const h = window.screen.availHeight;
      const features = [
        `width=${w}`, `height=${h}`,
        `left=0`, `top=0`,
        "scrollbars=yes", "toolbar=no", "menubar=no",
        "location=no", "status=no", "resizable=yes",
      ].join(",");
      const popup = window.open(url, `exam-${test.slug}`, features);
      if (popup) popup.focus();
    }
  };

  const initial = candidateName ? candidateName.trim().charAt(0).toUpperCase() : "?";
  const redirectPath = encodeURIComponent(`/mock-test/${test.slug}/instructions`);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-base font-semibold text-gray-400 dark:text-gray-500 mb-4">Instructions</h1>


        <div className="grid lg:grid-cols-[1fr_280px] gap-5 items-start">
          <div className="flex flex-col gap-0">
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
              <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                <h2 className="font-bold text-gray-900 dark:text-white mb-3">{test.title}</h2>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <FileQuestion className="w-4 h-4 text-gray-400" /> Total Questions{" "}
                    <strong className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-800 dark:text-gray-200">{test.totalQuestions}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-gray-400" /> Maximum Marks{" "}
                    <strong className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-800 dark:text-gray-200">{test.totalMarks}</strong>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-gray-400" /> Duration{" "}
                    <strong className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded text-gray-800 dark:text-gray-200">{test.durationMinutes} mins</strong>
                  </span>
                  <div className="ml-auto flex items-center gap-3">
                    <label className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                      Text Size:
                      <select value={textSize} onChange={(e) => handleTextSizeChange(e.target.value)}
                        className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-2 py-1 text-sm text-gray-800"
                      >
                        <option>Small</option>
                        <option>Medium</option>
                        <option>Large</option>
                      </select>
                    </label>
                    <label className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                      Language:
                      <select value={language} onChange={(e) => setLanguage(e.target.value)}
                        className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-lg px-2 py-1 text-sm text-gray-800"
                      >
                        <option>English</option>
                        <option>Hindi</option>
                      </select>
                    </label>
                  </div>
                </div>
              </div>

              <div className="p-5 overflow-y-auto" style={{ height: "420px" }}>
                <ExamInstructionsContent durationMinutes={test.durationMinutes} />
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 mt-5 p-5">
              <label className="block text-sm text-gray-900 dark:text-white mb-2">Default Language: <span className="font-semibold text-gray-700 dark:text-gray-300">{language}</span></label>
              <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                Please note all questions will appear in your default language. This language can be changed for a particular question later on.
              </p>

              <label className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400 mb-5 cursor-pointer">
                <input type="checkbox" checked={agreed} onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-primary-600 flex-shrink-0"
                />
                I have read and understood the instructions. I declare that I am not in possession of / not wearing / not carrying any prohibited
                gadget like a mobile phone, bluetooth device, etc. or any prohibited material with me into the examination. I agree that in case
                of not adhering to the instructions, I shall be liable to be barred from this test and/or to disciplinary action, which may
                include being banned from future tests / examinations.
              </label>

              <div className="flex items-center justify-between">
                <Link href="/mock-test" className="text-primary-600 font-medium text-sm hover:text-primary-700 transition-colors">
                  ← Previous
                </Link>
                <button
                  disabled={!canBegin}
                  onClick={handleBegin}
                  className={`px-6 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    canBegin ? "bg-primary-600 text-white hover:bg-primary-700" : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                  }`}
                >
                  I am ready to begin
                </button>
              </div>
            </div>
          </div>

          {/* Candidate panel */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-5 lg:sticky lg:top-6">
            {authReady ? (
              isLoggedIn ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 font-semibold flex items-center justify-center flex-shrink-0">
                    {initial}
                  </div>
                  <span className="font-semibold text-gray-900 dark:text-white">{candidateName}</span>
                </div>
              ) : (
                <div className="text-center py-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Login required to attempt this test</p>
                  <Link href={`/auth/login?redirect=${redirectPath}`}
                    className="inline-flex items-center gap-2 bg-primary-600 text-white rounded-xl px-4 py-2 text-sm font-medium hover:bg-primary-700 transition-colors"
                  >
                    <LogIn className="w-4 h-4" /> Login to continue
                  </Link>
                </div>
              )
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 animate-pulse flex-shrink-0" />
                <div className="h-4 w-28 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Login modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={(e) => { if (e.target === e.currentTarget) setShowLoginModal(false); }}
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-7 relative">
            <button onClick={() => setShowLoginModal(false)}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 bg-primary-600/10 rounded-full flex items-center justify-center mb-5">
              <LogIn className="w-6 h-6 text-primary-600" />
            </div>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Login to attempt test</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
              You need to be signed in to attempt{" "}
              <span className="font-medium text-gray-700 dark:text-gray-300">{test.title}</span>. It only takes a moment.
            </p>

            <div className="space-y-3">
              <Link href={`/auth/login?redirect=${redirectPath}`}
                className="w-full bg-primary-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" /> Sign in to continue
              </Link>
              <Link href={`/auth/signup?redirect=${redirectPath}`}
                className="w-full border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                Create a free account
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
