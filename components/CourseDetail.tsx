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
import { openRazorpayCheckout, parseRupees, recoverPendingOrders, verifyOrder } from "@/lib/razorpay";
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
  Check,
  Video,
  BookOpen,
  Newspaper,
  ClipboardList,
  Monitor,
  RefreshCw,
  Zap,
} from "lucide-react";

export default function CourseDetail({ course, related = [] }: { course: Course; related?: Course[] }) {
  const [openModules, setOpenModules] = useState<Set<number>>(new Set([0]));
  const [openFAQ, setOpenFAQ] = useState<number | null>(0);
  const [activeDemo, setActiveDemo] = useState<number | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [enrollChecked, setEnrollChecked] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [showTncModal, setShowTncModal] = useState(false);
  const [tncChecked, setTncChecked] = useState(false);
  const [tncSaving, setTncSaving] = useState(false);
  const [passTncChecked, setPassTncChecked] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);

  usePageTracking(course.slug);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      setIsLoggedIn(!!user);
      if (user) {
        // Finish any purchase whose checkout never reported back
        await recoverPendingOrders();
        // Check enrollment for this course
        const res = await fetch("/api/enrollments");
        const { enrollments } = await res.json();
        const enrolled = (enrollments ?? []).some(
          (e: { course_slug: string }) => e.course_slug === course.slug
        );
        setIsEnrolled(enrolled);
      }
      setEnrollChecked(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsLoggedIn(!!session?.user);
      if (!session?.user) { setIsEnrolled(false); setEnrollChecked(true); }
    });
    return () => subscription.unsubscribe();
  }, [course.slug]);

  const PASS_PRICE = 1999;

  const proceedToPayment = async () => {
    const priceRupees = parseRupees(course.price);
    if (!priceRupees || priceRupees <= 0) {
      await fetch("/api/enrollments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseSlug: course.slug }),
      });
      setIsEnrolled(true);
      window.location.href = `/course/${course.slug}/learn`;
      return;
    }
    setPaying(true);
    await openRazorpayCheckout({
      amountRupees: priceRupees,
      name: "The Law Project",
      description: course.title,
      purchase: { kind: "course", courseSlug: course.slug },
      onSuccess: async (_paymentId, orderId) => {
        setPaying(false);
        setPaySuccess(true);
        setIsEnrolled(true);
        trackEvent(course.slug, "payment_success");
        await verifyOrder(orderId);
        setTimeout(() => { window.location.href = `/course/${course.slug}/learn`; }, 1800);
      },
      onFailure: () => setPaying(false),
    });
  };

  const handleTncAgree = async () => {
    setTncSaving(true);
    await fetch("/api/record-tnc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseSlug: course.slug }),
    });
    setTncSaving(false);
    setShowTncModal(false);
    setTncChecked(false);
    await proceedToPayment();
  };

  const handleEnroll = async () => {
    trackEvent(course.slug, "enroll_click");
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    if (course.requiresTnc && course.tncContent) {
      setShowTncModal(true);
      return;
    }

    await proceedToPayment();
  };

  const handlePassCheckout = async () => {
    setShowPassModal(false);
    setPaying(true);
    await openRazorpayCheckout({
      amountRupees: PASS_PRICE,
      name: "The Law Project",
      description: "TLP All-Access Plan",
      purchase: { kind: "pass" },
      onSuccess: async (_paymentId, orderId) => {
        setPaying(false);
        setPaySuccess(true);
        setIsEnrolled(true);
        trackEvent(course.slug, "payment_success");
        await verifyOrder(orderId);
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

  function getYouTubeEmbedUrl(url: string): string | null {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    ];
    for (const re of patterns) {
      const m = url.match(re);
      if (m) return `https://www.youtube.com/embed/${m[1]}?autoplay=1&rel=0`;
    }
    return null;
  }

  const demoVideos = [
    course.demoVideoUrl,
    course.demoVideoUrl2,
    course.demoVideoUrl3,
  ]
    .map((url, i) => ({ label: `Demo ${i + 1}`, embedUrl: url ? getYouTubeEmbedUrl(url) : null }))
    .filter((d) => d.embedUrl !== null) as { label: string; embedUrl: string }[];

  const activeDemoUrl = activeDemo !== null ? demoVideos[activeDemo]?.embedUrl ?? null : null;

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

      <section className="bg-gray-50 dark:bg-gray-800 pt-40 sm:pt-44 lg:pt-36 pb-8 sm:pb-12 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-[3fr_2fr] gap-5 sm:gap-10 items-center">
          <div
            className="relative w-full h-48 sm:h-96 rounded-2xl overflow-hidden"
            style={{ animation: "tlpSlideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both" }}
          >
            {/* YouTube player */}
            {activeDemoUrl && (
              <iframe
                src={activeDemoUrl}
                title="Course Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            )}

            {/* Course image + central play button (shown when no demo is active) */}
            {!activeDemoUrl && (
              <>
                <img src={course.img} alt={course.title} className="w-full h-full object-cover" />
                {demoVideos.length > 0 && (
                  <button
                    onClick={() => setActiveDemo(0)}
                    className="absolute inset-0 flex flex-col items-center justify-center gap-3 group"
                    aria-label="Play demo"
                  >
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/45 transition-colors" />
                    <div className="relative z-10 w-14 h-14 sm:w-16 sm:h-16 bg-white/95 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-200">
                      <Play className="w-6 h-6 sm:w-7 sm:h-7 text-gray-900 fill-gray-900 ml-1" />
                    </div>
                    <span className="relative z-10 text-white text-sm sm:text-base font-semibold tracking-wide drop-shadow">
                      Play Demo
                    </span>
                  </button>
                )}
              </>
            )}

            {/* Demo switcher buttons — bottom-right, shown whenever demos exist */}
            {demoVideos.length > 0 && (
              <div className="absolute bottom-3 right-3 z-20 flex gap-1.5">
                {demoVideos.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveDemo(i)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all duration-150 shadow ${
                      activeDemo === i
                        ? "bg-white text-gray-900"
                        : "bg-black/50 text-white hover:bg-black/70"
                    }`}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="min-w-0 w-full" style={{ animation: "tlpSlideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) 0.1s both" }}>
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

            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              {course.startDate && (
                <span className="flex items-center gap-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                  <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                  Starts {course.startDate}
                </span>
              )}
            </div>

            <div className="mb-4 sm:mb-6">
              <div className="flex items-baseline gap-2 sm:gap-3">
                <span className="text-xl sm:text-3xl font-bold text-gray-900 dark:text-white">₹{course.price}</span>
                <span className="text-sm sm:text-lg text-gray-400 line-through">₹{course.oldPrice}</span>
              </div>
              {course.showOfferValidity && course.offerValidTill && (
                <p className="text-xs text-red-500 font-medium mt-1">
                  Offer valid till {course.offerValidTill}
                </p>
              )}
            </div>

            {course.isComingSoon ? (
              <button
                disabled
                className="w-full bg-amber-500 text-white px-6 py-3 rounded-lg text-sm font-semibold cursor-not-allowed opacity-90 flex items-center justify-center gap-2"
              >
                🔒 Coming Soon
              </button>
            ) : !enrollChecked ? (
              <div className="w-full h-11 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
            ) : isEnrolled ? (
              <a href={`/course/${course.slug}/learn`}
                className="w-full bg-primary-600 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2">
                Start Learning
              </a>
            ) : (
              <>
                <button
                  onClick={handleEnroll}
                  disabled={paying}
                  className="w-full bg-black text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {paySuccess ? "✓ Payment Successful! Redirecting…" : paying ? "Processing…" : "Enroll now"}
                </button>
              </>
            )}
          </div>
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
              {course.isComingSoon ? (
                <button
                  disabled
                  className="w-full bg-amber-500 text-white rounded-lg py-2.5 text-sm font-semibold cursor-not-allowed opacity-90 flex items-center justify-center gap-2"
                >
                  🔒 Coming Soon
                </button>
              ) : !enrollChecked ? (
                <div className="w-full h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
              ) : isEnrolled ? (
                <a href={`/course/${course.slug}/learn`}
                  className="w-full bg-primary-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2">
                  Start Learning
                </a>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={paying}
                  className="w-full bg-primary-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {paySuccess ? "✓ Redirecting…" : paying ? "Processing…" : <> Enroll now <ArrowRight className="w-4 h-4" /> </>}
                </button>
              )}
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

      {/* T&C Agreement modal */}
      <AnimatePresence>
        {showTncModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) { setShowTncModal(false); setTncChecked(false); } }}
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white dark:bg-gray-900 w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh]"
            >
              {/* Header */}
              <div className="flex items-start justify-between px-5 pt-5 pb-4 flex-shrink-0 border-b border-gray-100 dark:border-gray-700">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/30 text-amber-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mb-2">
                    <FileText className="w-3 h-3" /> Terms & Conditions
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">Before you enroll</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Please read and agree to the terms below.</p>
                </div>
                <button
                  onClick={() => { setShowTncModal(false); setTncChecked(false); }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0 ml-3 mt-0.5"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Scrollable T&C body */}
              <div className="overflow-y-auto flex-1 px-5 py-4">
                {course.tncContent ? (
                  <pre className="whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-400 leading-relaxed font-sans">
                    {course.tncContent}
                  </pre>
                ) : (
                  <p className="text-sm text-gray-400 italic">No terms and conditions text has been set for this course yet.</p>
                )}
              </div>

              {/* Sticky footer */}
              <div className="flex-shrink-0 border-t border-gray-100 dark:border-gray-700 px-5 py-4 bg-white dark:bg-gray-900 space-y-3">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={tncChecked}
                    onChange={(e) => setTncChecked(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer flex-shrink-0"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300 leading-snug group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                    I have read and agree to the Terms & Conditions stated above.
                  </span>
                </label>
                <button
                  onClick={handleTncAgree}
                  disabled={!tncChecked || tncSaving}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {tncSaving ? "Saving…" : <><Check className="w-4 h-4" /> I Agree — Proceed to Enroll</>}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TLP All-Access Pass modal */}
      <AnimatePresence>
        {showPassModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) { setShowPassModal(false); setPassTncChecked(false); } }}
          >
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white dark:bg-gray-900 w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh]"
            >
              {/* Header */}
              <div className="flex items-start justify-between px-5 pt-5 pb-4 flex-shrink-0 border-b border-gray-100 dark:border-gray-700">
                <div>
                  <div className="inline-flex items-center gap-1.5 bg-primary-50 dark:bg-primary-900/30 text-primary-600 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider mb-2">
                    <Zap className="w-3 h-3" /> Special Offer
                  </div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">TLP All-Access Plan</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">One pass. Every exam. All content.</p>
                </div>
                <button
                  onClick={() => { setShowPassModal(false); setPassTncChecked(false); }}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0 ml-3 mt-0.5"
                >
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Scrollable body */}
              <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">

                {/* Price banner */}
                <div className="bg-gradient-to-r from-primary-600 to-blue-600 rounded-2xl p-4 text-white flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-xs font-medium">Annual subscription</p>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-3xl font-bold">₹1,999</span>
                      <span className="text-white/60 text-sm line-through">₹4,999</span>
                    </div>
                    <p className="text-white/80 text-xs mt-1">Less than ₹6/day · 365 days access</p>
                  </div>
                  <div className="bg-white/20 rounded-xl px-3 py-2 text-center flex-shrink-0">
                    <p className="text-[10px] font-semibold text-white/80">YOU SAVE</p>
                    <p className="text-lg font-bold text-white">60%</p>
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-3.5 h-3.5 text-amber-600" />
                    </div>
                    <h3 className="font-bold text-gray-900 dark:text-white text-sm">Terms &amp; Conditions</h3>
                  </div>
                  <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-800/30 rounded-xl p-3.5 space-y-2.5 text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                    {[
                      ["1. Subscription", "The Plan grants access to TLP's digital content library for 12 months from the date of successful payment, at the price displayed at checkout."],
                      ["2. Early Access / Advance Booking", "This subscription is offered as an early access / advance booking purchase. The TLP All-Access web portal shall become operational, and content shall be made available to subscribers, with effect from September 1, 2026. Purchases made before this date secure early access at the applicable price; access to content will commence from the launch date stated above."],
                      ["3. Content Rollout", "Content is added in a phased, ongoing manner and not made available all at once. TLP does not commit to a fixed date, volume, or sequence for uploading specific topics or exam-wise material. Subscribing does not guarantee that all listed exam categories will have complete content within the 12-month period. All new content added during the subscription period is included at no extra cost."],
                      ["4. Nature of Content", "The TLP All-Access Plan is designed as a broad-based learning resource covering multiple law exams and legal courses under a single subscription. The content is generic in nature — built around core legal subjects and concepts common across exams — supplemented with exam-specific guidance and resources where applicable. Content under this Plan is not customised or tailor-made for any individual exam or individual needs; it is designed to support a subscriber's overall preparation across the exams listed on this Plan."],
                      ["5. Single-User Access", "Access is for one named user only. Account or credential sharing may result in suspension without refund."],
                      ["6. Intellectual Property", "All content is the property of TLP / Bhavtosh A. It is for personal study only; reproduction, redistribution, or resale is prohibited and may lead to termination of access and legal action."],
                      ["7. No Guarantee of Outcomes", "TLP does not guarantee admission, selection, or exam results. Subscribers should verify exam-specific syllabus, eligibility, and pattern changes with official sources."],
                      ["8. Refunds", "No refunds will be provided once a subscription is purchased, except where TLP is unable to provide the course/content as planned, in which case a refund (full or prorated, at TLP's discretion) will be considered."],
                      ["9. Changes to Terms", "TLP may update these Terms or modify Plan content/features at any time; continued use after changes constitutes acceptance."],
                      ["10. Governing Law", "These terms are governed by the laws of India, subject to the exclusive jurisdiction of the courts at Jaipur, Rajasthan."],
                    ].map(([title, body]) => (
                      <div key={title}>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">{title} — </span>{body}
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Sticky footer */}
              <div className="flex-shrink-0 border-t border-gray-100 dark:border-gray-700 px-5 py-4 bg-white dark:bg-gray-900">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className="text-xs text-gray-500">To Pay</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold text-gray-900 dark:text-white">₹1,999</span>
                      <span className="text-sm text-gray-400 line-through">₹4,999</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-green-600 font-semibold">You save ₹3,000</p>
                    <p className="text-[11px] text-gray-400">365 days · all exams</p>
                  </div>
                </div>
                <label className="flex items-start gap-2.5 cursor-pointer mb-3">
                  <input
                    type="checkbox"
                    checked={passTncChecked}
                    onChange={(e) => setPassTncChecked(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500 cursor-pointer flex-shrink-0"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400 leading-snug">
                    I have read and agree to the Terms &amp; Conditions above.
                  </span>
                </label>
                <button
                  onClick={handlePassCheckout}
                  disabled={paying || !passTncChecked}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {paying ? "Processing…" : <><Zap className="w-4 h-4" /> Get Pass — ₹1,999/yr</>}
                </button>
                <p className="text-center text-[11px] text-gray-400 mt-2">
                  Secure payment via Razorpay · Less than ₹6/day
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
