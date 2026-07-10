"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowRight, Star,
  LayoutGrid, GraduationCap, BookOpen, Scale, FileText,
  ChevronDown, Check,
} from "lucide-react";
import type { Course } from "@/lib/courses";

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  "All Courses": LayoutGrid,
  "CLAT UG": GraduationCap,
  "CLAT PG": BookOpen,
  "Judiciary": Scale,
  "NLSAT": FileText,
};

const ACCESS_OPTIONS = [
  { value: "all",               label: "All Plans" },
  { value: "free",              label: "Free" },
  { value: "tlp_plus",         label: "TLP Plus" },
  { value: "one_time_purchase", label: "One Time Purchase" },
];

const floatingTags = [
  { label: "ADVOCATE", img: "https://picsum.photos/seed/float1/200/260" },
  { label: "MENTOR",   img: "https://picsum.photos/seed/float2/200/260" },
  { label: "JUSTICE",  img: "https://picsum.photos/seed/float3/200/260" },
  { label: "CAREER",   img: "https://picsum.photos/seed/float4/200/260" },
  { label: "GROWTH",   img: "https://picsum.photos/seed/float5/200/260" },
];

function PlanDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const selected = ACCESS_OPTIONS.find((o) => o.value === value) ?? ACCESS_OPTIONS[0];
  const isFiltered = value !== "all";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={`flex items-center gap-2 border rounded-full px-5 py-2 text-sm font-medium transition-all ${
          isFiltered
            ? "border-primary-600 text-primary-600 bg-primary-50 dark:bg-primary-900/20"
            : "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-900 hover:border-gray-400 hover:text-gray-800 dark:hover:text-white"
        }`}
      >
        {isFiltered ? selected.label : "Plan"}
        <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.15 }}
          className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl shadow-black/10 py-1.5 min-w-[200px] z-30"
        >
          {ACCESS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { onChange(opt.value); setOpen(false); }}
              className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 dark:hover:bg-gray-700 ${
                value === opt.value ? "text-primary-600 font-semibold" : "text-gray-700 dark:text-gray-300"
              }`}
            >
              {opt.label}
              {value === opt.value && <Check className="w-3.5 h-3.5" />}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

const CourseHero = ({ courses }: { courses: Course[] }) => {
  const [activeCategory, setActiveCategory] = useState("All Courses");
  const [activePlan, setActivePlan] = useState("all");

  const categories = [
    "All Courses",
    ...Array.from(new Set(courses.map((c) => c.category).filter(Boolean))).sort(),
  ];

  const filteredCourses = courses.filter((c) => {
    const catMatch = activeCategory === "All Courses" || c.category === activeCategory;
    const planMatch = activePlan === "all" || c.accessType === activePlan;
    return catMatch && planMatch;
  });

  return (
    <section className="bg-white dark:bg-gray-900 pt-24 sm:pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            Explore All Courses &amp; <span className="text-gradient">Learning Paths</span>
          </h1>
          <p className="text-gray-500">
            <span className="text-gray-500 dark:text-gray-400">Discover practical, career-focused legal courses carefully built to help you crack exams, land internships, and build real skills.</span>
          </p>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap justify-center gap-2.5 mb-5">
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat] ?? BookOpen;
            const active = activeCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-200 ${
                  active
                    ? "border-2 border-primary-600 text-primary-600 bg-white"
                    : "border border-transparent text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${active ? "text-primary-600" : "text-gray-500"}`} />
                {cat}
              </button>
            );
          })}
        </div>

        {/* Dropdown filters row */}
        <div className="flex justify-center gap-3 mb-12">
          <PlanDropdown value={activePlan} onChange={setActivePlan} />
        </div>

        {/* Course grid */}
        {filteredCourses.length === 0 ? (
          <p className="text-center text-gray-400 py-16">No courses found for this filter.</p>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course, i) => (
              <motion.div
                key={course.slug}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 6) * 0.06, duration: 0.4 }}
              >
                <Link
                  href={`/course/${course.slug}`}
                  className="group block rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-800 hover:shadow-lg hover:shadow-black/8 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-300"
                >
                  {/* Thumbnail */}
                  <div className="relative overflow-hidden">
                    <img
                      src={course.img}
                      alt={course.title}
                      className="w-full h-44 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      {course.deliveryType && (
                        <span className="bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${course.deliveryType === "online" ? "bg-green-500" : "bg-gray-400"}`} />
                          {course.deliveryType === "online" ? "Online" : "Recorded"}
                        </span>
                      )}
                      {course.category && (
                        <span className="bg-white/95 backdrop-blur-sm text-gray-800 text-xs font-semibold px-2.5 py-1 rounded-md shadow-sm">
                          {course.category}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 dark:text-white text-[15px] leading-snug mb-2.5 line-clamp-2">
                      {course.title}
                    </h3>

                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                      {course.level} · {course.duration}
                    </p>

                    <div className="pt-3 border-t border-gray-100 dark:border-gray-700 flex items-center gap-2">
                      <span className="font-bold text-gray-900 dark:text-white text-sm">₹{course.price}</span>
                      <span className="text-xs text-gray-400 dark:text-gray-500 line-through">₹{course.oldPrice}</span>
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        {course.rating}
                      </div>
                      <span className="ml-auto bg-gray-900 dark:bg-gray-700 hover:bg-primary-600 dark:hover:bg-primary-600 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors duration-200 whitespace-nowrap">
                        View course
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

const UpgradeCTA = () => (
  <section className="relative bg-gray-50 dark:bg-gray-800 py-24 overflow-hidden">
    <div className="absolute inset-0 bg-grid-faint [mask-image:radial-gradient(ellipse_at_center,black,transparent_70%)]" />

    <div className="relative max-w-4xl mx-auto px-4 text-center mb-16">
      <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-6">
        Upgrade your skills, <span className="text-gradient">unlock your potential</span>
      </h2>
      <button className="inline-flex items-center gap-2 bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors">
        Explore our courses <ArrowRight className="w-4 h-4" />
      </button>
    </div>

    <div className="relative flex flex-wrap justify-center items-end gap-4 sm:gap-6 max-w-5xl mx-auto px-4">
      {floatingTags.map((item, i) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.08, duration: 0.5 }}
          className="relative w-28 sm:w-36 h-36 sm:h-44 rounded-2xl overflow-hidden shadow-lg"
          style={{ marginBottom: i % 2 === 0 ? "0px" : "28px" }}
        >
          <img src={item.img} alt={item.label} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
          <span className="absolute bottom-3 left-3 right-3 text-white text-xs font-bold tracking-wide bg-black/60 px-2 py-1 rounded-md text-center">
            {item.label}
          </span>
        </motion.div>
      ))}
    </div>
  </section>
);

export default function CourseCatalog({ courses }: { courses: Course[] }) {
  return (
    <>
      <CourseHero courses={courses} />
      <UpgradeCTA />
    </>
  );
}
