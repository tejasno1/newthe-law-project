"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  ArrowRight, Star,
  LayoutGrid, GraduationCap, BookOpen, Scale, FileText,
  ChevronDown, Check, ClipboardList, Award, Briefcase, Globe, Users,
} from "lucide-react";
import type { Course } from "@/lib/courses";

const ICON_MAP: Record<string, React.ElementType> = {
  "LayoutGrid": LayoutGrid,
  "GraduationCap": GraduationCap,
  "BookOpen": BookOpen,
  "Scale": Scale,
  "FileText": FileText,
  "ClipboardList": ClipboardList,
  "Award": Award,
  "Briefcase": Briefcase,
  "Globe": Globe,
  "Users": Users,
};

function resolveIcon(name: string): React.ElementType {
  return ICON_MAP[name] ?? BookOpen;
}

const ACCESS_OPTIONS = [
  { value: "all",  label: "All Plans" },
  { value: "free", label: "Free" },
  { value: "paid", label: "Paid" },
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
        <div
          className="absolute top-full left-0 mt-2 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl shadow-xl shadow-black/10 py-1.5 min-w-[200px] z-30"
          style={{ animation: "tlpSlideUp 0.15s cubic-bezier(0.22, 1, 0.36, 1) both" }}
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
        </div>
      )}
    </div>
  );
}

interface OrderedCategory {
  name: string;
  icon_name: string;
}

const CourseHero = ({
  courses,
  orderedCategories = [],
}: {
  courses: Course[];
  orderedCategories?: OrderedCategory[];
}) => {
  const [activeCategory, setActiveCategory] = useState("All Courses");
  const [activePlan, setActivePlan] = useState("all");
  const [enrolledSlugs, setEnrolledSlugs] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/enrollments")
      .then(r => r.json())
      .then(({ enrollments }) => {
        if (Array.isArray(enrollments))
          setEnrolledSlugs(new Set(enrollments.map((e: { course_slug: string }) => e.course_slug)));
      })
      .catch(() => {});
  }, []);

  // Build category list: use DB order when available, fall back to alphabetical
  const courseCatNames = new Set(courses.map((c) => c.category).filter(Boolean) as string[]);

  const ordered = orderedCategories
    .filter((cat) => courseCatNames.has(cat.name))
    .map((cat) => ({ name: cat.name, iconName: cat.icon_name }));

  const unmatched = Array.from(courseCatNames)
    .filter((n) => !orderedCategories.some((c) => c.name === n))
    .sort()
    .map((n) => ({ name: n, iconName: "BookOpen" }));

  const categories = [
    { name: "All Courses", iconName: "LayoutGrid" },
    ...ordered,
    ...unmatched,
  ];

  // Map category name → its admin-defined position (for sorting in All Courses view)
  const categoryOrderMap = new Map(
    orderedCategories.map((cat, i) => [cat.name, i])
  );

  const filteredCourses = courses
    .filter((c) => {
      const catMatch = activeCategory === "All Courses" || c.category === activeCategory;
      const planMatch = activePlan === "all" || c.accessType === activePlan;
      return catMatch && planMatch;
    })
    .sort((a, b) => {
      if (activeCategory !== "All Courses") return 0;
      const aIdx = categoryOrderMap.get(a.category ?? "") ?? 999;
      const bIdx = categoryOrderMap.get(b.category ?? "") ?? 999;
      return aIdx - bIdx;
    });

  const activeCatName = activeCategory;

  return (
    <section className="bg-white dark:bg-gray-900 pt-8 sm:pt-10 pb-12 sm:pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">


        {/* Category chips */}
        <div className="flex flex-nowrap sm:flex-wrap overflow-x-auto sm:overflow-visible scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0 justify-start sm:justify-center gap-2.5 mb-5 pb-1 sm:pb-0">
          {categories.map(({ name, iconName }) => {
            const Icon = resolveIcon(iconName);
            const active = activeCatName === name;
            return (
              <button
                key={name}
                onClick={() => setActiveCategory(name)}
                className={`flex-shrink-0 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all duration-200 ${
                  active
                    ? "border-2 border-primary-600 text-primary-600 bg-white"
                    : "border border-transparent text-gray-900 dark:text-gray-100 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${active ? "text-primary-600" : "text-gray-500"}`} />
                {name}
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
              <div
                key={course.slug}
                style={{ animation: `tlpSlideUp 0.4s cubic-bezier(0.22, 1, 0.36, 1) ${(i % 6) * 0.06}s both` }}
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
                    <div className="absolute top-3 right-3 flex items-center gap-1.5">
                      {course.deliveryType === "online" && (
                        <span className="flex items-center shadow-md overflow-hidden rounded-full">
                          <span className="bg-white w-5 h-5 rounded-full flex items-center justify-center border-2 border-red-600 flex-shrink-0 -mr-1 z-10">
                            <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-red-600" xmlns="http://www.w3.org/2000/svg">
                              <path d="M8 5.14v14l11-7-11-7z"/>
                            </svg>
                          </span>
                          <span className="bg-red-600 text-white text-[9px] font-extrabold tracking-widest pl-2.5 pr-2.5 py-0.5 rounded-r-full">
                            LIVE
                          </span>
                        </span>
                      )}
                      {course.deliveryType === "recorded" && (
                        <span className="bg-white/95 backdrop-blur-sm text-gray-700 text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-sm flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-gray-400 flex-shrink-0" />
                          Recorded
                        </span>
                      )}
                      {course.deliveryType === "live_and_recorded" && (
                        <span className="flex items-center shadow-md overflow-hidden rounded-full">
                          <span className="bg-white w-5 h-5 rounded-full flex items-center justify-center border-2 border-red-600 flex-shrink-0 -mr-1 z-10">
                            <svg viewBox="0 0 24 24" className="w-2.5 h-2.5 fill-red-600" xmlns="http://www.w3.org/2000/svg">
                              <path d="M8 5.14v14l11-7-11-7z"/>
                            </svg>
                          </span>
                          <span className="bg-red-600 text-white text-[9px] font-extrabold tracking-widest pl-1.5 py-0.5">
                            LIVE
                          </span>
                          <span className="bg-gray-800 text-white text-[9px] font-extrabold tracking-widest pl-1 pr-2 py-0.5 rounded-r-full">
                            + REC
                          </span>
                        </span>
                      )}
                      {course.isComingSoon && (
                        <span className="bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                          Coming Soon
                        </span>
                      )}
                      {course.category && (
                        <span className="bg-white/95 backdrop-blur-sm text-gray-800 text-[10px] font-semibold px-2 py-0.5 rounded-md shadow-sm">
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
                      {course.isComingSoon ? (
                        <span className="ml-auto bg-gray-900 dark:bg-gray-700 hover:bg-primary-600 dark:hover:bg-primary-600 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors duration-200 whitespace-nowrap">
                          Check Details
                        </span>
                      ) : enrolledSlugs.has(course.slug) ? (
                        <span className="ml-auto bg-primary-600 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors duration-200 whitespace-nowrap">
                          Start Learning
                        </span>
                      ) : (
                        <span className="ml-auto bg-gray-900 dark:bg-gray-700 hover:bg-primary-600 dark:hover:bg-primary-600 text-white text-xs font-semibold px-3 py-1.5 rounded-md transition-colors duration-200 whitespace-nowrap">
                          Enroll Now
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};


export default function CourseCatalog({
  courses,
  orderedCategories = [],
}: {
  courses: Course[];
  orderedCategories?: OrderedCategory[];
}) {
  return (
    <CourseHero courses={courses} orderedCategories={orderedCategories} />
  );
}
