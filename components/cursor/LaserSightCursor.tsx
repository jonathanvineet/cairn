"use client";

import { useEffect, useRef, useState } from "react";

export function LaserSightCursor() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const [hoverState] = useState<"default" | "breach" | "drone">("default");
  const rippleProgress = useRef(0);
  const isRippling = useRef(false);
  
  useEffect(() => {
    // Hide default cursor
    document.body.style.cursor = "none";
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Set canvas size
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
    };
    
    const handleClick = () => {
      isRippling.current = true;
      rippleProgress.current = 0;
    };
    
    window.addEventListener("resize", handleResize);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("click", handleClick);
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const x = mousePos.current.x;
      const y = mousePos.current.y;
      
      // Determine color based on hover state
      let color = "#00f5ff"; // Cyan default
      if (hoverState === "breach") color = "#e94560";
      if (hoverState === "drone") color = "#f59e0b";
      
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2;
      
      // Crosshair lines
      const lineLength = 12;
      const gap = 4;
      
      // Top
      ctx.beginPath();
      ctx.moveTo(x, y - gap);
      ctx.lineTo(x, y - gap - lineLength);
      ctx.stroke();
      
      // Bottom
      ctx.beginPath();
      ctx.moveTo(x, y + gap);
      ctx.lineTo(x, y + gap + lineLength);
      ctx.stroke();
      
      // Left
      ctx.beginPath();
      ctx.moveTo(x - gap, y);
      ctx.lineTo(x - gap - lineLength, y);
      ctx.stroke();
      
      // Right
      ctx.beginPath();
      ctx.moveTo(x + gap, y);
      ctx.lineTo(x + gap + lineLength, y);
      ctx.stroke();
      
      // Circle
      const circleRadius = hoverState === "breach" ? 18 + Math.sin(Date.now() * 0.005) * 4 : 18;
      ctx.beginPath();
      ctx.arc(x, y, circleRadius, 0, Math.PI * 2);
      ctx.stroke();
      
      // L-shaped corner ticks at 45deg offset
      const cornerDist = 22;
      const tickSize = 6;
      const angles = [45, 135, 225, 315];
      
      angles.forEach((angle) => {
        const rad = (angle * Math.PI) / 180;
        const cx = x + Math.cos(rad) * cornerDist;
        const cy = y + Math.sin(rad) * cornerDist;
        
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(rad + Math.PI / 4) * tickSize, cy + Math.sin(rad + Math.PI / 4) * tickSize);
        ctx.lineTo(cx + Math.cos(rad - Math.PI / 4) * tickSize, cy + Math.sin(rad - Math.PI / 4) * tickSize);
        ctx.closePath();
        ctx.stroke();
      });
      
      // Center dot
      ctx.fillStyle = "#ff1744";
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Click ripple
      if (isRippling.current) {
        rippleProgress.current += 0.05;
        
        const rippleRadius = 18 + rippleProgress.current * 22;
        const rippleOpacity = 1 - rippleProgress.current;
        
        ctx.globalAlpha = rippleOpacity;
        ctx.beginPath();
        ctx.arc(x, y, rippleRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = 1;
        
        if (rippleProgress.current >= 1) {
          isRippling.current = false;
        }
      }
      
      requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      document.body.style.cursor = "default";
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("click", handleClick);
    };
  }, [hoverState]);
  
  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 20,
      }}
    />
  );
}
