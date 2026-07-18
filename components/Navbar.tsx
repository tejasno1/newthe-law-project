"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { AnimatePresence, motion } from "framer-motion";
import { LogOut, Sun, Moon, User } from "lucide-react";
import { MovingBorderButton } from "@/components/ui/moving-border";
import { useTheme } from "@/components/ThemeProvider";

const navLinks = [
  { name: "Courses", href: "/course" },
  { name: "QuickSkills", href: "/skill-training" },
  { name: "About", href: "/about" },
  { name: "Blogs", href: "/blogs" },
  { name: "Practice test", href: "/mock-test" },
  { name: "Publish with Us", href: "/publish-with-us" },
];


export default function Navbar() {
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileProfileOpen, setMobileProfileOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [hidden, setHidden] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const profileRef = useRef<HTMLDivElement>(null);
  const mobileProfileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setAuthReady(true);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
      setAuthReady(true);
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
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setProfileOpen(false);
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
  const signupHref = `/auth/signup?redirect=${encodeURIComponent(pathname)}`;

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm transition-transform duration-300 ${hidden ? "-translate-y-full" : "translate-y-0"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ── Top row ─────────────────────────────────── */}
        <div className="flex items-center justify-between h-14 lg:h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img src="/lightmodelogotlp.png" alt="The Law Project" className="h-9 lg:h-10 w-auto object-contain dark:hidden" />
            <img src="/tlpfinallogo.png"      alt="The Law Project" className="h-9 lg:h-10 w-auto object-contain hidden dark:block" />
            <span className="text-lg lg:text-xl font-bold text-gray-900 dark:text-white">The Law Project</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-6 xl:gap-8">
            {navLinks.map((link) => (
              <Link key={link.name} href={link.href}
                className="text-base leading-4 font-medium text-gray-800 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors whitespace-nowrap"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Desktop auth area */}
          <div className="hidden lg:flex items-center gap-2">
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
                <>
                  <Link href={loginHref}
                    className="border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors whitespace-nowrap"
                  >
                    Login
                  </Link>
                  <Link href={signupHref}
                    className="bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors whitespace-nowrap"
                  >
                    Sign Up
                  </Link>
                </>
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
  );
}
