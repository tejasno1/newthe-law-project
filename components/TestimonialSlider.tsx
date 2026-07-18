"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import type { Review } from "@/lib/courses";

const getVisible = (width: number) => (width >= 1280 ? 3 : width >= 768 ? 2 : 1);

export default function TestimonialSlider({ reviews }: { reviews: Review[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [windowWidth, setWindowWidth] = useState(1024);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const directionRef = useRef(1);

  // Run once after mount — set real width and listen for resize
  useEffect(() => {
    setWindowWidth(window.innerWidth);
    const onResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Clamp index when width changes
  useEffect(() => {
    const max = Math.max(0, reviews.length - getVisible(windowWidth));
    setCurrentIndex((p) => Math.min(p, max));
  }, [windowWidth, reviews.length]);

  // Auto-play
  useEffect(() => {
    if (!isAutoPlaying) return;
    const id = setInterval(() => {
      const max = Math.max(0, reviews.length - getVisible(windowWidth));
      setCurrentIndex((prev) => {
        if (prev >= max) { directionRef.current = -1; return Math.max(0, prev - 1); }
        if (prev <= 0 && directionRef.current === -1) { directionRef.current = 1; return 1; }
        return prev + directionRef.current;
      });
    }, 4000);
    return () => clearInterval(id);
  }, [isAutoPlaying, windowWidth, reviews.length]);

  const visibleCount = getVisible(windowWidth);
  const maxIndex = Math.max(0, reviews.length - visibleCount);
  const canGoNext = currentIndex < maxIndex;
  const canGoPrev = currentIndex > 0;

  const pauseAutoPlay = () => {
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 8000);
  };

  const goNext = () => { if (!canGoNext) return; directionRef.current = 1; setCurrentIndex((p) => Math.min(p + 1, maxIndex)); pauseAutoPlay(); };
  const goPrev = () => { if (!canGoPrev) return; directionRef.current = -1; setCurrentIndex((p) => Math.max(p - 1, 0)); pauseAutoPlay(); };
  const handleDragEnd = (_: unknown, info: PanInfo) => { if (info.offset.x < -30) goNext(); else if (info.offset.x > 30) goPrev(); };

  if (reviews.length === 0) return null;

  return (
    <section className="py-16 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-10">
          <div>
            <span className="inline-block py-1 px-3 rounded-full bg-primary-600/10 text-primary-600 font-semibold text-xs uppercase tracking-wider mb-3">
              Testimonials
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">What students say</h2>
            <div className="w-12 h-1 bg-primary-600 rounded-full mt-3" />
          </div>
          <div className="flex gap-2 mb-1">
            <button
              onClick={goPrev}
              disabled={!canGoPrev}
              aria-label="Previous"
              className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-200 ${
                canGoPrev
                  ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm text-primary-600 hover:bg-primary-50 hover:border-primary-200"
                  : "bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-300 cursor-not-allowed"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={goNext}
              disabled={!canGoNext}
              aria-label="Next"
              className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-200 ${
                canGoNext
                  ? "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 shadow-sm text-primary-600 hover:bg-primary-50 hover:border-primary-200"
                  : "bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-300 cursor-not-allowed"
              }`}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-hidden">
          <motion.div
            className="flex"
            animate={{ x: `-${currentIndex * (100 / visibleCount)}%` }}
            transition={{ type: "spring", stiffness: 70, damping: 20 }}
          >
            {reviews.map((review, i) => (
              <div
                key={i}
                className={`flex-shrink-0 p-2 ${
                  visibleCount === 3 ? "w-1/3" : visibleCount === 2 ? "w-1/2" : "w-full"
                }`}
                onMouseDown={(e) => e.preventDefault()}
              >
                <motion.div
                  className="relative overflow-hidden rounded-2xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 h-full shadow-sm hover:shadow-md transition-shadow duration-300 cursor-grab active:cursor-grabbing select-none"
                  drag="x"
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.15}
                  onDragEnd={handleDragEnd}
                  whileHover={{ y: -4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Quote className="absolute -top-3 -left-2 w-14 h-14 text-primary-600 opacity-[0.07]" />
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex gap-0.5 mb-4">
                      {[...Array(5)].map((_, s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${s < review.rating ? "text-yellow-400 fill-yellow-400" : "text-gray-200 fill-gray-200"}`}
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed flex-1 mb-5">
                      &ldquo;{review.text}&rdquo;
                    </p>
                    <div className="pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center gap-3">
                      <img
                        src={review.img}
                        alt={review.name}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0 ring-2 ring-primary-600/10"
                      />
                      <div>
                        <p className="font-semibold text-sm text-gray-900 dark:text-white">{review.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{review.role}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
            ))}
          </motion.div>
        </div>

        {maxIndex > 0 && (
          <div className="flex justify-center items-center gap-1.5 mt-7">
            {Array.from({ length: maxIndex + 1 }, (_, i) => (
              <button
                key={i}
                onClick={() => { setCurrentIndex(i); pauseAutoPlay(); }}
                aria-label={`Go to slide ${i + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === currentIndex ? "bg-primary-600 w-5" : "bg-gray-300 dark:bg-gray-600 w-2 hover:bg-gray-400 dark:hover:bg-gray-500"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
