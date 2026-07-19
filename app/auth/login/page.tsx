"use client";

import { useState, useRef, useEffect, Suspense } from "react";
// useRef kept for timerRef
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Mail, RotateCcw } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";

/* ─── border beams ───────────────────────────────────────────── */
function BorderBeams() {
  return (
    <div className="absolute -inset-[1px] rounded-2xl overflow-hidden pointer-events-none">
      <motion.div className="absolute top-0 left-0 h-[2px] w-[50%] bg-gradient-to-r from-transparent via-primary-400 to-transparent opacity-80"
        animate={{ left: ["-50%", "100%"] }} transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }} />
      <motion.div className="absolute top-0 right-0 h-[50%] w-[2px] bg-gradient-to-b from-transparent via-primary-400 to-transparent opacity-80"
        animate={{ top: ["-50%", "100%"] }} transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 0.6 }} />
      <motion.div className="absolute bottom-0 right-0 h-[2px] w-[50%] bg-gradient-to-r from-transparent via-primary-400 to-transparent opacity-80"
        animate={{ right: ["-50%", "100%"] }} transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 1.2 }} />
      <motion.div className="absolute bottom-0 left-0 h-[50%] w-[2px] bg-gradient-to-b from-transparent via-primary-400 to-transparent opacity-80"
        animate={{ bottom: ["-50%", "100%"] }} transition={{ duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 1.8 }} />
    </div>
  );
}

