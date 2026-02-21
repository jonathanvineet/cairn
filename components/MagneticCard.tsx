"use client";

import { useRef, useState } from "react";
import { motion, useSpring } from "framer-motion";

interface MagneticCardProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
  breathe?: boolean;
}

export function MagneticCard({
  children,
  strength = 0.15,
  className = "",
  breathe = false,
}: MagneticCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  const x = useSpring(0, { stiffness: 150, damping: 15 });
  const y = useSpring(0, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;

    const rect = cardRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const offsetX = (e.clientX - centerX) * strength;
    const offsetY = (e.clientY - centerY) * strength;

    x.set(offsetX);
    y.set(offsetY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={cardRef}
      className={className}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      animate={{
        scale: isHovered ? 1.05 : breathe ? [1, 1.02, 1] : 1,
        y: isHovered ? -8 : 0,
      }}
      transition={{
        scale: {
          duration: breathe ? 3 : 0.3,
          repeat: breathe ? Infinity : 0,
          ease: "easeInOut",
        },
        y: { duration: 0.3 },
      }}
      whileHover={{
        boxShadow:
          "0 20px 40px rgba(45, 90, 39, 0.3), 0 0 30px rgba(74, 222, 128, 0.2)",
      }}
    >
      {children}
    </motion.div>
  );
}
