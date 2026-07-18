"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { X, MessageCircle } from "lucide-react";

// ← Replace with your actual WhatsApp number (country code + number, no spaces or +)
const WHATSAPP_NUMBER = "9555634585";
const WHATSAPP_MESSAGE = "Hi! I'm interested in The Law Project courses. Can you help me?";

export default function WhatsAppWidget() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  // Delay appearance so it doesn't flash on first load
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(t);
  }, []);

  if (pathname.startsWith("/admin")) return null;

  const openWhatsApp = () => {
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 hidden sm:flex flex-col items-end gap-3">
      {/* Chat bubble */}
      {open && (
        <div className="bg-white rounded-2xl shadow-2xl shadow-black/15 border border-gray-100 w-72 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="bg-[#25D366] px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  <path d="M12.004 2C6.477 2 2 6.478 2 12.005c0 1.832.47 3.557 1.294 5.057L2 22l5.083-1.274A9.961 9.961 0 0012.004 22c5.526 0 10.003-4.478 10.003-10.005S17.53 2 12.004 2zm0 18.32a8.297 8.297 0 01-4.234-1.16l-.303-.18-3.015.754.786-2.94-.198-.312A8.29 8.29 0 013.706 12c0-4.572 3.724-8.296 8.298-8.296 4.573 0 8.297 3.724 8.297 8.296 0 4.573-3.724 8.32-8.297 8.32z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">The Law Project</p>
                <p className="text-white/80 text-xs">Typically replies in minutes</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat preview */}
          <div className="bg-[#ece5dd] px-4 py-4">
            <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm max-w-[90%]">
              <p className="text-sm text-gray-800 leading-relaxed">
                👋 Hi there! Welcome to <strong>The Law Project</strong>.
              </p>
              <p className="text-sm text-gray-700 mt-1.5 leading-relaxed">
                Have questions about our CLAT PG / UG courses, mentorship programmes, or test series? We're here to help!
              </p>
              <p className="text-[10px] text-gray-400 text-right mt-2">Just now</p>
            </div>
          </div>

          {/* CTA */}
          <div className="px-4 py-3 bg-white">
            <button
              onClick={openWhatsApp}
              className="w-full bg-[#25D366] hover:bg-[#20ba59] text-white rounded-xl py-3 text-sm font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white flex-shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12.004 2C6.477 2 2 6.478 2 12.005c0 1.832.47 3.557 1.294 5.057L2 22l5.083-1.274A9.961 9.961 0 0012.004 22c5.526 0 10.003-4.478 10.003-10.005S17.53 2 12.004 2zm0 18.32a8.297 8.297 0 01-4.234-1.16l-.303-.18-3.015.754.786-2.94-.198-.312A8.29 8.29 0 013.706 12c0-4.572 3.724-8.296 8.298-8.296 4.573 0 8.297 3.724 8.297 8.296 0 4.573-3.724 8.32-8.297 8.32z" />
              </svg>
              Start Chat on WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* Floating pill button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1.5 bg-[#25D366] hover:bg-[#20ba59] text-white rounded-full pl-2.5 pr-3.5 py-1.5 shadow-xl shadow-[#25D366]/40 transition-all duration-200 hover:scale-105 active:scale-95"
        aria-label="Chat on WhatsApp"
      >
        {open ? (
          <X className="w-4 h-4" />
        ) : (
          <svg viewBox="0 0 24 24" className="w-4 h-4 fill-white flex-shrink-0">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
            <path d="M12.004 2C6.477 2 2 6.478 2 12.005c0 1.832.47 3.557 1.294 5.057L2 22l5.083-1.274A9.961 9.961 0 0012.004 22c5.526 0 10.003-4.478 10.003-10.005S17.53 2 12.004 2zm0 18.32a8.297 8.297 0 01-4.234-1.16l-.303-.18-3.015.754.786-2.94-.198-.312A8.29 8.29 0 013.706 12c0-4.572 3.724-8.296 8.298-8.296 4.573 0 8.297 3.724 8.297 8.296 0 4.573-3.724 8.32-8.297 8.32z" />
          </svg>
        )}
        <span className="text-xs font-semibold whitespace-nowrap">
          {open ? "Close" : "Talk to us"}
        </span>
      </button>
    </div>
  );
}
