"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PROGRAMMES } from "@/lib/programmes";
import { Clock, Calendar, Award, ChevronRight, Star, BadgeCheck } from "lucide-react";

export default function SkillTrainingPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />

      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="pt-28 sm:pt-32 pb-12 sm:pb-16 bg-gray-50 dark:bg-gray-800/40 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <span className="inline-block text-xs font-semibold tracking-widest uppercase text-primary-600 dark:text-primary-400 mb-3">
              The Law Project
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-gray-900 dark:text-white mb-4">
              QuickSkills Programmes
            </h1>
            <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto text-sm sm:text-base">
              Practitioner-designed certificate courses built for lawyers at every stage — from your first brief to complex regulatory matters.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ── PROGRAMME CARDS ──────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {PROGRAMMES.map((prog, i) => (
            <motion.div key={prog.slug}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}>
              <Link href={`/skill-training/${prog.slug}`}
                className="group flex flex-col h-full rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden hover:shadow-xl hover:shadow-black/8 hover:border-primary-200 dark:hover:border-primary-700 transition-all duration-300">

                {/* Cover */}
                <div className="relative overflow-hidden h-44">
                  <img src={prog.coverImg} alt={prog.shortTitle}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  {/* Badges */}
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
                  {/* Enrollment status */}
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

                  {/* Meta */}
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

                  {/* Footer row */}
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
            </motion.div>
          ))}
        </div>

        {/* Empty state for when more are added */}
        {PROGRAMMES.length === 0 && (
          <p className="text-center text-gray-400 py-20">No programmes available yet. Check back soon.</p>
        )}
      </section>

      {/* ── BOTTOM CTA STRIP ─────────────────────────────────── */}
      <section className="bg-primary-600 py-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <BadgeCheck className="w-5 h-5 text-primary-200" />
            <span className="text-primary-200 text-sm font-semibold">Skill India + NSDC Certified</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-white mb-3">
            Not sure which programme is right for you?
          </h2>
          <p className="text-primary-100 text-sm mb-6 max-w-lg mx-auto">
            Our team can help you choose the right course based on your current practice area and career goals.
          </p>
          <a href={`https://wa.me/9555634585?text=${encodeURIComponent("Hi! I'd like to know more about your Skill Training Programmes.")}`}
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-6 py-3 rounded-xl text-sm hover:bg-primary-50 transition-colors">
            Talk to a Counsellor
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
