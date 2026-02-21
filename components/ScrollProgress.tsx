"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";

export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  const [phase, setPhase] = useState(0);

  useEffect(() => {
    return scrollYProgress.on("change", (latest) => {
      if (latest < 0.25) setPhase(0);
      else if (latest < 0.5) setPhase(1);
      else if (latest < 0.75) setPhase(2);
      else setPhase(3);
    });
  }, [scrollYProgress]);

  const phases = [
    { label: "Scan", color: "#4ade80" },
    { label: "Breach", color: "#ef4444" },
    { label: "Evidence", color: "#facc15" },
    { label: "Secure", color: "#60a5fa" },
  ];

  return (
    <>
      {/* Progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-yellow-400 to-blue-400 origin-left z-50"
        style={{ scaleX }}
      />

      {/* Phase indicators */}
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
        {phases.map((p, i) => (
          <div
            key={i}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 ${
              i === phase
                ? "glass-strong scale-110 shadow-lg"
                : "glass opacity-50 scale-90"
            }`}
            style={{
              borderColor: i === phase ? p.color : "rgba(255,255,255,0.1)",
              color: i === phase ? p.color : "#888",
            }}
          >
            {p.label}
          </div>
        ))}
      </div>
    </>
  );
}
