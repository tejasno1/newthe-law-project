"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  BookOpen, GraduationCap, FileText,
  BarChart2, ClipboardList, Menu, X, Tag, Video,
} from "lucide-react";
import AdminLogoutButton from "./AdminLogoutButton";

const NAV = [
  { href: "/admin/courses",       label: "Courses",               icon: BookOpen, match: (p: string) => p.startsWith("/admin/courses") },
  { href: "/admin/course-videos", label: "Course Videos",         icon: Video,    match: (p: string) => p.startsWith("/admin/course-videos") },
  { href: "/admin/blogs",         label: "Blog Posts",            icon: FileText, match: (p: string) => p.startsWith("/admin/blogs") },
  { href: "/admin/categories",    label: "Course Category Order", icon: Tag,      match: (p: string) => p.startsWith("/admin/categories") },
];

const ANALYTICS = [
  { href: "/admin/analytics",       label: "Courses",   icon: BarChart2,    match: (p: string) => p === "/admin/analytics" },
  { href: "/admin/analytics/blogs", label: "Blogs",     icon: BookOpen,     match: (p: string) => p.startsWith("/admin/analytics/blogs") },
  { href: "/admin/analytics/mcq",   label: "MCQ Tests", icon: ClipboardList,match: (p: string) => p.startsWith("/admin/analytics/mcq") },
];

function NavLinks({ pathname, onNavigate }: { pathname: string; onNavigate: () => void }) {
  return (
    <>
      {NAV.map(({ href, label, icon: Icon, match }) => {
        const active = match(pathname);
        return (
          <Link key={href} href={href} onClick={onNavigate}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              active ? "bg-[#4d65ff]/10 text-[#4d65ff]" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <Icon size={16} className={active ? "text-[#4d65ff]" : "text-gray-500"} />
            {label}
          </Link>
        );
      })}

      <div className="pt-4 pb-1">
        <p className="px-3 text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Analytics</p>
      </div>

      {ANALYTICS.map(({ href, label, icon: Icon, match }) => {
        const active = match(pathname);
        return (
          <Link key={href} href={href} onClick={onNavigate}
            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              active ? "bg-[#4d65ff]/10 text-[#4d65ff]" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <Icon size={16} className={active ? "text-[#4d65ff]" : "text-gray-500"} />
            {label}
          </Link>
        );
      })}
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  if (pathname === "/admin/login") return <>{children}</>;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Mobile top bar ───────────────────────────────────── */}
      <header className="lg:hidden fixed top-0 inset-x-0 z-30 h-14 bg-white border-b border-gray-200 flex items-center gap-3 px-4">
        <button
          onClick={() => setOpen(true)}
          className="p-2 -ml-1 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Open navigation"
        >
          <Menu size={20} className="text-gray-700" />
        </button>
        <Link href="/admin/courses" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#4d65ff] rounded-lg flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="text-sm font-bold text-gray-900">TLP Admin</span>
        </Link>
      </header>

      {/* ── Mobile backdrop ──────────────────────────────────── */}
      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      {/* ── Mobile drawer ────────────────────────────────────── */}
      <aside
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-4 h-14 border-b border-gray-200 flex-shrink-0">
          <Link href="/admin/courses" onClick={() => setOpen(false)} className="flex items-center gap-2">
            <div className="w-7 h-7 bg-[#4d65ff] rounded-lg flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <div className="leading-tight">
              <p className="text-xs font-bold text-gray-900">The Law Project</p>
              <p className="text-[9px] text-gray-400 uppercase tracking-wide">Admin Panel</p>
            </div>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X size={17} className="text-gray-500" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <NavLinks pathname={pathname} onNavigate={() => setOpen(false)} />
        </nav>

        <div className="px-3 py-4 border-t border-gray-200 flex-shrink-0">
          <AdminLogoutButton />
        </div>
      </aside>

      {/* ── Desktop sidebar ───────────────────────────────────── */}
      <aside className="hidden lg:flex w-60 bg-white border-r border-gray-200 flex-col fixed inset-y-0 left-0 z-10">
        <div className="px-5 py-5 border-b border-gray-200 flex-shrink-0">
          <Link href="/admin/courses" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#4d65ff] rounded-lg flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-bold text-gray-900">The Law Project</p>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">Admin Panel</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <NavLinks pathname={pathname} onNavigate={() => {}} />
        </nav>

        <div className="px-3 py-4 border-t border-gray-200 flex-shrink-0">
          <AdminLogoutButton />
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────── */}
      <main className="lg:ml-60 min-h-screen pt-14 lg:pt-0">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
