"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { motion, useMotionValue, useTransform } from "framer-motion";

export default function SignupPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  // 3D tilt
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const rotateX = useTransform(mouseY, [-300, 300], [10, -10]);
  const rotateY = useTransform(mouseX, [-300, 300], [-10, 10]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };
  const handleMouseLeave = () => { mouseX.set(0); mouseY.set(0); };

  const friendlyError = (msg: string) => {
    if (msg.includes("already registered") || msg.includes("User already registered"))
      return "An account with this email already exists. Try signing in instead.";
    if (msg.includes("Password should be at least"))
      return "Password must be at least 8 characters.";
    if (msg.includes("rate limit"))
      return "Too many attempts. Please wait a moment and try again.";
    return "Something went wrong. Please try again.";
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) {
      setError(friendlyError(error.message));
      setLoading(false);
      return;
    }
    setDone(true);
  };

  const PageWrapper = ({ children }: { children: React.ReactNode }) => (
    <main className="relative w-screen min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary-600/40 via-primary-800/30 to-black" />
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-soft-light pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vh] h-[60vh] rounded-b-[50%] bg-primary-400/15 blur-[80px] pointer-events-none" />
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vh] h-[60vh] rounded-b-full bg-primary-300/10 blur-[60px] pointer-events-none"
        animate={{ opacity: [0.1, 0.25, 0.1], scale: [0.98, 1.02, 0.98] }}
        transition={{ duration: 8, repeat: Infinity, repeatType: "mirror" }}
      />
      <motion.div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80vh] h-[80vh] rounded-t-full bg-primary-400/10 blur-[60px] pointer-events-none"
        animate={{ opacity: [0.2, 0.4, 0.2], scale: [1, 1.08, 1] }}
        transition={{ duration: 6, repeat: Infinity, repeatType: "mirror", delay: 1 }}
      />
      <div className="relative z-10 w-full flex justify-center">{children}</div>
    </main>
  );

  if (done) {
    return (
      <PageWrapper>
        <div className="w-full max-w-sm" style={{ perspective: 1500 }}>
          <Link href="/" className="flex items-center justify-center gap-2 mb-7">
            <img src="/tlpfinallogo.png" alt="The Law Project" className="h-9 w-auto object-contain" />
            <span className="text-xl font-bold text-white">The Law Project</span>
          </Link>
          <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-white/[0.07] shadow-2xl text-center">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">Check your email</h2>
            <p className="text-sm text-white/50 mb-6">
              We sent a confirmation link to{" "}
              <span className="font-medium text-white/80">{email}</span>.{" "}
              Click it to verify your account before logging in.
            </p>
            <Link
              href="/auth/login"
              className="inline-block w-full bg-primary-600 text-white rounded-xl py-2.5 text-sm font-medium hover:bg-primary-500 transition-colors text-center"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper>
      <div className="w-full max-w-sm relative z-10" style={{ perspective: 1500 }}>
        <Link href="/" className="flex items-center justify-center gap-2 mb-7">
          <img src="/tlpfinallogo.png" alt="The Law Project" className="h-9 w-auto object-contain" />
          <span className="text-xl font-bold text-white">The Law Project</span>
        </Link>

        <motion.div
          style={{ rotateX, rotateY }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="relative"
        >
          <div className="relative group">
            {/* Traveling border light beams */}
            <div className="absolute -inset-[1px] rounded-2xl overflow-hidden pointer-events-none">
              <motion.div
                className="absolute top-0 left-0 h-[2px] w-[50%] bg-gradient-to-r from-transparent via-primary-400 to-transparent opacity-80"
                animate={{ left: ["-50%", "100%"] }}
                transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
              />
              <motion.div
                className="absolute top-0 right-0 h-[50%] w-[2px] bg-gradient-to-b from-transparent via-primary-400 to-transparent opacity-80"
                animate={{ top: ["-50%", "100%"] }}
                transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 0.6 }}
              />
              <motion.div
                className="absolute bottom-0 right-0 h-[2px] w-[50%] bg-gradient-to-r from-transparent via-primary-400 to-transparent opacity-80"
                animate={{ right: ["-50%", "100%"] }}
                transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 1.2 }}
              />
              <motion.div
                className="absolute bottom-0 left-0 h-[50%] w-[2px] bg-gradient-to-b from-transparent via-primary-400 to-transparent opacity-80"
                animate={{ bottom: ["-50%", "100%"] }}
                transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 1.8 }}
              />
            </div>

            {/* Glass card */}
            <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl p-8 border border-white/[0.07] shadow-2xl overflow-hidden space-y-6">
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{
                  backgroundImage: `linear-gradient(135deg, white 0.5px, transparent 0.5px), linear-gradient(45deg, white 0.5px, transparent 0.5px)`,
                  backgroundSize: "30px 30px",
                }}
              />

              <div className="relative">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
                  Create your account
                </h1>
                <p className="mt-1 text-xs text-white/50">Start your legal prep journey today</p>
              </div>

              <form onSubmit={handleSignup} className="space-y-4 relative">
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">Email</label>
                  <input
                    type="email" required placeholder="you@example.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 focus:border-primary-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/50 mb-1.5">
                    Password <span className="text-white/30 font-normal">(min. 8 characters)</span>
                  </label>
                  <input
                    type="password" required minLength={8} placeholder="••••••••"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 focus:border-primary-400 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none transition-colors"
                  />
                </div>

                {error && (
                  <div className="bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="group w-full relative mt-2"
                >
                  <div className="absolute inset-0 bg-primary-500/30 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary-600 hover:bg-primary-500 disabled:opacity-60 rounded-xl text-white font-semibold transition-all duration-300">
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Create account
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </div>
                </motion.button>
              </form>

              <p className="text-center text-xs text-white/40 relative">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-primary-400 font-semibold hover:text-primary-300 transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </PageWrapper>
  );
}
