"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getProgramme } from "@/lib/programmes";
import { openRazorpayCheckout, parseRupees } from "@/lib/razorpay";
import {
  Clock, Calendar, Check, ChevronDown, ChevronRight,
  Users, BadgeCheck, Play, FileText, Star,
  Laptop, Link2, Gavel, TrendingUp,
  BookOpen, Briefcase, Target, Quote,
  Share2, X, Mail,
} from "lucide-react";

/* ── helpers ─────────────────────────────────────────────────── */
function FadeUp({ children, delay = 0, className = "" }: {
  children: React.ReactNode; delay?: number; className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref}
      initial={{ opacity: 0, y: 28 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}>
      {children}
    </motion.div>
  );
}

function Accordion({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-0">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between py-5 text-left gap-4 hover:opacity-75 transition-opacity">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">{q}</span>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 text-gray-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="body"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
            <p className="pb-5 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SyllabusAccordion({ title, items, index }: { title: string; items: string[]; index: number }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(v => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left gap-4 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
        <div className="flex items-center gap-3">
          <span className="w-7 h-7 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-xs font-bold flex items-center justify-center flex-shrink-0">
            {index + 1}
          </span>
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{title}</span>
        </div>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 text-gray-400 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="body"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.22 }} className="overflow-hidden">
            <ul className="px-5 pb-5 pt-3 border-t border-gray-100 dark:border-gray-700 space-y-2">
              {items.map((item, j) => (
                <li key={j} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <ChevronRight className="w-3.5 h-3.5 text-primary-500 flex-shrink-0 mt-0.5" />{item}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const WHO_ICONS = [BookOpen, Briefcase, TrendingUp, Gavel];

export default function ProgrammeDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const prog = getProgramme(slug);
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [enrollOpen, setEnrollOpen] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [formDone, setFormDone] = useState(false);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) {
        setShareOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    document.body.style.overflow = enrollOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [enrollOpen]);

  function handleShare(platform: string) {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const text = encodeURIComponent(prog!.title);
    if (platform === "whatsapp") window.open(`https://wa.me/?text=${encodeURIComponent(prog!.title + " " + url)}`, "_blank");
    if (platform === "twitter") window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${text}`, "_blank");
    if (platform === "linkedin") window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, "_blank");
    if (platform === "facebook") window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
    if (platform === "email") window.location.href = `mailto:?subject=${text}&body=${encodeURIComponent(url)}`;
    if (platform === "copy") { navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    setShareOpen(false);
  }

  async function handleEnrollSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!prog) return;
    const priceRupees = parseRupees(prog.price);
    if (priceRupees > 0) {
      setPaying(true);
      await openRazorpayCheckout({
        amountRupees: priceRupees,
        name: "The Law Project",
        description: prog.title,
        prefill: { name: form.name, email: form.email, contact: form.phone },
        onSuccess: (paymentId) => {
          setPaying(false);
          const msg = `Hi! I've successfully booked a slot for: ${prog.title}\n\nName: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}\nPayment ID: ${paymentId}`;
          window.open(`https://wa.me/9555634585?text=${encodeURIComponent(msg)}`, "_blank");
          setFormDone(true);
        },
        onFailure: () => setPaying(false),
      });
    } else {
      const msg = `Hi! I'd like to book a slot for: ${prog.title}\n\nName: ${form.name}\nEmail: ${form.email}\nPhone: ${form.phone}`;
      window.open(`https://wa.me/9555634585?text=${encodeURIComponent(msg)}`, "_blank");
      setFormDone(true);
    }
  }

  if (!prog) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] flex-col gap-4">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Programme not found</h1>
          <Link href="/skill-training" className="text-primary-600 hover:underline text-sm">← Back to QuickSkills</Link>
        </div>
        <Footer />
      </div>
    );
  }

  function copyLink() {
    navigator.clipboard.writeText(typeof window !== "undefined" ? window.location.href : "");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const enrollLabel = prog.enrollment === "open" ? "Enroll Now" : "Book Your Slot";

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <Navbar />

      {/* ════════════════════════════════════════════════════════
          1. HERO — dark (matches rest of site)
      ════════════════════════════════════════════════════════ */}
      <section className="bg-gray-950 pt-20 sm:pt-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-gray-500 pt-6 pb-7 flex-wrap">
            <Link href="/" className="hover:text-gray-300 transition-colors">Home</Link>
            <span className="text-gray-700">/</span>
            <Link href="/skill-training" className="hover:text-gray-300 transition-colors">QuickSkills</Link>
            <span className="text-gray-700">/</span>
            <span className="text-gray-400 line-clamp-1">{prog.shortTitle}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-10 lg:gap-14 items-end">

            {/* LEFT */}
            <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }} className="pb-10 lg:pb-14">

              <div className="flex flex-wrap items-center gap-2 mb-5">
                {prog.isNew && (
                  <span className="flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-1 rounded-full">
                    <Star className="w-3 h-3 fill-amber-400" /> New
                  </span>
                )}
                <span className="text-[11px] font-semibold text-primary-400 bg-primary-400/10 border border-primary-400/20 px-2.5 py-1 rounded-full">
                  {prog.badge}
                </span>
                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${
                  prog.enrollment === "open"
                    ? "text-green-400 bg-green-400/10 border-green-400/20"
                    : "text-amber-400 bg-amber-400/10 border-amber-400/20"
                }`}>
                  {prog.enrollment === "open" ? "● Enrollment Open" : "● Waitlist Open"}
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-[2.5rem] font-semibold text-white leading-snug mb-4 max-w-2xl">
                {prog.title}
              </h1>
              <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-7 max-w-lg">
                {prog.tagline}
              </p>

              <div className="flex flex-wrap gap-2 mb-8">
                {[
                  { icon: Calendar, text: prog.duration },
                  { icon: Clock, text: prog.hoursPerWeek },
                  { icon: Users, text: "Live Online" },
                  { icon: BadgeCheck, text: "Skill India Certified" },
                ].map(m => (
                  <span key={m.text} className="flex items-center gap-1.5 text-xs text-gray-300 bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg">
                    <m.icon className="w-3.5 h-3.5 text-primary-400" /> {m.text}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <button onClick={() => { setEnrollOpen(true); setFormDone(false); }}
                  className="bg-primary-600 hover:bg-primary-500 text-white font-semibold px-7 py-3.5 rounded-xl text-sm transition-all duration-200 hover:scale-105 shadow-lg shadow-primary-600/25">
                  {enrollLabel}
                </button>
                <button className="border border-white/20 hover:border-white/40 text-white font-medium px-5 py-3.5 rounded-xl text-sm transition-colors flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Download Syllabus
                </button>
              </div>
            </motion.div>

            {/* RIGHT — cover image */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.65, delay: 0.1 }}
              className="relative h-56 sm:h-72 lg:h-[320px] rounded-t-2xl overflow-hidden self-end">
              <img src={prog.coverImg} alt={prog.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-gray-950/60 via-black/10 to-transparent" />
              <button className="absolute inset-0 flex items-center justify-center group" aria-label="Play intro">
                <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center group-hover:bg-white/30 transition-colors">
                  <Play className="w-7 h-7 text-white fill-white ml-0.5" />
                </div>
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          2. TRUST STRIP
      ════════════════════════════════════════════════════════ */}
      <section className="bg-gray-50 dark:bg-gray-800 border-y border-gray-100 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <p className="text-center text-[11px] font-semibold uppercase tracking-widest text-gray-400 mb-4">
            Trusted by legal professionals from
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-7 gap-y-2">
            {["Supreme Court of India", "Delhi High Court", "Bombay High Court", "NLU Delhi", "NLU Bangalore", "Amity Law School", "SCC Online"].map(org => (
              <span key={org} className="text-xs font-semibold text-gray-400 dark:text-gray-500 tracking-wide whitespace-nowrap">{org}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          3. STATS ROW
      ════════════════════════════════════════════════════════ */}
      <section className="bg-white dark:bg-gray-900 py-10 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            {[
              { value: "10,000+", label: "Live Classes Conducted" },
              { value: "1,00,000+", label: "Questions Discussed" },
              { value: "25,000+", label: "Hours of Mentoring" },
              { value: "10+", label: "Years of Experience" },
            ].map((s, i) => (
              <FadeUp key={s.label} delay={i * 0.07}>
                <p className="text-2xl sm:text-3xl font-bold text-primary-600 dark:text-primary-400">{s.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-snug">{s.label}</p>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          4. "A Training Worth Your Time" — 3 STEP CARDS
      ════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-800/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-gray-900 dark:text-white">
              A Training Worth Your Time.{" "}
              <span className="text-primary-600 dark:text-primary-400">Guaranteed.</span>
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 max-w-lg mx-auto">
              Every element is designed to make you practice-ready — not just certificate-ready.
            </p>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              { step: "01", title: "Learn from Practitioners", desc: "Every class is taught by lawyers who are actively practising — real cases, real strategy, real outcomes.", icon: BookOpen },
              { step: "02", title: "Practice Every Week", desc: "Two drafting exercises per week with written feedback from your instructor. You improve by doing, not just listening.", icon: Briefcase },
              { step: "03", title: "Get Placed & Certified", desc: "Placement support, CV enhancement, interview prep, and a nationally recognised Skill India + NSDC certificate.", icon: BadgeCheck },
            ].map((s, i) => (
              <motion.div key={s.step}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 hover:border-primary-200 dark:hover:border-primary-700 hover:shadow-md transition-all duration-300 group">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl font-black text-gray-100 dark:text-gray-700 group-hover:text-primary-100 dark:group-hover:text-primary-900/30 transition-colors">{s.step}</span>
                  <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center">
                    <s.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                </div>
                <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2">{s.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          5. TESTIMONIAL QUOTE
      ════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <FadeUp>
            <Quote className="w-10 h-10 text-primary-200 dark:text-primary-800 mx-auto mb-6" />
            <blockquote className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white leading-relaxed mb-8">
              "The drafting exercises and live classes completely changed how I approach bail applications. I got my first PMLA brief within two months of completing the course."
            </blockquote>
            <div className="flex items-center justify-center gap-3">
              <img src="https://picsum.photos/seed/testimonial-law/80/80" alt="Priya Mehta"
                className="w-11 h-11 rounded-full object-cover" />
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900 dark:text-white">Priya Mehta</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Criminal Litigator · Delhi High Court</p>
              </div>
            </div>
            <div className="flex items-center justify-center gap-1.5 mt-6">
              {[0, 1, 2].map(d => (
                <span key={d} className={`rounded-full transition-all ${d === 0 ? "w-6 h-2 bg-primary-600" : "w-2 h-2 bg-gray-200 dark:bg-gray-700"}`} />
              ))}
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          6. WHAT YOU'LL GET — 2×2 feature cards
      ════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-800/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="mb-10">
            <p className="text-xs font-bold tracking-widest uppercase text-primary-600 dark:text-primary-400 mb-2">Programme Highlights</p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">What you'll get</h2>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: Laptop, title: "Live Online Classes", desc: "Weekly live classes after work hours — attend from anywhere on mobile or laptop, no commute needed." },
              { icon: FileText, title: "Practical Drafting Exercises", desc: "Two real-world drafting assignments every week, with written instructor feedback on each submission." },
              { icon: BadgeCheck, title: "Skill India + NSDC Certificate", desc: "Nationally recognised certification through Medhavi Skills University on successful completion." },
              { icon: Target, title: "Career & Placement Support", desc: "CV enhancement, mock interviews, internship referrals, job placement guidance and networking coaching." },
            ].map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.45 }}
                className="flex gap-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-6 hover:border-primary-200 dark:hover:border-primary-700 hover:shadow-md transition-all duration-300">
                <div className="w-11 h-11 bg-primary-50 dark:bg-primary-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <f.icon className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{f.title}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          7. WHAT YOU'LL LEARN — 3-col chip grid
      ════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="mb-10">
            <p className="text-xs font-bold tracking-widest uppercase text-primary-600 dark:text-primary-400 mb-2">Curriculum</p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">What you'll learn</h2>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {prog.learnings.map((l, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, scale: 0.97 }} whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }} transition={{ delay: i * 0.04, duration: 0.35 }}
                className="flex items-start gap-2.5 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4 hover:border-primary-200 dark:hover:border-primary-700 hover:shadow-sm transition-all duration-300">
                <Check className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{l}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          8. MEET YOUR MENTOR — editorial profile cards
      ════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-800/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="mb-10">
            <p className="text-xs font-bold tracking-widest uppercase text-primary-600 dark:text-primary-400 mb-2">Your Instructors</p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">Meet your Mentor</h2>
          </FadeUp>

          <div className="space-y-5">
            {prog.faculty.map((f, i) => (
              <motion.div key={f.name}
                initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                className="rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">

                {/* ── TOP BANNER (dark strip) */}
                <div className="bg-gray-950 dark:bg-gray-900 px-6 pt-6 pb-0 flex flex-col sm:flex-row sm:items-end gap-5">
                  {/* photo */}
                  <div className="relative flex-shrink-0">
                    <img src={f.img} alt={f.name}
                      className="w-24 h-24 sm:w-32 sm:h-32 rounded-t-xl sm:rounded-t-2xl object-cover border-4 border-white/10" />
                    {/* online indicator */}
                    <span className="absolute bottom-0 right-0 w-4 h-4 bg-green-500 border-2 border-gray-950 rounded-full" />
                  </div>
                  {/* name + role */}
                  <div className="pb-5 sm:pb-6">
                    <p className="text-xl sm:text-2xl font-bold text-white">{f.name}</p>
                    <p className="text-sm text-primary-400 font-medium mt-1">{f.role}</p>
                    {/* credential chips */}
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {["Delhi High Court", "PMLA", "Criminal Litigation", "White-Collar Crime"].map(tag => (
                        <span key={tag}
                          className="text-[10px] font-semibold bg-white/8 border border-white/12 text-gray-300 px-2.5 py-0.5 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ── BOTTOM CONTENT (light) */}
                <div className="px-6 pt-5 pb-6">
                  {/* divider with quote icon */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
                    <Quote className="w-4 h-4 text-primary-300 dark:text-primary-600 flex-shrink-0" />
                    <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-5">{f.bio}</p>

                  {/* stats row */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { val: "8+", lbl: "Years in Practice" },
                      { val: "500+", lbl: "Cases Argued" },
                      { val: "200+", lbl: "Students Mentored" },
                    ].map(s => (
                      <div key={s.lbl}
                        className="rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 p-3 text-center">
                        <p className="text-lg font-bold text-primary-600 dark:text-primary-400">{s.val}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-snug">{s.lbl}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 italic">* Indicative list — faculty may change based on availability.</p>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          9. WHO IS THIS FOR — pills + detail cards
      ════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="mb-8 text-center">
            <p className="text-xs font-bold tracking-widest uppercase text-primary-600 dark:text-primary-400 mb-2">Is this for you?</p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white mb-3">Who is this for?</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto">
              Whether you're starting out or advancing your practice — this programme is built for you.
            </p>
          </FadeUp>
          {/* pills */}
          <FadeUp delay={0.1}>
            <div className="flex flex-wrap gap-2 justify-center mb-8">
              {prog.whoFor.map(w => (
                <span key={w.label}
                  className="inline-flex items-center gap-2 bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 rounded-xl px-4 py-2 text-sm font-medium text-primary-700 dark:text-primary-300">
                  <Check className="w-3.5 h-3.5" /> {w.label}
                </span>
              ))}
            </div>
          </FadeUp>
          {/* detail cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {prog.whoFor.map((w, i) => {
              const Icon = WHO_ICONS[i] ?? BookOpen;
              return (
                <motion.div key={w.label}
                  initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.4 }}
                  className="flex items-start gap-3 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 hover:border-primary-200 dark:hover:border-primary-700 hover:shadow-sm transition-all duration-300">
                  <div className="w-8 h-8 rounded-xl bg-primary-50 dark:bg-primary-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-4 h-4 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white mb-0.5">{w.label}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{w.desc}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          10. TRAINING METHODOLOGY
      ════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-800/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="mb-10">
            <p className="text-xs font-bold tracking-widest uppercase text-primary-600 dark:text-primary-400 mb-2">How It Works</p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">Training Methodology</h2>
          </FadeUp>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {prog.methodology.map((m, i) => (
              <motion.div key={m.title}
                initial={{ opacity: 0, y: 14 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.07, duration: 0.45 }}
                className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 hover:border-primary-200 dark:hover:border-primary-700 hover:shadow-md transition-all duration-300 group">
                <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4 group-hover:bg-primary-50 dark:group-hover:bg-primary-900/30 transition-colors">
                  <span className="text-xs font-black text-gray-400 dark:text-gray-500 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1.5">{m.title}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">{m.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          11. LEARNING OBJECTIVES
      ════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="mb-8">
            <p className="text-xs font-bold tracking-widest uppercase text-primary-600 dark:text-primary-400 mb-2">Detailed Outcomes</p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">Specific Learning Objectives</h2>
          </FadeUp>
          <div className="space-y-3">
            {prog.objectivesGroups.map((g, i) => (
              <SyllabusAccordion key={g.title} title={g.title} items={g.items} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          12. COURSE SYLLABUS
      ════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-800/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="mb-8">
            <p className="text-xs font-bold tracking-widest uppercase text-primary-600 dark:text-primary-400 mb-2">Course Content</p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">Course Syllabus</h2>
          </FadeUp>
          <div className="space-y-3">
            {prog.syllabus.map((s, i) => (
              <SyllabusAccordion key={s.title} title={s.title} items={s.items} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          13. CERTIFICATION BANNER
      ════════════════════════════════════════════════════════ */}
      <FadeUp>
        <section className="bg-gray-950 py-12 px-4">
          <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              <BadgeCheck className="w-8 h-8 text-white" />
            </div>
            <div>
              <p className="text-xs font-bold tracking-widest uppercase text-primary-400 mb-1">Certification</p>
              <h3 className="text-xl font-semibold text-white mb-2">Skill India + NSDC Certified</h3>
              <p className="text-sm text-gray-400 leading-relaxed">
                Get certified under the Skill India Mission through Medhavi Skills University on successful completion of the programme.
              </p>
            </div>
          </div>
        </section>
      </FadeUp>

      {/* ════════════════════════════════════════════════════════
          14. PRICING
      ════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-white dark:bg-gray-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="mb-8">
            <p className="text-xs font-bold tracking-widest uppercase text-primary-600 dark:text-primary-400 mb-2">Investment</p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">Course Plan</h2>
          </FadeUp>
          <FadeUp delay={0.1}>
            <div className="rounded-2xl border-2 border-primary-600 overflow-hidden">
              <div className="bg-primary-600 px-6 py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-primary-200 text-[11px] font-semibold uppercase tracking-widest">Standard Plan · All Inclusive</p>
                  <p className="text-white text-4xl font-black mt-1">{prog.price}</p>
                  <p className="text-primary-200 text-xs mt-1">100% refund within 30 days of full participation</p>
                </div>
                <button onClick={() => { setEnrollOpen(true); setFormDone(false); }}
                  className="bg-white text-primary-700 font-bold px-7 py-3.5 rounded-xl text-sm hover:bg-primary-50 transition-colors whitespace-nowrap">
                  {enrollLabel}
                </button>
              </div>
              <div className="bg-white dark:bg-gray-800 px-6 py-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-3">
                  {prog.features.map(f => (
                    <div key={f} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                      <Check className="w-4 h-4 text-primary-600 dark:text-primary-400 flex-shrink-0 mt-0.5" />{f}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </FadeUp>
        </div>
      </section>

      {/* ════════════════════════════════════════════════════════
          15. FAQ
      ════════════════════════════════════════════════════════ */}
      <section className="py-16 sm:py-20 bg-gray-50 dark:bg-gray-800/40">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeUp className="mb-8">
            <p className="text-xs font-bold tracking-widest uppercase text-primary-600 dark:text-primary-400 mb-2">Got Questions?</p>
            <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white">Frequently Asked Questions</h2>
          </FadeUp>
          <FadeUp delay={0.1}>
            <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 px-6 divide-y divide-gray-100 dark:divide-gray-700">
              {prog.faqs.map(faq => <Accordion key={faq.q} q={faq.q} a={faq.a} />)}
            </div>
          </FadeUp>
        </div>
      </section>

      <div className="pb-24">
        <Footer />
      </div>

      {/* ════════════════════════════════════════════════════════
          STICKY BOTTOM CTA
      ════════════════════════════════════════════════════════ */}
      <div className="fixed bottom-0 inset-x-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 shadow-[0_-4px_24px_rgba(0,0,0,0.10)]">
        <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          {/* left: title + price */}
          <div className="min-w-0 flex-1">
            <p className="text-xs sm:text-sm font-bold text-gray-900 dark:text-white truncate leading-tight">{prog.shortTitle}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm sm:text-base font-black text-primary-600 dark:text-primary-400">{prog.price}</span>
              <span className={`text-[10px] sm:text-xs font-semibold ${prog.enrollment === "open" ? "text-green-600 dark:text-green-400" : "text-amber-600 dark:text-amber-400"}`}>
                {prog.enrollment === "open" ? "● Open" : "● Waitlist"}
              </span>
            </div>
          </div>

          {/* right: share dropdown + CTA */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Share */}
            <div className="relative" ref={shareRef}>
              <button onClick={() => setShareOpen(v => !v)}
                className="flex items-center gap-1.5 text-xs font-semibold border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 px-3 py-2.5 rounded-xl hover:border-primary-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <Share2 className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Share</span>
              </button>

              <AnimatePresence>
                {shareOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 6 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 6 }}
                    transition={{ duration: 0.15 }}
                    className="absolute bottom-12 right-0 z-50 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-1.5 min-w-[168px]">
                    {/* WhatsApp */}
                    <button onClick={() => handleShare("whatsapp")}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <svg className="w-4 h-4 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12.004 2C6.477 2 2 6.478 2 12.005c0 1.832.47 3.557 1.294 5.057L2 22l5.083-1.274A9.961 9.961 0 0012.004 22c5.526 0 10.003-4.478 10.003-10.005S17.53 2 12.004 2z" />
                      </svg>
                      WhatsApp
                    </button>
                    {/* X / Twitter */}
                    <button onClick={() => handleShare("twitter")}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.629L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
                      </svg>
                      X / Twitter
                    </button>
                    {/* LinkedIn */}
                    <button onClick={() => handleShare("linkedin")}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <svg className="w-4 h-4 text-[#0A66C2]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                      LinkedIn
                    </button>
                    {/* Facebook */}
                    <button onClick={() => handleShare("facebook")}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <svg className="w-4 h-4 text-[#1877F2]" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                      Facebook
                    </button>
                    {/* Email */}
                    <button onClick={() => handleShare("email")}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <Mail className="w-4 h-4 text-gray-400" /> Email
                    </button>
                    {/* Copy link */}
                    <button onClick={() => handleShare("copy")}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <Link2 className="w-4 h-4 text-gray-400" /> {copied ? "Copied!" : "Copy Link"}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Book Your Slot */}
            <button onClick={() => { setEnrollOpen(true); setFormDone(false); }}
              className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm transition-colors whitespace-nowrap">
              {enrollLabel}
            </button>
          </div>
        </div>
      </div>

      {/* ════════════════════════════════════════════════════════
          ENROLLMENT MODAL
      ════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {enrollOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={(e) => { if (e.target === e.currentTarget) setEnrollOpen(false); }}>

            {/* backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            <motion.div
              initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 40 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full sm:max-w-2xl rounded-t-3xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col sm:flex-row min-h-0">

              {/* LEFT PANEL — primary */}
              <div className="bg-primary-600 px-6 py-7 sm:w-[44%] flex flex-col justify-between sm:min-h-[420px]">
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-primary-200 mb-3">{prog.badge}</p>
                  <h2 className="text-lg sm:text-xl font-bold text-white leading-snug mb-3">{prog.title}</h2>
                  <p className="text-sm text-primary-100 leading-relaxed hidden sm:block">{prog.tagline}</p>
                </div>
                <div className="hidden sm:flex flex-col gap-2 mt-6">
                  {[prog.duration, prog.hoursPerWeek, "Skill India Certified"].map(t => (
                    <span key={t} className="flex items-center gap-2 text-xs text-primary-200">
                      <Check className="w-3 h-3 flex-shrink-0" /> {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* RIGHT PANEL — form */}
              <div className="bg-white dark:bg-gray-900 flex-1 px-6 py-6 sm:py-7 relative">
                {/* close */}
                <button onClick={() => setEnrollOpen(false)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <X className="w-4 h-4" />
                </button>

                {formDone ? (
                  <div className="flex flex-col items-center justify-center h-full py-8 text-center">
                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mb-4">
                      <Check className="w-7 h-7 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">We've received your request!</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">
                      Our team will reach out to you on WhatsApp within 24 hours to confirm your slot.
                    </p>
                    <button onClick={() => setEnrollOpen(false)}
                      className="mt-6 bg-primary-600 hover:bg-primary-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition-colors">
                      Done
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white mb-5 pr-8">Book Your Slot</h3>
                    <form onSubmit={handleEnrollSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                          Full Name <span className="text-red-500">*</span>
                        </label>
                        <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                          placeholder="Enter your full name"
                          className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                          placeholder="name@example.com"
                          className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                          Phone Number <span className="text-red-500">*</span>
                        </label>
                        <div className="flex gap-2">
                          <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-xl px-3 py-2.5 text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 whitespace-nowrap flex-shrink-0">
                            🇮🇳 +91
                          </div>
                          <input required type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                            placeholder="9876543210"
                            className="flex-1 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow" />
                        </div>
                      </div>
                      <p className="text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed">
                        By submitting this form, I agree to The Law Project contacting me via WhatsApp, call, or email. I have read and agree to the{" "}
                        <Link href="/terms" className="text-primary-600 hover:underline">Terms and Conditions</Link>.
                      </p>
                      <button type="submit" disabled={paying}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3.5 rounded-xl text-sm transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
                        {paying ? "Opening Payment…" : `Pay ${prog.price} & Book Slot`}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
