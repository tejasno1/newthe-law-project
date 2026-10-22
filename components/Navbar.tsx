"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Sun, Moon, User, X, Check, Zap, Video, BookOpen, Newspaper, FileText, Target, Monitor, Globe, ClipboardList, BadgeCheck, ArrowRight, ChevronDown } from "lucide-react";
import { MovingBorderButton } from "@/components/ui/moving-border";
import { useTheme } from "@/components/ThemeProvider";
import { openRazorpayCheckout, recoverPendingOrders, verifyOrder } from "@/lib/razorpay";

const mainNavLinks = [
  { name: "Courses", href: "/course" },
  { name: "Practice Tests", href: "/mock-test" },
  { name: "QuickSkills", href: "/skill-training" },
  { name: "Question Bank", href: "/question-bank" },
  { name: "Resources", href: "/resources" },
  { name: "Blogs", href: "/blogs" },
];

const moreLinks = [
  { name: "Publish with Us", href: "/publish-with-us" },
  { name: "About", href: "/about" },
  { name: "Careers", href: "/careers" },
];

// All links combined (used for mobile pill bar)
const navLinks = [...mainNavLinks, ...moreLinks];


export default function Navbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [hasPass, setHasPass] = useState(false);
  const [showPassModal, setShowPassModal] = useState(false);
  const [passTncChecked, setPassTncChecked] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paySuccess, setPaySuccess] = useState(false);
  const [bannerVisible, setBannerVisible] = useState(false);

  const PASS_PRICE = 1999;

  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const profileRef = useRef<HTMLDivElement>(null);
  const mobileProfileRef = useRef<HTMLDivElement>(null);

  const fetchPassStatus = async () => {
    try {
      await recoverPendingOrders();
      const res = await fetch("/api/pass-status");
      const data = await res.json();
      setHasPass(!!data.hasPass);
    } catch {}
  };

  useEffect(() => {
    const dismissed = localStorage.getItem("tlp_banner_dismissed");
    if (!dismissed) setBannerVisible(true);
  }, []);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setAuthReady(true);
      if (user) fetchPassStatus();
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      setAuthReady(true);
      if (session?.user) fetchPassStatus();
      else setHasPass(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (mobileProfileRef.current && !mobileProfileRef.current.contains(e.target as Node)) {
        setMobileProfileOpen(false);
      }
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handlePassCheckout = async () => {
    if (!user) { router.push(`/auth/login?redirect=${encodeURIComponent(pathname)}`); return; }
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
        await verifyOrder(orderId);
        setHasPass(true);
        setTimeout(() => { setPaySuccess(false); router.push("/course"); }, 2000);
      },
      onFailure: () => setPaying(false),
    });
  };

  const handleLogout = async () => {
    setProfileOpen(false);
    localStorage.removeItem("tlp_session_token");
    await fetch("/api/session", { method: "DELETE" }).catch(() => {});
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const y = window.scrollY;
      setHidden(y > lastY && y > 72);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const { theme, toggle } = useTheme();

  const loginHref = `/auth/login?redirect=${encodeURIComponent(pathname)}`;

  return (
    <>
    <nav className={`fixed top-0 inset-x-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm transition-transform duration-300 ${hidden ? "-translate-y-full" : "translate-y-0"}`}>

      {/* ── Announcement banner ─────────────────────────────── */}
      {bannerVisible && (
        <div className="w-full bg-gradient-to-r from-violet-600 via-purple-600 to-orange-500 px-4 md:px-8 py-2 flex items-center justify-between gap-3">
          <div className="flex-1 flex items-center justify-center gap-3 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-white whitespace-nowrap truncate">
              Get access to 50+ Law Subjects for 35+ Law Exams for ₹1,999/-
            </p>
            <Link
              href="/course/tlp-all-access-plan"
              className="flex-shrink-0 bg-white text-purple-700 font-semibold text-xs px-4 sm:px-5 py-1.5 rounded-full hover:scale-105 transition duration-200 shadow-sm"
            >
              Get Pass
            </Link>
          </div>
          <button
            onClick={() => { setBannerVisible(false); localStorage.setItem("tlp_banner_dismissed", "true"); }}
            className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Top row ─────────────────────────────────── */}
        <div className="flex items-center justify-between h-14 lg:h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/lightmodelogotlp.png" alt="The Law Project" className="h-9 lg:h-10 w-auto object-contain dark:hidden" />
            <img src="/tlpfinallogo.png"      alt="The Law Project" className="h-9 lg:h-10 w-auto object-contain hidden dark:block" />
            <span className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">The Law Project</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-5 xl:gap-7">
            {mainNavLinks.map((link) => (
              <Link key={link.name} href={link.href}
                className="text-sm xl:text-base font-medium text-gray-800 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors whitespace-nowrap"
              >
                {link.name}
              </Link>
            ))}

            {/* More dropdown */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreOpen((v) => !v)}
                className={`flex items-center gap-1.5 text-sm font-medium border rounded-lg px-3 py-1.5 transition-colors whitespace-nowrap ${
                  moreOpen
                    ? "border-primary-500 text-primary-600 bg-primary-50 dark:bg-primary-900/20"
                    : "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 hover:border-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
              >
                More
                <ChevronDown className={`w-3.5 h-3.5 text-primary-600 transition-transform duration-200 ${moreOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {moreOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full left-0 mt-2.5 w-48 bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl shadow-black/8 py-1.5 z-50 overflow-hidden"
                  >
                    {moreLinks.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        onClick={() => setMoreOpen(false)}
                        className="flex items-center px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                      >
                        {link.name}
                      </Link>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Desktop auth area */}
          <div className="hidden lg:flex items-center gap-2 flex-shrink-0">
            <button onClick={toggle}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>


            {authReady && (
              user ? (
                <div className="relative" ref={profileRef}>
                  <button onClick={() => setProfileOpen((v) => !v)}
                    className="w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold hover:bg-primary-700 transition-colors ring-2 ring-primary-600/20 focus:outline-none"
                  >
                    <User className="w-4 h-4" />
                  </button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -8 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -8 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-12 w-60 bg-gray-950 rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50"
                      >
                        {/* User info */}
                        <div className="px-4 pt-4 pb-4 flex items-center gap-3 border-b border-white/10">
                          <div className="w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                            <User className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                            <p className="text-xs text-gray-500">The Law Project</p>
                          </div>
                        </div>

                        {/* Logout */}
                        <div className="px-4 py-3">
                          <button onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 text-sm font-medium transition-all duration-200"
                          >
                            <LogOut className="w-4 h-4" />
                            Logout
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <Link href={loginHref}
                    className="bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors whitespace-nowrap"
                  >
                    Sign In
                  </Link>
              )
            )}
          </div>

          {/* Mobile: login button (guest) or avatar (logged in) + theme toggle */}
          <div className="lg:hidden flex items-center gap-1.5">
            {authReady && !user && (
              <Link
                href={loginHref}
                className="text-sm font-medium text-primary-600 dark:text-primary-400 border border-primary-500 dark:border-primary-500 rounded-lg px-3 py-1.5 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors whitespace-nowrap"
              >
                Login
              </Link>
            )}
            {authReady && user && (
              <div className="relative" ref={mobileProfileRef}>
                <button
                  onClick={() => setMobileProfileOpen((v) => !v)}
                  className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0 hover:bg-primary-700 transition-colors focus:outline-none"
                >
                  <User className="w-4 h-4" />
                </button>

                <AnimatePresence>
                  {mobileProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-10 w-60 bg-gray-950 rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50"
                    >
                      {/* User info */}
                      <div className="px-4 pt-4 pb-4 flex items-center gap-3 border-b border-white/10">
                        <div className="w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                          <p className="text-xs text-gray-500">The Law Project</p>
                        </div>
                      </div>
                      {/* Logout */}
                      <div className="px-4 py-3">
                        <button
                          onClick={() => { setMobileProfileOpen(false); handleLogout(); }}
                          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400 text-sm font-medium transition-all duration-200"
                        >
                          <LogOut className="w-4 h-4" />
                          Logout
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            <button onClick={toggle}
              className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* ── Mobile scrollable pill bar ───────────────── */}
        <div className="lg:hidden -mx-4 px-3 pb-2.5 overflow-x-auto scrollbar-hide">
          <div className="flex items-center gap-2 w-max">

            {/* WhatsApp pill — moving green border, no fill */}
            <a
              href={`https://wa.me/9555634585?text=${encodeURIComponent("Hi! I'm interested in The Law Project courses. Can you help me?")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-shrink-0"
            >
              <MovingBorderButton borderColor="#25D366">
                <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 flex-shrink-0" style={{ fill: "#25D366" }}>
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12.004 2C6.477 2 2 6.478 2 12.005c0 1.832.47 3.557 1.294 5.057L2 22l5.083-1.274A9.961 9.961 0 0012.004 22c5.526 0 10.003-4.478 10.003-10.005S17.53 2 12.004 2zm0 18.32a8.297 8.297 0 01-4.234-1.16l-.303-.18-3.015.754.786-2.94-.198-.312A8.29 8.27 0 013.706 12c0-4.572 3.724-8.296 8.298-8.296 4.573 0 8.297 3.724 8.297 8.296 0 4.573-3.724 8.32-8.297 8.32z" />
                </svg>
                <span style={{ color: "#25D366" }}>WhatsApp</span>
              </MovingBorderButton>
            </a>


            {navLinks.map((link) => {
              const active = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    active
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}

          </div>
        </div>

      </div>

    </nav>

      {/* TLP All-Access Pass modal — outside <nav> so transform stacking context doesn't trap fixed positioning */}
      <AnimatePresence>
        {showPassModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
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
                <button onClick={() => { setShowPassModal(false); setPassTncChecked(false); }} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex-shrink-0 ml-3 mt-0.5">
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
                <p className="text-center text-[11px] text-gray-400 mt-2">Secure payment via Razorpay · Less than ₹6/day</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
