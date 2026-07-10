"use client";

import { GraduationCap, Instagram, Twitter, Youtube, Mail } from "lucide-react";

const brandName = "The Law Project";

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Twitter, href: "#", label: "X (Twitter)" },
  { icon: Youtube, href: "#", label: "YouTube" },
  { icon: Mail, href: "mailto:hello@thelawproject.com", label: "Email" },
];

const navLinks = [
  { label: "Overview", href: "/#overview" },
  { label: "Courses", href: "/course" },
  { label: "About Us", href: "/about" },
  { label: "Blogs", href: "/blogs" },
  { label: "Mock Test", href: "/mock-test" },
  { label: "FAQs", href: "/#faqs" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Refund Policy", href: "/refund" },
];

export default function Footer() {
  return (
    <section className="relative w-full mt-0 overflow-hidden">
      <footer className="border-t border-white/10 bg-black relative">
        <div className="max-w-7xl flex flex-col justify-between mx-auto min-h-[30rem] sm:min-h-[35rem] md:min-h-[40rem] relative p-4 py-10">
          <div className="flex flex-col mb-12 sm:mb-20 md:mb-0 w-full">
            <div className="w-full flex flex-col items-center">
              <div className="space-y-2 flex flex-col items-center flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-white text-3xl font-bold">{brandName}</span>
                </div>
                <p className="text-gray-400 font-semibold text-center w-full max-w-sm sm:w-96 px-4 sm:px-0">
                  Mentor-led legal education for CLAT PG, internships, and courtroom-ready skills.
                </p>
              </div>

              <div className="flex mb-8 mt-3 gap-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.href}
                    className="text-gray-400 hover:text-white transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <div className="w-6 h-6 hover:scale-110 duration-300">
                      <social.icon className="w-6 h-6" />
                    </div>
                    <span className="sr-only">{social.label}</span>
                  </a>
                ))}
              </div>

              <div className="flex flex-wrap justify-center gap-4 text-sm font-medium text-gray-400 max-w-full px-4">
                {navLinks.map((link, index) => (
                  <a
                    key={index}
                    className="hover:text-white duration-300 hover:font-semibold"
                    href={link.href}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-20 md:mt-24 flex flex-col gap-2 md:gap-1 items-center justify-center md:flex-row md:items-center md:justify-between px-4 md:px-0">
            <p className="text-base text-gray-500 text-center md:text-left">
              ©{new Date().getFullYear()} {brandName}. All rights reserved.
            </p>
          </div>
        </div>

        <div
          className="bg-gradient-to-b from-white/10 via-white/5 to-transparent bg-clip-text text-transparent leading-none absolute left-1/2 -translate-x-1/2 bottom-40 md:bottom-32 font-extrabold tracking-tighter pointer-events-none select-none text-center px-4"
          style={{ fontSize: "clamp(3rem, 12vw, 10rem)", maxWidth: "95vw" }}
        >
          {brandName.toUpperCase()}
        </div>

        <div className="absolute hover:border-white duration-400 drop-shadow-[0_0px_20px_rgba(255,255,255,0.15)] bottom-24 md:bottom-20 backdrop-blur-sm rounded-3xl bg-white/5 left-1/2 border-2 border-white/10 flex items-center justify-center p-3 -translate-x-1/2 z-10">
          <div className="w-12 sm:w-16 md:w-24 h-12 sm:h-16 md:h-24 bg-gradient-to-br from-white to-gray-300 rounded-2xl flex items-center justify-center shadow-lg">
            <GraduationCap className="w-8 sm:w-10 md:w-14 h-8 sm:h-10 md:h-14 text-black drop-shadow-lg" />
          </div>
        </div>

        <div className="absolute bottom-32 sm:bottom-34 backdrop-blur-sm h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent w-full left-1/2 -translate-x-1/2"></div>

        <div className="bg-gradient-to-t from-black via-black/80 blur-[1em] to-black/40 absolute bottom-28 w-full h-24"></div>
      </footer>
    </section>
  );
}
