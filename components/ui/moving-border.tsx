"use client";
import React, { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "framer-motion";

export function MovingBorderButton({
  children,
  duration = 5000,
  borderColor = "#25D366",
  className = "",
  ...props
}: {
  children: React.ReactNode;
  duration?: number;
  borderColor?: string;
  className?: string;
  [key: string]: any;
}) {
  return (
    <div
      className={`relative p-[1.5px] overflow-hidden rounded-md ${className}`}
      {...props}
    >
      {/* Animated border track */}
      <MovingBorder duration={duration} color={borderColor} />

      {/* Inner content */}
      <div className="relative z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-white dark:bg-gray-900 text-sm font-medium">
        {children}
      </div>
    </div>
  );
}

function MovingBorder({
  duration = 2500,
  color,
}: {
  duration?: number;
  color: string;
}) {
  const pathRef = useRef<SVGRectElement>(null);
  const progress = useMotionValue(0);

  useAnimationFrame((time) => {
    const length = pathRef.current?.getTotalLength();
    if (length) {
      const pxPerMs = length / duration;
      progress.set((time * pxPerMs) % length);
    }
  });

  const x = useTransform(progress, (val) => {
    try { return pathRef.current?.getPointAtLength(val).x ?? 0; } catch { return 0; }
  });
  const y = useTransform(progress, (val) => {
    try { return pathRef.current?.getPointAtLength(val).y ?? 0; } catch { return 0; }
  });
  const transform = useMotionTemplate`translateX(${x}px) translateY(${y}px) translateX(-50%) translateY(-50%)`;

  return (
    <>
      {/* Faint static border so shape is always visible */}
      <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <rect width="100%" height="100%" fill="none" stroke={color} strokeWidth="1" strokeOpacity="0.4" rx="5" ry="5" />
        {/* Hidden rect used for path length calculation */}
        <rect width="100%" height="100%" fill="none" rx="5" ry="5" ref={pathRef} />
      </svg>

      {/* Moving glow dot */}
      <motion.div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: 40,
          height: 40,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${color} 0%, ${color}80 40%, transparent 70%)`,
          transform,
          zIndex: 1,
        }}
      />
    </>
  );
}
