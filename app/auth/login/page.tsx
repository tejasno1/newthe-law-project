"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Lock, ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { motion, useMotionValue, useTransform } from "framer-motion";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");

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
    if (msg.includes("Email not confirmed"))
      return "Please verify your email first — check your inbox for the confirmation link.";
    if (msg.includes("Invalid login credentials"))
      return "Incorrect email or password. Please try again.";
    if (msg.includes("rate limit"))
      return "Too many attempts. Please wait a moment and try again.";
    return "Something went wrong. Please try again.";
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(friendlyError(error.message));
      setLoading(false);
      return;
    }
    router.push(redirectTo);
    router.refresh();
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callbackUrl },
    });
  };

  return (
    <div className="w-full max-w-sm relative z-10" style={{ perspective: 1500 }}>
      {/* Logo */}
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
            {/* Subtle inner grid */}
            <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(135deg, white 0.5px, transparent 0.5px), linear-gradient(45deg, white 0.5px, transparent 0.5px)`,
                backgroundSize: "30px 30px",
              }}
            />

            <div className="text-center relative">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80">
                Welcome back
              </h2>
              <p className="mt-1 text-xs text-white/50">Sign in to continue learning</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-7 relative">
              {/* Email */}
              <div className="relative z-0">
                <input
                  type="email" id="email" required placeholder=" "
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-primary-400 peer transition-colors"
                />
                <label htmlFor="email"
                  className="absolute text-sm text-white/40 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-primary-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  <User className="inline-block mr-1.5 -mt-0.5 w-3.5 h-3.5" />Email Address
                </label>
              </div>

              {/* Password */}
              <div className="relative z-0">
                <input
                  type="password" id="password" required placeholder=" "
                  value={password} onChange={(e) => setPassword(e.target.value)}
                  className="block py-2.5 px-0 w-full text-sm text-white bg-transparent border-0 border-b border-white/20 appearance-none focus:outline-none focus:ring-0 focus:border-primary-400 peer transition-colors"
                />
                <label htmlFor="password"
                  className="absolute text-sm text-white/40 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:text-primary-400 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6"
                >
                  <Lock className="inline-block mr-1.5 -mt-0.5 w-3.5 h-3.5" />Password
                </label>
              </div>

              <div className="flex justify-end -mt-4">
                <Link href="/forgot-password" className="text-xs text-white/40 hover:text-white/70 transition-colors">
                  Forgot Password?
                </Link>
              </div>

              {error && (
                <div className="bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              {/* Sign in button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="group w-full relative"
              >
                <div className="absolute inset-0 bg-primary-500/30 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary-600 hover:bg-primary-500 disabled:opacity-60 rounded-xl text-white font-semibold transition-all duration-300">
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      Sign In
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </div>
              </motion.button>

              {/* Divider */}
              <div className="relative flex items-center">
                <div className="flex-grow border-t border-white/[0.08]" />
                <span className="flex-shrink mx-4 text-white/30 text-xs tracking-wider">OR CONTINUE WITH</span>
                <div className="flex-grow border-t border-white/[0.08]" />
              </div>

              {/* Google */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button" onClick={handleGoogle} disabled={googleLoading}
                className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white/90 hover:bg-white disabled:opacity-60 rounded-xl text-gray-700 font-semibold transition-all duration-300"
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 48 48">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.802 8.841C34.553 4.806 29.613 2.5 24 2.5C11.983 2.5 2.5 11.983 2.5 24s9.483 21.5 21.5 21.5S45.5 36.017 45.5 24c0-1.538-.135-3.022-.389-4.417z" />
                  <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12.5 24 12.5c3.059 0 5.842 1.154 7.961 3.039l5.839-5.841C34.553 4.806 29.613 2.5 24 2.5C16.318 2.5 9.642 6.723 6.306 14.691z" />
                  <path fill="#4CAF50" d="M24 45.5c5.613 0 10.553-2.306 14.802-6.341l-5.839-5.841C30.842 35.846 27.059 38 24 38c-5.039 0-9.345-2.608-11.124-6.481l-6.571 4.819C9.642 41.277 16.318 45.5 24 45.5z" />
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l5.839 5.841C44.196 35.123 45.5 29.837 45.5 24c0-1.538-.135-3.022-.389-4.417z" />
                </svg>
                {googleLoading ? "Redirecting…" : "Sign in with Google"}
              </motion.button>
            </form>

            <p className="text-center text-xs text-white/40 relative">
              Don&apos;t have an account?{" "}
              <Link
                href={`/auth/signup?redirect=${encodeURIComponent(redirectTo)}`}
                className="text-primary-400 font-semibold hover:text-primary-300 transition-colors"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="relative w-screen min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden">
      {/* Background gradient — blue instead of purple */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary-600/40 via-primary-800/30 to-black" />

      {/* Noise texture */}
      <div
        className="absolute inset-0 opacity-[0.03] mix-blend-soft-light pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
      />

      {/* Top radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vh] h-[60vh] rounded-b-[50%] bg-primary-400/15 blur-[80px] pointer-events-none" />

      {/* Animated pulsing glow blobs */}
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

      <div className="relative z-10 w-full flex justify-center">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
