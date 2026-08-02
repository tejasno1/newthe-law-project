import Link from "next/link";
import { Clock, Calendar, Award, ChevronRight, Star } from "lucide-react";
import { PROGRAMMES } from "@/lib/programmes";

export default function SkillProgrammeGrid() {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {PROGRAMMES.map((prog, i) => (
          <div
            key={prog.slug}
            style={{ animation: `tlpSlideUp 0.45s cubic-bezier(0.22, 1, 0.36, 1) ${i * 0.08}s both` }}
          >
            <Link
              href={`/skill-training/${prog.slug}`}
              className="group flex flex-col h-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden hover:shadow-xl hover:border-primary-200 dark:hover:border-primary-700 transition-all duration-300"
            >
              {/* Cover */}
              <div className="relative overflow-hidden h-44">
                <img
                  src={prog.coverImg}
                  alt={prog.shortTitle}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  {prog.isNew && (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                      <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" /> New
                    </span>
                  )}
                  <span className="text-[10px] font-bold text-primary-700 dark:text-primary-300 bg-primary-50 dark:bg-primary-900/60 px-2 py-0.5 rounded-full">
                    {prog.badge}
                  </span>
                </div>
                <div className="absolute bottom-3 right-3">
                  <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm ${
                    prog.enrollment === "open"
                      ? "bg-green-500/20 text-green-300 border border-green-500/30"
                      : "bg-amber-500/20 text-amber-200 border border-amber-500/30"
                  }`}>
                    {prog.enrollment === "open" ? "Enrollment Open" : "Waitlist Open"}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="flex flex-col flex-1 p-5">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-primary-600 dark:text-primary-400 mb-1.5">
                  {prog.category}
                </span>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug mb-2 line-clamp-3">
                  {prog.title}
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed mb-4 line-clamp-2">
                  {prog.tagline}
                </p>
                <div className="flex items-center gap-3 mb-4 mt-auto flex-wrap">
                  <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Calendar className="w-3 h-3" /> {prog.duration}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3 h-3" /> {prog.hoursPerWeek}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <Award className="w-3 h-3" /> Skill India Certified
                  </span>
                </div>
                <div className="pt-3.5 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                  <div>
                    <p className="text-base font-bold text-gray-900 dark:text-white">{prog.price}</p>
                    <p className="text-[10px] text-gray-400">incl. all taxes</p>
                  </div>
                  <span className="flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400 group-hover:gap-2 transition-all duration-200">
                    View Programme <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {PROGRAMMES.length === 0 && (
        <p className="text-center text-gray-400 py-20">No programmes available yet. Check back soon.</p>
      )}
    </>
  );
}
