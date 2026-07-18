"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import DotCard from "@/components/ui/moving-dot-card";
import Footer from "@/components/Footer";
import { supabase } from "@/lib/supabaseClient";
import type { BlogPost } from "@/lib/blogs";
import {
  GraduationCap,
  ArrowRight,
  Play,
  Star,
  BookOpen,
  Users,
  Check,
  ChevronDown,
  ChevronUp,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  MessageCircle,
  Menu,
  X,
  Monitor,
  Globe,
  Award,
  TrendingUp,
  Home as HomeIcon,
  Briefcase,
  Rocket,
  Heart,
  Clock,
  BarChart3,
  Zap,
  ArrowUpRight,
  Mail,
  Phone,
  MapPin,
  Send,
  ChevronRight,
} from "lucide-react";

const CountUp = ({ end, suffix, inView, duration = 2000 }: { end: number; suffix: string; inView: boolean; duration?: number }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let rafId: number;
    let startTime: number | null = null;
    const animate = (ts: number) => {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * end));
      if (progress < 1) { rafId = requestAnimationFrame(animate); }
      else setCount(end);
    };
    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [inView, end, duration]);
  return <>{new Intl.NumberFormat("en-IN").format(count)}{suffix}</>;
};

const HeroSection2 = () => {
  const statsRef = useRef<HTMLDivElement>(null);
  const [statsInView, setStatsInView] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStatsInView(true); observer.disconnect(); } },
      { threshold: 0.2 }
    );
    if (statsRef.current) observer.observe(statsRef.current);
    return () => observer.disconnect();
  }, []);

  const stats = [
    { end: 10000, suffix: "+", label: "Live Classes Conducted" },
    { end: 100000, suffix: "+", label: "Aptitude Questions Taught & Discussed" },
    { end: 25000, suffix: "+", label: "Hours of Teaching & Mentoring" },
    { end: 10, suffix: "+", label: "Years of Law Mentoring", primary: true },
  ];

  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-blue-50/40 to-white dark:from-gray-900 dark:via-gray-900 dark:to-gray-900 min-h-[580px] sm:min-h-[635px] sm:pb-40">

        {/* Mobile-only background image */}
        <div className="absolute inset-0 pointer-events-none select-none block sm:hidden">
          <img
            src="/tlpherosectionmobileview.png"
            alt=""
            className="w-full h-full object-cover object-top"
            draggable={false}
          />
          {/* Top overlay — covers only the text area */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/[0.97] dark:from-gray-900/[0.97] via-white/60 dark:via-gray-900/60 to-transparent [--tw-gradient-from-position:0%] [--tw-gradient-via-position:35%] [--tw-gradient-to-position:52%]" />
          {/* Bottom fade — just enough to blend into stat cards */}
          <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white dark:from-gray-900 to-transparent pointer-events-none" />
        </div>

        {/* Desktop-only background image */}
        <div className="absolute inset-0 pointer-events-none select-none hidden sm:block">
          <img
            src="/tlpherosectionhome.svg"
            alt=""
            className="w-full h-full object-cover object-top"
            draggable={false}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-white/[0.96] dark:from-gray-900/[0.96] via-white/70 dark:via-gray-900/70 to-transparent [--tw-gradient-from-position:0%] [--tw-gradient-via-position:40%] [--tw-gradient-to-position:65%]" />
        </div>

        {/* Text content */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-28 lg:pt-32 pb-10 sm:pb-4"
        >
          <div className="max-w-xl lg:max-w-md xl:max-w-lg text-center sm:text-left">
            <h1 className="text-xl sm:text-5xl lg:text-[76px] lg:leading-[76px] font-semibold text-gray-900 dark:text-white leading-tight mb-2 sm:mb-5 mt-6 sm:mt-0">
              The best investment you can ever make is the one in <span className="text-primary-600">yourself.</span>
            </h1>
            <p className="text-sm sm:text-lg text-gray-700 sm:text-gray-500 dark:text-gray-300 sm:dark:text-gray-400 mb-2 sm:mb-6 max-w-lg">
              Begin your legal journey with top-tier mentorship. Explore preparation strategies designed for elite legal opportunities.
            </p>
            <div className="flex justify-center sm:justify-start mb-4">
              <button className="bg-primary-600 text-white px-6 py-3 rounded-xl text-sm leading-[21px] font-medium flex items-center gap-2 hover:bg-primary-700 transition-colors">
                Enroll now <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>

      </section>

      {/* Stat cards — overlap on desktop, slight pull-up on mobile */}
      <div className="relative z-20 -mt-16 sm:-mt-44 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
        <div ref={statsRef} className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4">
          {stats.map((stat, i) => (
            <div
              key={i}
              className={`rounded-2xl px-4 py-4 sm:px-6 sm:py-6 shadow-lg ${
                stat.primary
                  ? "bg-primary-600"
                  : i === 0
                  ? "bg-white dark:bg-gray-800"
                  : i === 1
                  ? "bg-gray-100 dark:bg-gray-700"
                  : "bg-gray-200/80 dark:bg-gray-600/80"
              }`}
            >
              <p className={`text-xl sm:text-3xl lg:text-4xl font-bold mb-1 leading-tight ${stat.primary ? "text-white" : "text-gray-900 dark:text-white"}`}>
                <CountUp end={stat.end} suffix={stat.suffix} inView={statsInView} />
              </p>
              <p className={`text-xs sm:text-sm ${stat.primary ? "text-primary-100" : "text-gray-500 dark:text-gray-400"}`}>
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const CategoriesSection = () => {
  const categories = [
    {
      num: "01",
      Icon: Monitor,
      title: "Live classes",
      desc: "Live, high-engagement sessions led by industry experts.",
      badge: "INTERACTIVE",
      from: "#3b82f6",
      to: "#06b6d4",
      iconBg: "bg-blue-50 dark:bg-blue-900/20",
      iconColor: "text-blue-600 dark:text-blue-400",
    },
    {
      num: "02",
      Icon: Play,
      title: "Recorded courses",
      desc: "High-quality modules built for your self-paced professional growth.",
      badge: "100+ hours of content",
      from: "#4d65ff",
      to: "#818cf8",
      iconBg: "bg-primary-50 dark:bg-primary-900/20",
      iconColor: "text-primary-600 dark:text-primary-400",
    },
    {
      num: "03",
      Icon: BarChart3,
      title: "Practice tests & test series",
      desc: "Comprehensive assessments with deep insights and topic-wise breakdowns.",
      badge: "ANALYTICAL PERFORMANCE BENCHMARKING",
      from: "#7c3aed",
      to: "#a855f7",
      iconBg: "bg-violet-50 dark:bg-violet-900/20",
      iconColor: "text-violet-600 dark:text-violet-400",
    },
    {
      num: "04",
      Icon: MessageCircle,
      title: "Doubt resolution",
      desc: "Direct access to mentors for resolving complex legal concepts and queries.",
      badge: "EXPERT LEGAL GUIDANCE",
      from: "#059669",
      to: "#10b981",
      iconBg: "bg-emerald-50 dark:bg-emerald-900/20",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      num: "05",
      Icon: GraduationCap,
      title: "One-on-one mentorship",
      desc: "Tailored roadmaps for your legal career with direct expert feedback.",
      badge: "PERSONALIZED STRATEGIC MENTORSHIP",
      from: "#d97706",
      to: "#f59e0b",
      iconBg: "bg-amber-50 dark:bg-amber-900/20",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
    {
      num: "06",
      Icon: BookOpen,
      title: "Books & study material",
      desc: "Access to professional notes, case law compilations, and exclusive study resources.",
      badge: "500+ resources",
      from: "#e11d48",
      to: "#f43f5e",
      iconBg: "bg-rose-50 dark:bg-rose-900/20",
      iconColor: "text-rose-600 dark:text-rose-400",
    },
  ];

  return (
    <section id="overview" className="pt-12 sm:pt-20 lg:pt-28 pb-6 sm:pb-10 bg-white dark:bg-gray-900 relative overflow-hidden">
      {/* Dot grid background */}
      <div
        className="absolute inset-0 opacity-[0.018] dark:opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: "radial-gradient(circle, #4d65ff 1.2px, transparent 1.2px)", backgroundSize: "28px 28px" }}
      />
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[360px] bg-primary-600/[0.05] rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8 sm:mb-14"
        >
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 bg-primary-600 rounded-full flex items-center justify-center">
                <Zap className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-bold tracking-widest text-primary-600 uppercase">What we offer</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-[42px] font-semibold text-gray-900 dark:text-white leading-tight whitespace-nowrap">
              Build your legal foundation
            </h2>
            <p className="mt-3 text-gray-500 dark:text-gray-400 text-sm sm:text-base max-w-lg">
              Everything you need to master your legal path, all in one place.
            </p>
          </div>
          <Link
            href="/course"
            className="inline-flex items-center gap-2 sm:gap-3 bg-primary-600 hover:bg-primary-700 rounded-full pl-4 sm:pl-6 pr-2 sm:pr-3 py-2 sm:py-3 transition-colors flex-shrink-0 self-start md:self-auto"
          >
            <span className="text-xs sm:text-sm font-bold text-white">Explore all courses</span>
            <div className="w-7 h-7 sm:w-9 sm:h-9 bg-white rounded-full flex items-center justify-center">
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary-600" />
            </div>
          </Link>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.num}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="group relative bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 overflow-hidden cursor-pointer hover:-translate-y-2 hover:shadow-2xl hover:shadow-gray-200/70 dark:hover:shadow-gray-950/50 hover:border-gray-200 dark:hover:border-gray-600 transition-all duration-300"
            >
              {/* Gradient top bar */}
              <div
                className="absolute top-0 left-0 right-0 h-[3px] transition-all duration-300 group-hover:h-[4px]"
                style={{ background: `linear-gradient(to right, ${cat.from}, ${cat.to})` }}
              />

              {/* Glow orb on hover */}
              <div
                className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-3xl pointer-events-none"
                style={{ background: `radial-gradient(circle, ${cat.from}25, transparent 70%)` }}
              />

              {/* Watermark number */}
              <div
                className="absolute -right-2 -top-1 text-[88px] font-black leading-none select-none pointer-events-none opacity-[0.045] dark:opacity-[0.07] group-hover:opacity-[0.08] dark:group-hover:opacity-[0.12] group-hover:scale-110 group-hover:-translate-y-1 transition-all duration-500"
                style={{ color: cat.from }}
              >
                {cat.num}
              </div>

              {/* Icon */}
              <div className={`w-12 h-12 ${cat.iconBg} rounded-xl flex items-center justify-center mb-5 transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}
                style={{ ["--tw-shadow-color" as string]: `${cat.from}30` }}>
                <cat.Icon className={`w-6 h-6 ${cat.iconColor}`} />
              </div>

              {/* Content */}
              <h3 className="text-[17px] font-bold text-gray-900 dark:text-white mb-2 leading-snug">{cat.title}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-6">{cat.desc}</p>

              {/* Bottom row */}
              <div className="flex items-center justify-between">
                <span
                  className="inline-flex items-center text-[11px] font-bold px-3 py-1.5 rounded-full tracking-wide uppercase"
                  style={{ background: `${cat.from}12`, color: cat.from }}
                >
                  {cat.badge}
                </span>
                <span
                  className="w-8 h-8 rounded-full border flex items-center justify-center opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-250"
                  style={{ borderColor: `${cat.from}40`, background: `${cat.from}0d` }}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" style={{ color: cat.from }} />
                </span>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};


const FeaturedCourses = () => {
  const [courses, setCourses] = useState<{ slug: string; category: string; title: string; desc: string; duration: string; price: string; img: string }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("courses")
      .select("slug, category, title, desc, duration, price, img")
      .order("id", { ascending: true })
      .limit(3)
      .then(({ data }) => {
        if (data) setCourses(data.map((r: any) => ({
          slug: r.slug,
          category: r.category ?? "",
          title: r.title,
          desc: r.desc,
          duration: r.duration ?? "",
          price: typeof r.price === "number" ? `₹${r.price.toLocaleString("en-IN")}` : String(r.price ?? ""),
          img: r.img ?? "",
        })));
        setLoading(false);
      });
  }, []);

  const skeletons = [0, 1, 2];

  return (
    <section id="courses" className="py-8 sm:py-14 bg-gray-50 dark:bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-3xl p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white"><span className="text-gradient">Featured</span> courses</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-1">Build the legal skills employers and NLUs actually look for</p>
            </div>
            <Link href="/course" className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              View All Courses <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading
              ? skeletons.map((i) => (
                  <div key={i} className="rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 animate-pulse">
                    <div className="h-44 bg-gray-200 dark:bg-gray-700" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                    </div>
                  </div>
                ))
              : courses.map((course, i) => (
                  <motion.div
                    key={course.slug}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.08, duration: 0.4 }}
                    className="rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 hover:shadow-lg hover:shadow-black/5 transition-shadow duration-300"
                  >
                    <Link href={`/course/${course.slug}`} className="block">
                      <div className="relative h-44">
                        {course.img ? (
                          <img src={course.img} alt={course.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <BookOpen className="w-10 h-10 text-gray-300 dark:text-gray-600" />
                          </div>
                        )}
                        {course.category && (
                          <span className="absolute top-3 left-3 bg-black/80 text-white text-xs font-medium px-3 py-1 rounded-full">{course.category}</span>
                        )}
                        {course.price && (
                          <span className="absolute top-3 right-3 bg-white/95 text-gray-900 text-sm font-semibold px-2.5 py-1 rounded-lg">{course.price}</span>
                        )}
                      </div>
                      <div className="p-5">
                        <h3 className="font-bold text-gray-900 dark:text-white mb-1.5">{course.title}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{course.desc}</p>
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">{course.duration}</span>
                          <span className="inline-flex items-center gap-1 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
                            View course <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Curriculum = () => {
  const [activeTab, setActiveTab] = useState(0);

  const tabs = [
    {
      id: 0,
      label: "Notes & Resources",
      Icon: BookOpen,
      title: "Rich study notes with every session,",
      highlight: "ready to download",
      description: "Every live and recorded class comes with structured PDF notes, case study booklets, and legal reference sheets — curated by Bhavtosh A. for maximum retention and quick revision.",
      features: ["Downloadable PDF notes for every lecture", "Case study booklets & legal drafting templates"],
    },
    {
      id: 1,
      label: "Live Video Classes",
      Icon: Monitor,
      title: "HD live sessions you can revisit",
      highlight: "anytime, anywhere",
      description: "Attend interactive live classes with real-time Q&A, or catch up via high-quality recordings. Every session is archived so you never miss a concept, no matter your schedule.",
      features: ["Live sessions with real-time doubt clearing", "Recordings accessible for lifetime"],
    },
    {
      id: 2,
      label: "Practice Tests & Analytics",
      Icon: BarChart3,
      title: "Full-length practice tests with deep",
      highlight: "performance analytics",
      description: "Attempt full-length CLAT PG and subject-wise mock exams. Get a detailed breakdown of your accuracy, time spent, and topic-wise performance to smartly direct your revision.",
      features: ["Full-length CLAT PG & AILET mock series", "Topic-wise accuracy & performance reports"],
    },
    {
      id: 3,
      label: "Expert Mentorship",
      Icon: MessageCircle,
      title: "Direct guidance from your mentor,",
      highlight: "not just a course",
      description: "Get scheduled one-on-one sessions with Bhavtosh A.. Ask questions, receive personalised strategy feedback, and feel genuinely supported every step of your preparation.",
      features: ["Scheduled doubt-clearing sessions", "Personalised strategy & essay review"],
    },
  ];

  const t = tabs[activeTab];

  return (
    <section id="features" className="py-12 sm:py-20 lg:py-24 bg-white dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto flex flex-col items-center">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-8 sm:mb-14">
          <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-4 py-1.5 rounded-full mb-5">
            <Zap className="w-3.5 h-3.5 text-primary-600" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Why Choose Our Courses</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-[44px] font-bold leading-tight text-gray-900 dark:text-white tracking-tight">
            What makes our video courses<br className="hidden sm:block" /> the smartest way to prepare?
          </h2>
        </motion.div>

        {/* Tab bar */}
        <motion.div initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: 0.1 }}
          className="w-full max-w-3xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full p-1.5 flex mb-10 overflow-x-auto scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="relative flex-1 flex items-center justify-center gap-2 px-4 py-2.5 min-w-max">
                <div className={`w-5 h-5 rounded-[4px] flex items-center justify-center transition-all duration-200 ${isActive ? "bg-primary-600" : "bg-gray-200 dark:bg-gray-700"}`}>
                  <tab.Icon className={`w-3 h-3 ${isActive ? "text-white" : "text-gray-500 dark:text-gray-400"}`} />
                </div>
                <span className={`text-sm font-medium whitespace-nowrap transition-colors duration-200 ${isActive ? "text-gray-900 dark:text-white" : "text-gray-500 dark:text-gray-400"}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div layoutId="tabIndicator" transition={{ type: "spring", bounce: 0.2, duration: 0.55 }}
                    className="absolute -bottom-1.5 left-[15%] right-[15%] h-0.5 bg-primary-600 rounded-full" />
                )}
              </button>
            );
          })}
        </motion.div>

        {/* Feature card */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab}
            initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-3xl p-5 sm:p-8 lg:p-12 flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-10">

            {/* Left — text */}
            <div className="flex-1 max-w-lg">
              <h3 className="text-2xl sm:text-[30px] font-bold text-gray-900 dark:text-white leading-tight mb-4">
                {t.title} <span className="text-primary-600">{t.highlight}</span>
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-8">{t.description}</p>
              <div className="flex flex-col gap-3">
                {t.features.map((feat, i) => (
                  <div key={i} className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl px-4 py-3.5 flex items-center gap-3">
                    <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/20 rounded-[10px] flex items-center justify-center flex-shrink-0">
                      <Check className="w-3.5 h-3.5 text-primary-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — mockup */}
            <div className="w-full lg:w-[45%] bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-2xl p-6 min-h-[300px] flex flex-col justify-center overflow-hidden">

              {/* Notes */}
              {activeTab === 0 && (
                <div className="flex flex-col gap-3">
                  {[
                    { name: "Module 1 – Legal Reasoning Foundations.pdf", size: "2.4 MB", color: "text-blue-500" },
                    { name: "Constitutional Law – Case Studies.pdf", size: "3.1 MB", color: "text-primary-600" },
                    { name: "CLAT PG Full Strategy Guide.pdf", size: "1.8 MB", color: "text-green-500" },
                    { name: "Legal Drafting Templates.docx", size: "0.9 MB", color: "text-orange-500" },
                  ].map((doc, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl">
                      <div className="w-9 h-9 rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 flex items-center justify-center flex-shrink-0">
                        <BookOpen className={`w-4 h-4 ${doc.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{doc.name}</p>
                        <p className="text-[11px] text-gray-500">{doc.size}</p>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-primary-600 flex-shrink-0" />
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Video */}
              {activeTab === 1 && (
                <div className="flex flex-col gap-4">
                  <div className="relative rounded-xl overflow-hidden bg-gray-900 aspect-video flex items-center justify-center">
                    <img src="https://picsum.photos/seed/lawvideo/480/270" alt="" className="absolute inset-0 w-full h-full object-cover opacity-50" />
                    <div className="absolute top-2.5 left-2.5 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />LIVE
                    </div>
                    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.15 }}
                      className="relative z-10 w-12 h-12 bg-white/25 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/40">
                      <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </motion.div>
                  </div>
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-3.5">
                    <p className="text-[11px] text-primary-600 font-bold uppercase tracking-wide mb-1">Now Playing</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-white">Constitutional Law – Session 14</p>
                    <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-0.5">Bhavtosh A. · 1h 24m</p>
                  </motion.div>
                </div>
              )}

              {/* Analytics */}
              {activeTab === 2 && (
                <div className="flex flex-col gap-4">
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4 flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full border-4 border-primary-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-base font-bold text-gray-900 dark:text-white">78<span className="text-[10px]">%</span></span>
                    </div>
                    <div>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400">Last Mock Score</p>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">78 / 100 Correct</p>
                      <p className="text-[11px] text-green-500 font-semibold">↑ +6 from previous test</p>
                    </div>
                  </motion.div>
                  <div className="bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl p-4">
                    <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-3 font-medium uppercase tracking-wide">Topic-wise Accuracy</p>
                    {[
                      { label: "Legal Reasoning", pct: 88 },
                      { label: "Constitutional Law", pct: 74 },
                      { label: "Current Affairs & GK", pct: 62 },
                    ].map((item, i) => (
                      <div key={i} className="mb-2.5 last:mb-0">
                        <div className="flex justify-between text-[11px] mb-1">
                          <span className="text-gray-700 dark:text-gray-300">{item.label}</span>
                          <span className="text-gray-500">{item.pct}%</span>
                        </div>
                        <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${item.pct}%` }}
                            transition={{ duration: 0.7, delay: 0.15 + i * 0.1, ease: "easeOut" }}
                            className="h-full bg-primary-600 rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mentorship chat */}
              {activeTab === 3 && (
                <div className="flex flex-col gap-3">
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-gray-700 mb-1">
                    <img src="https://picsum.photos/seed/bhavtosh/40/40" alt="Mentor" className="w-10 h-10 rounded-full object-cover border-2 border-primary-600" />
                    <div>
                      <p className="text-sm font-bold text-gray-900 dark:text-white">Bhavtosh A.</p>
                      <p className="text-[11px] text-green-500 font-medium flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />Online · available now
                      </p>
                    </div>
                  </motion.div>
                  {[
                    { from: "mentor", text: "Great question! Article 21 has expanded vastly — let me walk you through the landmark cases." },
                    { from: "student", text: "Sir, can you also review my moot court essay on fundamental rights?" },
                    { from: "mentor", text: "Absolutely. Send it over and I'll give you detailed feedback before your next session." },
                  ].map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: msg.from === "mentor" ? -10 : 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 + i * 0.12 }}
                      className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl text-[12px] leading-relaxed ${msg.from === "mentor" ? "bg-primary-600 text-white rounded-tl-none" : "bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tr-none ml-auto"}`}>
                      {msg.text}
                    </motion.div>
                  ))}
                </div>
              )}

            </div>
          </motion.div>
        </AnimatePresence>

        {/* Dot nav */}
        <div className="flex gap-1.5 mt-6">
          {tabs.map((_, i) => (
            <button key={i} onClick={() => setActiveTab(i)}
              className={`rounded-full transition-all duration-300 ${activeTab === i ? "w-5 h-2 bg-primary-600" : "w-2 h-2 bg-gray-300 dark:bg-gray-600"}`} />
          ))}
        </div>

      </div>
    </section>
  );
};

const AlumniSection = () => {
  type Card = { avatar: string; name: string; role: string; rating: number; text: string };

  const StarIcon = ({ filled, half }: { filled?: boolean; half?: boolean }) => (
    <svg width="15" height="15" viewBox="0 0 18 18" className="shrink-0">
      {half && (
        <defs>
          <linearGradient id="half-tlp-star">
            <stop offset="50%" stopColor="#4d65ff" />
            <stop offset="50%" stopColor="#d1d5db" />
          </linearGradient>
        </defs>
      )}
      <path
        d="M9 1l2.4 5 5.5.8-4 3.9.9 5.4L9 13.5l-4.8 2.5.9-5.4-4-3.9 5.5-.8z"
        fill={half ? "url(#half-tlp-star)" : filled ? "#4d65ff" : "#d1d5db"}
      />
    </svg>
  );

  const renderStars = (rating: number) =>
    [...Array(5)].map((_, i) => {
      const val = i + 1;
      return (
        <StarIcon key={i} filled={rating >= val} half={rating > i && rating < val} />
      );
    });

  const renderCard = (item: Card, idx: number) => (
    <div
      key={idx}
      className="w-full bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-[22px] p-6 flex flex-col items-center text-center hover:border-primary-600/30 transition-all duration-500 mb-5 last:mb-0"
    >
      <img src={item.avatar} alt={item.name} className="w-14 h-14 rounded-full border-2 border-gray-100 dark:border-gray-700 object-cover shadow-md mb-4" />
      <h3 className="font-bold text-[15px] text-gray-900 dark:text-white tracking-tight mb-1">{item.name}</h3>
      <p className="text-[12px] text-gray-500 dark:text-gray-400 mb-4">{item.role}</p>
      <div className="w-full h-px bg-gray-100 dark:bg-gray-700 mb-4" />
      <div className="flex items-center gap-0.5 mb-4">{renderStars(item.rating)}</div>
      <p className="text-[13px] text-gray-600 dark:text-gray-300 leading-relaxed italic">
        &ldquo;{item.text}&rdquo;
      </p>
    </div>
  );

  const col1: Card[] = [
    {
      avatar: "https://i.pravatar.cc/64?img=44",
      name: "TLP Student",
      role: "CLAT Aspirant",
      rating: 5,
      text: "I started my CLAT preparation from absolute scratch and knew very little when I joined. Bhavtosh A. was leading the faculty there, and the guidance and support I received from him had a significant impact on my preparation. Beyond academics, Sir was always there whenever I needed guidance outside the classroom, and his encouragement helped me stay focused. The mocks, feedback, and constant guidance made the journey much less overwhelming. I'm genuinely grateful for everything I learned from him and for the role he played in my journey.",
    },
    {
      avatar: "https://i.pravatar.cc/64?img=20",
      name: "TLP Student",
      role: "Student at NLSIU Bangalore",
      rating: 5,
      text: "I honestly wouldn't have made it to NLSIU without sir's guidance. He always knew exactly when to push scores, when to motivate, and when to keep things simple. Learning from him never felt stressful — something not normal in CLAT preparation — and I'm really grateful for everything he did for me.",
    },
    {
      avatar: "https://i.pravatar.cc/64?img=15",
      name: "Naman Devpura",
      role: "CLAT Aspirant",
      rating: 5,
      text: "Bhavtosh A. played a formative role in helping me crack CLAT, guiding me to devise an effective strategy to capitalise on my strengths and address my weaknesses. Beyond just covering the syllabus, he instilled a sense of calm and clarity whenever the pressure felt overwhelming. I still reach out to him, and his words continue to anchor me in my most challenging moments. He taught me early on that true progress requires discipline and the character not to be led astray by shortcuts.",
    },
    {
      avatar: "https://i.pravatar.cc/64?img=44",
      name: "TLP Student",
      role: "CLAT Aspirant",
      rating: 5,
      text: "I started my CLAT preparation from absolute scratch and knew very little when I joined. Bhavtosh A. was leading the faculty there, and the guidance and support I received from him had a significant impact on my preparation. Beyond academics, Sir was always there whenever I needed guidance outside the classroom, and his encouragement helped me stay focused. The mocks, feedback, and constant guidance made the journey much less overwhelming. I'm genuinely grateful for everything I learned from him and for the role he played in my journey.",
    },
    {
      avatar: "https://i.pravatar.cc/64?img=20",
      name: "TLP Student",
      role: "Student at NLSIU Bangalore",
      rating: 5,
      text: "I honestly wouldn't have made it to NLSIU without sir's guidance. He always knew exactly when to push scores, when to motivate, and when to keep things simple. Learning from him never felt stressful — something not normal in CLAT preparation — and I'm really grateful for everything he did for me.",
    },
    {
      avatar: "https://i.pravatar.cc/64?img=15",
      name: "Naman Devpura",
      role: "CLAT Aspirant",
      rating: 5,
      text: "Bhavtosh A. played a formative role in helping me crack CLAT, guiding me to devise an effective strategy to capitalise on my strengths and address my weaknesses. Beyond just covering the syllabus, he instilled a sense of calm and clarity whenever the pressure felt overwhelming. I still reach out to him, and his words continue to anchor me in my most challenging moments. He taught me early on that true progress requires discipline and the character not to be led astray by shortcuts.",
    },
  ];

  const col2: Card[] = [
    {
      avatar: "https://i.pravatar.cc/64?img=49",
      name: "TLP Student",
      role: "NLU Graduate | Legal Professional",
      rating: 5,
      text: "When I first began my CLAT preparation, the sheer volume of legal concepts felt completely daunting. That entirely changed once Bhavtosh A. started teaching us. He possesses a rare gift for translating complex legal methods into engaging stories and practical, out-of-the-box scenarios. His classes were always fun and vibrant. He built my conceptual clarity so thoroughly that tackling CLAT almost felt like a game. What sets him apart is his genuine investment in his students — he is a mentor and an older brother figure who truly wants to see you succeed. The foundation he built gave me the critical reasoning skills I relied on throughout university and into my professional career.",
    },
    {
      avatar: "https://i.pravatar.cc/64?img=29",
      name: "Akanksha",
      role: "3rd Year, NALSAR | AIR 121, CLAT",
      rating: 5,
      text: "I am Akanksha, a third year student at NALSAR, one of the best law colleges in India. I secured AIR 121 in my CLAT exam but I had never dreamt of securing this when I first started my preparation at ALLEN CLAT coaching where Bhavtosh A. was our legal reasoning faculty. He was one of the major cornerstones throughout my preparation — not just as a professor, but as a mentor. I still remember running to him after every mock paper, anxious and scared, and he always listened calmly. His pep talk before the CLAT exam was the reason I walked into that exam hall and cracked it.",
    },
    {
      avatar: "https://i.pravatar.cc/64?img=49",
      name: "TLP Student",
      role: "NLU Graduate | Legal Professional",
      rating: 5,
      text: "When I first began my CLAT preparation, the sheer volume of legal concepts felt completely daunting. That entirely changed once Bhavtosh A. started teaching us. He possesses a rare gift for translating complex legal methods into engaging stories and practical, out-of-the-box scenarios. His classes were always fun and vibrant. He built my conceptual clarity so thoroughly that tackling CLAT almost felt like a game. What sets him apart is his genuine investment in his students — he is a mentor and an older brother figure who truly wants to see you succeed. The foundation he built gave me the critical reasoning skills I relied on throughout university and into my professional career.",
    },
    {
      avatar: "https://i.pravatar.cc/64?img=29",
      name: "Akanksha",
      role: "3rd Year, NALSAR | AIR 121, CLAT",
      rating: 5,
      text: "I am Akanksha, a third year student at NALSAR, one of the best law colleges in India. I secured AIR 121 in my CLAT exam but I had never dreamt of securing this when I first started my preparation at ALLEN CLAT coaching where Bhavtosh A. was our legal reasoning faculty. He was one of the major cornerstones throughout my preparation — not just as a professor, but as a mentor. I still remember running to him after every mock paper, anxious and scared, and he always listened calmly. His pep talk before the CLAT exam was the reason I walked into that exam hall and cracked it.",
    },
  ];

  return (
    <section id="testimonials" className="py-12 sm:py-20 bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 md:px-[60px] relative overflow-hidden">
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-primary-600/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-[1200px] mx-auto flex flex-col lg:flex-row gap-10 lg:gap-20 items-start relative z-10">

        {/* Left sticky column */}
        <div className="w-full lg:w-[32%] lg:sticky lg:top-24 flex flex-col lg:h-[700px]">
          <p className="text-xs font-bold tracking-[2px] uppercase text-primary-600 mb-4 lg:mb-6">Student Reviews</p>
          <h2 className="text-xl sm:text-[28px] lg:text-[44px] font-bold leading-[1.15] text-gray-900 dark:text-white tracking-tight">
            Success stories from our learners
          </h2>

          <div className="flex flex-col gap-4 pt-8 lg:mt-auto lg:pt-10">
            <div className="flex items-center">
              <img src="https://i.pravatar.cc/40?img=11" alt="Student" className="w-10 h-10 rounded-full border-2 border-gray-50 dark:border-gray-900 object-cover shadow-lg" />
              <img src="https://i.pravatar.cc/40?img=45" alt="Student" className="w-10 h-10 rounded-full border-2 border-gray-50 dark:border-gray-900 object-cover -ml-3 shadow-lg" />
              <img src="https://i.pravatar.cc/40?img=32" alt="Student" className="w-10 h-10 rounded-full border-2 border-gray-50 dark:border-gray-900 object-cover -ml-3 shadow-lg" />
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-lg text-gray-900 dark:text-white">4.9/5</span>
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <svg key={i} width="16" height="16" viewBox="0 0 18 18">
                    <path d="M9 1l2.4 5 5.5.8-4 3.9.9 5.4L9 13.5l-4.8 2.5.9-5.4-4-3.9 5.5-.8z" fill="#4d65ff" />
                  </svg>
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Based on 2,000+ student reviews</p>
          </div>
        </div>

        {/* Right animated ticker */}
        <div className="w-full lg:w-[68%] h-[560px] lg:h-[700px] relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 h-full">
            {/* Column 1 — scroll up */}
            <div className="relative overflow-hidden h-full">
              <motion.div
                animate={{ y: ["0%", "-50%"] }}
                transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
                className="flex flex-col"
              >
                {col1.map((item, idx) => renderCard(item, idx))}
              </motion.div>
            </div>
            {/* Column 2 — scroll down */}
            <div className="relative overflow-hidden h-full hidden md:block">
              <motion.div
                animate={{ y: ["-50%", "0%"] }}
                transition={{ duration: 34, repeat: Infinity, ease: "linear" }}
                className="flex flex-col"
              >
                {col2.map((item, idx) => renderCard(item, idx))}
              </motion.div>
            </div>
          </div>

          {/* Fade overlays */}
          <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-gray-50 to-transparent dark:from-gray-900 pointer-events-none z-10" />
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-gray-50 to-transparent dark:from-gray-900 pointer-events-none z-10" />
        </div>

      </div>
    </section>
  );
};

const InstructorSection = () => {
  const credentials = [
    "13+ Years of experience in Legal Education & Mentorship",
    "Founder & Chief Mentor at The Law Project",
    "Former Head of Academic Excellence & Chief Mentor (Law) at CLAT Possible",
    "Former Academic Head – CLAT at ALLEN Career Institute",
    "Former Mentor at Career Launcher, ClatPrep Education, and CLAT Possible",
    "Mentored thousands of CLAT aspirants across India",
  ];

  const partnerLabels = [
    "CLAT Possible", "ALLEN Career Institute", "Career Launcher", "ClatPrep Education",
    "CLAT Possible", "ALLEN Career Institute", "Career Launcher", "ClatPrep Education",
  ];

  return (
    <section id="instructor" className="py-12 sm:py-20 bg-gray-50 dark:bg-gray-900 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">

        {/* LEFT — Photo card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative h-[400px] sm:h-[480px] lg:h-auto lg:min-h-[560px] rounded-3xl overflow-hidden border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <img
            src="https://picsum.photos/seed/instructor/600/700"
            alt="Bhavtosh A."
            className="w-full h-full object-cover object-center"
          />
          {/* Bottom name overlay */}
          <div className="absolute bottom-4 left-4 right-4 bg-white dark:bg-gray-800 rounded-2xl px-5 py-4 flex items-center justify-between shadow-lg">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white leading-tight">Bhavtosh A.</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Founder & Chief Mentor, The Law Project</p>
            </div>
            <div className="flex items-center gap-2">
              <a href="#" className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors">
                <Instagram className="w-4 h-4 text-pink-500" />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors">
                <Youtube className="w-4 h-4 text-red-500" />
              </a>
              <a href="#" className="w-9 h-9 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center hover:bg-primary-50 dark:hover:bg-primary-900/30 transition-colors">
                <Linkedin className="w-4 h-4 text-blue-600" />
              </a>
            </div>
          </div>
        </motion.div>

        {/* RIGHT — Content card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="bg-white dark:bg-gray-800 rounded-3xl px-5 py-7 sm:px-8 sm:py-10 flex flex-col justify-between border border-gray-200 dark:border-gray-700 shadow-sm"
        >
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-primary-600 dark:text-primary-400">Meet Your Mentor</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mt-2 mb-4">
              My story
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed mb-3">
              I founded The Law Project after over a decade of guiding CLAT aspirants across India's leading coaching institutions. My mission is simple — to give every law aspirant the mentorship, clarity, and confidence they need to succeed, not just in the exam hall, but in their legal careers.
            </p>
            <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">
              This program is everything I wish I could have offered every student I've taught — structured, personal, and built for real outcomes.
            </p>

            <div className="h-px bg-gray-100 dark:bg-gray-700 my-6" />

            <ul className="space-y-2.5">
              {credentials.map((item, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-300">
                  <span className="w-5 h-5 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary-600 dark:text-primary-400" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="h-px bg-gray-100 dark:bg-gray-700 my-6" />

            {/* Stats */}
            <div>
              <span className="text-xs font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-500">Our Track Record</span>
              <div className="grid grid-cols-4 gap-2 mt-3">
                {[
                  { number: "10K+", label: "Live Classes" },
                  { number: "1L+", label: "Questions Discussed" },
                  { number: "25K+", label: "Hours Mentoring" },
                  { number: "10+", label: "Years Experience" },
                ].map((stat) => (
                  <div key={stat.label} className="rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 p-3 text-center">
                    <p className="text-base font-bold text-gray-900 dark:text-white leading-none">{stat.number}</p>
                    <p className="text-[10px] text-gray-400 leading-snug mt-1.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Scrolling partners */}
          <div className="mt-6">
            <span className="text-xs font-semibold tracking-widest uppercase text-gray-400 dark:text-gray-500">Previously associated with</span>
            <div className="relative mt-3 overflow-hidden">
              <div className="flex items-center gap-10 animate-marquee whitespace-nowrap">
                {partnerLabels.map((label, i) => (
                  <span key={i} className="flex-shrink-0 text-sm font-semibold text-gray-400 dark:text-gray-500">{label}</span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

const BlogSection = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("blogs")
      .select("slug, title, excerpt, date, img, category, read_time, author, author_img, featured, tags, content")
      .order("id", { ascending: false })
      .limit(4)
      .then(({ data }) => {
        if (data) setPosts(data.map((r: any) => ({
          slug: r.slug, title: r.title, excerpt: r.excerpt, date: r.date,
          img: r.img, category: r.category, readTime: r.read_time,
          author: r.author, authorImg: r.author_img, featured: r.featured ?? false,
          tags: r.tags ?? [], content: r.content ?? [],
        })));
        setLoading(false);
      });
  }, []);

  const fmtDate = (d: string) => {
    try {
      return new Date(d).toLocaleDateString("en-IN", { month: "short", year: "2-digit" }).toUpperCase();
    } catch { return d; }
  };

  const featured = posts[0];
  const recent = posts.slice(1, 4);

  return (
    <section className="py-12 sm:py-20 bg-white dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800/40 mb-4">
            <BookOpen className="w-3.5 h-3.5 text-primary-600" />
            <span className="text-sm font-medium text-primary-700 dark:text-primary-400">News, Analysis & Career Roadmaps</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-3">
            Your guide to become a <span className="text-primary-600">complete lawyer</span>
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl">
            Your guide to staying ahead in the legal field.
          </p>
          <Link href="/blogs" className="mt-4 inline-flex items-center gap-1.5 text-primary-600 font-medium text-sm hover:opacity-80 transition-opacity">
            See all articles <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="grid lg:grid-cols-[420px_1fr] gap-8 lg:gap-12 animate-pulse">
            <div className="h-[420px] rounded-3xl bg-gray-100 dark:bg-gray-800" />
            <div className="flex flex-col gap-8 justify-center">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex gap-5">
                  <div className="w-28 h-28 rounded-2xl bg-gray-100 dark:bg-gray-800 shrink-0" />
                  <div className="flex-1 space-y-2 py-2">
                    <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-24" />
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-full" />
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-3/4" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : posts.length === 0 ? (
          <p className="text-center text-gray-400 py-12">No posts found.</p>
        ) : (
          <div className="grid lg:grid-cols-[420px_1fr] gap-8 lg:gap-12 items-stretch">

            {/* Featured post */}
            {featured && (
              <Link href={`/blogs/${featured.slug}`}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                  className="relative h-[400px] lg:h-full min-h-[400px] rounded-3xl overflow-hidden group cursor-pointer bg-gradient-to-br from-primary-900 via-primary-700 to-black"
                >
                  {featured.img && (
                    <img
                      src={featured.img} alt={featured.title}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-7 flex flex-col gap-2">
                    <span className="text-gray-300 text-xs font-medium uppercase tracking-widest">
                      {fmtDate(featured.date)} · {featured.category}
                    </span>
                    <h3 className="text-white text-xl font-semibold leading-snug">{featured.title}</h3>
                    <p className="text-gray-300 text-sm line-clamp-2 mt-1">{featured.excerpt}</p>
                  </div>
                </motion.div>
              </Link>
            )}

            {/* Recent posts list */}
            <div className="flex flex-col justify-center gap-7">
              {recent.map((post, i) => (
                <motion.div key={post.slug} initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
                  <Link href={`/blogs/${post.slug}`} className="flex items-start gap-5 group">
                    <div className="w-28 h-28 shrink-0 rounded-2xl overflow-hidden bg-gradient-to-br from-primary-700 to-black">
                      {post.img && (
                        <img
                          src={post.img} alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      )}
                    </div>
                    <div className="flex flex-col gap-1 py-1">
                      <span className="text-gray-400 text-xs font-medium uppercase tracking-widest">
                        {fmtDate(post.date)} · {post.category}
                      </span>
                      <h4 className="text-gray-900 dark:text-white text-base font-semibold leading-snug group-hover:text-primary-600 transition-colors line-clamp-2">
                        {post.title}
                      </h4>
                      <p className="text-gray-500 dark:text-gray-400 text-sm line-clamp-2 mt-0.5">{post.excerpt}</p>
                      <div className="flex items-center gap-1 text-primary-600 text-sm font-medium mt-1">
                        Read more <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

          </div>
        )}
      </div>
    </section>
  );
};


const FAQ2 = () => {
  const faqCategories = [
    {
      id: "program",
      title: "Program & Content",
      subtext: "Everything you need to know about what's inside the program — topics, structure, and what makes The Law Project different.",
      faqs: [
        { id: 1, q: "Who is this program designed for?", a: "This program is built for aspiring law students preparing for CLAT, AILET, or other law entrance exams, as well as early-career professionals who want structured legal mentorship." },
        { id: 2, q: "What topics does the curriculum cover?", a: "The program covers legal reasoning, constitutional law, contract drafting, moot court techniques, current affairs for law, and mock entrance exam preparation — all taught through real case studies." },
        { id: 3, q: "How much time should I dedicate each week?", a: "We recommend 8–12 hours per week for the best results, but the program is fully self-paced so you can adjust around your schedule." },
        { id: 4, q: "Will I get access to practice tests?", a: "Yes. The program includes full-length practice tests modeled after CLAT, AILET, and other major law entrance exams, with detailed answer explanations." },
        { id: 5, q: "What makes The Law Project different from coaching centers?", a: "Unlike traditional coaching, we combine structured content with direct mentor access, peer community support, and real-world legal exercises — so you build practical skills alongside exam prep." },
        { id: 6, q: "Is live session access included?", a: "Yes. All enrolled students get access to scheduled live mentor sessions where you can ask questions, get feedback on drafts, and participate in moot court practice." },
      ],
    },
    {
      id: "access",
      title: "Access & Enrollment",
      subtext: "Details on how to get started, what devices work, and how long you retain access after enrolling.",
      faqs: [
        { id: 7, q: "How long do I have access after enrolling?", a: "You get lifetime access to all program materials, including any future updates and additional modules added to the curriculum." },
        { id: 8, q: "Can I access the content on my phone?", a: "Yes. The platform is fully responsive and works on mobile, tablet, and desktop — so you can learn wherever you are." },
        { id: 9, q: "Is this self-paced or does it follow a fixed schedule?", a: "The core content is self-paced. Live sessions follow a schedule, but recordings are available shortly after so you never miss anything." },
        { id: 10, q: "What do I need to get started?", a: "Just a device with internet access and a browser. We provide all readings, case materials, and worksheets — no additional textbooks required." },
      ],
    },
    {
      id: "support",
      title: "Support & Refunds",
      subtext: "Our commitment to your success — from mentor access and doubt resolution to our refund guarantee.",
      faqs: [
        { id: 11, q: "What support is available if I have doubts?", a: "You can post questions in the community forum, attend live doubt-clearing sessions, or reach out to mentors directly via the platform's messaging feature." },
        { id: 12, q: "Is there a refund policy?", a: "Yes. We offer a 30-day money-back guarantee. If you're not satisfied within the first 30 days, contact us and we'll process a full refund — no questions asked." },
        { id: 13, q: "Can I interact with the mentor directly?", a: "Absolutely. In addition to live group sessions, select plans include one-on-one mentor calls where you can get personalised feedback on your progress and career goals." },
        { id: 14, q: "How do I enroll?", a: "Click the 'Enroll now' button, choose your plan, and complete checkout. You'll get instant access to the platform and an onboarding email within minutes." },
      ],
    },
  ];

  const [activeCategory, setActiveCategory] = useState(faqCategories[0]);
  const [openFaqId, setOpenFaqId] = useState<number | null>(faqCategories[0].faqs[0].id);

  const handleCategoryChange = (cat: typeof faqCategories[0]) => {
    setActiveCategory(cat);
    setOpenFaqId(cat.faqs[0].id);
  };

  return (
    <section id="faqs" className="bg-white dark:bg-gray-950 py-0 flex justify-center overflow-hidden">
      <div className="w-full max-w-[1248px] px-4 lg:px-6 flex flex-col">

        {/* Header */}
        <div className="flex flex-col items-center text-center gap-5 sm:gap-6 border border-gray-200 dark:border-gray-800 p-6 sm:p-10 lg:p-12">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }}
            className="px-4 py-2 border border-primary-300 dark:border-primary-500/30 bg-primary-50 dark:bg-primary-600/10 text-primary-600 dark:text-primary-400 text-sm font-medium rounded-sm tracking-wide">
            Common Questions
          </motion.div>
          <motion.h2 initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-2xl sm:text-4xl lg:text-[52px] font-medium text-gray-900 dark:text-white leading-tight tracking-tight">
            Got questions?{" "}
            <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">We&apos;ve got answers</span>
          </motion.h2>
          <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.15 }}
            className="text-gray-500 dark:text-gray-400 max-w-2xl text-base sm:text-lg leading-relaxed">
            Everything you need to know about the program, enrollment, access, and mentorship at The Law Project.
          </motion.p>
        </div>

        {/* Main content */}
        <div className="border border-gray-200 dark:border-gray-800 -mt-px">
          <div className="grid grid-cols-1 lg:grid-cols-2">

            {/* Left: category nav */}
            <div className="flex flex-col gap-5 sm:gap-8 py-7 sm:py-10 px-5 sm:px-6 lg:px-8 border-b lg:border-b-0 lg:border-r border-gray-200 dark:border-gray-800">
              {faqCategories.map((cat) => (
                <motion.div key={cat.id} onClick={() => handleCategoryChange(cat)}
                  initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}
                  className="flex flex-col gap-3 cursor-pointer group">
                  <h3 className={`text-lg sm:text-2xl lg:text-3xl font-medium transition-colors duration-300 ${
                    activeCategory.id === cat.id
                      ? "bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent"
                      : "text-gray-300 dark:text-gray-600 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                  }`}>
                    {cat.title}
                  </h3>
                  <AnimatePresence>
                    {activeCategory.id === cat.id && (
                      <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                        className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed max-w-sm overflow-hidden">
                        {cat.subtext}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>

            {/* Right: FAQ accordion */}
            <div className="border border-primary-200 dark:border-gray-700 flex flex-col bg-primary-50/50 dark:bg-gray-800/60 relative overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div key={activeCategory.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }} className="flex flex-col">
                  {activeCategory.faqs.map((faq) => {
                    const isOpen = openFaqId === faq.id;
                    return (
                      <div key={faq.id} onClick={() => setOpenFaqId(isOpen ? null : faq.id)}
                        className={`relative flex flex-col gap-3 p-5 sm:p-6 cursor-pointer transition-colors duration-200 ${isOpen ? "bg-primary-50 dark:bg-gray-700/50" : "hover:bg-gray-50 dark:hover:bg-gray-700/30"}`}>
                        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-primary-300 dark:from-gray-600 to-transparent" />
                        <div className="flex items-center justify-between gap-4">
                          <h4 className="text-base font-medium text-gray-900 dark:text-white leading-snug">{faq.q}</h4>
                          <div className={`flex-shrink-0 w-8 h-8 border flex items-center justify-center transition-all duration-200 rounded-sm ${
                            isOpen
                              ? "border-primary-400 dark:border-gray-500 text-primary-600 dark:text-gray-300 bg-primary-100 dark:bg-gray-600/30"
                              : "border-gray-200 dark:border-gray-700 text-gray-400 dark:text-gray-500 hover:border-gray-400 dark:hover:border-gray-500"
                          }`}>
                            {isOpen
                              ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M18 6L6 18M6 6l12 12"/></svg>
                              : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14"/></svg>
                            }
                          </div>
                        </div>
                        <AnimatePresence>
                          {isOpen && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.25, ease: "easeInOut" }} className="overflow-hidden">
                              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{faq.a}</p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })}
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>

        {/* Bottom CTA */}
        <div className="border border-gray-200 dark:border-gray-800 -mt-px">
          <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-[1fr_auto_auto] items-stretch">
            <div className="flex flex-col justify-center gap-2 py-8 px-6 lg:px-8">
              <h5 className="text-xl font-medium text-gray-900 dark:text-white tracking-tight uppercase">Join the next generation of legal professionals</h5>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md">
                Get in touch with our team — we&apos;re happy to help you decide if The Law Project is the right fit for your goals.
              </p>
            </div>
            <div className="hidden md:block w-px bg-gray-200 dark:bg-gray-800" />
            <div className="flex items-center justify-center px-6 py-6 md:py-0">
              <a href="mailto:hello@thelawproject.com"
                className="flex items-center gap-3 px-7 py-4 bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm rounded-lg transition-colors whitespace-nowrap">
                Contact us <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </motion.div>
        </div>

      </div>
    </section>
  );
};


export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />
      <HeroSection2 />
      <CategoriesSection />
      <FeaturedCourses />
      <Curriculum />
      <AlumniSection />
      <InstructorSection />
      <BlogSection />
      <FAQ2 />
      <Footer />
    </main>
  );
}
