"use client";

import React, { useState, useEffect, useRef } from 'react';

interface DotCardProps {
  target?: number;
  duration?: number;
  label?: string;
  suffix?: string;
  staticText?: string;
}

export default function DotCard({
  target = 777000,
  duration = 2000,
  label = "Views",
  suffix = "",
  staticText,
}: DotCardProps) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Start animation only when card scrolls into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!started || staticText !== undefined || target === undefined) return;
    let start = 0;
    const end = target;
    const range = end - start;
    if (range <= 0) return;
    const increment = Math.ceil(end / (duration / 50));
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        start = end;
        clearInterval(timer);
      }
      setCount(start);
    }, 50);
    return () => clearInterval(timer);
  }, [started, target, duration, staticText]);

  const display = staticText !== undefined
    ? staticText
    : count < 1000
      ? `${count}${suffix}`
      : `${Math.floor(count / 1000)}k${suffix}`;

  return (
    <div ref={ref} className="outer">
      <div className="card">
        <div className="ray"></div>
        <div className="text">{display}</div>
        <div className="label">{label}</div>
        <div className="line topl"></div>
        <div className="line leftl"></div>
        <div className="line bottoml"></div>
        <div className="line rightl"></div>
      </div>
    </div>
  );
}
