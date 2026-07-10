"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Users, GraduationCap, ChevronRight, Quote } from "lucide-react";

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.55, delay },
});

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />

      {/* ── Hero ── */}
      <section className="bg-gray-50 dark:bg-gray-800 pt-20 sm:pt-24 pb-16 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeUp(0)} className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 text-xs font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 shadow-sm text-gray-600 dark:text-gray-400">
              <Users className="w-3.5 h-3.5" />
              Our Story
            </span>
          </motion.div>
          <motion.h1 {...fadeUp(0.08)} className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
            Legal Education,<br />
            <span className="text-gradient">Reimagined.</span>
          </motion.h1>
          <motion.p {...fadeUp(0.15)} className="text-gray-500 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            The Law Project was founded with a simple yet powerful belief:
          </motion.p>
          <motion.blockquote
            {...fadeUp(0.22)}
            className="mt-6 text-lg sm:text-xl font-semibold text-gray-800 dark:text-gray-200 max-w-2xl mx-auto leading-relaxed border-l-4 border-primary-600 pl-6 text-left"
          >
            A student's geographical location, financial circumstances, or access to quality coaching should never determine the quality of legal education they receive.
          </motion.blockquote>
        </div>
      </section>

      {/* ── Story Body ── */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">

          <motion.div {...fadeUp(0)} className="prose prose-gray max-w-none">
            <motion.p {...fadeUp(0)} className="text-gray-600 dark:text-gray-400 leading-relaxed text-base mb-6">
              Legal education has traditionally been confined to classrooms, expensive coaching institutes, and geographical limitations. We believe it deserves to be far more accessible, flexible, and student-centric.
            </motion.p>

            <motion.p {...fadeUp(0.05)} className="text-gray-600 dark:text-gray-400 leading-relaxed text-base mb-6">
              That belief inspired the creation of The Law Project — a comprehensive legal learning platform dedicated to students and professionals at every stage of their legal journey.
            </motion.p>

            <motion.p {...fadeUp(0.08)} className="text-gray-600 dark:text-gray-400 leading-relaxed text-base mb-10">
              Whether you are preparing for CLAT-UG, CLAT PG, Judiciary, UGC NET Law, 3-Year LL.B. Entrance, looking for upgrading yourself as a law student, or a lawyer by developing necessary skills, or simply wish to strengthen your understanding of law, The Law Project offers carefully curated learning experiences through multiple formats.
            </motion.p>
          </motion.div>

          {/* Callout card */}
          <motion.div
            {...fadeUp(0.1)}
            className="bg-primary-600 rounded-2xl p-8 sm:p-10 text-white mb-10"
          >
            <Quote className="w-8 h-8 text-primary-300 mb-4" />
            <p className="text-base sm:text-lg leading-relaxed font-medium">
              From live interactive classes and premium recorded courses to digital study material, practice books, test series, mentorship programmes, revision resources, workshops, and skill-based legal courses, our objective is to ensure that every learner has access to quality legal education in the format that suits them best.
            </p>
          </motion.div>

          <motion.div {...fadeUp(0)} className="space-y-6 mb-10">
            <motion.div {...fadeUp(0.05)} className="bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl p-7">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Because learning is not one-size-fits-all.</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                Some students learn best in a live classroom. Others prefer recorded lectures. Some thrive through mentorship, while others excel with structured self-paced learning. We embrace all of these learning styles because our focus is not on <em>how</em> students learn — it is on ensuring that they do.
              </p>
            </motion.div>

            <motion.p {...fadeUp(0.08)} className="text-gray-600 dark:text-gray-400 leading-relaxed text-base">
              Unlike conventional coaching institutes that often prioritise admissions, we prioritise outcomes. Our philosophy revolves around conceptual clarity, personal mentorship, practical application, continuous improvement, and lifelong learning.
            </motion.p>

            <motion.p {...fadeUp(0.1)} className="text-gray-600 dark:text-gray-400 leading-relaxed text-base">
              Our vision extends far beyond entrance examinations. We aspire to remain with our learners before, during, and after law school — helping them crack competitive examinations, excel in academics, develop practical legal skills, build meaningful careers, and become competent, ethical, and confident members of the legal profession.
            </motion.p>
          </motion.div>

          {/* "We build future lawyers" statement */}
          <motion.div
            {...fadeUp(0.12)}
            className="text-center py-10 border-y border-gray-100 dark:border-gray-700 mb-10"
          >
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-3">At The Law Project, we do not simply prepare students for examinations.</p>
            <p className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">We build <span className="text-gradient">future lawyers.</span></p>
          </motion.div>
        </div>
      </section>

      {/* ── Meet the Founder ── */}
      <section className="py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          <motion.div {...fadeUp(0)} className="flex flex-col items-center mb-12">
            <span className="inline-flex items-center gap-2 text-xs font-medium bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-full px-4 py-2 shadow-sm text-gray-600 dark:text-gray-400">
              <GraduationCap className="w-3.5 h-3.5" />
              Meet the Founder
            </span>
          </motion.div>

          <motion.div
            {...fadeUp(0.08)}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden"
          >
            <div className="grid lg:grid-cols-5">
              {/* Photo */}
              <div className="lg:col-span-2">
                <img
                  src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=600&q=80&fit=crop"
                  alt="Bhavtosh A."
                  className="w-full h-72 lg:h-full object-cover object-top"
                />
              </div>

              {/* Content */}
              <div className="lg:col-span-3 p-8 sm:p-10 lg:p-12">
                <div className="mb-6">
                  <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">Bhavtosh A.</h2>
                  <p className="text-primary-600 font-semibold text-sm">Law Educator · Lead Mentor · Founder, The Law Project</p>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-5">
                  Bhavtosh A. is a Law Educator, Lead Mentor, and the Founder of The Law Project. An NLU Graduate and LL.M., he has spent more than a decade mentoring law aspirants and guiding thousands of students preparing for various Law Entrance and other law competitive examinations. Throughout his teaching journey, he has trained numerous top performers and earned the trust of students through his mentorship-driven approach to legal education.
                </p>

                <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">His philosophy is simple:</p>
                <blockquote className="border-l-2 border-primary-600 pl-4 mb-5">
                  <p className="italic text-base text-gray-800 dark:text-gray-200 font-medium leading-relaxed">
                    &ldquo;Teaching begins in the classroom. Mentorship begins after it.&rdquo;
                  </p>
                </blockquote>

                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-5">
                  He believes education is not merely about delivering lectures — it is about understanding every learner's strengths, identifying their challenges, building confidence, providing honest feedback, and ensuring continuous academic growth.
                </p>

                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-5">
                  This philosophy gave birth to The Law Project, where every course, every resource, and every initiative is designed around one objective: helping learners realise their fullest potential.
                </p>

                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-5">
                  His long-term vision is to build one of India's most trusted legal learning platforms — one that supports aspiring lawyers not only before they enter law school, but throughout their academic journey and professional career.
                </p>

                <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-5 text-sm text-gray-700 dark:text-gray-300 space-y-1 leading-relaxed">
                  <p className="italic">Because becoming a lawyer is not an event.</p>
                  <p className="italic">It is a lifelong journey.</p>
                  <p className="italic">And The Law Project is committed to walking that journey with every learner.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 bg-white dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            {...fadeUp(0)}
            className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-3xl px-8 sm:px-14 py-14 text-center"
          >
            <p className="text-primary-200 text-sm font-medium uppercase tracking-widest mb-4">Our Promise</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6 leading-snug">
              With You Before, During<br />&amp; After Law School.
            </h2>
            <div className="flex flex-wrap justify-center gap-3">
              <Link
                href="/course"
                className="inline-flex items-center gap-2 bg-white text-primary-700 font-semibold px-7 py-3 rounded-xl hover:bg-primary-50 transition-colors text-sm"
              >
                Explore Courses <ChevronRight className="w-4 h-4" />
              </Link>
              <Link
                href="/mock-test"
                className="inline-flex items-center gap-2 border border-primary-400/40 text-white px-7 py-3 rounded-xl hover:bg-primary-700/30 transition-colors text-sm font-medium"
              >
                Free Mock Test
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
