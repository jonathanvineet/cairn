"use client";

import { motion } from "framer-motion";

interface BreachCounterProps {
  count: number;
}

export function BreachCounter({ count }: BreachCounterProps) {
  return (
    <div className="flex flex-col items-center">
      <motion.div
        key={count}
        initial={{ scale: 1.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="text-5xl font-bold text-[#e94560] mb-2"
        style={{ fontFamily: "Rajdhani, sans-serif" }}
      >
        {count}
      </motion.div>
      <div className="text-[10px] text-[#e94560] tracking-[0.3em] uppercase">
        BREACH EVENTS DETECTED
      </div>
    </div>
  );
}
