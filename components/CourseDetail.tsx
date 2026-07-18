"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { createClient } from "@/lib/supabase/client";
import type { Course } from "@/lib/courses";
import AccessBadge from "@/components/AccessBadge";

const TestimonialSlider = dynamic(() => import("@/components/TestimonialSlider"), { ssr: false });
import { usePageTracking, trackEvent } from "@/lib/tracking";
import { openRazorpayCheckout, parseRupees } from "@/lib/razorpay";
import {
  Star,
  Clock,
  Play,
  BarChart3,
  Globe,
  FileText,
  Calendar,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  CheckCircle2,
  Target,
  ArrowRight,
  Plus,
  Minus,
  X,
  LogIn,
  ShoppingCart,
} from "lucide-react";

export default function CourseDetail({ course, related = [] }: { course: Course; related?: Course[] }) {
  const [openModules, setOpenModules] = useState<Set<number>>(new Set([0]));
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  usePageTracking(course.slug);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setIsLoggedIn(!!user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsLoggedIn(!!session?.user);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleEnroll = async () => {
    trackEvent(course.slug, "enroll_click");
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    const priceRupees = parseRupees(course.price);
    if (!priceRupees || priceRupees <= 0) {
      window.location.href = `/course/${course.slug}/learn`;
      return;
    }
    setPaying(true);
    await openRazorpayCheckout({
      amountRupees: priceRupees,
      name: "The Law Project",
      description: course.title,
      onSuccess: (paymentId) => {
        setPaying(false);
        setPaySuccess(true);
        trackEvent(course.slug, "payment_success");
        setTimeout(() => { window.location.href = `/course/${course.slug}/learn`; }, 1800);
      },
      onFailure: () => setPaying(false),
    });
  };

  const toggleModule = (i: number) => {
    setOpenModules((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  const allOpen = openModules.size === course.modules.length;
  const toggleAll = () => setOpenModules(allOpen ? new Set() : new Set(course.modules.map((_, i) => i)));

  const totalLectures = course.modules.reduce((sum, m) => sum + (m.lessonsCount ?? m.items.length), 0);

  const info = [
    { icon: Clock, label: "Duration:", value: course.duration },
    { icon: Play, label: "Lesson:", value: course.lessons },
    { icon: BarChart3, label: "Level:", value: course.level },
    { icon: Globe, label: "Language:", value: course.language },
    { icon: FileText, label: "File:", value: course.files },
    { icon: Calendar, label: "Last update:", value: course.lastUpdate },
  ];

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900 overflow-x-hidden">
      <Navbar />

      <section className="bg-gray-50 dark:bg-gray-800 pt-28 sm:pt-28 pb-8 sm:pb-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-5 sm:gap-10 items-center">
          <motion.img
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            src={course.img}
            alt={course.title}
            className="block w-full max-w-full h-48 sm:h-96 object-cover rounded-2xl"
          />

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="min-w-0 w-full">
            <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500 mb-3 min-w-0">
              <Link href="/course" className="hover:text-primary-600 transition-colors flex-shrink-0">Course</Link>
              <ChevronRight className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="text-gray-700 dark:text-gray-300 truncate min-w-0">{course.title}</span>
            </div>

            <div className="flex items-center gap-3 mb-2 sm:mb-3">
              <h1 className="text-xl sm:text-4xl font-bold text-gray-900 dark:text-white break-words">{course.title}</h1>
            </div>

            {course.accessType && (
              <div className="mb-3 sm:mb-4">
                <AccessBadge accessType={course.accessType} />
              </div>
            )}

            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 flex-wrap">
              <span className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </span>
              {course.reviewsCount} <span className="text-gray-300">|</span> {course.students} Student Enrolled
            </div>

            <div className="flex items-baseline gap-2 sm:gap-3 mb-4 sm:mb-6">
              <span className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">₹{course.price}</span>
              <span className="text-sm sm:text-lg text-gray-400 line-through">₹{course.oldPrice}</span>
            </div>

            <button
              onClick={handleEnroll}
              disabled={paying}
              className="w-full bg-black text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {paySuccess ? "✓ Payment Successful! Redirecting…" : paying ? "Processing…" : "Enroll now"}
            </button>
          </motion.div>
        </div>
      </section>

      <section className="py-7 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-3 gap-6 sm:gap-10">
          <div className="lg:col-span-2">
            <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">Course overview</h2>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed mb-5 sm:mb-8">{course.longDesc}</p>

            {course.idealFor.length > 0 && (
              <>
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">Ideal for</h2>
                <div className="grid sm:grid-cols-2 gap-2 sm:gap-3 mb-5 sm:mb-8">
                  {course.idealFor.map((item) => (
                    <div key={item} className="flex items-start gap-2.5 sm:gap-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 sm:p-4">
                      <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            {course.outcomes.length > 0 && (
              <>
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white mb-2 sm:mb-4">Course outcome</h2>
                <div className="grid sm:grid-cols-2 gap-2 sm:gap-3 mb-5 sm:mb-8">
                  {course.outcomes.map((item) => (
                    <div key={item} className="flex items-start gap-2.5 sm:gap-3 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3 sm:p-4">
                      <Target className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600 flex-shrink-0 mt-0.5" />
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{item}</span>
                    </div>
                  ))}
                </div>
              </>
            )}

            <div className="flex items-center justify-between mb-2 sm:mb-3">
              <h2 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">Course content</h2>
              <button onClick={toggleAll} className="text-xs sm:text-sm font-medium text-primary-600 hover:underline">
                {allOpen ? "Collapse All" : "Expand All"}
              </button>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 mb-4 sm:mb-5">
              {course.modules.length} Modules&nbsp;•&nbsp;{totalLectures} lectures&nbsp;•&nbsp;{course.duration} length
            </p>
            <div className="mb-0 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700 divide-y divide-gray-200 dark:divide-gray-700">
              {course.modules.map((module, i) => (
                <div key={i}>
                  <button
                    className="w-full flex items-center gap-3 px-4 py-4 text-left bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => toggleModule(i)}
                  >
                    {openModules.has(i) ? (
                      <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-0.5">Module {i + 1}</p>
                      <p className="font-semibold text-gray-900 dark:text-white text-sm">{module.title}</p>
                    </div>
                  </button>
                  {openModules.has(i) && (
                    <div className="bg-white dark:bg-gray-900 divide-y divide-gray-50 dark:divide-gray-800">
                      {module.description && (
                        <p className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{module.description}</p>
                      )}
                      {module.items.map((item, j) => (
                        <div key={j} className="flex items-center justify-between px-5 py-2.5">
                          <span className="flex items-center gap-2.5 text-sm text-gray-700 dark:text-gray-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-gray-400 flex-shrink-0" />
                            {item.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

          </div>

          <div className="lg:col-span-1">
            <div className="rounded-2xl border border-gray-100 dark:border-gray-700 dark:bg-gray-800 p-4 sm:p-6 lg:sticky lg:top-28">
              <h3 className="font-bold text-gray-900 dark:text-white mb-3">Course information</h3>
              <ul className="space-y-2.5 mb-4">
                {info.map((item) => (
                  <li key={item.label} className="flex items-center justify-between gap-2 text-sm min-w-0">
                    <span className="flex items-center gap-2 text-gray-500 flex-shrink-0">
                      <item.icon className="w-4 h-4" /> {item.label}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-white text-right truncate">{item.value}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={handleEnroll}
                disabled={paying}
                className="w-full bg-primary-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {paySuccess ? "✓ Redirecting…" : paying ? "Processing…" : <> Enroll now <ArrowRight className="w-4 h-4" /> </>}
              </button>
            </div>
          </div>
        </div>
      </section>

      {course.reviews.length > 0 && <TestimonialSlider reviews={course.reviews} />}

      {course.faqs.length > 0 && (
        <section className="py-7 sm:py-12 dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
              <div className="mb-6 sm:mb-10 text-center">
                <span className="inline-block py-1 px-3 rounded-full bg-primary-600/10 text-primary-600 font-semibold text-xs uppercase tracking-wider mb-2 sm:mb-3">
                  FAQ
                </span>
                <h2 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">Frequently <span className="text-gradient">asked questions</span></h2>
                <div className="w-12 h-1 bg-primary-600 rounded-full mt-3 mx-auto" />
              </div>

              <div className="divide-y divide-gray-100 dark:divide-gray-700 border border-gray-100 dark:border-gray-700 rounded-2xl overflow-hidden">
                {course.faqs.map((faq, i) => (
                  <div key={i} className="bg-white dark:bg-gray-800">
                    <button
                      className="w-full flex items-center justify-between gap-3 px-4 sm:px-6 py-3.5 sm:py-5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => setOpenFAQ(openFAQ === i ? null : i)}
                    >
                      <span className={`font-medium text-xs sm:text-base ${openFAQ === i ? "text-primary-600" : "text-gray-900 dark:text-white"}`}>
                        {faq.question}
                      </span>
                      <span className={`flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center transition-colors ${openFAQ === i ? "bg-primary-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500"}`}>
                        {openFAQ === i ? <Minus className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> : <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
                      </span>
                    </button>
                    {openFAQ === i && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        className="px-4 sm:px-6 pb-4 sm:pb-5"
                      >
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{faq.answer}</p>
                      </motion.div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      <section className="py-7 sm:py-12 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6">Related <span className="text-gradient">courses</span></h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((rc) => (
              <div key={rc.slug} className="group rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-900 hover:shadow-lg hover:shadow-black/5 transition-shadow duration-300">
                <div className="overflow-hidden">
                  <img src={rc.img} alt={rc.title} className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110" />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400 mb-3">
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {rc.duration}</span>
                    <span className="flex items-center gap-1.5"><Play className="w-3.5 h-3.5" /> {rc.lessons}</span>
                    <span className="flex items-center gap-1.5"><Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" /> {rc.rating}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2">{rc.title}</h3>
                  <div className="flex items-baseline gap-2 mb-5">
                    <span className="text-lg font-bold text-gray-900 dark:text-white">₹{rc.price}</span>
                    <span className="text-sm text-gray-400 line-through">₹{rc.oldPrice}</span>
                  </div>
                  <Link
                    href={`/course/${rc.slug}`}
                    className="w-full border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 text-sm font-medium text-gray-900 dark:text-gray-200 flex items-center justify-center hover:bg-primary-600 hover:border-primary-600 hover:text-white transition-colors"
                  >
                    View course
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />

      {/* Login-to-purchase modal */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setShowLoginModal(false); }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2 }}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-sm p-7 relative"
            >
              <button
                onClick={() => setShowLoginModal(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-12 h-12 bg-primary-600/10 rounded-full flex items-center justify-center mb-5">
                <LogIn className="w-6 h-6 text-primary-600" />
              </div>

              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Login to purchase</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 leading-relaxed">
                You need to be signed in to enroll in{" "}
                <span className="font-medium text-gray-700 dark:text-gray-300">{course.title}</span>.
                It only takes a moment.
              </p>

              <div className="space-y-3">
                <Link
                  href={`/auth/login?redirect=/course/${course.slug}`}
                  className="w-full bg-primary-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2"
                  onClick={() => setShowLoginModal(false)}
                >
                  <LogIn className="w-4 h-4" />
                  Sign in to continue
                </Link>
                <Link
                  href={`/auth/signup?redirect=/course/${course.slug}`}
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
                  onClick={() => setShowLoginModal(false)}
                >
                  <ShoppingCart className="w-4 h-4" />
                  Create a free account
                </Link>
              </div>

              <p className="text-xs text-center text-gray-400 mt-4">
                Already enrolled?{" "}
                <Link href="/dashboard" className="text-primary-600 hover:underline" onClick={() => setShowLoginModal(false)}>
                  Go to dashboard
                </Link>
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
