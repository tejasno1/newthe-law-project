"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { AnimatePresence, motion } from "framer-motion";
import {
  GraduationCap, Menu, X, LogOut,
  BookMarked, ClipboardList, FileText, Info, ChevronRight,
  Sun, Moon,
} from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

const navLinks = [
  { name: "Courses", href: "/course" },
  { name: "About", href: "/about" },
  { name: "Blogs", href: "/blogs" },
  { name: "Mock test", href: "/mock-test" },
];

const dropdownMenuItems = [
  { icon: BookMarked, label: "Courses", href: "/course" },
  { icon: ClipboardList, label: "Mock Tests", href: "/mock-test" },
  { icon: FileText, label: "Blogs", href: "/blogs" },
  { icon: Info, label: "About Us", href: "/about" },
];

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [hidden, setHidden] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();
  const profileRef = useRef<HTMLDivElement>(null);

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
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    setProfileOpen(false);
    setIsOpen(false);
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

  const avatarLetter = user?.email?.charAt(0).toUpperCase() ?? "?";
  const loginHref = `/auth/login?redirect=${encodeURIComponent(pathname)}`;

  return (
    <nav className={`fixed top-0 inset-x-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 shadow-sm transition-transform duration-300 ${hidden ? "-translate-y-full" : "translate-y-0"}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

              {/* Logo */}
              <Link href="/" className="flex items-center gap-2">
                <img
                  src="/lightmodelogotlp.png"
                  alt="The Law Project"
                  className="h-10 w-auto object-contain dark:hidden"
                />
                <img
                  src="/tlpfinallogo.png"
                  alt="The Law Project"
                  className="h-10 w-auto object-contain hidden dark:block"
                />
                <span className="text-xl font-bold text-gray-900 dark:text-white">The Law Project</span>
              </Link>

              {/* Desktop nav links */}
              <div className="hidden lg:flex items-center gap-6 xl:gap-8">
                {navLinks.map((link) => (
                  <Link key={link.name} href={link.href}
                    className="text-base leading-6 font-medium text-gray-800 dark:text-gray-200 hover:text-primary-600 dark:hover:text-primary-400 transition-colors whitespace-nowrap"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>

              {/* Desktop auth area */}
              <div className="hidden lg:flex items-center gap-2">
                {/* Theme toggle */}
                <button
                  onClick={toggle}
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                {authReady && (
                  user ? (
                    <div className="relative" ref={profileRef}>
                      {/* Avatar button */}
                      <button
                        onClick={() => setProfileOpen((v) => !v)}
                        className="w-9 h-9 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold hover:bg-primary-700 transition-colors ring-2 ring-primary-600/20 focus:outline-none"
                      >
                        {avatarLetter}
                      </button>

                      {/* Dropdown panel */}
                      <AnimatePresence>
                        {profileOpen && (
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -8 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -8 }}
                            transition={{ duration: 0.15 }}
                            className="absolute right-0 top-12 w-72 bg-gray-950 rounded-2xl shadow-2xl border border-white/10 overflow-hidden z-50"
                          >
                            {/* User header */}
                            <div className="px-4 pt-5 pb-4 flex items-center gap-3 border-b border-white/10">
                              <div className="w-11 h-11 rounded-full bg-primary-600 text-white flex items-center justify-center text-base font-bold flex-shrink-0">
                                {avatarLetter}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{user.email}</p>
                                <p className="text-xs text-gray-500">The Law Project</p>
                              </div>
                            </div>

                            {/* Enroll CTA */}
                            <div className="px-4 py-3 border-b border-white/10">
                              <Link href="/course" onClick={() => setProfileOpen(false)}
                                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-primary-500/40 text-primary-400 text-sm font-semibold hover:bg-primary-600 hover:text-white hover:border-primary-600 transition-all duration-200"
                              >
                                <GraduationCap className="w-4 h-4" />
                                Enroll in a Course
                              </Link>
                            </div>

                            {/* 2-col quick nav */}
                            <div className="px-4 py-3 grid grid-cols-2 gap-2 border-b border-white/10">
                              {[
                                { icon: BookMarked, label: "My Courses", href: "/course" },
                                { icon: ClipboardList, label: "Mock Tests", href: "/mock-test" },
                              ].map((item) => (
                                <Link key={item.label} href={item.href} onClick={() => setProfileOpen(false)}
                                  className="flex flex-col items-start gap-1.5 bg-white/5 hover:bg-white/10 rounded-xl p-3 transition-colors"
                                >
                                  <item.icon className="w-5 h-5 text-gray-400" />
                                  <span className="text-xs font-medium text-gray-300">{item.label}</span>
                                </Link>
                              ))}
                            </div>

                            {/* List nav */}
                            <div className="px-2 py-2 border-b border-white/10">
                              {dropdownMenuItems.map((item) => (
                                <Link key={item.label} href={item.href} onClick={() => setProfileOpen(false)}
                                  className="flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group"
                                >
                                  <div className="flex items-center gap-3">
                                    <item.icon className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-300 group-hover:text-white transition-colors">{item.label}</span>
                                  </div>
                                  <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-gray-400" />
                                </Link>
                              ))}
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
                      <Link href={`/auth/signup?redirect=${encodeURIComponent(pathname)}`}
                        className="bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors whitespace-nowrap"
                      >
                        Sign Up
                      </Link>
                    </>
                  )
                )}
              </div>

              {/* Mobile: theme toggle + hamburger */}
              <div className="lg:hidden flex items-center gap-1">
                <button
                  onClick={toggle}
                  className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
                </button>
                <button className="p-2 text-gray-700 dark:text-gray-300" onClick={() => setIsOpen(!isOpen)}>
                  {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                </button>
              </div>
            </div>

          {/* Mobile menu */}
          {isOpen && (
            <div className="lg:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
              <div className="px-4 py-3 space-y-2">
                {navLinks.map((link) => (
                  <Link key={link.name} href={link.href}
                    className="block py-2 text-base leading-6 font-medium text-gray-800 dark:text-gray-200 hover:text-primary-600"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}

                {authReady && (
                  <div className="pt-2 space-y-2 border-t border-gray-100 dark:border-gray-800">
                    {user ? (
                      <>
                        <div className="flex items-center gap-3 py-2">
                          <div className="w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
                            {avatarLetter}
                          </div>
                          <span className="text-sm text-gray-600 dark:text-gray-300 truncate">{user.email}</span>
                        </div>
                        <button onClick={handleLogout}
                          className="w-full flex items-center justify-center gap-2 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          <LogOut className="w-4 h-4" /> Logout
                        </button>
                      </>
                    ) : (
                      <>
                        <Link href={loginHref} onClick={() => setIsOpen(false)}
                          className="block w-full text-center border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                        >
                          Login
                        </Link>
                        <Link href={`/auth/signup?redirect=${encodeURIComponent(pathname)}`} onClick={() => setIsOpen(false)}
                          className="block w-full text-center bg-primary-600 text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:bg-primary-700"
                        >
                          Sign Up
                        </Link>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
      </div>
    </nav>
  );
}