const RESEND_SECONDS = 60;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";
  const supabase = createClient();

  const [step, setStep] = useState<"email" | "otp">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const startCountdown = () => {
    setCountdown(RESEND_SECONDS);
    timerRef.current = setInterval(() => {
      setCountdown(c => {
        if (c <= 1) { clearInterval(timerRef.current!); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const friendlyError = (msg: string) => {
    console.error("[auth error]", msg);
    if (msg.includes("rate limit") || msg.includes("too many")) return "Too many attempts. Please wait a moment.";
    if (msg.includes("invalid") || msg.includes("expired") || msg.includes("Token")) return "Incorrect or expired code. Try again or request a new one.";
    if (msg.includes("email")) return "Could not send code — check your email address.";
    return `Error: ${msg || "(empty — check browser console)"}`;
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });
    setLoading(false);
    if (error) {
      console.error("[signInWithOtp full]", error, "status:", error.status, "code:", error.code, "msg:", error.message);
      setError(friendlyError(error.message || error.code || JSON.stringify(error)));
      return;
    }
    setCode("");
    setStep("otp");
    startCountdown();
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setError("");
    setVerifying(true);
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: "email",
    });
    setVerifying(false);
    if (error) { setError("Incorrect or expired code. Please try again."); return; }
    router.push(redirectTo);
    router.refresh();
  };

  const handleResend = async () => {
    if (countdown > 0) return;
    setError("");
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`,
      },
    });
    if (error) { setError(friendlyError(error.message)); return; }
    startCountdown();
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`;
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: callbackUrl } });
  };

  return (
    <div className="w-full max-w-sm">
      <Link href="/" className="flex items-center justify-center gap-2 mb-7">
        <img src="/tlpfinallogo.png" alt="The Law Project" className="h-9 w-auto object-contain" />
        <span className="text-xl font-bold text-white">The Law Project</span>
      </Link>

      <div className="relative">
        <BorderBeams />
        <div className="relative bg-black/40 backdrop-blur-xl rounded-2xl border border-white/[0.07] shadow-2xl overflow-hidden">
          <div className="absolute inset-0 rounded-2xl opacity-[0.02] pointer-events-none"
            style={{ backgroundImage: `linear-gradient(135deg,white 0.5px,transparent 0.5px),linear-gradient(45deg,white 0.5px,transparent 0.5px)`, backgroundSize: "30px 30px" }} />

          <AnimatePresence mode="wait">
            {step === "email" ? (
              <motion.div key="email-step" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }} className="p-8 space-y-6 relative">

                <div className="text-center">
                  <div className="w-12 h-12 bg-primary-600/20 border border-primary-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Mail className="w-6 h-6 text-primary-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Sign in</h2>
                  <p className="mt-1 text-xs text-white/50">Enter your email — we'll send a verification code</p>
                </div>

                <form onSubmit={handleSendCode} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5">Email address</label>
                    <input
                      type="email" required placeholder="you@example.com"
                      value={email} onChange={e => setEmail(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 focus:border-primary-400 focus:bg-white/8 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none transition-all duration-200"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-3 text-sm text-red-200">{error}</div>
                  )}

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="submit" disabled={loading} className="group w-full relative">
                    <div className="absolute inset-0 bg-primary-500/30 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary-600 hover:bg-primary-500 disabled:opacity-60 rounded-xl text-white font-semibold transition-all duration-300">
                      {loading
                        ? <div className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" />
                        : <> Send verification code <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /> </>}
                    </div>
                  </motion.button>

                  <div className="relative flex items-center pt-1">
                    <div className="flex-grow border-t border-white/[0.08]" />
                    <span className="flex-shrink mx-4 text-white/30 text-xs tracking-wider">OR</span>
                    <div className="flex-grow border-t border-white/[0.08]" />
                  </div>

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="button" onClick={handleGoogle} disabled={googleLoading}
                    className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-white/90 hover:bg-white disabled:opacity-60 rounded-xl text-gray-700 font-semibold transition-all duration-300">
                    <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 48 48">
                      <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039L38.802 8.841C34.553 4.806 29.613 2.5 24 2.5C11.983 2.5 2.5 11.983 2.5 24s9.483 21.5 21.5 21.5S45.5 36.017 45.5 24c0-1.538-.135-3.022-.389-4.417z" />
                      <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12.5 24 12.5c3.059 0 5.842 1.154 7.961 3.039l5.839-5.841C34.553 4.806 29.613 2.5 24 2.5C16.318 2.5 9.642 6.723 6.306 14.691z" />
                      <path fill="#4CAF50" d="M24 45.5c5.613 0 10.553-2.306 14.802-6.341l-5.839-5.841C30.842 35.846 27.059 38 24 38c-5.039 0-9.345-2.608-11.124-6.481l-6.571 4.819C9.642 41.277 16.318 45.5 24 45.5z" />
                      <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l5.839 5.841C44.196 35.123 45.5 29.837 45.5 24c0-1.538-.135-3.022-.389-4.417z" />
                    </svg>
                    {googleLoading ? "Redirecting…" : "Continue with Google"}
                  </motion.button>
                </form>

                <p className="text-center text-xs text-white/30">
                  New here? No problem — we'll create your account automatically.
                </p>
              </motion.div>

            ) : (
              <motion.div key="otp-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }} className="p-8 space-y-5 relative">

                <div className="text-center">
                  <div className="w-14 h-14 bg-emerald-500/20 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-white">Enter verification code</h2>
                  <p className="mt-1 text-xs text-white/50">We sent a code to</p>
                  <p className="mt-1 text-sm font-semibold text-white/80">{email}</p>
                </div>

                <form onSubmit={handleVerify} className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-white/50 mb-1.5 text-center">Verification code</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      autoFocus
                      placeholder="e.g. 07040239"
                      value={code}
                      onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
                      className="w-full bg-white/5 border border-white/10 focus:border-primary-400 focus:bg-white/8 rounded-xl px-4 py-3 text-2xl font-bold text-white text-center tracking-[0.3em] placeholder:text-white/15 placeholder:text-base placeholder:tracking-normal outline-none transition-all duration-200"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-500/20 border border-red-400/30 rounded-xl px-4 py-3 text-sm text-red-200 text-center">{error}</div>
                  )}

                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    type="submit" disabled={verifying || !code.trim()} className="group w-full relative">
                    <div className="absolute inset-0 bg-primary-500/30 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 rounded-xl text-white font-semibold transition-all duration-300">
                      {verifying
                        ? <><div className="w-4 h-4 border-2 border-white/70 border-t-transparent rounded-full animate-spin" /> Verifying…</>
                        : <> Verify & Sign in <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /> </>}
                    </div>
                  </motion.button>
                </form>

                <div className="text-center space-y-2 pt-1">
                  <button type="button" onClick={handleResend} disabled={countdown > 0}
                    className="flex items-center justify-center gap-1.5 mx-auto text-xs text-white/40 hover:text-white/70 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                    <RotateCcw className="w-3 h-3" />
                    {countdown > 0 ? `Resend code in ${countdown}s` : "Resend code"}
                  </button>
                  <button type="button" onClick={() => { setStep("email"); setError(""); setCode(""); }}
                    className="block mx-auto text-xs text-white/30 hover:text-white/60 transition-colors">
                    ← Use a different email
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <main className="relative w-screen min-h-screen bg-black flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-primary-600/40 via-primary-800/30 to-black" />
      <div className="absolute inset-0 opacity-[0.03] mix-blend-soft-light pointer-events-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`, backgroundSize: "200px 200px" }} />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vh] h-[60vh] rounded-b-[50%] bg-primary-400/15 blur-[80px] pointer-events-none" />
      <motion.div className="absolute top-0 left-1/2 -translate-x-1/2 w-[100vh] h-[60vh] rounded-b-full bg-primary-300/10 blur-[60px] pointer-events-none"
        animate={{ opacity: [0.1, 0.25, 0.1], scale: [0.98, 1.02, 0.98] }}
        transition={{ duration: 8, repeat: Infinity, repeatType: "mirror" }} />
      <div className="relative z-10 w-full flex justify-center">
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
