import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  Mail, MapPin, Clock, Users, BookOpen, Code2, Megaphone,
  Settings, Scale, ChevronRight, Lightbulb, TrendingUp, Heart, Globe,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Careers",
  description: "Join The Law Project and help shape the future of legal education in India.",
};

const areas = [
  { icon: BookOpen,   title: "Academics & Research",    desc: "Curriculum design, legal research, faculty coordination and academic quality." },
  { icon: Code2,      title: "Technology",               desc: "Full-stack engineering, product design, DevOps and platform infrastructure." },
  { icon: Scale,      title: "Legal Content",            desc: "Case summaries, study material, mock tests and exam-prep content creation." },
  { icon: Megaphone,  title: "Marketing & Growth",       desc: "Brand strategy, social media, performance marketing and student outreach." },
  { icon: Settings,   title: "Operations",               desc: "Process management, student success, partnerships and admin functions." },
  { icon: Users,      title: "Community & Outreach",     desc: "Building student communities, college tie-ups and ambassador programmes." },
];

const perks = [
  { icon: Globe,       title: "Remote-First Culture",    desc: "Work from anywhere in India. We trust our people to get things done." },
  { icon: TrendingUp,  title: "High-Impact Work",        desc: "Your work directly reaches thousands of law students across the country." },
  { icon: Lightbulb,   title: "Learning Environment",    desc: "Regular knowledge sessions, mentorship from legal and industry experts, and a culture that values continuous growth." },
  { icon: Heart,       title: "Mission-Driven Team",     desc: "We genuinely care about democratising quality legal education in India." },
];

const steps = [
  { num: "01", title: "Send Your Application", desc: "Email your resume and a brief cover note to careers@thelawproject.in, mentioning the role or area you wish to contribute in." },
  { num: "02", title: "Rolling Review",         desc: "Applications are reviewed on an ongoing basis. There is no fixed deadline — we look at profiles as they come in." },
  { num: "03", title: "We Reach Out",           desc: "If your profile matches a current or upcoming opportunity, our team will contact you to take the conversation forward." },
];

// Add openings here when available — leave empty for the "no current openings" state
const openings: { title: string; type: string; location: string; area: string }[] = [
  // { title: "Legal Content Writer", type: "Part-time", location: "Remote", area: "Legal Content" },
];

