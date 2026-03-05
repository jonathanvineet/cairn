"use client";

import { useEffect, useRef } from "react";

export function RadarMinimap() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    let animationId: number;
    
    const animate = () => {
      ctx.clearRect(0, 0, 80, 80);
      
      // Background
      ctx.fillStyle = "rgba(10, 22, 40, 0.85)";
      ctx.fillRect(0, 0, 80, 80);
      
      // Grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1;
      
      for (let i = 0; i <= 80; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, 80);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(80, i);
        ctx.stroke();
      }
      
      // Center cross
      ctx.strokeStyle = "rgba(0, 245, 255, 0.5)";
      ctx.beginPath();
      ctx.moveTo(40, 30);
      ctx.lineTo(40, 50);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(30, 40);
      ctx.lineTo(50, 40);
      ctx.stroke();
      
      // Rotating radar sweep
      const time = Date.now() * 0.001;
      const angle = (time % 2) * Math.PI;
      
      ctx.save();
      ctx.translate(40, 40);
      ctx.rotate(angle);
      
      const gradient = ctx.createLinearGradient(0, 0, 30, 0);
      gradient.addColorStop(0, "rgba(0, 245, 255, 0)");
      gradient.addColorStop(1, "rgba(0, 245, 255, 0.5)");
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(30, -5);
      ctx.lineTo(30, 5);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
      
      // Mock drone dots
      const droneDots = [
        { x: 25, y: 30 },
        { x: 50, y: 45 },
        { x: 35, y: 55 },
        { x: 60, y: 25 },
      ];
      
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      droneDots.forEach((dot) => {
        ctx.beginPath();
        ctx.arc(dot.x, dot.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Mock breach markers
      const breachMarkers = [
        { x: 15, y: 20 },
        { x: 65, y: 60 },
      ];
      
      const pulse = Math.sin(time * 4) * 0.3 + 0.7;
      ctx.fillStyle = `rgba(233, 69, 96, ${pulse})`;
      breachMarkers.forEach((marker) => {
        ctx.beginPath();
        ctx.arc(marker.x, marker.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // User dot (center)
      ctx.fillStyle = "#00f5ff";
      ctx.beginPath();
      ctx.arc(40, 40, 3, 0, Math.PI * 2);
      ctx.fill();
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);
  
  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={80}
        height={80}
        className="border border-[#00f5ff]/30 rounded"
      />
      <div className="absolute -bottom-5 left-0 right-0 text-center text-[8px] text-white/40 tracking-wider">
        RADAR
      </div>
    </div>
  );
}