export default function CareersPage() {
  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-[#030712] pt-[6.5rem] lg:pt-[5.5rem] pb-14 sm:pb-20 relative overflow-hidden">
        {/* Subtle grid */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 opacity-[0.14]
            [mask-image:linear-gradient(to_bottom,transparent_0%,black_40%,black_70%,transparent_100%)]
            bg-[linear-gradient(to_right,rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,.7)_1px,transparent_1px)]
            bg-[size:28px_28px]" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span
            className="inline-flex items-center gap-2 text-[11px] font-bold tracking-[0.18em] uppercase text-primary-400 mb-4"
            style={{ animation: "tlpSlideUp 0.5s cubic-bezier(0.22,1,0.36,1) both" }}
          >
            The Law Project
          </span>
          <h1
            className="text-3xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5"
            style={{ animation: "tlpSlideUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.07s both" }}
          >
            Build the future of<br className="hidden sm:block" /> legal education
          </h1>
          <p
            className="text-sm sm:text-base lg:text-lg text-gray-400 max-w-2xl mx-auto mb-8 leading-relaxed"
            style={{ animation: "tlpSlideUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.14s both" }}
          >
            We welcome applications from passionate individuals who want to help make quality legal education
            accessible to every student in India — regardless of where they come from.
          </p>
          <div style={{ animation: "tlpSlideUp 0.55s cubic-bezier(0.22,1,0.36,1) 0.2s both" }}>
            <a
              href="mailto:careers@thelawproject.in"
              className="inline-flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-7 py-3 rounded-xl text-sm transition-colors"
            >
              <Mail className="w-4 h-4" /> Apply Now
            </a>
          </div>
        </div>
      </section>

      {/* ── Current Openings ─────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[11px] font-bold tracking-widest uppercase text-primary-600 dark:text-primary-400 mb-1">Open Positions</p>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Current Opportunities</h2>
            </div>
          </div>

          {openings.length > 0 ? (
            <div className="space-y-3">
              {openings.map((job) => (
                <div key={job.title} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-4">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{job.title}</h3>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.type}</span>
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                      <span className="bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-2 py-0.5 rounded text-[10px] font-medium">{job.area}</span>
                    </div>
                  </div>
                  <a
                    href={`mailto:careers@thelawproject.in?subject=Application for ${encodeURIComponent(job.title)}`}
                    className="inline-flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex-shrink-0"
                  >
                    Apply <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 border border-dashed border-gray-200 dark:border-gray-700 rounded-2xl px-8 py-10 text-center">
              <div className="w-12 h-12 bg-primary-50 dark:bg-primary-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Scale className="w-5 h-5 text-primary-600 dark:text-primary-400" />
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">No specific openings listed right now</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-5 leading-relaxed">
                We hire on a rolling basis across all functions. Send us your resume and we&apos;ll reach out when a suitable opportunity arises.
              </p>
              <a
                href="mailto:careers@thelawproject.in"
                className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white hover:bg-gray-700 dark:hover:bg-gray-100 text-white dark:text-gray-900 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
              >
                <Mail className="w-3.5 h-3.5" /> Send Open Application
              </a>
            </div>
          )}
        </div>
      </section>

      {/* ── Areas We Hire In ─────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-[11px] font-bold tracking-widest uppercase text-primary-600 dark:text-primary-400 mb-2">Functional Areas</p>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-3">Where you can contribute</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
              We invite professionals from a wide range of backgrounds who share our passion for legal education.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {areas.map((area, i) => (
              <div
                key={area.title}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-primary-300 dark:hover:border-primary-700 hover:shadow-md transition-all duration-200"
                style={{ animation: `tlpSlideUp 0.45s cubic-bezier(0.22,1,0.36,1) ${i * 0.06}s both` }}
              >
                <div className="w-9 h-9 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-3">
                  <area.icon className="w-4.5 h-4.5 text-primary-600 dark:text-primary-400" strokeWidth={1.8} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1.5">{area.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{area.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Join TLP ─────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-[11px] font-bold tracking-widest uppercase text-primary-600 dark:text-primary-400 mb-2">Why TLP</p>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">What it&apos;s like working here</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {perks.map((perk, i) => (
              <div
                key={perk.title}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5"
                style={{ animation: `tlpSlideUp 0.45s cubic-bezier(0.22,1,0.36,1) ${i * 0.07}s both` }}
              >
                <div className="w-9 h-9 bg-primary-50 dark:bg-primary-900/30 rounded-lg flex items-center justify-center mb-3">
                  <perk.icon className="w-4 h-4 text-primary-600 dark:text-primary-400" strokeWidth={1.8} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-1.5">{perk.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{perk.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How to Apply ─────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16 border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-[11px] font-bold tracking-widest uppercase text-primary-600 dark:text-primary-400 mb-2">Process</p>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">How to apply</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {steps.map((step, i) => (
              <div key={step.num} className="relative">
                {/* Connector line */}
                {i < steps.length - 1 && (
                  <div className="hidden sm:block absolute top-5 left-[calc(50%+20px)] right-[-50%] h-px bg-gray-200 dark:bg-gray-700" />
                )}
                <div className="flex flex-col items-center text-center">
                  <div className="w-10 h-10 rounded-full bg-primary-600 text-white text-sm font-bold flex items-center justify-center mb-4 relative z-10">
                    {step.num}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">{step.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-14 sm:py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Ready to make an impact?
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
            Send your resume and a brief cover note to{" "}
            <a href="mailto:careers@thelawproject.in" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
              careers@thelawproject.in
            </a>{" "}
            mentioning the role or area you wish to contribute in.
            Shortlisted candidates will be contacted as suitable opportunities arise.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href="mailto:careers@thelawproject.in"
              className="inline-flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-8 py-3 rounded-xl text-sm transition-colors"
            >
              <Mail className="w-4 h-4" /> careers@thelawproject.in
            </a>
            <Link
              href="/about"
              className="inline-flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 font-medium px-8 py-3 rounded-xl text-sm transition-colors"
            >
              Learn about us <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
